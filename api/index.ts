import { mkdir } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import express, { type NextFunction, type Request, type Response } from 'express';
import { createClient, type Client } from '@libsql/client';
import { z } from 'zod';
import { defaultContent, type PortfolioContent } from '../shared/content.js';
import {
  ADMIN_COOKIE,
  VISITOR_COOKIE,
  clearCookie,
  clientKey,
  createRateLimiter,
  createSessionToken,
  parseCookies,
  parseUserAgent,
  safeEqual,
  safeReferrer,
  setSecureCookie,
  verifySessionToken,
  visitorHash
} from './lib/security.js';

const app = express();
const port = Number(process.env.PORT || 3001);
const deploymentOrigin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';
const allowedOrigins = [...(process.env.SITE_URL || 'http://localhost:5173').split(','), deploymentOrigin].map((origin) => origin.trim()).filter(Boolean);
const sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString('hex');
const analyticsSecret = process.env.ANALYTICS_HASH_SECRET || sessionSecret;
const retentionDays = Math.max(1, Math.min(Number(process.env.ANALYTICS_RETENTION_DAYS || 90), 730));
const eventLimiter = createRateLimiter(90, 60_000);
const loginLimiter = createRateLimiter(8, 15 * 60_000);

let database: Client | null = null;
let databaseReady: Promise<Client> | null = null;

async function getDatabase() {
  if (databaseReady) return databaseReady;
  databaseReady = (async () => {
    const url = process.env.TURSO_DATABASE_URL || 'file:./data/analytics.db';
    if (url.startsWith('file:')) await mkdir('data', { recursive: true });
    database = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || undefined });
    await database.execute(`CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      occurred_at TEXT NOT NULL,
      event TEXT NOT NULL,
      page TEXT NOT NULL,
      browser TEXT NOT NULL,
      os TEXT NOT NULL,
      device TEXT NOT NULL,
      referrer TEXT NOT NULL,
      country TEXT,
      region TEXT,
      visitor_hash TEXT NOT NULL,
      is_new INTEGER NOT NULL DEFAULT 0
    )`);
    await database.execute('CREATE INDEX IF NOT EXISTS idx_events_date ON analytics_events(occurred_at)');
    await database.execute('CREATE INDEX IF NOT EXISTS idx_events_visitor ON analytics_events(visitor_hash)');
    await database.execute(`CREATE TABLE IF NOT EXISTS portfolio_content (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      content_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`);
    await database.execute(`CREATE TABLE IF NOT EXISTS portfolio_photo (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      mime_type TEXT NOT NULL,
      data_base64 TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`);
    await database.execute({
      sql: 'INSERT OR IGNORE INTO portfolio_content (id, content_json, updated_at) VALUES (1, ?, ?)',
      args: [JSON.stringify(defaultContent), new Date().toISOString()]
    });
    return database;
  })();
  return databaseReady;
}

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '3mb', type: 'application/json' }));
app.use((request, _response, next) => {
  const rewrittenPath = request.query.path;
  if (request.path === '/api/index' && typeof rewrittenPath === 'string' && /^[a-zA-Z0-9/_-]+$/.test(rewrittenPath)) {
    request.url = `/api/${rewrittenPath}`;
  }
  next();
});
app.use((request, response, next) => {
  response.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
    'Cache-Control': request.path.startsWith('/api/admin') ? 'no-store' : 'no-cache'
  });
  if (process.env.NODE_ENV === 'production') response.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  const origin = request.get('origin');
  if (origin && allowedOrigins.includes(origin)) {
    response.set('Access-Control-Allow-Origin', origin);
    response.set('Access-Control-Allow-Credentials', 'true');
    response.set('Vary', 'Origin');
  } else if (origin && !allowedOrigins.includes(origin)) {
    response.status(403).json({ error: 'Origin not allowed' });
    return;
  }
  next();
});

const eventSchema = z.object({
  event: z.enum(['page_view', 'view_experience', 'view_projects', 'linkedin_click', 'github_click', 'resume_download', 'contact_click']),
  page: z.string().max(120).regex(/^\/[a-zA-Z0-9/_-]*$/)
}).strict();

const loginSchema = z.object({ password: z.string().min(8).max(256) }).strict();
const localizedSchema = z.object({ es: z.string().min(1).max(5000), en: z.string().min(1).max(5000) }).strict();
const experienceSchema = z.object({
  id: z.string().min(1).max(100), company: z.string().min(1).max(160), role: localizedSchema,
  period: localizedSchema,
  responsibilities: z.object({ es: z.array(z.string().min(1).max(1200)).max(20), en: z.array(z.string().min(1).max(1200)).max(20) }).strict(),
  technologies: z.array(z.string().min(1).max(100)).max(40)
}).strict();
const certificateSchema = z.object({
  id: z.string().min(1).max(100), name: localizedSchema, issuer: z.string().min(1).max(200),
  date: z.string().max(100), credentialUrl: z.string().max(1000).refine((value) => value === '' || URL.canParse(value))
}).strict();
const contentSchema = z.object({
  name: z.string().min(1).max(160), role: z.string().min(1).max(160), location: z.string().min(1).max(200),
  email: z.email().max(320), phoneDisplay: z.string().min(1).max(80), phoneHref: z.string().min(1).max(120),
  whatsapp: z.url().max(1000), linkedin: z.url().max(1000), github: z.url().max(1000), summary: localizedSchema,
  experience: z.array(experienceSchema).max(30), certificates: z.array(certificateSchema).max(50),
  photoUrl: z.string().min(1).max(1000), updatedAt: z.string().optional()
}).strict();
const photoSchema = z.object({ dataUrl: z.string().max(2_800_000) }).strict();

function requireAdmin(request: Request, response: Response, next: NextFunction) {
  if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
    response.status(503).json({ error: 'Admin access is not configured' });
    return;
  }
  const cookies = parseCookies(request.get('cookie'));
  if (!verifySessionToken(cookies[ADMIN_COOKIE], sessionSecret)) {
    response.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
}

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));

async function readContent(db: Client): Promise<PortfolioContent> {
  const result = await db.execute('SELECT content_json, updated_at FROM portfolio_content WHERE id = 1');
  const row = result.rows[0];
  if (!row) return defaultContent;
  try {
    const parsed = contentSchema.safeParse(JSON.parse(String(row.content_json)));
    return parsed.success ? { ...parsed.data, updatedAt: String(row.updated_at) } : defaultContent;
  } catch {
    return defaultContent;
  }
}

app.get('/api/content', async (_request, response, next) => {
  try {
    const db = await getDatabase();
    const content = await readContent(db);
    const photo = await db.execute('SELECT updated_at FROM portfolio_photo WHERE id = 1');
    response.json({ ...content, photoUrl: photo.rows.length ? `/api/content/photo?v=${encodeURIComponent(String(photo.rows[0].updated_at))}` : content.photoUrl });
  } catch (error) {
    next(error);
  }
});

app.get('/api/content/photo', async (_request, response, next) => {
  try {
    const db = await getDatabase();
    const result = await db.execute('SELECT mime_type, data_base64, updated_at FROM portfolio_photo WHERE id = 1');
    if (!result.rows.length) {
      response.redirect(302, '/profile.webp');
      return;
    }
    response.set({ 'Content-Type': String(result.rows[0].mime_type), 'Cache-Control': 'public, max-age=31536000, immutable' });
    response.send(Buffer.from(String(result.rows[0].data_base64), 'base64'));
  } catch (error) {
    next(error);
  }
});

app.post('/api/events', async (request, response, next) => {
  try {
    if (process.env.ANALYTICS_ENABLED === 'false' || request.get('dnt') === '1') {
      response.status(204).end();
      return;
    }
    if (!eventLimiter(clientKey(request))) {
      response.status(429).json({ error: 'Too many requests' });
      return;
    }
    const parsed = eventSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: 'Invalid event' });
      return;
    }

    const cookies = parseCookies(request.get('cookie'));
    const existingVisitor = cookies[VISITOR_COOKIE];
    const visitorId = existingVisitor || randomBytes(24).toString('base64url');
    if (!existingVisitor) setSecureCookie(response, VISITOR_COOKIE, visitorId, 31_536_000, 'Lax');
    const userAgent = parseUserAgent(request.get('user-agent'));
    const db = await getDatabase();
    const cutoff = new Date(Date.now() - retentionDays * 86_400_000).toISOString();

    await db.batch([
      {
        sql: `INSERT INTO analytics_events
          (occurred_at, event, page, browser, os, device, referrer, country, region, visitor_hash, is_new)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          new Date().toISOString(), parsed.data.event, parsed.data.page,
          userAgent.browser, userAgent.os, userAgent.device,
          safeReferrer(request.get('referer')),
          (request.get('x-vercel-ip-country') || '').slice(0, 2) || null,
          (request.get('x-vercel-ip-country-region') || '').slice(0, 8) || null,
          visitorHash(visitorId, analyticsSecret), existingVisitor ? 0 : 1
        ]
      },
      { sql: 'DELETE FROM analytics_events WHERE occurred_at < ?', args: [cutoff] }
    ], 'write');
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', (request, response) => {
  if (!loginLimiter(clientKey(request))) {
    response.status(429).json({ error: 'Too many login attempts' });
    return;
  }
  if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
    response.status(503).json({ error: 'Admin access is not configured' });
    return;
  }
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success || !safeEqual(parsed.data.password, process.env.ADMIN_PASSWORD)) {
    response.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  setSecureCookie(response, ADMIN_COOKIE, createSessionToken(sessionSecret), 3600, 'Strict');
  response.json({ authenticated: true });
});

app.post('/api/auth/logout', (_request, response) => {
  clearCookie(response, ADMIN_COOKIE);
  response.status(204).end();
});

app.get('/api/admin/content', requireAdmin, async (_request, response, next) => {
  try {
    response.json(await readContent(await getDatabase()));
  } catch (error) {
    next(error);
  }
});

app.put('/api/admin/content', requireAdmin, async (request, response, next) => {
  try {
    const parsed = contentSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: 'Invalid portfolio content' });
      return;
    }
    const updatedAt = new Date().toISOString();
    const content = { ...parsed.data };
    delete content.updatedAt;
    const db = await getDatabase();
    await db.execute({ sql: 'UPDATE portfolio_content SET content_json = ?, updated_at = ? WHERE id = 1', args: [JSON.stringify(content), updatedAt] });
    response.json({ ...content, updatedAt });
  } catch (error) {
    next(error);
  }
});

app.put('/api/admin/photo', requireAdmin, async (request, response, next) => {
  try {
    const parsed = photoSchema.safeParse(request.body);
    const match = parsed.success ? /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(parsed.data.dataUrl) : null;
    if (!match) {
      response.status(400).json({ error: 'Invalid image. Use JPG, PNG, or WebP.' });
      return;
    }
    const image = Buffer.from(match[2], 'base64');
    if (!image.length || image.length > 2_000_000) {
      response.status(400).json({ error: 'Image must be smaller than 2 MB.' });
      return;
    }
    const updatedAt = new Date().toISOString();
    const db = await getDatabase();
    await db.execute({
      sql: `INSERT INTO portfolio_photo (id, mime_type, data_base64, updated_at) VALUES (1, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET mime_type = excluded.mime_type, data_base64 = excluded.data_base64, updated_at = excluded.updated_at`,
      args: [match[1], match[2], updatedAt]
    });
    response.json({ photoUrl: `/api/content/photo?v=${encodeURIComponent(updatedAt)}` });
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/summary', requireAdmin, async (_request, response, next) => {
  try {
    const db = await getDatabase();
    const queries = await db.batch([
      "SELECT COUNT(*) AS value FROM analytics_events WHERE event = 'page_view'",
      'SELECT COUNT(DISTINCT visitor_hash) AS value FROM analytics_events',
      `SELECT substr(occurred_at, 1, 10) AS label, COUNT(*) AS value FROM analytics_events WHERE event = 'page_view' GROUP BY label ORDER BY label DESC LIMIT 30`,
      'SELECT browser AS label, COUNT(*) AS value FROM analytics_events GROUP BY browser ORDER BY value DESC',
      'SELECT device AS label, COUNT(*) AS value FROM analytics_events GROUP BY device ORDER BY value DESC',
      'SELECT os AS label, COUNT(*) AS value FROM analytics_events GROUP BY os ORDER BY value DESC',
      'SELECT referrer AS label, COUNT(*) AS value FROM analytics_events GROUP BY referrer ORDER BY value DESC LIMIT 12',
      "SELECT page AS label, COUNT(*) AS value FROM analytics_events WHERE event = 'page_view' GROUP BY page ORDER BY value DESC",
      `SELECT event AS label, COUNT(*) AS value FROM analytics_events WHERE event IN ('resume_download','linkedin_click','github_click','contact_click') GROUP BY event ORDER BY value DESC`,
      `SELECT COUNT(DISTINCT visitor_hash) AS value FROM analytics_events WHERE event IN ('resume_download','linkedin_click','contact_click')`
    ], 'read');

    const scalar = (index: number) => Number(queries[index].rows[0]?.value || 0);
    const rows = (index: number) => queries[index].rows.map((row) => ({ label: String(row.label), value: Number(row.value) }));
    const visitors = scalar(1);
    const converted = scalar(9);
    response.json({
      totalVisits: scalar(0),
      uniqueVisitors: visitors,
      conversionRate: visitors ? Math.round((converted / visitors) * 1000) / 10 : 0,
      visitsByDay: rows(2).reverse(), browsers: rows(3), devices: rows(4), operatingSystems: rows(5),
      referrers: rows(6), pages: rows(7), conversions: rows(8),
      retentionDays
    });
  } catch (error) {
    next(error);
  }
});

function csvCell(value: unknown) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

app.get('/api/admin/export.csv', requireAdmin, async (_request, response, next) => {
  try {
    const db = await getDatabase();
    const result = await db.execute(`SELECT occurred_at, event, page, browser, os, device, referrer, country, region, is_new
      FROM analytics_events ORDER BY occurred_at DESC LIMIT 50000`);
    const headers = ['date_time', 'event', 'page', 'browser', 'operating_system', 'device', 'referrer', 'country', 'region', 'new_visitor'];
    const lines = [headers.map(csvCell).join(',')];
    result.rows.forEach((row) => lines.push([
      row.occurred_at, row.event, row.page, row.browser, row.os, row.device,
      row.referrer, row.country, row.region, row.is_new ? 'yes' : 'no'
    ].map(csvCell).join(',')));
    response.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="portfolio-analytics-${new Date().toISOString().slice(0, 10)}.csv"`
    });
    response.send(`\uFEFF${lines.join('\r\n')}`);
  } catch (error) {
    next(error);
  }
});

app.all('/api/{*path}', (_request, response) => response.status(405).json({ error: 'Method or endpoint not allowed' }));

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  if (error instanceof SyntaxError) {
    response.status(400).json({ error: 'Invalid JSON' });
    return;
  }
  if (process.env.NODE_ENV !== 'production') console.error(error);
  response.status(500).json({ error: 'Internal server error' });
});

if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    process.stdout.write(`Portfolio API listening on http://localhost:${port}\n`);
  });
}

export default app;

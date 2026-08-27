import { mkdir } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import express, { type NextFunction, type Request, type Response } from 'express';
import { createClient, type Client } from '@libsql/client';
import { z } from 'zod';
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
} from './lib/security.ts';

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
    return database;
  })();
  return databaseReady;
}

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '4kb', type: 'application/json' }));
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

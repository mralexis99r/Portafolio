import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { PreferenceControls } from '../components/PreferenceControls';
import { copy, type Locale } from '../data/profile';

type DataPoint = { label: string; value: number };
type Summary = {
  totalVisits: number;
  uniqueVisitors: number;
  conversionRate: number;
  visitsByDay: DataPoint[];
  browsers: DataPoint[];
  devices: DataPoint[];
  operatingSystems: DataPoint[];
  referrers: DataPoint[];
  pages: DataPoint[];
  conversions: DataPoint[];
  retentionDays: number;
};

type Props = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
};

const dashboardCopy = {
  es: {
    title: 'Panel privado', subtitle: 'Efectividad del portfolio', password: 'Contraseña de administrador', login: 'Acceder', loggingIn: 'Verificando…', invalid: 'No fue posible iniciar sesión.', unavailable: 'El panel no está configurado en este entorno.', back: 'Volver al portfolio', logout: 'Cerrar sesión', export: 'Exportar CSV', refresh: 'Actualizar', visits: 'Visitas totales', visitors: 'Visitantes', conversion: 'Conversión básica', retention: 'Retención', days: 'días', trend: 'Visitas por día', browsers: 'Navegadores', devices: 'Dispositivos', os: 'Sistemas operativos', sources: 'Fuentes de tráfico', pages: 'Páginas', actions: 'Acciones clave', empty: 'Aún no hay datos para este reporte.', privacy: 'Datos agregados, sin IP completa ni fingerprinting.'
  },
  en: {
    title: 'Private dashboard', subtitle: 'Portfolio effectiveness', password: 'Administrator password', login: 'Sign in', loggingIn: 'Checking…', invalid: 'Unable to sign in.', unavailable: 'The dashboard is not configured in this environment.', back: 'Back to portfolio', logout: 'Sign out', export: 'Export CSV', refresh: 'Refresh', visits: 'Total visits', visitors: 'Visitors', conversion: 'Basic conversion', retention: 'Retention', days: 'days', trend: 'Visits by day', browsers: 'Browsers', devices: 'Devices', os: 'Operating systems', sources: 'Traffic sources', pages: 'Pages', actions: 'Key actions', empty: 'There is no data for this report yet.', privacy: 'Aggregated data, without full IP addresses or fingerprinting.'
  }
} as const;

function MetricChart({ title, data }: { title: string; data: DataPoint[] }) {
  const max = Math.max(...data.map((point) => point.value), 1);
  return (
    <section className="metric-panel">
      <h2>{title}</h2>
      {data.length ? <div className="bar-list">{data.map((point) => (
        <div className="bar-row" key={point.label}>
          <div><span title={point.label}>{point.label}</span><strong>{point.value}</strong></div>
          <progress className="bar-track" max={max} value={point.value} aria-label={`${point.label}: ${point.value}`} />
        </div>
      ))}</div> : <p className="empty-state">—</p>}
    </section>
  );
}

export function Dashboard({ locale, setLocale, theme, setTheme }: Props) {
  const t = dashboardCopy[locale];
  const [summary, setSummary] = useState<Summary | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadSummary = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/summary', { credentials: 'same-origin' });
      if (response.status === 401 || response.status === 503) {
        setAuthenticated(false);
        if (response.status === 503) setError(t.unavailable);
        return;
      }
      if (!response.ok) throw new Error('request_failed');
      setSummary(await response.json() as Summary);
      setAuthenticated(true);
      setError('');
    } catch {
      setAuthenticated(false);
      setError(t.invalid);
    }
  }, [t.invalid, t.unavailable]);

  useEffect(() => {
    const requestId = window.setTimeout(() => void loadSummary(), 0);
    return () => window.clearTimeout(requestId);
  }, [loadSummary]);

  async function login(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ password })
      });
      if (!response.ok) {
        setError(response.status === 503 ? t.unavailable : t.invalid);
        return;
      }
      setPassword('');
      await loadSummary();
    } catch {
      setError(t.invalid);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    setSummary(null);
    setAuthenticated(false);
  }

  if (authenticated !== true) {
    return (
      <main className="dashboard-login" id="main-content">
        <div className="dashboard-controls"><a href="/">← {t.back}</a><PreferenceControls locale={locale} setLocale={setLocale} theme={theme} setTheme={setTheme} labels={copy[locale].controls} /></div>
        <form onSubmit={login} className="login-panel">
          <span className="brand-mark">CR</span>
          <p>{t.subtitle}</p>
          <h1>{t.title}</h1>
          <label htmlFor="admin-password">{t.password}</label>
          <input id="admin-password" type="password" autoComplete="current-password" minLength={8} maxLength={256} required value={password} onChange={(event) => setPassword(event.target.value)} />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" disabled={busy || authenticated === null}>{busy ? t.loggingIn : t.login}<Icon name="arrow" /></button>
        </form>
      </main>
    );
  }

  return (
    <main className="dashboard" id="main-content">
      <header className="dashboard-header">
        <div><p>CR / ANALYTICS</p><h1>{t.subtitle}</h1><small>{t.privacy}</small></div>
        <div className="dashboard-actions"><PreferenceControls locale={locale} setLocale={setLocale} theme={theme} setTheme={setTheme} labels={copy[locale].controls} /><button type="button" onClick={() => void loadSummary()}>{t.refresh}</button><a href="/api/admin/export.csv" download>{t.export}<Icon name="download" /></a><button type="button" onClick={() => void logout()}>{t.logout}</button></div>
      </header>
      {summary && <>
        <section className="summary-grid">
          <article><span>{t.visits}</span><strong>{summary.totalVisits.toLocaleString(locale)}</strong></article>
          <article><span>{t.visitors}</span><strong>{summary.uniqueVisitors.toLocaleString(locale)}</strong></article>
          <article><span>{t.conversion}</span><strong>{summary.conversionRate}%</strong></article>
          <article><span>{t.retention}</span><strong>{summary.retentionDays} <small>{t.days}</small></strong></article>
        </section>
        <div className="dashboard-grid">
          <MetricChart title={t.trend} data={summary.visitsByDay} />
          <MetricChart title={t.actions} data={summary.conversions} />
          <MetricChart title={t.browsers} data={summary.browsers} />
          <MetricChart title={t.devices} data={summary.devices} />
          <MetricChart title={t.os} data={summary.operatingSystems} />
          <MetricChart title={t.sources} data={summary.referrers} />
          <MetricChart title={t.pages} data={summary.pages} />
        </div>
      </>}
    </main>
  );
}

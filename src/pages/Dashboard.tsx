import { type ChangeEvent, type FormEvent, useCallback, useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { PreferenceControls } from '../components/PreferenceControls';
import { copy, type Locale } from '../data/profile';
import { defaultContent, type PortfolioContent } from '../../shared/content';

type DataPoint = { label: string; value: number };
type Summary = { totalVisits: number; uniqueVisitors: number; conversionRate: number; visitsByDay: DataPoint[]; browsers: DataPoint[]; devices: DataPoint[]; operatingSystems: DataPoint[]; referrers: DataPoint[]; pages: DataPoint[]; conversions: DataPoint[]; retentionDays: number };
type Props = { locale: Locale; setLocale: (locale: Locale) => void; theme: 'light' | 'dark'; setTheme: (theme: 'light' | 'dark') => void };

const dashboardCopy = {
  es: { title: 'Acceso del propietario', subtitle: 'Administra tu portafolio', password: 'Contraseña de administrador', login: 'Iniciar sesión', loggingIn: 'Verificando…', invalid: 'No fue posible iniciar sesión. Revisa la contraseña.', unavailable: 'El panel no está configurado en este entorno.', back: 'Ver portafolio', logout: 'Cerrar sesión', export: 'Exportar CSV', refresh: 'Actualizar', content: 'Editar portafolio', analytics: 'Actividad', save: 'Guardar cambios', saving: 'Guardando…', saved: 'Cambios publicados correctamente.', photo: 'Foto de perfil', general: 'Información principal', summary: 'Resumen profesional', experience: 'Experiencia', certificates: 'Certificados', addExperience: 'Agregar experiencia', addCertificate: 'Agregar certificado', remove: 'Eliminar', visits: 'Visitas totales', visitors: 'Visitantes', conversion: 'Conversión básica', retention: 'Retención', days: 'días', trend: 'Visitas por día', browsers: 'Navegadores', devices: 'Dispositivos', os: 'Sistemas operativos', sources: 'Fuentes de tráfico', pages: 'Páginas', actions: 'Acciones clave', privacy: 'Datos agregados, sin IP completa ni fingerprinting.' },
  en: { title: 'Owner access', subtitle: 'Manage your portfolio', password: 'Administrator password', login: 'Sign in', loggingIn: 'Checking…', invalid: 'Unable to sign in. Check the password.', unavailable: 'The dashboard is not configured in this environment.', back: 'View portfolio', logout: 'Sign out', export: 'Export CSV', refresh: 'Refresh', content: 'Edit portfolio', analytics: 'Activity', save: 'Save changes', saving: 'Saving…', saved: 'Changes published successfully.', photo: 'Profile photo', general: 'Main information', summary: 'Professional summary', experience: 'Experience', certificates: 'Certificates', addExperience: 'Add experience', addCertificate: 'Add certificate', remove: 'Remove', visits: 'Total visits', visitors: 'Visitors', conversion: 'Basic conversion', retention: 'Retention', days: 'days', trend: 'Visits by day', browsers: 'Browsers', devices: 'Devices', os: 'Operating systems', sources: 'Traffic sources', pages: 'Pages', actions: 'Key actions', privacy: 'Aggregated data, without full IP addresses or fingerprinting.' }
} as const;

function MetricChart({ title, data }: { title: string; data: DataPoint[] }) {
  const max = Math.max(...data.map((point) => point.value), 1);
  return <section className="metric-panel"><h2>{title}</h2>{data.length ? <div className="bar-list">{data.map((point) => <div className="bar-row" key={point.label}><div><span title={point.label}>{point.label}</span><strong>{point.value}</strong></div><progress className="bar-track" max={max} value={point.value} aria-label={`${point.label}: ${point.value}`} /></div>)}</div> : <p className="empty-state">—</p>}</section>;
}

function Lines({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  return <textarea rows={4} value={value.join('\n')} onChange={(event) => onChange(event.target.value.split('\n').filter(Boolean))} />;
}

export function Dashboard({ locale, setLocale, theme, setTheme }: Props) {
  const t = dashboardCopy[locale];
  const [summary, setSummary] = useState<Summary | null>(null);
  const [content, setContent] = useState<PortfolioContent>(defaultContent);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<'content' | 'analytics'>('content');

  const loadAdmin = useCallback(async () => {
    try {
      const [summaryResponse, contentResponse] = await Promise.all([fetch('/api/admin/summary', { credentials: 'same-origin' }), fetch('/api/admin/content', { credentials: 'same-origin' })]);
      if ([summaryResponse.status, contentResponse.status].some((status) => status === 401 || status === 503)) {
        setAuthenticated(false);
        if (summaryResponse.status === 503 || contentResponse.status === 503) setError(t.unavailable);
        return;
      }
      if (!summaryResponse.ok || !contentResponse.ok) throw new Error('request_failed');
      setSummary(await summaryResponse.json() as Summary);
      setContent(await contentResponse.json() as PortfolioContent);
      setAuthenticated(true); setError('');
    } catch { setAuthenticated(false); setError(t.invalid); }
  }, [t.invalid, t.unavailable]);

  useEffect(() => { const requestId = window.setTimeout(() => void loadAdmin(), 0); return () => window.clearTimeout(requestId); }, [loadAdmin]);

  async function login(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ password }) });
      if (!response.ok) { setError(response.status === 503 ? t.unavailable : t.invalid); return; }
      setPassword(''); await loadAdmin();
    } catch { setError(t.invalid); } finally { setBusy(false); }
  }

  async function logout() { await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }); setSummary(null); setAuthenticated(false); }

  async function saveContent(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/admin/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(content) });
      if (!response.ok) throw new Error('save_failed');
      setContent(await response.json() as PortfolioContent); setNotice(t.saved);
    } catch { setError(locale === 'es' ? 'No se pudieron guardar los cambios.' : 'Changes could not be saved.'); } finally { setBusy(false); }
  }

  async function uploadPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    if (file.size > 2_000_000) { setError(locale === 'es' ? 'La foto debe pesar menos de 2 MB.' : 'The photo must be smaller than 2 MB.'); return; }
    setBusy(true); setError('');
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
      const response = await fetch('/api/admin/photo', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ dataUrl }) });
      if (!response.ok) throw new Error('upload_failed');
      const result = await response.json() as { photoUrl: string }; setContent((current) => ({ ...current, photoUrl: result.photoUrl })); setNotice(t.saved);
    } catch { setError(locale === 'es' ? 'No se pudo subir la foto.' : 'The photo could not be uploaded.'); } finally { setBusy(false); }
  }

  if (authenticated !== true) return <main className="dashboard-login" id="main-content"><div className="dashboard-controls"><a href="/">← {t.back}</a><PreferenceControls locale={locale} setLocale={setLocale} theme={theme} setTheme={setTheme} labels={copy[locale].controls} /></div><form onSubmit={login} className="login-panel"><span className="brand-mark">CR</span><p>PRIVATE / CMS</p><h1>{t.title}</h1><label htmlFor="admin-password">{t.password}</label><input id="admin-password" type="password" autoComplete="current-password" minLength={8} maxLength={256} required value={password} onChange={(event) => setPassword(event.target.value)} />{error && <p className="form-error" role="alert">{error}</p>}<button type="submit" disabled={busy || authenticated === null}>{busy ? t.loggingIn : t.login}<Icon name="arrow" /></button></form></main>;

  const updateExperience = (id: string, update: (item: PortfolioContent['experience'][number]) => PortfolioContent['experience'][number]) => setContent({ ...content, experience: content.experience.map((item) => item.id === id ? update(item) : item) });
  const updateCertificate = (id: string, update: (item: PortfolioContent['certificates'][number]) => PortfolioContent['certificates'][number]) => setContent({ ...content, certificates: content.certificates.map((item) => item.id === id ? update(item) : item) });

  return <main className="dashboard" id="main-content">
    <header className="dashboard-header"><div><p>CR / OWNER</p><h1>{t.subtitle}</h1><small>{t.privacy}</small></div><div className="dashboard-actions"><PreferenceControls locale={locale} setLocale={setLocale} theme={theme} setTheme={setTheme} labels={copy[locale].controls} /><a href="/" target="_blank" rel="noreferrer">{t.back}</a><button type="button" onClick={() => void logout()}>{t.logout}</button></div></header>
    <nav className="dashboard-tabs" aria-label="Dashboard"><button className={tab === 'content' ? 'active' : ''} onClick={() => setTab('content')}>{t.content}</button><button className={tab === 'analytics' ? 'active' : ''} onClick={() => setTab('analytics')}>{t.analytics}</button></nav>
    {tab === 'content' ? <form className="cms-form" onSubmit={saveContent}>
      <section className="cms-panel"><div className="cms-section-heading"><div><span>01</span><h2>{t.general}</h2></div><img className="cms-photo" src={content.photoUrl} alt="" /></div><div className="cms-grid">
        {(['name', 'role', 'location', 'email', 'phoneDisplay', 'phoneHref', 'whatsapp', 'linkedin', 'github'] as const).map((field) => <label key={field}><span>{field}</span><input value={content[field]} onChange={(event) => setContent({ ...content, [field]: event.target.value })} required /></label>)}
        <label className="full"><span>{t.photo} (JPG, PNG, WebP · max. 2 MB)</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void uploadPhoto(event)} /></label>
        <label className="full"><span>{t.summary} · ES</span><textarea rows={4} value={content.summary.es} onChange={(event) => setContent({ ...content, summary: { ...content.summary, es: event.target.value } })} /></label>
        <label className="full"><span>{t.summary} · EN</span><textarea rows={4} value={content.summary.en} onChange={(event) => setContent({ ...content, summary: { ...content.summary, en: event.target.value } })} /></label>
      </div></section>
      <section className="cms-panel"><div className="cms-section-heading"><div><span>02</span><h2>{t.experience}</h2></div><button type="button" className="outline-button" onClick={() => setContent({ ...content, experience: [{ id: crypto.randomUUID(), company: '', role: { es: '', en: '' }, period: { es: '', en: '' }, responsibilities: { es: [], en: [] }, technologies: [] }, ...content.experience] })}>+ {t.addExperience}</button></div><div className="cms-stack">{content.experience.map((job, index) => <article className="cms-card" key={job.id}><div className="cms-card-head"><strong>{String(index + 1).padStart(2, '0')} · {job.company || t.experience}</strong><button type="button" onClick={() => setContent({ ...content, experience: content.experience.filter((item) => item.id !== job.id) })}>{t.remove}</button></div><div className="cms-grid">
        <label><span>Empresa</span><input value={job.company} onChange={(event) => updateExperience(job.id, (item) => ({ ...item, company: event.target.value }))} /></label>
        {(['role', 'period'] as const).flatMap((field) => (['es', 'en'] as const).map((lang) => <label key={`${field}-${lang}`}><span>{field} · {lang.toUpperCase()}</span><input value={job[field][lang]} onChange={(event) => updateExperience(job.id, (item) => ({ ...item, [field]: { ...item[field], [lang]: event.target.value } }))} /></label>))}
        {(['es', 'en'] as const).map((lang) => <label className="full" key={lang}><span>Responsabilidades · {lang.toUpperCase()} (una por línea)</span><Lines value={job.responsibilities[lang]} onChange={(value) => updateExperience(job.id, (item) => ({ ...item, responsibilities: { ...item.responsibilities, [lang]: value } }))} /></label>)}
        <label className="full"><span>Tecnologías (separadas por coma)</span><input value={job.technologies.join(', ')} onChange={(event) => updateExperience(job.id, (item) => ({ ...item, technologies: event.target.value.split(',').map((value) => value.trim()).filter(Boolean) }))} /></label>
      </div></article>)}</div></section>
      <section className="cms-panel"><div className="cms-section-heading"><div><span>03</span><h2>{t.certificates}</h2></div><button type="button" className="outline-button" onClick={() => setContent({ ...content, certificates: [...content.certificates, { id: crypto.randomUUID(), name: { es: '', en: '' }, issuer: '', date: '', credentialUrl: '' }] })}>+ {t.addCertificate}</button></div><div className="cms-stack">{content.certificates.map((certificate) => <article className="cms-card" key={certificate.id}><div className="cms-card-head"><strong>{certificate.name[locale] || t.certificates}</strong><button type="button" onClick={() => setContent({ ...content, certificates: content.certificates.filter((item) => item.id !== certificate.id) })}>{t.remove}</button></div><div className="cms-grid">{(['es', 'en'] as const).map((lang) => <label key={lang}><span>Nombre · {lang.toUpperCase()}</span><input value={certificate.name[lang]} onChange={(event) => updateCertificate(certificate.id, (item) => ({ ...item, name: { ...item.name, [lang]: event.target.value } }))} /></label>)}{(['issuer', 'date', 'credentialUrl'] as const).map((field) => <label key={field}><span>{field}</span><input value={certificate[field]} onChange={(event) => updateCertificate(certificate.id, (item) => ({ ...item, [field]: event.target.value }))} /></label>)}</div></article>)}</div></section>
      <div className="cms-savebar">{error && <p className="form-error" role="alert">{error}</p>}{notice && <p className="form-success" role="status">{notice}</p>}<button type="submit" disabled={busy}>{busy ? t.saving : t.save}<Icon name="arrow" /></button></div>
    </form> : <>{summary && <><section className="summary-grid"><article><span>{t.visits}</span><strong>{summary.totalVisits.toLocaleString(locale)}</strong></article><article><span>{t.visitors}</span><strong>{summary.uniqueVisitors.toLocaleString(locale)}</strong></article><article><span>{t.conversion}</span><strong>{summary.conversionRate}%</strong></article><article><span>{t.retention}</span><strong>{summary.retentionDays} <small>{t.days}</small></strong></article></section><div className="analytics-toolbar"><button type="button" onClick={() => void loadAdmin()}>{t.refresh}</button><a href="/api/admin/export.csv" download>{t.export}<Icon name="download" /></a></div><div className="dashboard-grid"><MetricChart title={t.trend} data={summary.visitsByDay} /><MetricChart title={t.actions} data={summary.conversions} /><MetricChart title={t.browsers} data={summary.browsers} /><MetricChart title={t.devices} data={summary.devices} /><MetricChart title={t.os} data={summary.operatingSystems} /><MetricChart title={t.sources} data={summary.referrers} /><MetricChart title={t.pages} data={summary.pages} /></div></>}</>}
  </main>;
}

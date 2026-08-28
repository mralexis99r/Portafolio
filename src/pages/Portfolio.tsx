import { useEffect, useState, type ReactNode } from 'react';
import { Icon } from '../components/Icon';
import { PreferenceControls } from '../components/PreferenceControls';
import { copy, profile, type Locale } from '../data/profile';
import { trackEvent, usePageView, useSectionView } from '../hooks/useAnalytics';
import { defaultContent, type PortfolioContent } from '../../shared/content';

type Props = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
};

function ExternalLink({ href, children, className, event }: { href: string; children: ReactNode; className?: string; event?: Parameters<typeof trackEvent>[0] }) {
  return <a href={href} className={className} target="_blank" rel="noopener noreferrer" onClick={() => event && trackEvent(event)}>{children}</a>;
}

export function Portfolio({ locale, setLocale, theme, setTheme }: Props) {
  const t = copy[locale];
  const [menuOpen, setMenuOpen] = useState(false);
  const [content, setContent] = useState<PortfolioContent>(defaultContent);
  const experienceRef = useSectionView('view_experience');
  const projectsRef = useSectionView('view_projects');
  usePageView();

  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('hashchange', close);
    return () => window.removeEventListener('hashchange', close);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/content', { signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<PortfolioContent> : Promise.reject())
      .then(setContent)
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  return (
    <>
      <header className="site-header">
        <div className="shell header-inner">
          <a className="brand" href="#top" aria-label={`${content.name} — ${content.role}`}>
            <span className="brand-mark">CR</span>
            <span><strong>Cristian Roman</strong><small>QA Engineer</small></span>
          </a>
          <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Primary navigation">
            <a href="#profile" onClick={() => setMenuOpen(false)}>{t.nav.about}</a>
            <a href="#skills" onClick={() => setMenuOpen(false)}>{t.nav.skills}</a>
            <a href="#experience" onClick={() => setMenuOpen(false)}>{t.nav.experience}</a>
            <a href="#projects" onClick={() => setMenuOpen(false)}>{t.nav.projects}</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>{t.nav.contact}</a>
          </nav>
          <div className="header-actions">
            <PreferenceControls locale={locale} setLocale={setLocale} theme={theme} setTheme={setTheme} labels={t.controls} />
            <button type="button" className="menu-button" aria-expanded={menuOpen} aria-label={menuOpen ? t.controls.closeMenu : t.controls.menu} onClick={() => setMenuOpen(!menuOpen)}>
              <Icon name={menuOpen ? 'x' : 'menu'} />
            </button>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section className="hero" id="top">
          <div className="shell hero-grid">
            <div className="hero-copy reveal">
              <div className="eyebrow"><span className="status-dot" />{t.hero.eyebrow}</div>
              <h1><span>{content.name}</span>{content.role}</h1>
              <p className="hero-summary">{content.summary[locale]}</p>
              <div className="hero-actions">
                <a className="button primary" href="#experience">{t.hero.experience}<Icon name="arrow" /></a>
                <a className="button secondary" href="#projects">{t.hero.projects}</a>
                <a className="text-link" href={profile.resume[locale]} download onClick={() => trackEvent('resume_download')}><Icon name="download" />{t.hero.resume}</a>
              </div>
              <div className="social-row" aria-label={t.contact.social}>
                <ExternalLink href={content.linkedin} event="linkedin_click"><Icon name="linkedin" /><span>LinkedIn</span></ExternalLink>
                <ExternalLink href={content.github} event="github_click"><Icon name="github" /><span>GitHub</span></ExternalLink>
              </div>
            </div>
            <div className="hero-visual" aria-label="QA engineering overview">
              <div className="visual-frame">
                <div className="visual-head"><span>QUALITY / SYSTEM</span><span>2026</span></div>
                <div className="visual-core">
                  {content.photoUrl
                    ? <img src={content.photoUrl} alt={content.name} />
                    : <><div className="initials" aria-hidden="true">CR</div><span className="orbit orbit-one" /><span className="orbit orbit-two" /></>}
                </div>
                <div className="quality-grid">
                  {profile.focus.map((item, index) => <div key={item.en}><span>0{index + 1}</span>{item[locale]}</div>)}
                </div>
              </div>
              <div className="availability"><span className="status-dot" />{t.hero.available}</div>
            </div>
          </div>
          <a className="scroll-cue" href="#profile"><span>{t.hero.scroll}</span><i /></a>
        </section>

        <section className="section profile-section" id="profile">
          <div className="shell split-layout">
            <div><p className="section-kicker">01 / {t.about.kicker}</p><h2>{t.about.title}</h2></div>
            <div className="profile-content">
              <p className="large-copy">{t.about.body}</p>
              <p className="list-label">{t.about.label}</p>
              <ol className="principles">
                {t.about.items.map((item, index) => <li key={item}><span>0{index + 1}</span><p>{item}</p></li>)}
              </ol>
            </div>
          </div>
        </section>

        <section className="section skills-section" id="skills">
          <div className="shell">
            <div className="section-heading"><p className="section-kicker">02 / {t.skills.kicker}</p><h2>{t.skills.title}</h2><p>{t.skills.body}</p></div>
            <div className="skills-matrix">
              {profile.skills.map((group, index) => (
                <article className="skill-row" key={group.title.en}>
                  <span className="row-index">0{index + 1}</span>
                  <h3>{group.title[locale]}</h3>
                  <ul>{group.items.map((skill) => <li key={skill}>{skill}</li>)}</ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section experience-section" id="experience" ref={experienceRef}>
          <div className="shell">
            <div className="section-heading"><p className="section-kicker">03 / {t.experience.kicker}</p><h2>{t.experience.title}</h2><p>{t.experience.body}</p></div>
            <div className="timeline">
              {content.experience.map((job, index) => (
                <article className="experience-item" key={job.id}>
                  <div className="experience-meta"><span>0{index + 1}</span><time>{job.period[locale]}</time></div>
                  <div className="experience-main"><h3>{job.role[locale]}</h3><p className="company">{job.company}</p><ul>{job.responsibilities[locale].map((item) => <li key={item}>{item}</li>)}</ul></div>
                  <div className="experience-tools"><span>{t.experience.technologies}</span><p>{job.technologies.join(' · ')}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section projects-section" id="projects" ref={projectsRef}>
          <div className="shell">
            <div className="section-heading"><p className="section-kicker">04 / {t.projects.kicker}</p><h2>{t.projects.title}</h2><p>{t.projects.body}</p></div>
            <div className="project-list">
              {profile.projects.map((project, index) => (
                <article className="project" key={project.title}>
                  <div className="project-number">0{index + 1}</div>
                  <div className="project-body"><div className="verified"><span />{t.projects.verified}</div><h3>{project.title}</h3><p>{project.description[locale]}</p><ul>{project.technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul></div>
                  <ExternalLink href={project.repository} className="project-link" event="github_click"><span>{t.projects.repository}</span><Icon name="arrow" /></ExternalLink>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section credentials-section">
          <div className="shell">
            <h2>{t.education.title}</h2>
            <div className="credentials-grid">
              <div><span>{t.education.education}</span><h3>{profile.education.degree[locale]}</h3><p>{profile.education.institution} · {profile.education.period}</p></div>
              <div><span>{t.education.languages}</span>{profile.languages.map((language) => <p className="language-row" key={language.language.en}><strong>{language.language[locale]}</strong><b>{language.level}</b></p>)}</div>
              {content.certificates.length > 0 && <div className="certificates-list"><span>{locale === 'es' ? 'Certificados' : 'Certificates'}</span>{content.certificates.map((certificate) => (
                <article key={certificate.id} className="certificate-row"><h3>{certificate.name[locale]}</h3><p>{certificate.issuer}{certificate.date ? ` · ${certificate.date}` : ''}</p>{certificate.credentialUrl && <ExternalLink href={certificate.credentialUrl}>{locale === 'es' ? 'Ver credencial' : 'View credential'} <Icon name="arrow" /></ExternalLink>}</article>
              ))}</div>}
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="shell contact-grid">
            <div><p className="section-kicker">05 / {t.contact.kicker}</p><h2>{t.contact.title}</h2><p>{t.contact.body}</p></div>
            <div className="contact-actions">
              <a className="contact-primary" href={`mailto:${content.email}`} onClick={() => trackEvent('contact_click')}><span><Icon name="mail" />{t.contact.email}</span><Icon name="arrow" /></a>
              <ExternalLink href={content.whatsapp} className="contact-line" event="contact_click"><span><Icon name="whatsapp" />{t.contact.whatsapp}</span><strong>{content.phoneDisplay}</strong></ExternalLink>
              <a className="contact-line" href={content.phoneHref} onClick={() => trackEvent('contact_click')}><span><Icon name="phone" />{t.contact.phone}</span><strong>{content.phoneDisplay}</strong></a>
              <div className="contact-line static"><span><Icon name="map" />{t.contact.location}</span><strong>{content.location}</strong></div>
              <p className="contact-email">{content.email}</p>
            </div>
          </div>
        </section>
      </main>

      <footer><div className="shell footer-inner"><div><strong>CR / QA</strong><p>{t.footer.note}</p></div><div><p>© {new Date().getFullYear()} {content.name}</p><small>{t.footer.rights}</small></div></div></footer>
    </>
  );
}

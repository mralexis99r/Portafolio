import { useEffect, useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { Portfolio } from './pages/Portfolio';
import { copy, type Locale } from './data/profile';

type Theme = 'light' | 'dark';

function initialLocale(): Locale {
  const saved = localStorage.getItem('portfolio-language');
  if (saved === 'es' || saved === 'en') return saved;
  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
}

function initialTheme(): Theme {
  const saved = localStorage.getItem('portfolio-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem('portfolio-language', locale);
    document.title = locale === 'es'
      ? 'Cristian Alexis Roman Santiago | QA Engineer'
      : 'Cristian Alexis Roman Santiago | QA Engineer';
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) {
      description.content = locale === 'es'
        ? 'Portfolio de Cristian Alexis Roman Santiago, QA Engineer especializado en testing funcional, automatización, APIs, datos y CI/CD.'
        : 'Cristian Alexis Roman Santiago’s QA Engineer portfolio, focused on functional testing, automation, APIs, data, and CI/CD.';
    }
    const skipLink = document.querySelector<HTMLAnchorElement>('.skip-link');
    if (skipLink) skipLink.textContent = copy[locale].a11y.skip;
  }, [locale]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('portfolio-theme', theme);
    const metaTheme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (metaTheme) metaTheme.content = theme === 'dark' ? '#0d0b1d' : '#f7f7fc';
  }, [theme]);

  if (window.location.pathname === '/login' || window.location.pathname === '/private-insights') {
    return <Dashboard locale={locale} setLocale={setLocale} theme={theme} setTheme={setTheme} />;
  }

  return (
    <Portfolio
      locale={locale}
      setLocale={setLocale}
      theme={theme}
      setTheme={setTheme}
    />
  );
}

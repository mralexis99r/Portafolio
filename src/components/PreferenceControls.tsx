import { Icon } from './Icon';
import type { Locale } from '../data/profile';

type Props = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  labels: {
    language: string;
    theme: string;
    light: string;
    dark: string;
  };
};

export function PreferenceControls({ locale, setLocale, theme, setTheme, labels }: Props) {
  return (
    <div className="preference-controls">
      <div className="language-switch" role="group" aria-label={labels.language}>
        <button type="button" lang="es" aria-pressed={locale === 'es'} onClick={() => setLocale('es')}>ES</button>
        <button type="button" lang="en" aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>EN</button>
      </div>
      <button
        type="button"
        className="icon-button"
        aria-label={`${labels.theme}: ${theme === 'dark' ? labels.light : labels.dark}`}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
      </button>
    </div>
  );
}

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('portfolio preferences', () => {
  it('switches all recruiter-facing content to English and persists the choice', () => {
    localStorage.setItem('portfolio-language', 'es');
    render(<App />);

    expect(screen.getByRole('heading', { name: /Cristian Alexis Roman Santiago/i })).toHaveTextContent('QA Engineer');
    expect(screen.getByRole('link', { name: 'Ver experiencia' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'EN' }));

    expect(screen.getByRole('link', { name: 'View experience' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Featured QA projects' })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem('portfolio-language')).toBe('en');
  });

  it('persists the selected color theme', () => {
    localStorage.setItem('portfolio-language', 'en');
    localStorage.setItem('portfolio-theme', 'light');
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Change theme: Dark theme/ }));

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('portfolio-theme')).toBe('dark');
  });
});

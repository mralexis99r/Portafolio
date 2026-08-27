import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

class IntersectionObserverMock {
  observe() {}
  disconnect() {}
  unobserve() {}
}

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
vi.stubGlobal('matchMedia', vi.fn(() => ({
  matches: false,
  media: '',
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
})));
Object.defineProperty(navigator, 'sendBeacon', { value: vi.fn(() => true), configurable: true });

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

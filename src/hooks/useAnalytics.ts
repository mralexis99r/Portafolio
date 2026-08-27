import { useCallback, useEffect, useRef } from 'react';

export type AnalyticsEvent = 'page_view' | 'view_experience' | 'view_projects' | 'linkedin_click' | 'github_click' | 'resume_download' | 'contact_click';

function analyticsAllowed() {
  return import.meta.env.VITE_ANALYTICS_ENABLED !== 'false' && navigator.doNotTrack !== '1';
}

export function trackEvent(event: AnalyticsEvent) {
  if (!analyticsAllowed()) return;

  const payload = JSON.stringify({ event, page: window.location.pathname });
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/events', new Blob([payload], { type: 'application/json' }));
    return;
  }

  void fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    credentials: 'same-origin',
    keepalive: true
  });
}

export function usePageView() {
  useEffect(() => trackEvent('page_view'), []);
}

export function useSectionView(event: Extract<AnalyticsEvent, 'view_experience' | 'view_projects'>) {
  const elementRef = useRef<HTMLElement | null>(null);
  const tracked = useRef(false);
  const setRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !tracked.current) {
        tracked.current = true;
        trackEvent(event);
        observer.disconnect();
      }
    }, { threshold: 0.35 });

    observer.observe(element);
    return () => observer.disconnect();
  }, [event]);

  return setRef;
}

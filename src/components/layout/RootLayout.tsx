import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { LaunchBar } from './LaunchBar';
import './RootLayout.css';

export function RootLayout() {
  const { pathname, hash } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);

  /* On navigation: return to the top and move focus into the new page so
     keyboard and screen reader users are not left behind in the header. */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, hash]);

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <LaunchBar />
      <Header />
      <main id="main" ref={mainRef} tabIndex={-1} key={pathname} className="shell__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

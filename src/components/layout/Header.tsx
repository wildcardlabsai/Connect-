import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Logo } from '../brand/Logo';
import { Button } from '../ui/Button';
import { JOIN_LABEL, JOIN_PATH, primaryNav } from '../../data/nav';
import './Header.css';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => window.scrollY > 8);
  const { pathname } = useLocation();
  const [renderedPath, setRenderedPath] = useState(pathname);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  /* Distance from the top of the viewport to the bottom of the header bar.
     It changes with scroll position, because the launch bar above the header
     scrolls away while the header itself stays put. The mobile menu starts
     here so it never covers its own close button. */
  const [menuTop, setMenuTop] = useState(0);

  const measureMenuTop = () => {
    const bottom = headerRef.current?.getBoundingClientRect().bottom ?? 0;
    setMenuTop(Math.max(0, Math.round(bottom)));
  };

  const toggleMenu = () => {
    setMenuOpen((open) => {
      if (!open) measureMenuTop();
      return !open;
    });
  };

  /* Close the mobile menu whenever the route changes. Adjusting state during
     render rather than in an effect avoids a frame with the menu still open. */
  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    if (menuOpen) setMenuOpen(false);
  }

  /* A hairline appears under the header once the page has moved. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* While the menu is open: lock the page behind it and honour Escape. */
  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };

    const onResize = () => measureMenuTop();

    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [menuOpen]);

  return (
    <header
      ref={headerRef}
      className={`header${scrolled ? ' is-scrolled' : ''}${menuOpen ? ' is-open' : ''}`}
    >
      <div className="container header__inner">
        <Link to="/" className="header__brand" aria-label="ConnectCymru, home">
          <Logo size="md" accented />
        </Link>

        <nav className="header__nav" aria-label="Primary">
          <ul className="header__list">
            {primaryNav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `header__link${isActive ? ' is-active' : ''}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__actions">
          <Button to={JOIN_PATH} variant="accent" size="sm" className="header__cta">
            {JOIN_LABEL}
          </Button>

          <button
            ref={toggleRef}
            type="button"
            className="header__toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={toggleMenu}
          >
            <span className="visually-hidden">
              {menuOpen ? 'Close menu' : 'Open menu'}
            </span>
            <span className="header__bars" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      {/* Kept in the DOM so it can animate both ways; `inert` takes it out of
          the tab order and the accessibility tree while it is closed. */}
      <div
        id="mobile-menu"
        className="header__menu"
        inert={!menuOpen}
        style={{ '--menu-top': `${menuTop}px` } as CSSProperties}
      >
        <nav className="container header__menu-inner" aria-label="Primary, mobile">
          <ul className="header__menu-list">
            {primaryNav.map((item, index) => (
              <li key={item.to} style={{ '--i': index } as CSSProperties}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `header__menu-link${isActive ? ' is-active' : ''}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <Button to={JOIN_PATH} variant="accent" size="lg" fullWidth arrow>
            {JOIN_LABEL}
          </Button>
        </nav>
      </div>
    </header>
  );
}

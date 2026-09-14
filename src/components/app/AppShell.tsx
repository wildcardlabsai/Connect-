import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import './AppShell.css';

export type AppNavItem = { label: string; to: string; end?: boolean };

type AppShellProps = {
  title: string;
  subtitle?: string;
  nav: AppNavItem[];
  action?: ReactNode;
  children: ReactNode;
};

/**
 * Shared frame for the signed-in dashboard and the admin panel: a title, a
 * row of section tabs, and content below. Deliberately plain (no sidebar,
 * no fake widgets) so it reads as a working tool rather than a mock dashboard.
 */
export function AppShell({ title, subtitle, nav, action, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <div className="container app-shell__head">
        <div>
          <h1 className="app-shell__title">{title}</h1>
          {subtitle ? <p className="app-shell__subtitle">{subtitle}</p> : null}
        </div>
        {action}
      </div>

      <div className="app-shell__nav-wrap">
        <nav className="container app-shell__nav" aria-label="Section">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `app-shell__tab${isActive ? ' is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="container app-shell__body">{children}</div>
    </div>
  );
}

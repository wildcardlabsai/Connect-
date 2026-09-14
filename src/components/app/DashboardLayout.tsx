import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from './AppShell';
import { Button } from '../ui/Button';
import { useAuth } from '../../lib/auth';

const NAV = [
  { label: 'Overview', to: '/app', end: true },
  { label: 'My Listings', to: '/app/listings' },
  { label: 'My Requirements', to: '/app/requirements' },
  { label: 'Matches', to: '/app/matches' },
  { label: 'Messages', to: '/app/messages' },
  { label: 'Settings', to: '/app/settings' },
];

export function DashboardLayout({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const { profile } = useAuth();

  return (
    <AppShell
      title={title}
      subtitle={subtitle ?? (profile ? profile.company_name : undefined)}
      nav={NAV}
      action={action}
    >
      {children}
    </AppShell>
  );
}

/** Small reusable "nothing here yet" block with a call to action. */
export function EmptyState({
  title,
  body,
  actionLabel,
  actionTo,
}: {
  title: string;
  body: string;
  actionLabel: string;
  actionTo: string;
}) {
  return (
    <div className="app-empty">
      <h2 style={{ fontSize: 'var(--t-h4)', marginBottom: '0.5rem' }}>{title}</h2>
      <p>{body}</p>
      <div className="btn-row">
        <Button to={actionTo} variant="solid" arrow>
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

export function InlineLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="btn btn--outline btn--sm">
      <span className="btn__label">{children}</span>
    </Link>
  );
}

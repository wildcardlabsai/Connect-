import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth';
import { usePlatformMode } from './usePlatformMode';
import { Button } from '../components/ui/Button';
import type { PlatformMode } from './platform';

/**
 * Wraps any route that needs a real backend behind it (an account, a
 * database) rather than the static marketing site. Shows a plain
 * explanation instead of a broken screen while the platform mode is still
 * being resolved, and a different one if neither Supabase nor Claude's own
 * database turns out to be available — see platform.ts for what each mode
 * means.
 */
export function RequirePlatform({ children }: { children: ReactNode }) {
  const mode = usePlatformMode();

  if (mode === 'loading') return <LoadingScreen />;

  if (mode === 'none') {
    return (
      <section className="section container container--narrow">
        <p className="eyebrow" style={{ marginBottom: '1rem' }}>
          <span className="eyebrow__mark" aria-hidden="true" />
          Not connected yet
        </p>
        <h1 style={{ fontSize: 'var(--t-h2)', marginBottom: '1rem', maxWidth: '18ch' }}>
          The platform isn&rsquo;t switched on for this build.
        </h1>
        <p className="lead" style={{ marginBottom: '2rem', maxWidth: '52ch' }}>
          Accounts, listings and messaging need a backend connected. Add
          <code style={{ margin: '0 0.3em' }}>VITE_SUPABASE_URL</code> and
          <code style={{ margin: '0 0.3em' }}>VITE_SUPABASE_ANON_KEY</code> to the
          environment and rebuild &mdash; see <code>supabase/README.md</code> for the exact
          steps &mdash; or open this page live inside a Claude conversation with the
          database capability granted, see <code>claude-db-README.md</code>.
        </p>
        <Button to="/">Back to the home page</Button>
      </section>
    );
  }

  return <>{children}</>;
}

/** Redirects to /login, remembering where the visitor was headed. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  return <>{children}</>;
}

/** As RequireAuth, but also checks admin access and shows a plain refusal.
    In claude-db mode that check is a self-reported flag rather than a real
    permission (see claudeDb.ts) — the copy below reflects that honestly. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading, mode } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  if (!isAdmin) {
    return (
      <section className="section container container--narrow">
        <h1 style={{ fontSize: 'var(--t-h2)', marginBottom: '1rem' }}>Admin access only.</h1>
        <p className="lead" style={{ marginBottom: '2rem' }}>
          {mode === 'claude-db'
            ? 'Turn on "treat this business as admin" in Settings to see this page — there is no real permission check in this demo mode.'
            : 'Your account does not have admin access. If you believe it should, ask whoever administers the ConnectCymru database to grant it.'}
        </p>
        <Button to="/app">Back to your dashboard</Button>
      </section>
    );
  }

  return <>{children}</>;
}

/**
 * Wraps the working parts of the dashboard (listings, requirements,
 * matches, messages) — everything except Settings, which stays reachable
 * so a pending or rejected business can still see and correct its details.
 * Admins bypass this on their own account: nothing about running the
 * platform should depend on the admin having approved themselves first.
 */
export function RequireApproved({ children }: { children: ReactNode }) {
  const { user, profile, isAdmin, loading, mode } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (isAdmin) return <>{children}</>;
  if (!profile) return <LoadingScreen />;

  if (profile.status === 'pending') return <PendingScreen mode={mode} />;
  if (profile.status === 'rejected') return <RejectedScreen reason={profile.rejection_reason} />;

  return <>{children}</>;
}

function PendingScreen({ mode }: { mode: PlatformMode | 'loading' }) {
  return (
    <section className="section container container--narrow">
      <p className="eyebrow" style={{ marginBottom: '1rem' }}>
        <span className="eyebrow__mark" aria-hidden="true" />
        Pending verification
      </p>
      <h1 style={{ fontSize: 'var(--t-h2)', marginBottom: '1rem', maxWidth: '20ch' }}>
        Your account is waiting to be checked.
      </h1>
      <p className="lead" style={{ marginBottom: '1.5rem', maxWidth: '52ch' }}>
        We review each new business registration by hand before giving it full access to
        listings, requirements and messaging. There&rsquo;s nothing else to do on your side
        &mdash; we&rsquo;ll be in touch once yours has been reviewed.
      </p>
      <p style={{ fontSize: 'var(--t-small)', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '52ch' }}>
        {mode === 'claude-db'
          ? 'This is the demo backend: turn on "treat this business as admin" for a different business in Settings, then approve this one from Admin → Businesses, to see what happens next.'
          : 'Spotted a mistake in what you submitted? You can still update it from Settings.'}
      </p>
      <div className="btn-row">
        <Button to="/app/settings" variant="solid">
          Go to Settings
        </Button>
        <Button to="/contact" variant="outline">
          Contact us
        </Button>
      </div>
    </section>
  );
}

function RejectedScreen({ reason }: { reason: string | null }) {
  return (
    <section className="section container container--narrow">
      <p className="eyebrow" style={{ marginBottom: '1rem' }}>
        <span className="eyebrow__mark" aria-hidden="true" />
        Registration not approved
      </p>
      <h1 style={{ fontSize: 'var(--t-h2)', marginBottom: '1rem', maxWidth: '20ch' }}>
        We weren&rsquo;t able to approve this registration.
      </h1>
      {reason ? (
        <div className="note" style={{ marginBottom: '1.5rem', maxWidth: '52ch' }}>
          <p className="note__label">Reason given</p>
          <p className="note__body">{reason}</p>
        </div>
      ) : (
        <p className="lead" style={{ marginBottom: '1.5rem', maxWidth: '52ch' }}>
          No reason was recorded. Get in touch and we can explain what needs correcting.
        </p>
      )}
      <p style={{ fontSize: 'var(--t-small)', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '52ch' }}>
        You can update your details from Settings and get back in touch to have the
        registration looked at again.
      </p>
      <div className="btn-row">
        <Button to="/app/settings" variant="solid">
          Go to Settings
        </Button>
        <Button to="/contact" variant="outline">
          Contact us
        </Button>
      </div>
    </section>
  );
}

function LoadingScreen() {
  return (
    <div className="container section" aria-busy="true">
      <p className="lead">Loading&hellip;</p>
    </div>
  );
}

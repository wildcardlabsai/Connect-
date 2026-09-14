import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth';
import { isSupabaseConfigured } from './supabase';
import { Button } from '../components/ui/Button';

/**
 * Wraps any route that needs the platform (an account, a database) to be
 * switched on. Shows a plain explanation instead of a broken screen when
 * VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set yet.
 */
export function RequireSupabase({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured) {
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
          Accounts, listings and messaging need a Supabase project connected. Add
          <code style={{ margin: '0 0.3em' }}>VITE_SUPABASE_URL</code> and
          <code style={{ margin: '0 0.3em' }}>VITE_SUPABASE_ANON_KEY</code> to the
          environment and rebuild. See <code>supabase/README.md</code> for the exact steps.
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

/** As RequireAuth, but also checks the admin role and shows a plain refusal. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  if (!isAdmin) {
    return (
      <section className="section container container--narrow">
        <h1 style={{ fontSize: 'var(--t-h2)', marginBottom: '1rem' }}>Admin access only.</h1>
        <p className="lead" style={{ marginBottom: '2rem' }}>
          Your account does not have admin access. If you believe it should, ask whoever
          administers the ConnectCymru database to grant it.
        </p>
        <Button to="/app">Back to your dashboard</Button>
      </section>
    );
  }

  return <>{children}</>;
}

function LoadingScreen() {
  return (
    <div className="container section" aria-busy="true">
      <p className="lead">Loading&hellip;</p>
    </div>
  );
}

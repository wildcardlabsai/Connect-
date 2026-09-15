/* ==========================================================================
   Which backend is actually running.
   --------------------------------------------------------------------------
   Three possible modes:

     'supabase'   VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set. The
                  real backend: works on any host, for any number of real
                  businesses. See supabase/README.md.

     'claude-db'  No Supabase configured, but this page is running live
                  inside a Claude conversation with the `db` capability
                  granted. Claude's own database stands in for a backend so
                  the whole flow can be tried without setting anything up.

                  Two things this mode can never do, by platform design, not
                  by choice here: it cannot be shared with anyone outside the
                  artifact owner's own Claude account, and it has no real
                  per-user login (the `user` capability isn't available to
                  this account), so "signing in" is really just picking
                  which business profile you're acting as. It is a solo
                  prototype for trying the product, never a production
                  backend. See claudeDb.ts.

     'none'       Neither is available. /app, /admin, /login, /signup and
                  /browse show a plain explanation instead of data.

   window.claude only exists at all when a page is actually being served by
   Claude (a live conversation, or the artifact's own hosted copy) — a
   completely separate deployment (Netlify, Vercel, your own server) never
   has it, so 'claude-db' mode is structurally impossible outside Claude's
   own hosting. Checking for it here can never affect a real deployment.
   ========================================================================== */

import { isSupabaseConfigured } from './supabase';
import type { DB } from './claudeDbTypes';

export type PlatformMode = 'supabase' | 'claude-db' | 'none';

declare global {
  interface Window {
    claude?: {
      use<T = unknown>(name: string): Promise<T | null>;
    };
  }
}

let dbPromise: Promise<DB | null> | null = null;

/** Resolves once to the `db` capability namespace, or null. Memoized: every
    caller shares the same in-flight (or settled) attempt. */
function getClaudeDbNamespace(): Promise<DB | null> {
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    if (typeof window === 'undefined' || typeof window.claude?.use !== 'function') return null;
    try {
      return await window.claude.use<DB>('db');
    } catch {
      return null;
    }
  })();

  return dbPromise;
}

let modePromise: Promise<PlatformMode> | null = null;

/** Resolves once to the active backend mode. Memoized for the page's life. */
export function resolvePlatformMode(): Promise<PlatformMode> {
  if (modePromise) return modePromise;

  modePromise = (async () => {
    if (isSupabaseConfigured) return 'supabase';
    const db = await getClaudeDbNamespace();
    return db ? 'claude-db' : 'none';
  })();

  return modePromise;
}

/** The resolved `db` namespace when the mode is 'claude-db', otherwise null.
    Safe to call before the mode is known; resolves alongside it. */
export async function getClaudeDb(): Promise<DB | null> {
  const mode = await resolvePlatformMode();
  return mode === 'claude-db' ? getClaudeDbNamespace() : null;
}

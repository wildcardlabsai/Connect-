import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True once both Supabase environment variables are present. Everything
 * behind a login (the dashboard, browsing listings, admin) checks this
 * before rendering, so the site degrades to a clear "not connected yet"
 * message instead of crashing when the project hasn't been wired up.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * The Supabase client. Safe to import anywhere: when the environment
 * variables are missing this still returns a working client pointed at a
 * placeholder project, so a stray import can't crash the app at load time.
 * Every real call site should check `isSupabaseConfigured` first (the
 * `useAuth` hook and the `RequireSupabase` wrapper already do), rather than
 * relying on this call to fail.
 */
// No generic schema type here: without the Supabase CLI to generate one, a
// hand-written Database type fights the client's internal generic
// constraints more than it helps. Each function in `src/lib/api/` casts its
// result to the matching type from `database.types.ts` instead, which gives
// the same safety at every call site with far less fragility.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
  { auth: { persistSession: true, autoRefreshToken: true } },
);

/**
 * Recomputes suggested matches server-side. Called after a listing or
 * requirement is created, edited or its status changes. Failures are
 * swallowed on purpose: matches simply catch up next time something
 * changes, and this should never block the action that triggered it.
 */
export async function refreshMatchesQuietly(): Promise<void> {
  try {
    await supabase.rpc('refresh_matches');
  } catch {
    // Best-effort only, see comment above.
  }
}

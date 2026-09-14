import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './supabase';
import type { Profile } from './database.types';

type SignUpInput = {
  email: string;
  password: string;
  companyName: string;
  contactName: string;
  location?: string;
  industry?: string;
};

type AuthState = {
  /** Undefined while the initial session check is still running. */
  user: User | null | undefined;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (input: SignUpInput) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

/**
 * Wraps the whole app. Tracks the Supabase session, the matching `profiles`
 * row, and whether the signed-in user holds the admin role, so every screen
 * that needs auth state reads it from one place via `useAuth()`.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadProfileAndRole(currentUser: User) {
    const [{ data: profileRow }, { data: roleRow }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', currentUser.id).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', currentUser.id).eq('role', 'admin').maybeSingle(),
    ]);
    setProfile(profileRow ?? null);
    setIsAdmin(Boolean(roleRow));
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) await loadProfileAndRole(data.session.user);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (cancelled) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await loadProfileAndRole(newSession.user);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      session,
      profile,
      isAdmin,
      loading,

      async signUp({ email, password, companyName, contactName, location, industry }) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return { error: error.message };
        if (!data.user) {
          return { error: 'Account created. Check your email to confirm it before signing in.' };
        }

        // The row-level security policy on `profiles` only allows a user to
        // insert their own row, so this only succeeds once signUp above has
        // actually produced a session (email confirmation is off) or a user
        // id (confirmation is on, they confirm, then sign in and this runs
        // again from the profile-completion prompt).
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          company_name: companyName,
          contact_name: contactName,
          location: location || null,
          industry: industry || null,
        });
        if (profileError && !profileError.message.includes('duplicate key')) {
          return { error: profileError.message };
        }

        if (data.session) await loadProfileAndRole(data.user);
        return { error: null };
      },

      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
      },

      async signOut() {
        await supabase.auth.signOut();
      },

      async refreshProfile() {
        if (user) await loadProfileAndRole(user);
      },
    }),
    [user, session, profile, isAdmin, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

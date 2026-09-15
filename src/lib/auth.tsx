import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { resolvePlatformMode } from './platform';
import type { PlatformMode } from './platform';
import {
  claudeCreateBusiness,
  claudeGetBusiness,
  claudeSignOutLocal,
  claudeSwitchBusiness,
  getStoredBusinessId,
} from './claudeDb';
import type { CompanyType, Profile } from './database.types';

export type SignUpInput = {
  email: string;
  password: string;
  companyName: string;
  contactName: string;
  location?: string;
  industry?: string;
  phone?: string;
  legalName?: string;
  companyType?: CompanyType;
  companiesHouseNumber?: string;
  vatNumber?: string;
  registeredAddressLine1?: string;
  registeredAddressLine2?: string;
  registeredCity?: string;
  registeredPostcode?: string;
  registeredCountry?: string;
  jobTitle?: string;
  website?: string;
  /** Must be true to submit — enforced in the SignUp form, not here. */
  termsAccepted: boolean;
};

/** Every page only ever reads `.id` off the signed-in user (checked across
    the codebase), so a Supabase session and a claude-db business share this
    one minimal shape rather than each page needing to know which backend
    is active. */
type MinimalUser = { id: string };

type AuthState = {
  /** Which backend is actually answering these calls. Useful for a page
      that needs to adapt its UI (Login, Settings) rather than just its data
      source — most pages never need to look at this. */
  mode: PlatformMode | 'loading';
  /** Undefined while the initial check is still running. */
  user: MinimalUser | null | undefined;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (input: SignUpInput) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  /** claude-db mode only: switch to acting as an existing business instead
      of creating a new one. See claudeDb.ts for what "signing in" means
      here — a convenience, not a security boundary. */
  switchBusiness: (id: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

/**
 * Wraps the whole app. Tracks whichever backend is active (see
 * platform.ts), the signed-in user or business, their profile, and whether
 * they hold admin access, so every screen reads it from one place via
 * `useAuth()`.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PlatformMode | 'loading'>('loading');
  const [user, setUser] = useState<MinimalUser | null | undefined>(undefined);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadSupabaseProfileAndRole(currentUser: SupabaseUser) {
    const [{ data: profileRow }, { data: roleRow }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', currentUser.id).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', currentUser.id).eq('role', 'admin').maybeSingle(),
    ]);
    setProfile(profileRow ?? null);
    setIsAdmin(Boolean(roleRow));
  }

  async function loadClaudeBusiness(id: string) {
    const business = await claudeGetBusiness(id);
    setProfile(business);
    setIsAdmin(Boolean(business?.is_admin));
    return business;
  }

  /* Resolve the backend once, then load whatever session it has. */
  useEffect(() => {
    let cancelled = false;

    resolvePlatformMode().then(async (resolved) => {
      if (cancelled) return;
      setMode(resolved);

      if (resolved === 'supabase') {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        setUser(data.session?.user ?? null);
        if (data.session?.user) await loadSupabaseProfileAndRole(data.session.user);
        setLoading(false);
        return;
      }

      if (resolved === 'claude-db') {
        const storedId = getStoredBusinessId();
        if (!storedId) {
          setUser(null);
          setLoading(false);
          return;
        }
        const business = await loadClaudeBusiness(storedId);
        if (cancelled) return;
        if (business) {
          setUser({ id: storedId });
        } else {
          // The stored id no longer resolves to a business (deleted
          // elsewhere) — clear it rather than getting stuck signed in as
          // nothing.
          claudeSignOutLocal();
          setUser(null);
        }
        setLoading(false);
        return;
      }

      setUser(null);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  /* Supabase's own session changes (sign in elsewhere, token refresh,
     sign out). Only registered once the mode is confirmed to be Supabase. */
  useEffect(() => {
    if (mode !== 'supabase') return;

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await loadSupabaseProfileAndRole(newSession.user);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, [mode]);

  const value = useMemo<AuthState>(
    () => ({
      mode,
      user,
      profile,
      isAdmin,
      loading,

      async signUp(input) {
        const {
          email,
          password,
          companyName,
          contactName,
          location,
          industry,
          phone,
          legalName,
          companyType,
          companiesHouseNumber,
          vatNumber,
          registeredAddressLine1,
          registeredAddressLine2,
          registeredCity,
          registeredPostcode,
          registeredCountry,
          jobTitle,
          website,
          termsAccepted,
        } = input;

        if (mode === 'claude-db') {
          try {
            const business = await claudeCreateBusiness({
              companyName,
              contactName,
              location,
              industry,
              phone,
              legalName,
              companyType,
              companiesHouseNumber,
              vatNumber,
              registeredAddressLine1,
              registeredAddressLine2,
              registeredCity,
              registeredPostcode,
              registeredCountry,
              jobTitle,
              website,
              termsAccepted,
            });
            setUser({ id: business.id });
            setProfile(business);
            setIsAdmin(false);
            return { error: null };
          } catch (error) {
            return { error: error instanceof Error ? error.message : 'Something went wrong creating this business.' };
          }
        }

        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return { error: error.message };
        if (!data.user) {
          return { error: 'Account created. Check your email to confirm it before signing in.' };
        }

        // The row-level security policy on `profiles` only allows a user to
        // insert their own row, so this only succeeds once signUp above has
        // actually produced a session (email confirmation is off) or a user
        // id (confirmation is on, they confirm, then sign in and this runs
        // again from the profile-completion prompt). `status` is left out
        // deliberately: the insert policy requires it to be 'pending' and
        // the column default already provides that.
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          company_name: companyName,
          contact_name: contactName,
          location: location || null,
          industry: industry || null,
          phone: phone || null,
          legal_name: legalName || null,
          company_type: companyType || null,
          companies_house_number: companiesHouseNumber || null,
          vat_number: vatNumber || null,
          registered_address_line1: registeredAddressLine1 || null,
          registered_address_line2: registeredAddressLine2 || null,
          registered_city: registeredCity || null,
          registered_postcode: registeredPostcode || null,
          registered_country: registeredCountry || 'United Kingdom',
          job_title: jobTitle || null,
          website: website || null,
          terms_accepted_at: termsAccepted ? new Date().toISOString() : null,
        });
        if (profileError && !profileError.message.includes('duplicate key')) {
          return { error: profileError.message };
        }

        if (data.session) await loadSupabaseProfileAndRole(data.user);
        return { error: null };
      },

      async signIn(email, password) {
        if (mode === 'claude-db') {
          return { error: 'Choose a business below instead — there is no password to check here.' };
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
      },

      async switchBusiness(id) {
        if (mode !== 'claude-db') return { error: 'Not available.' };
        try {
          const business = await loadClaudeBusiness(id);
          if (!business) return { error: 'That business no longer exists.' };
          claudeSwitchBusiness(id);
          setUser({ id });
          return { error: null };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Something went wrong.' };
        }
      },

      async signOut() {
        if (mode === 'claude-db') {
          claudeSignOutLocal();
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          return;
        }
        await supabase.auth.signOut();
      },

      async refreshProfile() {
        if (!user) return;
        if (mode === 'claude-db') {
          await loadClaudeBusiness(user.id);
          return;
        }
        // Supabase mode expects the full SupabaseUser shape.
        const { data } = await supabase.auth.getUser();
        if (data.user) await loadSupabaseProfileAndRole(data.user);
      },
    }),
    [mode, user, profile, isAdmin, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}


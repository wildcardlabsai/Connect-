import { supabase } from '../supabase';
import { resolvePlatformMode } from '../platform';
import { claudeGetBusiness } from '../claudeDb';
import type { Profile } from '../database.types';

/** One business's public profile, by id. Used to show "listed by X" and
    similar, regardless of backend. */
export async function fetchProfile(id: string): Promise<Profile | null> {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeGetBusiness(id);

  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

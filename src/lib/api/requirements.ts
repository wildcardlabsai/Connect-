import { refreshMatchesQuietly, supabase } from '../supabase';
import { resolvePlatformMode } from '../platform';
import {
  claudeCreateRequirement,
  claudeDeleteRequirement,
  claudeFetchActiveRequirements,
  claudeFetchMyRequirements,
  claudeFetchRequirement,
  claudeUpdateRequirement,
} from '../claudeDb';
import type { Requirement } from '../database.types';

export type RequirementInput = {
  category_id: string;
  title: string;
  description: string;
  quantity_needed: string;
  location_preference: string;
};

export async function fetchActiveRequirements(categoryId?: string) {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeFetchActiveRequirements(categoryId);

  let query = supabase
    .from('requirements')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (categoryId) query = query.eq('category_id', categoryId);

  const { data, error } = await query;
  if (error) throw error;
  return data as Requirement[];
}

export async function fetchRequirement(id: string) {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeFetchRequirement(id);

  const { data, error } = await supabase.from('requirements').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Requirement | null;
}

export async function fetchMyRequirements(buyerId: string) {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeFetchMyRequirements(buyerId);

  const { data, error } = await supabase
    .from('requirements')
    .select('*')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Requirement[];
}

export async function createRequirement(buyerId: string, input: RequirementInput) {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeCreateRequirement(buyerId, input);

  const { data, error } = await supabase
    .from('requirements')
    .insert({ buyer_id: buyerId, status: 'active', ...input })
    .select()
    .single();
  if (error) throw error;
  await refreshMatchesQuietly();
  return data as Requirement;
}

export async function updateRequirement(
  id: string,
  patch: Partial<RequirementInput & { status: Requirement['status'] }>,
) {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeUpdateRequirement(id, patch);

  const { data, error } = await supabase.from('requirements').update(patch).eq('id', id).select().single();
  if (error) throw error;
  await refreshMatchesQuietly();
  return data as Requirement;
}

export async function deleteRequirement(id: string) {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeDeleteRequirement(id);

  const { error } = await supabase.from('requirements').delete().eq('id', id);
  if (error) throw error;
}

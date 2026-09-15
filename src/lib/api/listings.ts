import { refreshMatchesQuietly, supabase } from '../supabase';
import { resolvePlatformMode } from '../platform';
import {
  claudeCreateListing,
  claudeDeleteListing,
  claudeFetchActiveListings,
  claudeFetchListing,
  claudeFetchMyListings,
  claudeUpdateListing,
} from '../claudeDb';
import type { Listing } from '../database.types';

export type ListingInput = {
  category_id: string;
  title: string;
  description: string;
  quantity: string;
  condition: string;
  location: string;
  frequency: 'one-off' | 'occasional' | 'regular';
};

/** Active listings visible to any signed-in business, newest first. */
export async function fetchActiveListings(categoryId?: string) {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeFetchActiveListings(categoryId);

  let query = supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (categoryId) query = query.eq('category_id', categoryId);

  const { data, error } = await query;
  if (error) throw error;
  return data as Listing[];
}

export async function fetchListing(id: string) {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeFetchListing(id);

  const { data, error } = await supabase.from('listings').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Listing | null;
}

/** A seller's own listings, any status, newest first. */
export async function fetchMyListings(sellerId: string) {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeFetchMyListings(sellerId);

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Listing[];
}

export async function createListing(sellerId: string, input: ListingInput) {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeCreateListing(sellerId, input);

  const { data, error } = await supabase
    .from('listings')
    .insert({ seller_id: sellerId, status: 'active', photo_paths: [], ...input })
    .select()
    .single();
  if (error) throw error;

  // Recompute matches now that a new active listing exists. Best-effort: a
  // failure here just means matches catch up next time something changes,
  // it should never block the listing itself from being created.
  await refreshMatchesQuietly();

  return data as Listing;
}

export async function updateListing(
  id: string,
  patch: Partial<ListingInput & { status: Listing['status']; photo_paths: string[] }>,
) {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeUpdateListing(id, patch);

  const { data, error } = await supabase.from('listings').update(patch).eq('id', id).select().single();
  if (error) throw error;
  await refreshMatchesQuietly();
  return data as Listing;
}

export async function deleteListing(id: string) {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeDeleteListing(id);

  const { error } = await supabase.from('listings').delete().eq('id', id);
  if (error) throw error;
}

/** Public URL for a photo stored in the `listing-photos` bucket. Only
    reachable in Supabase mode: claude-db mode never has photo paths to
    resolve, since photo upload has nowhere to go there (see
    ListingForm.tsx, which hides the picker in that mode). */
export function listingPhotoUrl(path: string): string {
  return supabase.storage.from('listing-photos').getPublicUrl(path).data.publicUrl;
}

export async function uploadListingPhoto(sellerId: string, listingId: string, file: File): Promise<string> {
  if ((await resolvePlatformMode()) === 'claude-db') {
    throw new Error('Photo uploads are not available in this demo mode.');
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${sellerId}/${listingId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('listing-photos').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  return path;
}

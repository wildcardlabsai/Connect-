import { refreshMatchesQuietly, supabase } from '../supabase';
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
  const { data, error } = await supabase.from('listings').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Listing | null;
}

/** A seller's own listings, any status, newest first. */
export async function fetchMyListings(sellerId: string) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Listing[];
}

export async function createListing(sellerId: string, input: ListingInput) {
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
  const { data, error } = await supabase.from('listings').update(patch).eq('id', id).select().single();
  if (error) throw error;
  await refreshMatchesQuietly();
  return data as Listing;
}

export async function deleteListing(id: string) {
  const { error } = await supabase.from('listings').delete().eq('id', id);
  if (error) throw error;
}

/** Public URL for a photo stored in the `listing-photos` bucket. */
export function listingPhotoUrl(path: string): string {
  return supabase.storage.from('listing-photos').getPublicUrl(path).data.publicUrl;
}

export async function uploadListingPhoto(sellerId: string, listingId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${sellerId}/${listingId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('listing-photos').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  return path;
}

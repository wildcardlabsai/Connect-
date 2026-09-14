import { supabase } from '../supabase';
import type { Listing, MatchRow, Requirement } from '../database.types';

export type ListingMatch = MatchRow & { requirement: Requirement };
export type RequirementMatch = MatchRow & { listing: Listing };

/** Matches for every listing a seller owns, requirement details attached. */
export async function fetchMatchesForSeller(sellerId: string): Promise<ListingMatch[]> {
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('id')
    .eq('seller_id', sellerId);
  if (listingsError) throw listingsError;
  const listingIds = (listings ?? []).map((l) => l.id);
  if (listingIds.length === 0) return [];

  const { data, error } = await supabase
    .from('matches')
    .select('*, requirement:requirements(*)')
    .in('listing_id', listingIds)
    .order('score', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ListingMatch[];
}

/** Matches for every requirement a buyer owns, listing details attached. */
export async function fetchMatchesForBuyer(buyerId: string): Promise<RequirementMatch[]> {
  const { data: requirements, error: requirementsError } = await supabase
    .from('requirements')
    .select('id')
    .eq('buyer_id', buyerId);
  if (requirementsError) throw requirementsError;
  const requirementIds = (requirements ?? []).map((r) => r.id);
  if (requirementIds.length === 0) return [];

  const { data, error } = await supabase
    .from('matches')
    .select('*, listing:listings(*)')
    .in('requirement_id', requirementIds)
    .order('score', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as RequirementMatch[];
}

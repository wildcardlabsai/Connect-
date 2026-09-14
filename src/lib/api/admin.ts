import { supabase } from '../supabase';
import type { Enquiry, Listing, Profile, Requirement } from '../database.types';

export async function fetchAdminStats() {
  const [{ count: listingsCount }, { count: requirementsCount }, { count: profilesCount }, { count: enquiriesCount }] =
    await Promise.all([
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('requirements').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('enquiries').select('id', { count: 'exact', head: true }).eq('handled', false),
    ]);

  return {
    activeListings: listingsCount ?? 0,
    activeRequirements: requirementsCount ?? 0,
    businesses: profilesCount ?? 0,
    openEnquiries: enquiriesCount ?? 0,
  };
}

export async function fetchAllListingsForAdmin(): Promise<Listing[]> {
  const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Listing[];
}

export async function fetchAllRequirementsForAdmin(): Promise<Requirement[]> {
  const { data, error } = await supabase.from('requirements').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Requirement[];
}

export async function fetchAllProfilesForAdmin(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Profile[];
}

export async function fetchAllEnquiries(): Promise<Enquiry[]> {
  const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Enquiry[];
}

export async function setListingStatus(id: string, status: Listing['status']) {
  const { error } = await supabase.from('listings').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function setEnquiryHandled(id: string, handled: boolean) {
  const { error } = await supabase.from('enquiries').update({ handled }).eq('id', id);
  if (error) throw error;
}

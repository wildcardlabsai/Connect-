import { supabase } from '../supabase';
import { resolvePlatformMode } from '../platform';
import {
  claudeFetchAdminStats,
  claudeFetchAllEnquiries,
  claudeFetchAllListingsForAdmin,
  claudeFetchAllProfilesForAdmin,
  claudeFetchAllRequirementsForAdmin,
  claudeSetBusinessStatus,
  claudeSetEnquiryHandled,
  claudeSetListingStatus,
} from '../claudeDb';
import type { Enquiry, Listing, Profile, Requirement } from '../database.types';

export async function fetchAdminStats() {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeFetchAdminStats();

  const [
    { count: listingsCount },
    { count: requirementsCount },
    { count: profilesCount },
    { count: enquiriesCount },
    { count: pendingCount },
  ] = await Promise.all([
    supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('requirements').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('enquiries').select('id', { count: 'exact', head: true }).eq('handled', false),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  return {
    activeListings: listingsCount ?? 0,
    activeRequirements: requirementsCount ?? 0,
    businesses: profilesCount ?? 0,
    openEnquiries: enquiriesCount ?? 0,
    pendingApprovals: pendingCount ?? 0,
  };
}

export async function fetchAllListingsForAdmin(): Promise<Listing[]> {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeFetchAllListingsForAdmin();

  const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Listing[];
}

export async function fetchAllRequirementsForAdmin(): Promise<Requirement[]> {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeFetchAllRequirementsForAdmin();

  const { data, error } = await supabase.from('requirements').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Requirement[];
}

export async function fetchAllProfilesForAdmin(): Promise<Profile[]> {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeFetchAllProfilesForAdmin();

  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Profile[];
}

export async function fetchAllEnquiries(): Promise<Enquiry[]> {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeFetchAllEnquiries();

  const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Enquiry[];
}

export async function setListingStatus(id: string, status: Listing['status']) {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeSetListingStatus(id, status);

  const { error } = await supabase.from('listings').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function setEnquiryHandled(id: string, handled: boolean) {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeSetEnquiryHandled(id, handled);

  const { error } = await supabase.from('enquiries').update({ handled }).eq('id', id);
  if (error) throw error;
}

/**
 * Approves a pending (or previously rejected) business, or rejects one with
 * a reason the business will see on their pending screen. `reviewerId` is
 * the admin's own id, recorded for accountability. Under Supabase this is
 * the only way `status` can change at all — a database trigger blocks
 * anyone who isn't an admin from touching it, whatever the client sends.
 */
export async function setBusinessStatus(
  id: string,
  status: 'approved' | 'rejected',
  reviewerId: string,
  rejectionReason?: string,
) {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeSetBusinessStatus(id, status, rejectionReason);

  const { error } = await supabase
    .from('profiles')
    .update({
      status,
      rejection_reason: status === 'rejected' ? rejectionReason || null : null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
    })
    .eq('id', id);
  if (error) throw error;
}

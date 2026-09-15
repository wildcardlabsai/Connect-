/* ==========================================================================
   Hand-written types matching supabase/migrations/0001_init.sql and
   0002_business_verification.sql.
   --------------------------------------------------------------------------
   If you have the Supabase CLI, the real way to keep these in sync is:

     npx supabase gen types typescript --project-id <your-project-ref> > src/lib/database.types.ts

   Until then, this file is kept in step with the migrations by hand. Update
   all three together.
   ========================================================================== */

export type ListingStatus = 'draft' | 'active' | 'archived' | 'removed';
export type RequirementStatus = 'active' | 'paused' | 'closed';
export type Frequency = 'one-off' | 'occasional' | 'regular';
export type EnquiryForm = 'founding-network' | 'contact';
export type AppRole = 'admin';

/** pending: awaiting review. approved: full access. rejected: refused, see
    `rejection_reason`. Only an admin can change this — enforced in the
    database (0002_business_verification.sql), not just the UI. */
export type BusinessStatus = 'pending' | 'approved' | 'rejected';

export type CompanyType = 'limited_company' | 'llp' | 'sole_trader' | 'partnership' | 'other';

export const COMPANY_TYPE_LABELS: Record<CompanyType, string> = {
  limited_company: 'Limited company',
  llp: 'Limited liability partnership (LLP)',
  sole_trader: 'Sole trader',
  partnership: 'Partnership',
  other: 'Other',
};

export type Profile = {
  id: string;
  company_name: string;
  contact_name: string;
  location: string | null;
  industry: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
  /**
   * Only meaningful in claude-db mode, where there is no separate roles
   * table to check (see lib/claudeDb.ts). Always undefined under Supabase,
   * which keeps admin as a role grant instead — see user_roles.
   */
  is_admin?: boolean;

  // --- Registration / verification detail (0002_business_verification.sql) ---
  status: BusinessStatus;
  legal_name: string | null;
  company_type: CompanyType | null;
  companies_house_number: string | null;
  vat_number: string | null;
  registered_address_line1: string | null;
  registered_address_line2: string | null;
  registered_city: string | null;
  registered_postcode: string | null;
  registered_country: string | null;
  job_title: string | null;
  website: string | null;
  terms_accepted_at: string | null;
  rejection_reason: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export type MaterialCategoryRow = {
  id: string;
  name: string;
  sort_order: number;
};

export type Listing = {
  id: string;
  seller_id: string;
  category_id: string;
  title: string;
  description: string;
  quantity: string | null;
  condition: string | null;
  location: string | null;
  frequency: Frequency | null;
  photo_paths: string[];
  status: ListingStatus;
  created_at: string;
  updated_at: string;
};

export type Requirement = {
  id: string;
  buyer_id: string;
  category_id: string;
  title: string;
  description: string;
  quantity_needed: string | null;
  location_preference: string | null;
  status: RequirementStatus;
  created_at: string;
  updated_at: string;
};

export type MatchRow = {
  id: string;
  listing_id: string;
  requirement_id: string;
  score: number;
  reason: string;
  created_at: string;
};

export type Conversation = {
  id: string;
  listing_id: string | null;
  requirement_id: string | null;
  buyer_id: string;
  seller_id: string;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type Enquiry = {
  id: string;
  form_name: EnquiryForm;
  name: string;
  company: string | null;
  email: string;
  location: string | null;
  industry: string | null;
  interest: string | null;
  message: string | null;
  created_at: string;
  handled: boolean;
};

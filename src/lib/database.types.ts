/* ==========================================================================
   Hand-written types matching supabase/migrations/0001_init.sql.
   --------------------------------------------------------------------------
   If you have the Supabase CLI, the real way to keep these in sync is:

     npx supabase gen types typescript --project-id <your-project-ref> > src/lib/database.types.ts

   Until then, this file is kept in step with the migration by hand. Update
   both together.
   ========================================================================== */

export type ListingStatus = 'draft' | 'active' | 'archived' | 'removed';
export type RequirementStatus = 'active' | 'paused' | 'closed';
export type Frequency = 'one-off' | 'occasional' | 'regular';
export type EnquiryForm = 'founding-network' | 'contact';
export type AppRole = 'admin';

export type Profile = {
  id: string;
  company_name: string;
  contact_name: string;
  location: string | null;
  industry: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
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

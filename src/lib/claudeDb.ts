/* ==========================================================================
   The claude-db backend.
   --------------------------------------------------------------------------
   Every function here mirrors one in src/lib/api/*.ts, implemented against
   Claude's own `db` capability instead of Supabase. Each src/lib/api/*.ts
   function calls into here when resolvePlatformMode() is 'claude-db'; see
   platform.ts for what that mode actually means and its limits.

   Collections, mirroring supabase/migrations/0001_init.sql:

     businesses/<id>                 a signed-up business (Profile)
     listings/<id>                   surplus material (Listing)
     requirements/<id>                material wanted (Requirement)
     matches/<listingId>__<reqId>    suggested pairing (MatchRow)
     conversations/<id>              a chat between two businesses
     conversations/<id>/messages/<id> messages in that chat
     enquiries/<id>                  founding network / contact submissions

   There is no server-side function capability here, unlike Supabase's
   refresh_matches(): claudeRefreshMatches() below does the same job by
   reading every active listing and requirement and computing matches in the
   browser. Fine at the scale this mode is meant for (one person trying the
   product); not how you'd want it to work with real traffic.
   ========================================================================== */

import { getClaudeDb } from './platform';
import type { DbError, DocumentSnapshot, Unsubscribe } from './claudeDbTypes';
import type {
  BusinessStatus,
  CompanyType,
  Conversation,
  Enquiry,
  EnquiryForm,
  Frequency,
  Listing,
  ListingStatus,
  MatchRow,
  Message,
  Profile,
  Requirement,
  RequirementStatus,
} from './database.types';

const nowIso = () => new Date().toISOString();
const newId = () => crypto.randomUUID();

function fromDoc<T>(doc: DocumentSnapshot): T {
  return { id: doc.id, ...(doc.data() ?? {}) } as T;
}

async function requireDb() {
  const db = await getClaudeDb();
  if (!db) {
    throw new Error(
      'Claude’s database is not available in this view. It only works while this page is open live in a Claude conversation.',
    );
  }
  return db;
}

/* ---------------------------------------------------------------- Identity
   There is no `user` capability on this account (see platform.ts), so there
   is no secure way to know who is asking. "Signing in" here means picking
   which business's data you are looking at and writing as, tracked in this
   browser's localStorage. It is a convenience for trying the product alone,
   never an access boundary: anyone with edit access to this artifact can
   read or write any business's rows regardless of which one they last
   "signed in" as. */
const ACTIVE_BUSINESS_KEY = 'connectcymru:activeBusinessId';

export function getStoredBusinessId(): string | null {
  try {
    return window.localStorage.getItem(ACTIVE_BUSINESS_KEY);
  } catch {
    return null;
  }
}

function setStoredBusinessId(id: string | null) {
  try {
    if (id) window.localStorage.setItem(ACTIVE_BUSINESS_KEY, id);
    else window.localStorage.removeItem(ACTIVE_BUSINESS_KEY);
  } catch {
    // Storage can be unavailable (private browsing); the session still
    // works for this page load, it just won't be remembered next time.
  }
}

export async function claudeGetBusiness(id: string): Promise<Profile | null> {
  const db = await requireDb();
  const doc = await db.doc(`businesses/${id}`).get();
  return doc.exists ? fromDoc<Profile>(doc) : null;
}

/** Every business that has signed up, for the "choose a business" picker
    and the admin panel. Capped well under the 5,000 document ceiling. */
export async function claudeListBusinesses(): Promise<Profile[]> {
  const db = await requireDb();
  const snapshot = await db.collection('businesses').limit(200).get();
  return snapshot.docs.map((doc) => fromDoc<Profile>(doc));
}

export type ClaudeBusinessInput = {
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
  /** True once the signup form's consent checkbox was ticked. Recorded as a
      timestamp, same as Supabase mode, even though nothing here enforces
      what it points to — see platform.ts. */
  termsAccepted?: boolean;
};

/** New businesses always start pending here too, same as Supabase mode:
    matching real behaviour matters for trying the approval flow itself,
    even though nothing in this mode actually secures it (see platform.ts
    and claude-db-README.md). Approve via the demo admin toggle in Settings,
    then Admin -> Businesses. */
export async function claudeCreateBusiness(input: ClaudeBusinessInput): Promise<Profile> {
  const db = await requireDb();
  const id = newId();
  const body = {
    company_name: input.companyName,
    contact_name: input.contactName,
    location: input.location || null,
    industry: input.industry || null,
    phone: input.phone || null,
    is_admin: false,
    status: 'pending' as BusinessStatus,
    legal_name: input.legalName || null,
    company_type: input.companyType || null,
    companies_house_number: input.companiesHouseNumber || null,
    vat_number: input.vatNumber || null,
    registered_address_line1: input.registeredAddressLine1 || null,
    registered_address_line2: input.registeredAddressLine2 || null,
    registered_city: input.registeredCity || null,
    registered_postcode: input.registeredPostcode || null,
    registered_country: input.registeredCountry || 'United Kingdom',
    job_title: input.jobTitle || null,
    website: input.website || null,
    terms_accepted_at: input.termsAccepted ? nowIso() : null,
    rejection_reason: null,
    reviewed_at: null,
    reviewed_by: null,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  await db.doc(`businesses/${id}`).set(body);
  setStoredBusinessId(id);
  return { id, ...body };
}

/** Demo-mode equivalent of an admin approving or rejecting a registration.
    No real permission check backs this — see claude-db-README.md — but the
    UI only exposes it behind the same "treat as admin" toggle as everything
    else in this mode's admin panel. */
export async function claudeSetBusinessStatus(
  id: string,
  status: BusinessStatus,
  rejectionReason?: string,
): Promise<void> {
  const db = await requireDb();
  await db.doc(`businesses/${id}`).update({
    status,
    rejection_reason: status === 'rejected' ? rejectionReason || null : null,
    reviewed_at: nowIso(),
    updated_at: nowIso(),
  });
}

export function claudeSwitchBusiness(id: string) {
  setStoredBusinessId(id);
}

export function claudeSignOutLocal() {
  setStoredBusinessId(null);
}

export async function claudeUpdateBusiness(id: string, patch: Partial<Profile>): Promise<void> {
  const db = await requireDb();
  const { id: _drop, ...rest } = patch;
  await db.doc(`businesses/${id}`).update({ ...rest, updated_at: nowIso() });
}

/* ---------------------------------------------------------------- Listings */
export type ClaudeListingInput = {
  category_id: string;
  title: string;
  description: string;
  quantity: string;
  condition: string;
  location: string;
  frequency: Frequency;
};

/** The set of business ids currently approved. Fetched once per call site
    that needs it rather than cached, since this mode has no push
    invalidation — fine at the scale this mode runs at (see module doc). */
async function fetchApprovedBusinessIds(): Promise<Set<string>> {
  const db = await requireDb();
  const snapshot = await db.collection('businesses').where('status', '==', 'approved').limit(1000).get();
  return new Set(snapshot.docs.map((doc) => doc.id));
}

export async function claudeFetchActiveListings(categoryId?: string): Promise<Listing[]> {
  const db = await requireDb();
  let query = db.collection('listings').where('status', '==', 'active');
  if (categoryId) query = query.where('category_id', '==', categoryId);
  const [snapshot, approvedIds] = await Promise.all([
    query.orderBy('created_at', 'desc').limit(500).get(),
    fetchApprovedBusinessIds(),
  ]);
  return snapshot.docs.map((doc) => fromDoc<Listing>(doc)).filter((listing) => approvedIds.has(listing.seller_id));
}

export async function claudeFetchListing(id: string): Promise<Listing | null> {
  const db = await requireDb();
  const doc = await db.doc(`listings/${id}`).get();
  return doc.exists ? fromDoc<Listing>(doc) : null;
}

export async function claudeFetchMyListings(sellerId: string): Promise<Listing[]> {
  const db = await requireDb();
  const snapshot = await db
    .collection('listings')
    .where('seller_id', '==', sellerId)
    .orderBy('created_at', 'desc')
    .get();
  return snapshot.docs.map((doc) => fromDoc<Listing>(doc));
}

export async function claudeCreateListing(sellerId: string, input: ClaudeListingInput): Promise<Listing> {
  const db = await requireDb();
  const id = newId();
  const body = {
    seller_id: sellerId,
    status: 'active' as ListingStatus,
    photo_paths: [] as string[],
    created_at: nowIso(),
    updated_at: nowIso(),
    ...input,
  };
  await db.doc(`listings/${id}`).set(body);
  await claudeRefreshMatches();
  return { id, ...body };
}

export async function claudeUpdateListing(
  id: string,
  patch: Partial<ClaudeListingInput & { status: ListingStatus }>,
): Promise<Listing> {
  const db = await requireDb();
  await db.doc(`listings/${id}`).update({ ...patch, updated_at: nowIso() });
  await claudeRefreshMatches();
  const doc = await db.doc(`listings/${id}`).get();
  return fromDoc<Listing>(doc);
}

export async function claudeDeleteListing(id: string): Promise<void> {
  const db = await requireDb();
  await db.doc(`listings/${id}`).delete();
}

/* ------------------------------------------------------------ Requirements */
export type ClaudeRequirementInput = {
  category_id: string;
  title: string;
  description: string;
  quantity_needed: string;
  location_preference: string;
};

export async function claudeFetchActiveRequirements(categoryId?: string): Promise<Requirement[]> {
  const db = await requireDb();
  let query = db.collection('requirements').where('status', '==', 'active');
  if (categoryId) query = query.where('category_id', '==', categoryId);
  const [snapshot, approvedIds] = await Promise.all([
    query.orderBy('created_at', 'desc').limit(500).get(),
    fetchApprovedBusinessIds(),
  ]);
  return snapshot.docs
    .map((doc) => fromDoc<Requirement>(doc))
    .filter((requirement) => approvedIds.has(requirement.buyer_id));
}

export async function claudeFetchRequirement(id: string): Promise<Requirement | null> {
  const db = await requireDb();
  const doc = await db.doc(`requirements/${id}`).get();
  return doc.exists ? fromDoc<Requirement>(doc) : null;
}

export async function claudeFetchMyRequirements(buyerId: string): Promise<Requirement[]> {
  const db = await requireDb();
  const snapshot = await db
    .collection('requirements')
    .where('buyer_id', '==', buyerId)
    .orderBy('created_at', 'desc')
    .get();
  return snapshot.docs.map((doc) => fromDoc<Requirement>(doc));
}

export async function claudeCreateRequirement(buyerId: string, input: ClaudeRequirementInput): Promise<Requirement> {
  const db = await requireDb();
  const id = newId();
  const body = {
    buyer_id: buyerId,
    status: 'active' as RequirementStatus,
    created_at: nowIso(),
    updated_at: nowIso(),
    ...input,
  };
  await db.doc(`requirements/${id}`).set(body);
  await claudeRefreshMatches();
  return { id, ...body };
}

export async function claudeUpdateRequirement(
  id: string,
  patch: Partial<ClaudeRequirementInput & { status: RequirementStatus }>,
): Promise<Requirement> {
  const db = await requireDb();
  await db.doc(`requirements/${id}`).update({ ...patch, updated_at: nowIso() });
  await claudeRefreshMatches();
  const doc = await db.doc(`requirements/${id}`).get();
  return fromDoc<Requirement>(doc);
}

export async function claudeDeleteRequirement(id: string): Promise<void> {
  const db = await requireDb();
  await db.doc(`requirements/${id}`).delete();
}

/* ------------------------------------------------------------------ Matches
   No server-side function here, so this recomputes the whole set from
   scratch by scanning active listings and requirements — the same category
   and (loose) location check as refresh_matches() in the SQL migration. */
export async function claudeRefreshMatches(): Promise<void> {
  const db = await requireDb();

  const [listingsSnap, requirementsSnap, existingSnap, approvedIds] = await Promise.all([
    db.collection('listings').where('status', '==', 'active').limit(1000).get(),
    db.collection('requirements').where('status', '==', 'active').limit(1000).get(),
    db.collection('matches').limit(1000).get(),
    fetchApprovedBusinessIds(),
  ]);

  // Only ever match between two approved businesses, exactly like
  // refresh_matches() in the Supabase migration — a pending business's
  // listing should never surface as a suggestion to anyone before it's
  // actually live.
  const listings = listingsSnap.docs.map((doc) => fromDoc<Listing>(doc)).filter((l) => approvedIds.has(l.seller_id));
  const requirements = requirementsSnap.docs
    .map((doc) => fromDoc<Requirement>(doc))
    .filter((r) => approvedIds.has(r.buyer_id));

  const validIds = new Set<string>();
  const writes: Array<Promise<unknown>> = [];

  for (const listing of listings) {
    for (const requirement of requirements) {
      if (listing.category_id !== requirement.category_id) continue;

      const matchId = `${listing.id}__${requirement.id}`;
      validIds.add(matchId);

      const locationMatch = Boolean(
        listing.location &&
          requirement.location_preference &&
          listing.location.toLowerCase().includes(requirement.location_preference.toLowerCase()),
      );

      writes.push(
        db.doc(`matches/${matchId}`).set({
          listing_id: listing.id,
          requirement_id: requirement.id,
          score: locationMatch ? 80 : 55,
          reason: locationMatch ? 'Same material category and a location match.' : 'Same material category.',
          created_at: nowIso(),
        }),
      );
    }
  }

  for (const doc of existingSnap.docs) {
    if (!validIds.has(doc.id)) writes.push(db.doc(`matches/${doc.id}`).delete());
  }

  await Promise.all(writes);
}

export type ClaudeListingMatch = MatchRow & { requirement: Requirement };
export type ClaudeRequirementMatch = MatchRow & { listing: Listing };

export async function claudeFetchMatchesForSeller(sellerId: string): Promise<ClaudeListingMatch[]> {
  const db = await requireDb();
  const listingsSnap = await db.collection('listings').where('seller_id', '==', sellerId).get();
  const listingIds = new Set(listingsSnap.docs.map((doc) => doc.id));
  if (listingIds.size === 0) return [];

  const matchesSnap = await db.collection('matches').limit(1000).get();
  const relevant = matchesSnap.docs.map((doc) => fromDoc<MatchRow>(doc)).filter((m) => listingIds.has(m.listing_id));

  const withRequirement = await Promise.all(
    relevant.map(async (match) => {
      const doc = await db.doc(`requirements/${match.requirement_id}`).get();
      return doc.exists ? { ...match, requirement: fromDoc<Requirement>(doc) } : null;
    }),
  );

  return withRequirement.filter((m): m is ClaudeListingMatch => m !== null).sort((a, b) => b.score - a.score);
}

export async function claudeFetchMatchesForBuyer(buyerId: string): Promise<ClaudeRequirementMatch[]> {
  const db = await requireDb();
  const requirementsSnap = await db.collection('requirements').where('buyer_id', '==', buyerId).get();
  const requirementIds = new Set(requirementsSnap.docs.map((doc) => doc.id));
  if (requirementIds.size === 0) return [];

  const matchesSnap = await db.collection('matches').limit(1000).get();
  const relevant = matchesSnap.docs
    .map((doc) => fromDoc<MatchRow>(doc))
    .filter((m) => requirementIds.has(m.requirement_id));

  const withListing = await Promise.all(
    relevant.map(async (match) => {
      const doc = await db.doc(`listings/${match.listing_id}`).get();
      return doc.exists ? { ...match, listing: fromDoc<Listing>(doc) } : null;
    }),
  );

  return withListing.filter((m): m is ClaudeRequirementMatch => m !== null).sort((a, b) => b.score - a.score);
}

/* ----------------------------------------------------------------- Messages
   Messages live in a subcollection under their conversation document, so a
   conversation and its history delete together and stay naturally scoped. */
export type ClaudeConversationWithParties = Conversation & {
  buyer: { id: string; company_name: string };
  seller: { id: string; company_name: string };
};

async function attachParties(db: Awaited<ReturnType<typeof requireDb>>, conversation: Conversation) {
  const [buyerDoc, sellerDoc] = await Promise.all([
    db.doc(`businesses/${conversation.buyer_id}`).get(),
    db.doc(`businesses/${conversation.seller_id}`).get(),
  ]);
  return {
    ...conversation,
    buyer: { id: conversation.buyer_id, company_name: (buyerDoc.data()?.company_name as string) ?? 'Unknown business' },
    seller: { id: conversation.seller_id, company_name: (sellerDoc.data()?.company_name as string) ?? 'Unknown business' },
  };
}

export async function claudeFetchMyConversations(userId: string): Promise<ClaudeConversationWithParties[]> {
  const db = await requireDb();
  const [asBuyer, asSeller] = await Promise.all([
    db.collection('conversations').where('buyer_id', '==', userId).get(),
    db.collection('conversations').where('seller_id', '==', userId).get(),
  ]);

  const conversations = [...asBuyer.docs, ...asSeller.docs].map((doc) => fromDoc<Conversation>(doc));
  const withParties = await Promise.all(conversations.map((c) => attachParties(db, c)));
  return withParties.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function claudeStartConversation(input: {
  buyerId: string;
  sellerId: string;
  listingId?: string;
  requirementId?: string;
}): Promise<Conversation> {
  const db = await requireDb();
  const snapshot = await db
    .collection('conversations')
    .where('buyer_id', '==', input.buyerId)
    .where('seller_id', '==', input.sellerId)
    .get();

  const existing = snapshot.docs.find((doc) => {
    const data = doc.data() ?? {};
    return (data.listing_id ?? null) === (input.listingId ?? null) && (data.requirement_id ?? null) === (input.requirementId ?? null);
  });
  if (existing) return fromDoc<Conversation>(existing);

  const id = newId();
  const body = {
    buyer_id: input.buyerId,
    seller_id: input.sellerId,
    listing_id: input.listingId ?? null,
    requirement_id: input.requirementId ?? null,
    created_at: nowIso(),
  };
  await db.doc(`conversations/${id}`).set(body);
  return { id, ...body };
}

export async function claudeFetchMessages(conversationId: string): Promise<Message[]> {
  const db = await requireDb();
  const snapshot = await db.doc(`conversations/${conversationId}`).collection('messages').orderBy('created_at', 'asc').get();
  return snapshot.docs.map((doc) => fromDoc<Message>(doc));
}

export async function claudeSendMessage(conversationId: string, senderId: string, body: string): Promise<Message> {
  const db = await requireDb();
  const ref = await db.doc(`conversations/${conversationId}`).collection('messages').add({
    conversation_id: conversationId,
    sender_id: senderId,
    body,
    created_at: nowIso(),
  });
  const doc = await ref.get();
  return fromDoc<Message>(doc);
}

/** Live updates for one conversation's messages. Resolves the unsubscribe
    function once the db capability is ready; callers keep it and call it
    on cleanup, guarding against an unmount that happens first. */
export async function claudeSubscribeMessages(
  conversationId: string,
  onChange: (messages: Message[]) => void,
  onError?: (error: DbError) => void,
): Promise<Unsubscribe> {
  const db = await requireDb();
  return db
    .doc(`conversations/${conversationId}`)
    .collection('messages')
    .orderBy('created_at', 'asc')
    .onSnapshot((snapshot) => onChange(snapshot.docs.map((doc) => fromDoc<Message>(doc))), onError);
}

/* ---------------------------------------------------------------- Enquiries */
export type ClaudeEnquiryInput = {
  formName: EnquiryForm;
  name: string;
  company?: string;
  email: string;
  location?: string;
  industry?: string;
  interest?: string;
  message?: string;
};

export async function claudeSubmitEnquiry(input: ClaudeEnquiryInput): Promise<void> {
  const db = await requireDb();
  const id = newId();
  await db.doc(`enquiries/${id}`).set({
    form_name: input.formName,
    name: input.name,
    company: input.company || null,
    email: input.email,
    location: input.location || null,
    industry: input.industry || null,
    interest: input.interest || null,
    message: input.message || null,
    created_at: nowIso(),
    handled: false,
  });
}

/* -------------------------------------------------------------------- Admin
   There is no separate roles table here (see claudeUpdateBusiness /
   Profile.is_admin) — a business flips its own "treat as admin (demo)"
   switch in Settings, since there is no real identity to check it against
   anyway. Real access control does not exist in this mode; see platform.ts. */
export async function claudeFetchAdminStats() {
  const db = await requireDb();
  const [listings, requirements, businesses, enquiries, pending] = await Promise.all([
    db.collection('listings').where('status', '==', 'active').get(),
    db.collection('requirements').where('status', '==', 'active').get(),
    db.collection('businesses').get(),
    db.collection('enquiries').where('handled', '==', false).get(),
    db.collection('businesses').where('status', '==', 'pending').get(),
  ]);
  return {
    activeListings: listings.size,
    activeRequirements: requirements.size,
    businesses: businesses.size,
    openEnquiries: enquiries.size,
    pendingApprovals: pending.size,
  };
}

export async function claudeFetchAllListingsForAdmin(): Promise<Listing[]> {
  const db = await requireDb();
  const snapshot = await db.collection('listings').orderBy('created_at', 'desc').get();
  return snapshot.docs.map((doc) => fromDoc<Listing>(doc));
}

export async function claudeFetchAllRequirementsForAdmin(): Promise<Requirement[]> {
  const db = await requireDb();
  const snapshot = await db.collection('requirements').orderBy('created_at', 'desc').get();
  return snapshot.docs.map((doc) => fromDoc<Requirement>(doc));
}

export async function claudeFetchAllProfilesForAdmin(): Promise<Profile[]> {
  const db = await requireDb();
  const snapshot = await db.collection('businesses').orderBy('created_at', 'desc').get();
  return snapshot.docs.map((doc) => fromDoc<Profile>(doc));
}

export async function claudeFetchAllEnquiries(): Promise<Enquiry[]> {
  const db = await requireDb();
  const snapshot = await db.collection('enquiries').orderBy('created_at', 'desc').get();
  return snapshot.docs.map((doc) => fromDoc<Enquiry>(doc));
}

export async function claudeSetListingStatus(id: string, status: ListingStatus): Promise<void> {
  const db = await requireDb();
  await db.doc(`listings/${id}`).update({ status, updated_at: nowIso() });
}

export async function claudeSetEnquiryHandled(id: string, handled: boolean): Promise<void> {
  const db = await requireDb();
  await db.doc(`enquiries/${id}`).update({ handled });
}

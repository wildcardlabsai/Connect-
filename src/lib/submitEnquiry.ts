/* ==========================================================================
   Enquiry submission
   --------------------------------------------------------------------------
   THIS IS THE ONLY PLACE THE FOUNDING NETWORK AND CONTACT FORMS SEND DATA.

   Three ways this can behave, tried in order:

     1. Supabase configured (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY set):
        the submission is written to the `enquiries` table for real, and
        shows up in the admin panel under Enquiries.
     2. VITE_ENQUIRY_ENDPOINT set instead: POSTed there as JSON, for a
        different backend or a hosted form service.
     3. Neither set: simulates success locally after a short delay. Nothing
        is stored and nothing leaves the browser. This is the state the site
        ships in before either is configured.
   ========================================================================== */

import { isSupabaseConfigured } from './supabase';
import { submitEnquiryToDb } from './api/enquiries';
import type { EnquiryForm } from './database.types';

export type EnquiryPayload = {
  /** Which form the submission came from. */
  formName: EnquiryForm;
  fields: Record<string, string>;
};

export type SubmitResult =
  | { ok: true }
  | { ok: false; message: string };

const SIMULATED_DELAY_MS = 700;

const GENERIC_ERROR =
  'Something went wrong sending your details. Please try again in a moment.';

export async function submitEnquiry(payload: EnquiryPayload): Promise<SubmitResult> {
  if (isSupabaseConfigured) {
    try {
      const f = payload.fields;
      await submitEnquiryToDb({
        formName: payload.formName,
        name: f.name ?? '',
        company: f.company,
        email: f.email ?? '',
        location: f.location,
        industry: f.industry,
        interest: f.interest,
        message: f.message,
      });
      return { ok: true };
    } catch (error) {
      if (import.meta.env.DEV) console.error('[ConnectCymru] enquiry insert failed:', error);
      return { ok: false, message: GENERIC_ERROR };
    }
  }

  const endpoint = import.meta.env.VITE_ENQUIRY_ENDPOINT as string | undefined;

  if (!endpoint) {
    // Frontend-only placeholder. Configure Supabase or VITE_ENQUIRY_ENDPOINT.
    if (import.meta.env.DEV) {
      console.info('[ConnectCymru] Simulated submission, nothing was sent:', payload);
    }
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));
    return { ok: true };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return { ok: false, message: GENERIC_ERROR };
    return { ok: true };
  } catch {
    return { ok: false, message: GENERIC_ERROR };
  }
}

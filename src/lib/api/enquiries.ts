import { supabase } from '../supabase';
import { resolvePlatformMode } from '../platform';
import { claudeSubmitEnquiry } from '../claudeDb';
import type { EnquiryForm } from '../database.types';

export type EnquiryInput = {
  formName: EnquiryForm;
  name: string;
  company?: string;
  email: string;
  location?: string;
  industry?: string;
  interest?: string;
  message?: string;
};

/** Public insert: works whether or not anyone is signed in (see RLS policy
    in Supabase mode; claude-db mode has no such distinction). */
export async function submitEnquiryToDb(input: EnquiryInput) {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeSubmitEnquiry(input);

  const { error } = await supabase.from('enquiries').insert({
    form_name: input.formName,
    name: input.name,
    company: input.company || null,
    email: input.email,
    location: input.location || null,
    industry: input.industry || null,
    interest: input.interest || null,
    message: input.message || null,
  });
  if (error) throw error;
}

import { supabase } from '../supabase';
import type { Conversation, Message, Profile } from '../database.types';

export type ConversationWithParties = Conversation & {
  buyer: Pick<Profile, 'id' | 'company_name'>;
  seller: Pick<Profile, 'id' | 'company_name'>;
  last_message?: Message;
};

/** Every conversation the current user is a participant in, most recent first. */
export async function fetchMyConversations(userId: string): Promise<ConversationWithParties[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*, buyer:profiles!conversations_buyer_id_fkey(id, company_name), seller:profiles!conversations_seller_id_fkey(id, company_name)')
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ConversationWithParties[];
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Message[];
}

export async function sendMessage(conversationId: string, senderId: string, body: string) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, body })
    .select()
    .single();
  if (error) throw error;
  return data as Message;
}

/**
 * Finds an existing conversation between these two parties about this
 * listing/requirement, or starts one. `buyerId` is always the party reaching
 * out; `sellerId` is always who they are contacting.
 */
export async function startConversation(input: {
  buyerId: string;
  sellerId: string;
  listingId?: string;
  requirementId?: string;
}): Promise<Conversation> {
  const { buyerId, sellerId, listingId, requirementId } = input;

  let existing = supabase
    .from('conversations')
    .select('*')
    .eq('buyer_id', buyerId)
    .eq('seller_id', sellerId);
  existing = listingId ? existing.eq('listing_id', listingId) : existing.is('listing_id', null);
  existing = requirementId ? existing.eq('requirement_id', requirementId) : existing.is('requirement_id', null);

  const { data: found, error: findError } = await existing.maybeSingle();
  if (findError) throw findError;
  if (found) return found as Conversation;

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      buyer_id: buyerId,
      seller_id: sellerId,
      listing_id: listingId ?? null,
      requirement_id: requirementId ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Conversation;
}

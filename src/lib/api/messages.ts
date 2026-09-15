import { supabase } from '../supabase';
import { resolvePlatformMode } from '../platform';
import { claudeFetchMessages, claudeFetchMyConversations, claudeSendMessage, claudeStartConversation, claudeSubscribeMessages } from '../claudeDb';
import type { Conversation, Message, Profile } from '../database.types';

export type ConversationWithParties = Conversation & {
  buyer: Pick<Profile, 'id' | 'company_name'>;
  seller: Pick<Profile, 'id' | 'company_name'>;
  last_message?: Message;
};

/** Every conversation the current user is a participant in, most recent first. */
export async function fetchMyConversations(userId: string): Promise<ConversationWithParties[]> {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeFetchMyConversations(userId);

  const { data, error } = await supabase
    .from('conversations')
    .select('*, buyer:profiles!conversations_buyer_id_fkey(id, company_name), seller:profiles!conversations_seller_id_fkey(id, company_name)')
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ConversationWithParties[];
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeFetchMessages(conversationId);

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Message[];
}

export async function sendMessage(conversationId: string, senderId: string, body: string) {
  if ((await resolvePlatformMode()) === 'claude-db') return claudeSendMessage(conversationId, senderId, body);

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
  if ((await resolvePlatformMode()) === 'claude-db') return claudeStartConversation(input);

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

/**
 * Live updates for one conversation's messages, regardless of backend.
 * `onChange` always receives the FULL current message list in order (never
 * just the newest one), so callers can simply replace their state with it
 * — that is the only shape Claude's `db.onSnapshot` can deliver for a
 * query, so the Supabase side matches it here rather than the two backends
 * exposing different contracts. Resolves to an unsubscribe function;
 * callers should guard against an unmount that happens before this promise
 * settles (see Conversation.tsx).
 */
export async function subscribeToMessages(
  conversationId: string,
  onChange: (messages: Message[]) => void,
): Promise<() => void> {
  if ((await resolvePlatformMode()) === 'claude-db') {
    return claudeSubscribeMessages(conversationId, onChange, () => {
      // Terminal per the db capability's contract; the conversation view
      // simply stops receiving live updates rather than erroring loudly.
    });
  }

  const channel = supabase
    .channel(`conversation-${conversationId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      () => {
        fetchMessages(conversationId).then(onChange);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

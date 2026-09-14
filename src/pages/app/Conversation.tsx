import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/app/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../lib/auth';
import { fetchMessages, fetchMyConversations, sendMessage } from '../../lib/api/messages';
import type { ConversationWithParties } from '../../lib/api/messages';
import type { Message } from '../../lib/database.types';
import { supabase } from '../../lib/supabase';
import { useSeo } from '../../lib/seo';
import './conversation.css';

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<ConversationWithParties | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useSeo({
    title: 'Conversation | ConnectCymru',
    description: 'A conversation about a listing or requirement on ConnectCymru.',
    path: `/app/messages/${id}`,
  });

  useEffect(() => {
    if (!id || !user) return;

    fetchMyConversations(user.id).then((all) => {
      setConversation(all.find((c) => c.id === id) ?? null);
    });
    fetchMessages(id).then(setMessages);

    // Live updates: new messages in this conversation appear without a reload.
    const channel = supabase
      .channel(`conversation-${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` },
        (payload) => setMessages((current) => [...current, payload.new as Message]),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'nearest' });
  }, [messages.length]);

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    if (!id || !user || !body.trim()) return;
    setSending(true);
    try {
      const message = await sendMessage(id, user.id, body.trim());
      setMessages((current) => (current.some((m) => m.id === message.id) ? current : [...current, message]));
      setBody('');
    } finally {
      setSending(false);
    }
  }

  const otherParty =
    conversation && user
      ? conversation.buyer_id === user.id
        ? conversation.seller
        : conversation.buyer
      : null;

  return (
    <DashboardLayout title={otherParty?.company_name ?? 'Conversation'} subtitle="Messages">
      <div className="thread">
        <div className="thread__messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`thread__bubble ${message.sender_id === user?.id ? 'is-own' : 'is-other'}`}
            >
              <p>{message.body}</p>
              <time>{new Date(message.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</time>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form className="thread__composer" onSubmit={handleSend}>
          <label className="visually-hidden" htmlFor="message-body">
            Write a message
          </label>
          <textarea
            id="message-body"
            className="field__control field__control--area"
            style={{ minHeight: '3.5rem' }}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write a message..."
            rows={2}
          />
          <Button type="submit" variant="accent" disabled={sending || !body.trim()}>
            Send
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}

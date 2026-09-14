import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/app/DashboardLayout';
import { useAuth } from '../../lib/auth';
import { fetchMyConversations } from '../../lib/api/messages';
import type { ConversationWithParties } from '../../lib/api/messages';
import { useSeo } from '../../lib/seo';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithParties[] | null>(null);

  useSeo({
    title: 'Messages | ConnectCymru',
    description: 'Conversations with other businesses about listings and requirements.',
    path: '/app/messages',
  });

  useEffect(() => {
    if (!user) return;
    fetchMyConversations(user.id).then(setConversations);
  }, [user]);

  return (
    <DashboardLayout title="Messages">
      {conversations === null ? (
        <p className="lead">Loading&hellip;</p>
      ) : conversations.length === 0 ? (
        <div className="app-empty">
          <p>
            No conversations yet. They start from a match, or from &ldquo;Message&rdquo; on a
            listing you are browsing.
          </p>
        </div>
      ) : (
        <ul className="app-list">
          {conversations.map((conversation) => {
            const isBuyer = conversation.buyer_id === user?.id;
            const otherParty = isBuyer ? conversation.seller : conversation.buyer;
            return (
              <li key={conversation.id} className="app-row">
                <div className="app-row__main">
                  <Link to={`/app/messages/${conversation.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <p className="app-row__title">{otherParty?.company_name ?? 'Business'}</p>
                    <p className="app-row__meta">
                      <span>{isBuyer ? 'About material you need' : 'About your listing'}</span>
                    </p>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardLayout>
  );
}

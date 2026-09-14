import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/app/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../lib/auth';
import { fetchMatchesForBuyer, fetchMatchesForSeller } from '../../lib/api/matches';
import type { ListingMatch, RequirementMatch } from '../../lib/api/matches';
import { startConversation } from '../../lib/api/messages';
import { materialCategories, otherCategory } from '../../data/materials';
import { useSeo } from '../../lib/seo';
import { useNavigate } from 'react-router-dom';

const CATEGORY_NAME = new Map([...materialCategories, otherCategory].map((c) => [c.id, c.name]));

export default function Matches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sellerMatches, setSellerMatches] = useState<ListingMatch[] | null>(null);
  const [buyerMatches, setBuyerMatches] = useState<RequirementMatch[] | null>(null);
  const [contacting, setContacting] = useState<string | null>(null);

  useSeo({
    title: 'Matches | ConnectCymru',
    description: 'Potential matches between your listings and requirements and what other businesses need or have.',
    path: '/app/matches',
  });

  useEffect(() => {
    if (!user) return;
    fetchMatchesForSeller(user.id).then(setSellerMatches);
    fetchMatchesForBuyer(user.id).then(setBuyerMatches);
  }, [user]);

  async function contactAboutSellerMatch(match: ListingMatch) {
    if (!user) return;
    setContacting(match.id);
    try {
      const conversation = await startConversation({
        buyerId: match.requirement.buyer_id,
        sellerId: user.id,
        listingId: match.listing_id,
        requirementId: match.requirement_id,
      });
      navigate(`/app/messages/${conversation.id}`);
    } finally {
      setContacting(null);
    }
  }

  async function contactAboutBuyerMatch(match: RequirementMatch) {
    if (!user) return;
    setContacting(match.id);
    try {
      const conversation = await startConversation({
        buyerId: user.id,
        sellerId: match.listing.seller_id,
        listingId: match.listing_id,
        requirementId: match.requirement_id,
      });
      navigate(`/app/messages/${conversation.id}`);
    } finally {
      setContacting(null);
    }
  }

  const loading = sellerMatches === null || buyerMatches === null;
  const noMatches = !loading && sellerMatches.length === 0 && buyerMatches.length === 0;

  return (
    <DashboardLayout
      title="Matches"
      subtitle="Potential matches are not automatic approvals. Confirm suitability and any applicable requirements yourself before agreeing anything."
    >
      {loading ? (
        <p className="lead">Loading&hellip;</p>
      ) : noMatches ? (
        <div className="app-empty">
          <p>
            No potential matches yet. Matches appear once a listing and a requirement share a
            category, so list what you have or post what you need to start seeing them.
          </p>
        </div>
      ) : (
        <>
          {sellerMatches.length > 0 && (
            <section style={{ marginBottom: 'var(--s-8)' }}>
              <h2 style={{ fontSize: 'var(--t-h4)', marginBottom: 'var(--s-4)' }}>
                Businesses that may want what you have
              </h2>
              <ul className="app-list">
                {sellerMatches.map((match) => (
                  <li key={match.id} className="app-row">
                    <div className="app-row__main">
                      <p className="app-row__title">{match.requirement.title}</p>
                      <p className="app-row__meta">
                        <span>{CATEGORY_NAME.get(match.requirement.category_id)}</span>
                        {match.requirement.location_preference ? <span>{match.requirement.location_preference}</span> : null}
                        <span>{match.reason}</span>
                      </p>
                    </div>
                    <div className="app-row__actions">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => contactAboutSellerMatch(match)}
                        disabled={contacting === match.id}
                      >
                        {contacting === match.id ? 'Opening...' : 'Message'}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {buyerMatches.length > 0 && (
            <section>
              <h2 style={{ fontSize: 'var(--t-h4)', marginBottom: 'var(--s-4)' }}>
                Materials that may match what you need
              </h2>
              <ul className="app-list">
                {buyerMatches.map((match) => (
                  <li key={match.id} className="app-row">
                    <div className="app-row__main">
                      <p className="app-row__title">{match.listing.title}</p>
                      <p className="app-row__meta">
                        <span>{CATEGORY_NAME.get(match.listing.category_id)}</span>
                        {match.listing.location ? <span>{match.listing.location}</span> : null}
                        <span>{match.reason}</span>
                      </p>
                    </div>
                    <div className="app-row__actions">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => contactAboutBuyerMatch(match)}
                        disabled={contacting === match.id}
                      >
                        {contacting === match.id ? 'Opening...' : 'Message'}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHero } from '../components/layout/PageHero';
import { Note } from '../components/ui/Note';
import { Button } from '../components/ui/Button';
import { RequireAuth, RequireSupabase } from '../lib/guards';
import { useAuth } from '../lib/auth';
import { fetchListing, listingPhotoUrl } from '../lib/api/listings';
import { startConversation } from '../lib/api/messages';
import type { Listing, Profile } from '../lib/database.types';
import { supabase } from '../lib/supabase';
import { materialCategories, otherCategory } from '../data/materials';
import { useSeo } from '../lib/seo';
import './ListingDetail.css';

const CATEGORY_NAME = new Map([...materialCategories, otherCategory].map((c) => [c.id, c.name]));

function ListingDetailBody() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null | undefined>(undefined);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchListing(id).then(async (found) => {
      setListing(found);
      if (found) {
        const { data } = await supabase.from('profiles').select('*').eq('id', found.seller_id).maybeSingle();
        setSeller(data as Profile | null);
      }
    });
  }, [id]);

  async function handleContact() {
    if (!listing || !user) return;
    setContacting(true);
    try {
      const conversation = await startConversation({
        buyerId: user.id,
        sellerId: listing.seller_id,
        listingId: listing.id,
      });
      navigate(`/app/messages/${conversation.id}`);
    } finally {
      setContacting(false);
    }
  }

  if (listing === undefined) return <p className="lead">Loading&hellip;</p>;
  if (listing === null) {
    return (
      <div className="app-empty">
        <p>This listing is no longer available.</p>
        <div className="btn-row">
          <Button to="/browse" variant="solid">
            Back to browse
          </Button>
        </div>
      </div>
    );
  }

  const isOwnListing = user?.id === listing.seller_id;

  return (
    <div className="listing-detail">
      {listing.photo_paths.length > 0 && (
        <div className="listing-detail__photos">
          {listing.photo_paths.map((path) => (
            <img key={path} src={listingPhotoUrl(path)} alt="" />
          ))}
        </div>
      )}

      <div className="listing-detail__grid">
        <div>
          <p className="eyebrow" style={{ marginBottom: '1rem' }}>
            <span className="eyebrow__mark" aria-hidden="true" />
            {CATEGORY_NAME.get(listing.category_id) ?? listing.category_id}
          </p>
          <h1 style={{ fontSize: 'var(--t-h1)', marginBottom: '1.5rem' }}>{listing.title}</h1>
          <p className="lead" style={{ whiteSpace: 'pre-wrap' }}>
            {listing.description}
          </p>
        </div>

        <aside className="listing-detail__aside">
          <dl className="listing-detail__facts">
            {listing.quantity && (
              <div>
                <dt>Quantity</dt>
                <dd>{listing.quantity}</dd>
              </div>
            )}
            {listing.condition && (
              <div>
                <dt>Condition</dt>
                <dd>{listing.condition}</dd>
              </div>
            )}
            {listing.location && (
              <div>
                <dt>Location</dt>
                <dd>{listing.location}</dd>
              </div>
            )}
            {listing.frequency && (
              <div>
                <dt>Availability</dt>
                <dd style={{ textTransform: 'capitalize' }}>{listing.frequency.replace('-', ' ')}</dd>
              </div>
            )}
            {seller && (
              <div>
                <dt>Listed by</dt>
                <dd>{seller.company_name}</dd>
              </div>
            )}
          </dl>

          {isOwnListing ? (
            <Button to={`/app/listings/${listing.id}/edit`} variant="outline" fullWidth>
              Edit your listing
            </Button>
          ) : (
            <Button variant="accent" fullWidth onClick={handleContact} disabled={contacting}>
              {contacting ? 'Opening...' : 'Message seller'}
            </Button>
          )}
        </aside>
      </div>

      <Note>
        Potential matches are not automatic approvals. Confirm this material is suitable for
        your intended use and that any applicable regulatory, safety, transport or waste
        requirements are satisfied before agreeing anything.
      </Note>
    </div>
  );
}

export default function ListingDetail() {
  useSeo({
    title: 'Listing | ConnectCymru',
    description: 'A surplus material listing on ConnectCymru.',
    path: '/browse',
  });

  return (
    <>
      <PageHero eyebrow="Listing" title="Material details." />
      <section className="section container">
        <RequireSupabase>
          <RequireAuth>
            <ListingDetailBody />
          </RequireAuth>
        </RequireSupabase>
      </section>
    </>
  );
}

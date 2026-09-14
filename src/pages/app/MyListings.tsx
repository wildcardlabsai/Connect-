import { useEffect, useState } from 'react';
import { DashboardLayout, EmptyState, InlineLink } from '../../components/app/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../lib/auth';
import { deleteListing, fetchMyListings, updateListing } from '../../lib/api/listings';
import type { Listing } from '../../lib/database.types';
import { materialCategories, otherCategory } from '../../data/materials';
import { useSeo } from '../../lib/seo';

const CATEGORY_NAME = new Map([...materialCategories, otherCategory].map((c) => [c.id, c.name]));

export default function MyListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[] | null>(null);

  useSeo({
    title: 'My Listings | ConnectCymru',
    description: 'The surplus materials you have listed on ConnectCymru.',
    path: '/app/listings',
  });

  async function load() {
    if (!user) return;
    setListings(await fetchMyListings(user.id));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleArchive(id: string) {
    await updateListing(id, { status: 'archived' });
    load();
  }

  async function handleReactivate(id: string) {
    await updateListing(id, { status: 'active' });
    load();
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    await deleteListing(id);
    load();
  }

  return (
    <DashboardLayout
      title="My Listings"
      action={
        <Button to="/app/listings/new" variant="accent" size="sm" arrow>
          New listing
        </Button>
      }
    >
      {listings === null ? (
        <p className="lead">Loading&hellip;</p>
      ) : listings.length === 0 ? (
        <EmptyState
          title="You haven't listed anything yet."
          body="List a surplus material and it becomes visible to other businesses looking for exactly that."
          actionLabel="List surplus material"
          actionTo="/app/listings/new"
        />
      ) : (
        <ul className="app-list">
          {listings.map((listing) => (
            <li key={listing.id} className="app-row">
              <div className="app-row__main">
                <p className="app-row__title">{listing.title}</p>
                <p className="app-row__meta">
                  <span>{CATEGORY_NAME.get(listing.category_id) ?? listing.category_id}</span>
                  {listing.location ? <span>{listing.location}</span> : null}
                  <span className={`badge badge--${listing.status}`}>{listing.status}</span>
                </p>
              </div>
              <div className="app-row__actions">
                <InlineLink to={`/app/listings/${listing.id}/edit`}>Edit</InlineLink>
                {listing.status === 'active' ? (
                  <Button variant="outline" size="sm" onClick={() => handleArchive(listing.id)}>
                    Archive
                  </Button>
                ) : listing.status === 'archived' ? (
                  <Button variant="outline" size="sm" onClick={() => handleReactivate(listing.id)}>
                    Reactivate
                  </Button>
                ) : null}
                <Button variant="link" size="sm" onClick={() => handleDelete(listing.id)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardLayout>
  );
}

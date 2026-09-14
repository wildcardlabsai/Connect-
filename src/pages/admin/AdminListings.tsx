import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/app/AdminLayout';
import { Button } from '../../components/ui/Button';
import { fetchAllListingsForAdmin, setListingStatus } from '../../lib/api/admin';
import type { Listing } from '../../lib/database.types';
import { materialCategories, otherCategory } from '../../data/materials';
import { useSeo } from '../../lib/seo';

const CATEGORY_NAME = new Map([...materialCategories, otherCategory].map((c) => [c.id, c.name]));

export default function AdminListings() {
  const [listings, setListings] = useState<Listing[] | null>(null);

  useSeo({ title: 'Listings | ConnectCymru Admin', description: 'Moderate listings.', path: '/admin/listings' });

  async function load() {
    setListings(await fetchAllListingsForAdmin());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRemove(id: string) {
    await setListingStatus(id, 'removed');
    load();
  }

  async function handleRestore(id: string) {
    await setListingStatus(id, 'active');
    load();
  }

  return (
    <AdminLayout title="Listings">
      {listings === null ? (
        <p className="lead">Loading&hellip;</p>
      ) : listings.length === 0 ? (
        <div className="app-empty">
          <p>No listings yet.</p>
        </div>
      ) : (
        <ul className="app-list">
          {listings.map((listing) => (
            <li key={listing.id} className="app-row">
              <div className="app-row__main">
                <p className="app-row__title">{listing.title}</p>
                <p className="app-row__meta">
                  <span>{CATEGORY_NAME.get(listing.category_id)}</span>
                  {listing.location ? <span>{listing.location}</span> : null}
                  <span className={`badge badge--${listing.status}`}>{listing.status}</span>
                </p>
              </div>
              <div className="app-row__actions">
                {listing.status === 'removed' ? (
                  <Button variant="outline" size="sm" onClick={() => handleRestore(listing.id)}>
                    Restore
                  </Button>
                ) : (
                  <Button variant="link" size="sm" onClick={() => handleRemove(listing.id)}>
                    Remove
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminLayout>
  );
}

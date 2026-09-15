import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHero } from '../components/layout/PageHero';
import { fetchActiveListings } from '../lib/api/listings';
import type { Listing } from '../lib/database.types';
import { materialCategories, otherCategory } from '../data/materials';
import { RequirePlatform } from '../lib/guards';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/Button';
import { useSeo } from '../lib/seo';
import './Browse.css';

const CATEGORIES = [...materialCategories, otherCategory];
const CATEGORY_NAME = new Map(CATEGORIES.map((c) => [c.id, c.name]));

function BrowseList() {
  const { user, loading } = useAuth();
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [category, setCategory] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    fetchActiveListings(category || undefined).then(setListings);
  }, [user, category]);

  if (loading) return <p className="lead">Loading&hellip;</p>;

  if (!user) {
    return (
      <div className="app-empty">
        <p>Sign in to browse what other Welsh businesses currently have listed.</p>
        <div className="btn-row">
          <Button to="/login" variant="solid">
            Sign in
          </Button>
          <Button to="/signup" variant="outline">
            Create an account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="browse-filters" role="group" aria-label="Filter by category">
        <button
          type="button"
          className={`browse-filters__chip${category === '' ? ' is-active' : ''}`}
          onClick={() => setCategory('')}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`browse-filters__chip${category === c.id ? ' is-active' : ''}`}
            onClick={() => setCategory(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {listings === null ? (
        <p className="lead">Loading&hellip;</p>
      ) : listings.length === 0 ? (
        <div className="app-empty">
          <p>No active listings in this category yet.</p>
        </div>
      ) : (
        <ul className="app-list">
          {listings.map((listing) => (
            <li key={listing.id} className="app-row">
              <div className="app-row__main">
                <Link to={`/browse/${listing.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <p className="app-row__title">{listing.title}</p>
                  <p className="app-row__meta">
                    <span>{CATEGORY_NAME.get(listing.category_id)}</span>
                    {listing.location ? <span>{listing.location}</span> : null}
                    {listing.quantity ? <span>{listing.quantity}</span> : null}
                  </p>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function Browse() {
  useSeo({
    title: 'Browse Listings | ConnectCymru',
    description: 'Browse surplus materials currently listed by Welsh businesses on ConnectCymru.',
    path: '/browse',
  });

  return (
    <>
      <PageHero
        eyebrow="Browse"
        title="What's currently available."
        lead="Materials listed by businesses on ConnectCymru. Sign in to see the full list and get in touch."
      />
      <section className="section container">
        <RequirePlatform>
          <BrowseList />
        </RequirePlatform>
      </section>
    </>
  );
}

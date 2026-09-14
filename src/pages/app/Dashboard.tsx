import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/app/DashboardLayout';
import { useAuth } from '../../lib/auth';
import { fetchMyListings } from '../../lib/api/listings';
import { fetchMyRequirements } from '../../lib/api/requirements';
import { fetchMatchesForBuyer, fetchMatchesForSeller } from '../../lib/api/matches';
import { Button } from '../../components/ui/Button';
import { useSeo } from '../../lib/seo';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [counts, setCounts] = useState<{ listings: number; requirements: number; matches: number } | null>(null);

  useSeo({
    title: 'Your Dashboard | ConnectCymru',
    description: 'Manage your listings, requirements, matches and messages.',
    path: '/app',
  });

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    Promise.all([
      fetchMyListings(user.id),
      fetchMyRequirements(user.id),
      fetchMatchesForSeller(user.id),
      fetchMatchesForBuyer(user.id),
    ]).then(([listings, requirements, sellerMatches, buyerMatches]) => {
      if (cancelled) return;
      const matchIds = new Set([...sellerMatches.map((m) => m.id), ...buyerMatches.map((m) => m.id)]);
      setCounts({ listings: listings.length, requirements: requirements.length, matches: matchIds.size });
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <DashboardLayout
      title={`Welcome${profile ? `, ${profile.contact_name.split(' ')[0]}` : ''}.`}
      subtitle={profile?.company_name}
    >
      <div className="stat-grid">
        <div className="stat-tile">
          <p className="stat-tile__value">{counts?.listings ?? '—'}</p>
          <p className="stat-tile__label">Your listings</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__value">{counts?.requirements ?? '—'}</p>
          <p className="stat-tile__label">Your requirements</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__value">{counts?.matches ?? '—'}</p>
          <p className="stat-tile__label">Potential matches</p>
        </div>
      </div>

      <div className="btn-row">
        <Button to="/app/listings/new" variant="accent" arrow>
          List surplus material
        </Button>
        <Button to="/app/requirements/new" variant="outline">
          Post what you need
        </Button>
        <Button to="/browse" variant="outline">
          Browse listings
        </Button>
      </div>
    </DashboardLayout>
  );
}

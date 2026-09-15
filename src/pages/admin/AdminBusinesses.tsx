import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/app/AdminLayout';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../lib/auth';
import { fetchAllProfilesForAdmin, setBusinessStatus } from '../../lib/api/admin';
import type { Profile } from '../../lib/database.types';
import { useSeo } from '../../lib/seo';

const STATUS_ORDER: Record<Profile['status'], number> = { pending: 0, approved: 1, rejected: 2 };

export default function AdminBusinesses() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[] | null>(null);

  useSeo({
    title: 'Businesses | ConnectCymru Admin',
    description: 'Registered businesses and pending approvals.',
    path: '/admin/businesses',
  });

  async function load() {
    setProfiles(await fetchAllProfilesForAdmin());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApprove(id: string) {
    if (!user) return;
    await setBusinessStatus(id, 'approved', user.id);
    load();
  }

  const sorted = profiles
    ? [...profiles].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
    : null;

  return (
    <AdminLayout title="Businesses">
      {sorted === null ? (
        <p className="lead">Loading&hellip;</p>
      ) : sorted.length === 0 ? (
        <div className="app-empty">
          <p>No registered businesses yet.</p>
        </div>
      ) : (
        <ul className="app-list">
          {sorted.map((profile) => (
            <li key={profile.id} className="app-row">
              <div className="app-row__main">
                <p className="app-row__title">{profile.legal_name || profile.company_name}</p>
                <p className="app-row__meta">
                  <span>{profile.contact_name}</span>
                  {profile.location ? <span>{profile.location}</span> : null}
                  {profile.industry ? <span>{profile.industry}</span> : null}
                  <span className={`badge badge--${profile.status}`}>{profile.status}</span>
                </p>
              </div>
              <div className="app-row__actions">
                {profile.status === 'pending' ? (
                  <Button variant="solid" size="sm" onClick={() => handleApprove(profile.id)}>
                    Quick approve
                  </Button>
                ) : null}
                <Button variant="outline" size="sm" to={`/admin/businesses/${profile.id}`}>
                  Review
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminLayout>
  );
}

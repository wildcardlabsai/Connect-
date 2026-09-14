import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/app/AdminLayout';
import { fetchAllProfilesForAdmin } from '../../lib/api/admin';
import type { Profile } from '../../lib/database.types';
import { useSeo } from '../../lib/seo';

export default function AdminBusinesses() {
  const [profiles, setProfiles] = useState<Profile[] | null>(null);

  useSeo({
    title: 'Businesses | ConnectCymru Admin',
    description: 'Registered businesses.',
    path: '/admin/businesses',
  });

  useEffect(() => {
    fetchAllProfilesForAdmin().then(setProfiles);
  }, []);

  return (
    <AdminLayout title="Businesses">
      {profiles === null ? (
        <p className="lead">Loading&hellip;</p>
      ) : profiles.length === 0 ? (
        <div className="app-empty">
          <p>No registered businesses yet.</p>
        </div>
      ) : (
        <ul className="app-list">
          {profiles.map((profile) => (
            <li key={profile.id} className="app-row">
              <div className="app-row__main">
                <p className="app-row__title">{profile.company_name}</p>
                <p className="app-row__meta">
                  <span>{profile.contact_name}</span>
                  {profile.location ? <span>{profile.location}</span> : null}
                  {profile.industry ? <span>{profile.industry}</span> : null}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminLayout>
  );
}

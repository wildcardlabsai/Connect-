import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/app/AdminLayout';
import { fetchAllRequirementsForAdmin } from '../../lib/api/admin';
import type { Requirement } from '../../lib/database.types';
import { materialCategories, otherCategory } from '../../data/materials';
import { useSeo } from '../../lib/seo';

const CATEGORY_NAME = new Map([...materialCategories, otherCategory].map((c) => [c.id, c.name]));

export default function AdminRequirements() {
  const [requirements, setRequirements] = useState<Requirement[] | null>(null);

  useSeo({
    title: 'Requirements | ConnectCymru Admin',
    description: 'All posted requirements.',
    path: '/admin/requirements',
  });

  useEffect(() => {
    fetchAllRequirementsForAdmin().then(setRequirements);
  }, []);

  return (
    <AdminLayout title="Requirements">
      {requirements === null ? (
        <p className="lead">Loading&hellip;</p>
      ) : requirements.length === 0 ? (
        <div className="app-empty">
          <p>No requirements yet.</p>
        </div>
      ) : (
        <ul className="app-list">
          {requirements.map((requirement) => (
            <li key={requirement.id} className="app-row">
              <div className="app-row__main">
                <p className="app-row__title">{requirement.title}</p>
                <p className="app-row__meta">
                  <span>{CATEGORY_NAME.get(requirement.category_id)}</span>
                  {requirement.location_preference ? <span>{requirement.location_preference}</span> : null}
                  <span className={`badge badge--${requirement.status}`}>{requirement.status}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminLayout>
  );
}

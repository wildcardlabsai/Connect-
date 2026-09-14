import { useEffect, useState } from 'react';
import { DashboardLayout, EmptyState, InlineLink } from '../../components/app/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../lib/auth';
import { deleteRequirement, fetchMyRequirements, updateRequirement } from '../../lib/api/requirements';
import type { Requirement } from '../../lib/database.types';
import { materialCategories, otherCategory } from '../../data/materials';
import { useSeo } from '../../lib/seo';

const CATEGORY_NAME = new Map([...materialCategories, otherCategory].map((c) => [c.id, c.name]));

export default function MyRequirements() {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState<Requirement[] | null>(null);

  useSeo({
    title: 'My Requirements | ConnectCymru',
    description: 'The materials you are looking for on ConnectCymru.',
    path: '/app/requirements',
  });

  async function load() {
    if (!user) return;
    setRequirements(await fetchMyRequirements(user.id));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleStatus(id: string, status: Requirement['status']) {
    await updateRequirement(id, { status });
    load();
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this requirement? This cannot be undone.')) return;
    await deleteRequirement(id);
    load();
  }

  return (
    <DashboardLayout
      title="My Requirements"
      action={
        <Button to="/app/requirements/new" variant="accent" size="sm" arrow>
          New requirement
        </Button>
      }
    >
      {requirements === null ? (
        <p className="lead">Loading&hellip;</p>
      ) : requirements.length === 0 ? (
        <EmptyState
          title="You haven't posted what you're looking for yet."
          body="Describe a material you need and it becomes visible to businesses that might have it."
          actionLabel="Post what you need"
          actionTo="/app/requirements/new"
        />
      ) : (
        <ul className="app-list">
          {requirements.map((requirement) => (
            <li key={requirement.id} className="app-row">
              <div className="app-row__main">
                <p className="app-row__title">{requirement.title}</p>
                <p className="app-row__meta">
                  <span>{CATEGORY_NAME.get(requirement.category_id) ?? requirement.category_id}</span>
                  {requirement.location_preference ? <span>{requirement.location_preference}</span> : null}
                  <span className={`badge badge--${requirement.status}`}>{requirement.status}</span>
                </p>
              </div>
              <div className="app-row__actions">
                <InlineLink to={`/app/requirements/${requirement.id}/edit`}>Edit</InlineLink>
                {requirement.status === 'active' ? (
                  <Button variant="outline" size="sm" onClick={() => handleStatus(requirement.id, 'paused')}>
                    Pause
                  </Button>
                ) : requirement.status === 'paused' ? (
                  <Button variant="outline" size="sm" onClick={() => handleStatus(requirement.id, 'active')}>
                    Reactivate
                  </Button>
                ) : null}
                <Button variant="link" size="sm" onClick={() => handleDelete(requirement.id)}>
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

import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/app/AdminLayout';
import { fetchAdminStats } from '../../lib/api/admin';
import { useSeo } from '../../lib/seo';

export default function AdminOverview() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchAdminStats>> | null>(null);

  useSeo({ title: 'Admin | ConnectCymru', description: 'ConnectCymru admin overview.', path: '/admin' });

  useEffect(() => {
    fetchAdminStats().then(setStats);
  }, []);

  return (
    <AdminLayout title="Overview">
      <div className="stat-grid">
        <div className="stat-tile">
          <p className="stat-tile__value">{stats?.businesses ?? '—'}</p>
          <p className="stat-tile__label">Registered businesses</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__value">{stats?.activeListings ?? '—'}</p>
          <p className="stat-tile__label">Active listings</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__value">{stats?.activeRequirements ?? '—'}</p>
          <p className="stat-tile__label">Active requirements</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__value">{stats?.openEnquiries ?? '—'}</p>
          <p className="stat-tile__label">Open enquiries</p>
        </div>
      </div>
    </AdminLayout>
  );
}

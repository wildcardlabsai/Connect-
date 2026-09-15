import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/app/AdminLayout';
import { Button } from '../../components/ui/Button';
import { TextAreaField } from '../../components/forms/Fields';
import { useAuth } from '../../lib/auth';
import { fetchAllProfilesForAdmin, setBusinessStatus } from '../../lib/api/admin';
import { COMPANY_TYPE_LABELS } from '../../lib/database.types';
import type { Profile } from '../../lib/database.types';
import { useSeo } from '../../lib/seo';
import '../../components/forms/form.css';

function DetailItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="detail-grid__label">{label}</p>
      <p className="detail-grid__value">{value || '—'}</p>
    </div>
  );
}

export default function AdminBusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useSeo({
    title: 'Business review | ConnectCymru Admin',
    description: 'Review a registered business.',
    path: `/admin/businesses/${id}`,
  });

  async function load() {
    const all = await fetchAllProfilesForAdmin();
    setProfile(all.find((p) => p.id === id) ?? null);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleApprove() {
    if (!id || !user) return;
    setWorking(true);
    setError(null);
    try {
      await setBusinessStatus(id, 'approved', user.id);
      await load();
      setShowReject(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setWorking(false);
    }
  }

  async function handleReject(event: React.FormEvent) {
    event.preventDefault();
    if (!id || !user) return;
    setWorking(true);
    setError(null);
    try {
      await setBusinessStatus(id, 'rejected', user.id, rejectionReason.trim() || undefined);
      await load();
      setShowReject(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setWorking(false);
    }
  }

  if (profile === undefined) {
    return (
      <AdminLayout title="Business review">
        <p className="lead">Loading&hellip;</p>
      </AdminLayout>
    );
  }

  if (profile === null) {
    return (
      <AdminLayout title="Business review">
        <div className="app-empty">
          <p>No business found with this id.</p>
          <div className="btn-row">
            <Button to="/admin/businesses" variant="outline">
              Back to businesses
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={profile.legal_name || profile.company_name}>
      <p style={{ marginBottom: 'var(--s-6)' }}>
        Status: <span className={`badge badge--${profile.status}`}>{profile.status}</span>
        {profile.status === 'rejected' && profile.rejection_reason ? (
          <span className="field__hint" style={{ display: 'block', marginTop: 'var(--s-2)' }}>
            Reason given: {profile.rejection_reason}
          </span>
        ) : null}
      </p>

      <div className="detail-grid">
        <DetailItem label="Trading name" value={profile.company_name} />
        <DetailItem label="Registered/legal name" value={profile.legal_name} />
        <DetailItem
          label="Company type"
          value={profile.company_type ? COMPANY_TYPE_LABELS[profile.company_type] : null}
        />
        <DetailItem label="Companies House number" value={profile.companies_house_number} />
        <DetailItem label="VAT number" value={profile.vat_number} />
        <DetailItem label="Website" value={profile.website} />
        <DetailItem
          label="Registered address"
          value={[
            profile.registered_address_line1,
            profile.registered_address_line2,
            profile.registered_city,
            profile.registered_postcode,
            profile.registered_country,
          ]
            .filter(Boolean)
            .join(', ')}
        />
        <DetailItem label="Contact" value={profile.contact_name} />
        <DetailItem label="Job title" value={profile.job_title} />
        <DetailItem label="Location" value={profile.location} />
        <DetailItem label="Industry" value={profile.industry} />
        <DetailItem label="Phone" value={profile.phone} />
        <DetailItem
          label="Terms accepted"
          value={profile.terms_accepted_at ? new Date(profile.terms_accepted_at).toLocaleString('en-GB') : null}
        />
        <DetailItem
          label="Registered"
          value={new Date(profile.created_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
        />
      </div>

      {error ? (
        <p className="form__alert" role="alert" style={{ marginBottom: 'var(--s-5)' }}>
          {error}
        </p>
      ) : null}

      <div className="btn-row" style={{ marginBottom: 'var(--s-6)' }}>
        {profile.status !== 'approved' ? (
          <Button variant="accent" onClick={handleApprove} disabled={working}>
            Approve
          </Button>
        ) : null}
        {profile.status !== 'rejected' ? (
          <Button variant="outline" onClick={() => setShowReject((current) => !current)} disabled={working}>
            Reject&hellip;
          </Button>
        ) : null}
        <Button to="/admin/businesses" variant="link">
          Back to businesses
        </Button>
      </div>

      {showReject ? (
        <form className="form" style={{ maxWidth: '32rem' }} onSubmit={handleReject}>
          <TextAreaField
            label="Reason (shown to the business)"
            name="rejectionReason"
            value={rejectionReason}
            onChange={setRejectionReason}
            rows={3}
            hint="Explain what needs correcting so they can fix it and be reviewed again."
          />
          <div className="form__foot">
            <Button type="submit" variant="solid" disabled={working}>
              {working ? 'Rejecting...' : 'Confirm rejection'}
            </Button>
          </div>
        </form>
      ) : null}
    </AdminLayout>
  );
}

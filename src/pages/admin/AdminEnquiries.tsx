import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/app/AdminLayout';
import { Button } from '../../components/ui/Button';
import { fetchAllEnquiries, setEnquiryHandled } from '../../lib/api/admin';
import type { Enquiry } from '../../lib/database.types';
import { useSeo } from '../../lib/seo';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[] | null>(null);

  useSeo({
    title: 'Enquiries | ConnectCymru Admin',
    description: 'Founding network and contact form submissions.',
    path: '/admin/enquiries',
  });

  async function load() {
    setEnquiries(await fetchAllEnquiries());
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(id: string, handled: boolean) {
    await setEnquiryHandled(id, handled);
    load();
  }

  return (
    <AdminLayout title="Enquiries">
      {enquiries === null ? (
        <p className="lead">Loading&hellip;</p>
      ) : enquiries.length === 0 ? (
        <div className="app-empty">
          <p>No enquiries yet.</p>
        </div>
      ) : (
        <ul className="app-list">
          {enquiries.map((enquiry) => (
            <li key={enquiry.id} className="app-row" style={{ alignItems: 'flex-start' }}>
              <div className="app-row__main">
                <p className="app-row__title">
                  {enquiry.name}
                  {enquiry.company ? ` — ${enquiry.company}` : ''}
                </p>
                <p className="app-row__meta">
                  <span>{enquiry.email}</span>
                  <span>{enquiry.form_name === 'founding-network' ? 'Founding network' : 'Contact'}</span>
                  {enquiry.interest ? <span>{enquiry.interest}</span> : null}
                  {enquiry.location ? <span>{enquiry.location}</span> : null}
                  <span>{new Date(enquiry.created_at).toLocaleDateString('en-GB')}</span>
                </p>
                {enquiry.message ? (
                  <p style={{ marginTop: 'var(--s-2)', fontSize: 'var(--t-small)', color: 'var(--text-muted)' }}>
                    {enquiry.message}
                  </p>
                ) : null}
              </div>
              <div className="app-row__actions">
                <Button variant="outline" size="sm" onClick={() => toggle(enquiry.id, !enquiry.handled)}>
                  {enquiry.handled ? 'Mark unhandled' : 'Mark handled'}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminLayout>
  );
}

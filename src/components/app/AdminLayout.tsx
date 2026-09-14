import type { ReactNode } from 'react';
import { AppShell } from './AppShell';

const NAV = [
  { label: 'Overview', to: '/admin', end: true },
  { label: 'Listings', to: '/admin/listings' },
  { label: 'Requirements', to: '/admin/requirements' },
  { label: 'Businesses', to: '/admin/businesses' },
  { label: 'Enquiries', to: '/admin/enquiries' },
];

export function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <AppShell title={title} subtitle="Admin" nav={NAV}>
      {children}
    </AppShell>
  );
}

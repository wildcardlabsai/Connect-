import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/app/DashboardLayout';
import { SelectField, TextField } from '../../components/forms/Fields';
import { Button } from '../../components/ui/Button';
import { Note } from '../../components/ui/Note';
import { useAuth } from '../../lib/auth';
import { claudeUpdateBusiness } from '../../lib/claudeDb';
import { supabase } from '../../lib/supabase';
import { requiredText } from '../../lib/validation';
import { COMPANY_TYPE_LABELS } from '../../lib/database.types';
import type { CompanyType } from '../../lib/database.types';
import { useSeo } from '../../lib/seo';
import '../../components/forms/form.css';

const COMPANY_TYPE_OPTIONS = Object.values(COMPANY_TYPE_LABELS);
const COMPANY_TYPE_BY_LABEL = new Map<string, CompanyType>(
  (Object.entries(COMPANY_TYPE_LABELS) as [CompanyType, string][]).map(([value, label]) => [label, value]),
);
const COMPANY_TYPE_LABEL_BY_VALUE = new Map<CompanyType, string>(
  Object.entries(COMPANY_TYPE_LABELS) as [CompanyType, string][],
);

const STATUS_COPY: Record<string, string> = {
  pending: 'Awaiting review. You can still update these details while you wait.',
  approved: 'Approved — your listings and requirements are visible to other businesses.',
  rejected: 'Not approved. Update anything that needed correcting and get in touch.',
};

export default function Settings() {
  const { user, profile, mode, refreshProfile, signOut } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [phone, setPhone] = useState('');
  const [legalName, setLegalName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [companiesHouseNumber, setCompaniesHouseNumber] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [registeredAddressLine1, setRegisteredAddressLine1] = useState('');
  const [registeredAddressLine2, setRegisteredAddressLine2] = useState('');
  const [registeredCity, setRegisteredCity] = useState('');
  const [registeredPostcode, setRegisteredPostcode] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [website, setWebsite] = useState('');
  const [demoAdmin, setDemoAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useSeo({
    title: 'Settings | ConnectCymru',
    description: 'Manage your ConnectCymru business account details.',
    path: '/app/settings',
  });

  useEffect(() => {
    if (!profile) return;
    setCompanyName(profile.company_name);
    setContactName(profile.contact_name);
    setLocation(profile.location ?? '');
    setIndustry(profile.industry ?? '');
    setPhone(profile.phone ?? '');
    setLegalName(profile.legal_name ?? '');
    setCompanyType(profile.company_type ? (COMPANY_TYPE_LABEL_BY_VALUE.get(profile.company_type) ?? '') : '');
    setCompaniesHouseNumber(profile.companies_house_number ?? '');
    setVatNumber(profile.vat_number ?? '');
    setRegisteredAddressLine1(profile.registered_address_line1 ?? '');
    setRegisteredAddressLine2(profile.registered_address_line2 ?? '');
    setRegisteredCity(profile.registered_city ?? '');
    setRegisteredPostcode(profile.registered_postcode ?? '');
    setJobTitle(profile.job_title ?? '');
    setWebsite(profile.website ?? '');
    setDemoAdmin(Boolean(profile.is_admin));
  }, [profile]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    setError(null);
    setSaved(false);

    const companyError = requiredText(companyName, 'Company name');
    const contactError = requiredText(contactName, 'Your name');
    if (companyError || contactError) {
      setError(companyError || contactError || null);
      return;
    }

    setSaving(true);
    try {
      const patch = {
        company_name: companyName.trim(),
        contact_name: contactName.trim(),
        location: location.trim() || null,
        industry: industry.trim() || null,
        phone: phone.trim() || null,
        legal_name: legalName.trim() || null,
        company_type: COMPANY_TYPE_BY_LABEL.get(companyType) ?? null,
        companies_house_number: companiesHouseNumber.trim() || null,
        vat_number: vatNumber.trim() || null,
        registered_address_line1: registeredAddressLine1.trim() || null,
        registered_address_line2: registeredAddressLine2.trim() || null,
        registered_city: registeredCity.trim() || null,
        registered_postcode: registeredPostcode.trim() || null,
        job_title: jobTitle.trim() || null,
        website: website.trim() || null,
      };

      if (mode === 'claude-db') {
        await claudeUpdateBusiness(user.id, { ...patch, is_admin: demoAdmin });
      } else {
        const { error: updateError } = await supabase.from('profiles').update(patch).eq('id', user.id);
        if (updateError) throw updateError;
      }

      await refreshProfile();
      setSaved(true);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Something went wrong saving this.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout title="Settings">
      {profile ? (
        <div style={{ marginBottom: 'var(--s-6)' }}>
          <p style={{ marginBottom: 'var(--s-3)' }}>
            Account status: <span className={`badge badge--${profile.status}`}>{profile.status}</span>
          </p>
          {profile.status === 'rejected' && profile.rejection_reason ? (
            <Note label="Reason given">{profile.rejection_reason}</Note>
          ) : (
            <p className="field__hint">{STATUS_COPY[profile.status]}</p>
          )}
        </div>
      ) : null}

      <form className="form" style={{ maxWidth: '32rem' }} onSubmit={handleSubmit} noValidate>
        <h3 className="form__section-title" style={{ borderTop: 'none', paddingTop: 0 }}>
          Account
        </h3>
        <TextField label="Trading name" name="companyName" value={companyName} onChange={setCompanyName} required />
        <TextField label="Your name" name="contactName" value={contactName} onChange={setContactName} required />
        <TextField label="Your job title" name="jobTitle" value={jobTitle} onChange={setJobTitle} />
        <TextField label="Location" name="location" value={location} onChange={setLocation} />
        <TextField label="Industry" name="industry" value={industry} onChange={setIndustry} />
        <TextField label="Phone" name="phone" value={phone} onChange={setPhone} />

        <h3 className="form__section-title">Company legal details</h3>
        <p className="field__hint" style={{ marginTop: 'calc(var(--s-2) * -1)' }}>
          Changes here don&rsquo;t affect your approval status, but a significant change (a new
          legal name, a different company) may prompt another review.
        </p>
        <TextField
          label="Registered/legal company name"
          name="legalName"
          value={legalName}
          onChange={setLegalName}
        />
        <SelectField
          label="Company type"
          name="companyType"
          value={companyType}
          onChange={setCompanyType}
          options={COMPANY_TYPE_OPTIONS}
        />
        <TextField
          label="Companies House number"
          name="companiesHouseNumber"
          value={companiesHouseNumber}
          onChange={setCompaniesHouseNumber}
        />
        <TextField label="VAT number" name="vatNumber" value={vatNumber} onChange={setVatNumber} />
        <TextField
          label="Registered address"
          name="registeredAddressLine1"
          value={registeredAddressLine1}
          onChange={setRegisteredAddressLine1}
        />
        <TextField
          label="Address line 2"
          name="registeredAddressLine2"
          value={registeredAddressLine2}
          onChange={setRegisteredAddressLine2}
        />
        <TextField label="Town or city" name="registeredCity" value={registeredCity} onChange={setRegisteredCity} />
        <TextField
          label="Postcode"
          name="registeredPostcode"
          value={registeredPostcode}
          onChange={setRegisteredPostcode}
        />
        <TextField label="Website" name="website" value={website} onChange={setWebsite} placeholder="https://" />

        {mode === 'claude-db' ? (
          <label className="radio__label" style={{ display: 'inline-flex', width: 'fit-content' }}>
            <input
              type="checkbox"
              checked={demoAdmin}
              onChange={(event) => setDemoAdmin(event.target.checked)}
              style={{ marginRight: '0.5em' }}
            />
            Treat this business as admin (demo mode &mdash; there is no real permission check
            behind this, see the home page for why)
          </label>
        ) : null}

        {error ? (
          <p className="form__alert" role="alert">
            {error}
          </p>
        ) : null}
        {saved ? <p style={{ color: '#1a6b3c', fontSize: 'var(--t-small)' }}>Saved.</p> : null}

        <div className="form__foot">
          <Button type="submit" variant="accent" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>

      <div style={{ marginTop: 'var(--s-9)', paddingTop: 'var(--s-6)', borderTop: '1px solid var(--line)' }}>
        <Button variant="outline" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    </DashboardLayout>
  );
}

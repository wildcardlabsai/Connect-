import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/app/DashboardLayout';
import { TextField } from '../../components/forms/Fields';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../lib/auth';
import { claudeUpdateBusiness } from '../../lib/claudeDb';
import { supabase } from '../../lib/supabase';
import { requiredText } from '../../lib/validation';
import { useSeo } from '../../lib/seo';
import '../../components/forms/form.css';

export default function Settings() {
  const { user, profile, mode, refreshProfile, signOut } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [phone, setPhone] = useState('');
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
      <form className="form" style={{ maxWidth: '32rem' }} onSubmit={handleSubmit} noValidate>
        <TextField label="Company" name="companyName" value={companyName} onChange={setCompanyName} required />
        <TextField label="Your name" name="contactName" value={contactName} onChange={setContactName} required />
        <TextField label="Location" name="location" value={location} onChange={setLocation} />
        <TextField label="Industry" name="industry" value={industry} onChange={setIndustry} />
        <TextField label="Phone" name="phone" value={phone} onChange={setPhone} />

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

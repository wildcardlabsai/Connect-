import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/app/DashboardLayout';
import { TextField } from '../../components/forms/Fields';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { requiredText } from '../../lib/validation';
import { useSeo } from '../../lib/seo';
import '../../components/forms/form.css';

export default function Settings() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [phone, setPhone] = useState('');
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
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        company_name: companyName.trim(),
        contact_name: contactName.trim(),
        location: location.trim() || null,
        industry: industry.trim() || null,
        phone: phone.trim() || null,
      })
      .eq('id', user.id);
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await refreshProfile();
    setSaved(true);
  }

  return (
    <DashboardLayout title="Settings">
      <form className="form" style={{ maxWidth: '32rem' }} onSubmit={handleSubmit} noValidate>
        <TextField label="Company" name="companyName" value={companyName} onChange={setCompanyName} required />
        <TextField label="Your name" name="contactName" value={contactName} onChange={setContactName} required />
        <TextField label="Location" name="location" value={location} onChange={setLocation} />
        <TextField label="Industry" name="industry" value={industry} onChange={setIndustry} />
        <TextField label="Phone" name="phone" value={phone} onChange={setPhone} />

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

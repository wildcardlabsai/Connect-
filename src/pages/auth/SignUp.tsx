import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { PageHero } from '../../components/layout/PageHero';
import { RequirePlatform } from '../../lib/guards';
import { useAuth } from '../../lib/auth';
import { TextField } from '../../components/forms/Fields';
import { Button } from '../../components/ui/Button';
import { compact, requiredEmail, requiredText } from '../../lib/validation';
import type { Errors } from '../../lib/validation';
import { useSeo } from '../../lib/seo';
import './auth.css';
import '../../components/forms/form.css';

type FieldName = 'companyName' | 'contactName' | 'email' | 'password' | 'location';

const EMPTY: Record<FieldName, string> = {
  companyName: '',
  contactName: '',
  email: '',
  password: '',
  location: '',
};

function SignUpForm() {
  const { user, loading, signUp, mode } = useAuth();
  const isClaudeDb = mode === 'claude-db';
  const navigate = useNavigate();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors<FieldName>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmNotice, setConfirmNotice] = useState(false);

  const set = (field: FieldName) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  if (!loading && user) return <Navigate to="/app" replace />;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const found = compact<FieldName>({
      companyName: requiredText(values.companyName, 'Company name'),
      contactName: requiredText(values.contactName, 'Your name'),
      email: isClaudeDb ? undefined : requiredEmail(values.email),
      password: isClaudeDb || values.password.length >= 8 ? undefined : 'Use at least 8 characters.',
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    const { error } = await signUp({
      email: values.email,
      password: values.password,
      companyName: values.companyName,
      contactName: values.contactName,
      location: values.location,
    });
    setSubmitting(false);

    if (error) {
      if (error.toLowerCase().includes('check your email')) {
        setConfirmNotice(true);
        return;
      }
      setFormError(error);
      return;
    }

    navigate('/app', { replace: true });
  }

  if (confirmNotice) {
    return (
      <div className="auth-card">
        <h2 className="auth-card__title">Check your email.</h2>
        <p className="auth-card__body">
          We&rsquo;ve sent a confirmation link to {values.email}. Follow it, then come back and{' '}
          <Link to="/login">sign in</Link>.
        </p>
      </div>
    );
  }

  return (
    <form className="form auth-card" onSubmit={handleSubmit} noValidate>
      <h2 className="auth-card__title">Create your account</h2>

      <div className="form__grid form__grid--2">
        <TextField
          label="Company"
          name="companyName"
          value={values.companyName}
          onChange={set('companyName')}
          error={errors.companyName}
          required
          autoComplete="organization"
        />
        <TextField
          label="Your name"
          name="contactName"
          value={values.contactName}
          onChange={set('contactName')}
          error={errors.contactName}
          required
          autoComplete="name"
        />
      </div>

      {isClaudeDb ? (
        <p className="field__hint" style={{ marginTop: '-0.5rem' }}>
          This demo has no password to check, so there is nothing to enter here beyond a
          name for the business.
        </p>
      ) : (
        <>
          <TextField
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={set('email')}
            error={errors.email}
            required
            autoComplete="email"
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={values.password}
            onChange={set('password')}
            error={errors.password}
            required
            hint="At least 8 characters."
            autoComplete="new-password"
          />
        </>
      )}
      <TextField
        label="Location"
        name="location"
        value={values.location}
        onChange={set('location')}
        hint="Town or area in Wales."
        autoComplete="address-level2"
      />

      {formError ? (
        <p className="form__alert" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="form__foot">
        <Button type="submit" variant="accent" size="lg" disabled={submitting}>
          {submitting ? 'Creating...' : isClaudeDb ? 'Create business' : 'Create account'}
        </Button>
        <p className="form__privacy">
          Already have an account? <Link to="/login">Sign in</Link>.
        </p>
      </div>
    </form>
  );
}

export default function SignUp() {
  useSeo({
    title: 'Sign Up | ConnectCymru',
    description: 'Create a ConnectCymru business account to list surplus materials or find what you need.',
    path: '/signup',
  });

  return (
    <>
      <PageHero
        eyebrow="Get started"
        title="Create your business account."
        lead="One account covers both sides: list what you have, and look for what you need."
      />
      <section className="section container container--narrow">
        <RequirePlatform>
          <SignUpForm />
        </RequirePlatform>
      </section>
    </>
  );
}

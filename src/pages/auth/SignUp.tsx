import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { PageHero } from '../../components/layout/PageHero';
import { RequirePlatform } from '../../lib/guards';
import { useAuth } from '../../lib/auth';
import { CheckboxField, SelectField, TextField } from '../../components/forms/Fields';
import { Button } from '../../components/ui/Button';
import { compact, requiredEmail, requiredText } from '../../lib/validation';
import type { Errors } from '../../lib/validation';
import { COMPANY_TYPE_LABELS } from '../../lib/database.types';
import type { CompanyType } from '../../lib/database.types';
import { useSeo } from '../../lib/seo';
import './auth.css';
import '../../components/forms/form.css';

const COMPANY_TYPE_OPTIONS = Object.values(COMPANY_TYPE_LABELS);
const COMPANY_TYPE_BY_LABEL = new Map<string, CompanyType>(
  (Object.entries(COMPANY_TYPE_LABELS) as [CompanyType, string][]).map(([value, label]) => [label, value]),
);

type FieldName =
  | 'companyName'
  | 'contactName'
  | 'email'
  | 'password'
  | 'location'
  | 'legalName'
  | 'companyType'
  | 'registeredAddressLine1'
  | 'registeredCity'
  | 'registeredPostcode'
  | 'jobTitle'
  | 'terms';

const EMPTY = {
  companyName: '',
  contactName: '',
  email: '',
  password: '',
  location: '',
  legalName: '',
  companyType: '',
  companiesHouseNumber: '',
  vatNumber: '',
  registeredAddressLine1: '',
  registeredAddressLine2: '',
  registeredCity: '',
  registeredPostcode: '',
  jobTitle: '',
  website: '',
};

function SignUpForm() {
  const { user, loading, signUp, mode } = useAuth();
  const isClaudeDb = mode === 'claude-db';
  const navigate = useNavigate();
  const [values, setValues] = useState(EMPTY);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Errors<FieldName>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmNotice, setConfirmNotice] = useState(false);

  const set = (field: keyof typeof EMPTY) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => (current[field as FieldName] ? { ...current, [field]: undefined } : current));
  };

  if (!loading && user) return <Navigate to="/app" replace />;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const found = compact<FieldName>({
      companyName: requiredText(values.companyName, 'Trading name'),
      contactName: requiredText(values.contactName, 'Your name'),
      email: isClaudeDb ? undefined : requiredEmail(values.email),
      password: isClaudeDb || values.password.length >= 8 ? undefined : 'Use at least 8 characters.',
      legalName: requiredText(values.legalName, 'Registered/legal company name'),
      companyType: requiredText(values.companyType, 'Company type'),
      registeredAddressLine1: requiredText(values.registeredAddressLine1, 'Registered address'),
      registeredCity: requiredText(values.registeredCity, 'Town or city'),
      registeredPostcode: requiredText(values.registeredPostcode, 'Postcode'),
      jobTitle: requiredText(values.jobTitle, 'Your job title'),
      terms: termsAccepted ? undefined : 'You need to accept the terms and privacy policy to continue.',
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
      legalName: values.legalName,
      companyType: COMPANY_TYPE_BY_LABEL.get(values.companyType),
      companiesHouseNumber: values.companiesHouseNumber,
      vatNumber: values.vatNumber,
      registeredAddressLine1: values.registeredAddressLine1,
      registeredAddressLine2: values.registeredAddressLine2,
      registeredCity: values.registeredCity,
      registeredPostcode: values.registeredPostcode,
      jobTitle: values.jobTitle,
      website: values.website,
      termsAccepted,
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
      <p className="form__section-intro">
        We check every new registration by hand before it goes live, so we ask for the same
        details a bank or supplier would.
      </p>

      <h3 className="form__section-title">Account</h3>
      <div className="form__grid form__grid--2">
        <TextField
          label="Trading name"
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
      <div className="form__grid form__grid--2">
        <TextField
          label="Your job title"
          name="jobTitle"
          value={values.jobTitle}
          onChange={set('jobTitle')}
          error={errors.jobTitle}
          required
          autoComplete="organization-title"
        />
        <TextField
          label="Location"
          name="location"
          value={values.location}
          onChange={set('location')}
          placeholder="Town or area in Wales"
          autoComplete="address-level2"
        />
      </div>

      <h3 className="form__section-title">Company legal details</h3>
      <p className="field__hint" style={{ marginTop: '-0.5rem' }}>
        This is what our reviewer checks against the public register before approving your
        account &mdash; it isn&rsquo;t shown publicly.
      </p>
      <div className="form__grid form__grid--2">
        <TextField
          label="Registered/legal company name"
          name="legalName"
          value={values.legalName}
          onChange={set('legalName')}
          error={errors.legalName}
          required
          placeholder="As it appears on Companies House"
        />
        <SelectField
          label="Company type"
          name="companyType"
          value={values.companyType}
          onChange={set('companyType')}
          error={errors.companyType}
          required
          options={COMPANY_TYPE_OPTIONS}
        />
      </div>
      <div className="form__grid form__grid--2">
        <TextField
          label="Companies House number"
          name="companiesHouseNumber"
          value={values.companiesHouseNumber}
          onChange={set('companiesHouseNumber')}
          hint="Leave blank if you're a sole trader or partnership."
        />
        <TextField
          label="VAT number"
          name="vatNumber"
          value={values.vatNumber}
          onChange={set('vatNumber')}
          hint="Leave blank if you're not VAT registered."
        />
      </div>
      <TextField
        label="Registered address"
        name="registeredAddressLine1"
        value={values.registeredAddressLine1}
        onChange={set('registeredAddressLine1')}
        error={errors.registeredAddressLine1}
        required
        autoComplete="address-line1"
      />
      <TextField
        label="Address line 2"
        name="registeredAddressLine2"
        value={values.registeredAddressLine2}
        onChange={set('registeredAddressLine2')}
        autoComplete="address-line2"
      />
      <div className="form__grid form__grid--2">
        <TextField
          label="Town or city"
          name="registeredCity"
          value={values.registeredCity}
          onChange={set('registeredCity')}
          error={errors.registeredCity}
          required
          autoComplete="address-level2"
        />
        <TextField
          label="Postcode"
          name="registeredPostcode"
          value={values.registeredPostcode}
          onChange={set('registeredPostcode')}
          error={errors.registeredPostcode}
          required
          autoComplete="postal-code"
        />
      </div>
      <TextField
        label="Website"
        name="website"
        value={values.website}
        onChange={set('website')}
        autoComplete="url"
        placeholder="https://"
      />

      <CheckboxField
        label={
          <>
            I confirm these details are accurate and I agree to the{' '}
            <Link to="/terms">terms of use</Link> and <Link to="/privacy">privacy policy</Link>.
          </>
        }
        name="terms"
        checked={termsAccepted}
        onChange={(checked) => {
          setTermsAccepted(checked);
          setErrors((current) => (current.terms ? { ...current, terms: undefined } : current));
        }}
        error={errors.terms}
        required
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
          We review new registrations by hand, so your account will show as pending until
          it&rsquo;s checked. Already have an account? <Link to="/login">Sign in</Link>.
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

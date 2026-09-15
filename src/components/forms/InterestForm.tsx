import { useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { RadioGroup, SelectField, TextAreaField, TextField } from './Fields';
import { FormSuccess } from './FormSuccess';
import { submitEnquiry } from '../../lib/submitEnquiry';
import { usePlatformMode } from '../../lib/usePlatformMode';
import { compact, requiredEmail, requiredText } from '../../lib/validation';
import type { Errors } from '../../lib/validation';
import './form.css';

const INTEREST_OPTIONS = [
  'I have surplus materials',
  'I am looking for materials',
  'Both',
  'I want to learn more',
];

const INDUSTRIES = [
  'Manufacturing',
  'Construction and fabrication',
  'Timber and joinery',
  'Metals and engineering',
  'Plastics and polymers',
  'Textiles',
  'Food and drink production',
  'Packaging and logistics',
  'Automotive',
  'Energy and utilities',
  'Waste and resource management',
  'Other',
];

type FieldName = 'name' | 'company' | 'email' | 'location' | 'industry' | 'interest' | 'message';

const EMPTY: Record<FieldName, string> = {
  name: '',
  company: '',
  email: '',
  location: '',
  industry: '',
  interest: '',
  message: '',
};

export function InterestForm() {
  const mode = usePlatformMode();
  // Real submissions once a backend is connected; otherwise this is
  // honest about the form being a local simulation.
  const backendMeta =
    mode === 'supabase' || mode === 'claude-db'
      ? undefined
      : 'This site is not connected to a backend yet, so your details have not been stored or sent anywhere.';
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors<FieldName>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const set = (field: FieldName) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    // Clear a field's error as soon as the person starts correcting it.
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  function validate(): Errors<FieldName> {
    return compact<FieldName>({
      name: requiredText(values.name, 'Your name'),
      company: requiredText(values.company, 'Company name'),
      email: requiredEmail(values.email),
      interest: values.interest ? undefined : 'Choose the option that fits best.',
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const found = validate();
    setErrors(found);

    if (Object.keys(found).length > 0) {
      // Move focus to the first control that needs attention.
      window.requestAnimationFrame(() => {
        const invalid = formRef.current?.querySelector<HTMLElement>(
          '[aria-invalid="true"], .field--invalid input, .field--invalid select',
        );
        invalid?.focus();
      });
      return;
    }

    setStatus('sending');
    const result = await submitEnquiry({ formName: 'founding-network', fields: values });

    if (result.ok) {
      setStatus('sent');
    } else {
      setStatus('idle');
      setSubmitError(result.message);
    }
  }

  if (status === 'sent') {
    return (
      <FormSuccess
        title="Thank you. You are on the list."
        meta={backendMeta}
      >
        We have your interest in the ConnectCymru founding network. We will be in touch as
        the platform takes shape, and we may come back to you with a few questions about
        the materials your business handles.
      </FormSuccess>
    );
  }

  return (
    <form className="form" ref={formRef} onSubmit={handleSubmit} noValidate>
      <div className="form__grid form__grid--2">
        <TextField
          label="Name"
          name="name"
          value={values.name}
          onChange={set('name')}
          error={errors.name}
          required
          autoComplete="name"
        />
        <TextField
          label="Company"
          name="company"
          value={values.company}
          onChange={set('company')}
          error={errors.company}
          required
          autoComplete="organization"
        />
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
          label="Location"
          name="location"
          value={values.location}
          onChange={set('location')}
          hint="Town or area in Wales."
          autoComplete="address-level2"
        />
      </div>

      <SelectField
        label="Industry"
        name="industry"
        value={values.industry}
        onChange={set('industry')}
        options={INDUSTRIES}
      />

      <RadioGroup
        legend="What are you interested in?"
        name="interest"
        value={values.interest}
        onChange={set('interest')}
        options={INTEREST_OPTIONS}
        error={errors.interest}
      />

      <TextAreaField
        label="Message"
        name="message"
        value={values.message}
        onChange={set('message')}
        hint="Tell us what your business has, what it needs, or what you would want the platform to do."
      />

      {submitError ? (
        <p className="form__alert" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="form__foot">
        <Button type="submit" variant="accent" size="lg" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending...' : 'Join the Founding Network'}
        </Button>
        <p className="form__privacy">
          We will only use your details to talk to you about ConnectCymru.
        </p>
      </div>
    </form>
  );
}

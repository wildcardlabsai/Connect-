import { useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { TextAreaField, TextField } from './Fields';
import { FormSuccess } from './FormSuccess';
import { submitEnquiry } from '../../lib/submitEnquiry';
import { usePlatformMode } from '../../lib/usePlatformMode';
import { compact, requiredEmail, requiredText } from '../../lib/validation';
import type { Errors } from '../../lib/validation';
import './form.css';

type FieldName = 'name' | 'company' | 'email' | 'message';

const EMPTY: Record<FieldName, string> = { name: '', company: '', email: '', message: '' };



export function ContactForm() {
  const mode = usePlatformMode();
  // Real submissions once a backend is connected; otherwise this is
  // honest about the form being a local simulation.
  const backendMeta =
    mode === 'supabase' || mode === 'claude-db'
      ? undefined
      : 'This site is not connected to a backend yet, so your enquiry has not been stored or sent anywhere.';
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors<FieldName>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const set = (field: FieldName) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const found = compact<FieldName>({
      name: requiredText(values.name, 'Your name'),
      company: requiredText(values.company, 'Company name'),
      email: requiredEmail(values.email),
      message: requiredText(values.message, 'Message'),
    });
    setErrors(found);

    if (Object.keys(found).length > 0) {
      window.requestAnimationFrame(() => {
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
      return;
    }

    setStatus('sending');
    const result = await submitEnquiry({ formName: 'contact', fields: values });

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
        title="Enquiry received."
        meta={backendMeta}
      >
        Thanks for getting in touch. We read everything that comes in and will reply as
        soon as we can.
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
      </div>

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

      <TextAreaField
        label="Message"
        name="message"
        value={values.message}
        onChange={set('message')}
        error={errors.message}
        required
        rows={6}
      />

      {submitError ? (
        <p className="form__alert" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="form__foot">
        <Button type="submit" variant="accent" size="lg" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending...' : 'Send Enquiry'}
        </Button>
        <p className="form__privacy">
          We will only use your details to reply to your enquiry.
        </p>
      </div>
    </form>
  );
}

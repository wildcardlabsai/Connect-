import { useId } from 'react';
import type { ReactNode } from 'react';
import './form.css';

type BaseProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  /** Short guidance shown under the label. */
  hint?: string;
  autoComplete?: string;
  placeholder?: string;
};

function FieldShell({
  label,
  id,
  error,
  hint,
  hintId,
  errorId,
  required,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  hint?: string;
  hintId: string;
  errorId: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`field${error ? ' field--invalid' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}
        {required ? null : <span className="field__optional"> (optional)</span>}
      </label>
      {hint ? (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p className="field__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  hint,
  autoComplete,
  placeholder,
  type = 'text',
}: BaseProps & { type?: 'text' | 'email' }) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <FieldShell
      label={label}
      id={id}
      error={error}
      hint={hint}
      hintId={hintId}
      errorId={errorId}
      required={required}
    >
      <input
        className="field__control"
        id={id}
        name={name}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hint ? hintId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  hint,
  placeholder,
  rows = 5,
}: BaseProps & { rows?: number }) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <FieldShell
      label={label}
      id={id}
      error={error}
      hint={hint}
      hintId={hintId}
      errorId={errorId}
      required={required}
    >
      <textarea
        className="field__control field__control--area"
        id={id}
        name={name}
        rows={rows}
        value={value}
        required={required}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hint ? hintId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  hint,
  options,
  placeholder = 'Please select',
}: BaseProps & { options: string[] }) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <FieldShell
      label={label}
      id={id}
      error={error}
      hint={hint}
      hintId={hintId}
      errorId={errorId}
      required={required}
    >
      <div className="field__select-wrap">
        <select
          className="field__control field__control--select"
          id={id}
          name={name}
          value={value}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hint ? hintId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <svg className="field__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 4.5 6 8.5 10 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
        </svg>
      </div>
    </FieldShell>
  );
}

export function RadioGroup({
  legend,
  name,
  value,
  onChange,
  options,
  error,
  hint,
}: {
  legend: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  error?: string;
  hint?: string;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <fieldset className={`field field--group${error ? ' field--invalid' : ''}`}>
      <legend className="field__label">{legend}</legend>
      {hint ? (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      <div
        className="radio-grid"
        aria-describedby={[hint ? hintId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined}
      >
        {options.map((option, index) => {
          const optionId = `${id}-${index}`;
          return (
            <div className="radio" key={option}>
              <input
                className="radio__input"
                type="radio"
                id={optionId}
                name={name}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
              />
              <label className="radio__label" htmlFor={optionId}>
                <span className="radio__box" aria-hidden="true" />
                {option}
              </label>
            </div>
          );
        })}
      </div>
      {error ? (
        <p className="field__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

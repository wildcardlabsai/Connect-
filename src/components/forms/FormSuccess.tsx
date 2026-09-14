import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import './form.css';

type FormSuccessProps = {
  title: string;
  children: ReactNode;
  /** Small print under the rule, e.g. what happens next. */
  meta?: ReactNode;
};

/**
 * Shown in place of a form once it has been submitted. Focus moves here so
 * the outcome is announced, and it carries the frontend-only caveat in `meta`
 * where the page needs it.
 */
export function FormSuccess({ title, children, meta }: FormSuccessProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div className="form-success" role="status" tabIndex={-1} ref={ref}>
      <span className="form-success__check" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
        </svg>
      </span>
      <h2 className="form-success__title">{title}</h2>
      <p className="form-success__body">{children}</p>
      {meta ? <p className="form-success__meta">{meta}</p> : null}
    </div>
  );
}

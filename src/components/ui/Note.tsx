import type { ReactNode } from 'react';
import './Note.css';

type NoteProps = {
  /** Short label, e.g. "Important". */
  label?: string;
  children: ReactNode;
  className?: string;
};

/**
 * A bordered aside for the responsibility and suitability wording. Deliberately
 * plain: a rule, a label and the text, with no icon or coloured panel.
 */
export function Note({ label = 'Important', children, className }: NoteProps) {
  return (
    <aside className={['note', className].filter(Boolean).join(' ')}>
      <p className="note__label">{label}</p>
      <div className="note__body">{children}</div>
    </aside>
  );
}

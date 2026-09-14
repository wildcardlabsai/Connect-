import type { ReactNode } from 'react';
import { Button } from '../ui/Button';
import { Eyebrow } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { JOIN_LABEL, JOIN_PATH } from '../../data/nav';
import './CtaSection.css';

type CtaSectionProps = {
  eyebrow?: string;
  title: ReactNode;
  body: ReactNode;
  /** Small line of text under the buttons. */
  note?: ReactNode;
  /** `dark` paints the section charcoal, `light` keeps it on the paper ground. */
  tone?: 'dark' | 'light';
  /** `xl` is the closing statement on the home page. */
  scale?: 'md' | 'xl';
  primary?: { label: string; to: string };
  secondary?: { label: string; to: string };
};

/**
 * The reusable call to action band. Every page ends with one of these so the
 * next step is always the same and always visible.
 */
export function CtaSection({
  eyebrow,
  title,
  body,
  note,
  tone = 'dark',
  scale = 'md',
  primary = { label: JOIN_LABEL, to: JOIN_PATH },
  secondary,
}: CtaSectionProps) {
  return (
    <section
      className={[
        'cta',
        `cta--${tone}`,
        `cta--${scale}`,
        tone === 'dark' ? 'is-inverted' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="container cta__inner">
        <Reveal className="cta__content">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h2 className="cta__title">{title}</h2>
          <p className="cta__body">{body}</p>
        </Reveal>

        <Reveal className="cta__actions" delay={1}>
          <div className="btn-row">
            <Button to={primary.to} variant="accent" size="lg" arrow>
              {primary.label}
            </Button>
            {secondary ? (
              <Button to={secondary.to} variant="outline" size="lg">
                {secondary.label}
              </Button>
            ) : null}
          </div>
          {note ? <p className="cta__note">{note}</p> : null}
        </Reveal>
      </div>
    </section>
  );
}

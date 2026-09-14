import type { ReactNode } from 'react';
import { Eyebrow } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';
import './SplitSection.css';

type SplitSectionProps = {
  eyebrow: string;
  title: ReactNode;
  /** Opening paragraph, set slightly larger than the body copy. */
  lead?: ReactNode;
  children: ReactNode;
  id?: string;
};

/**
 * Editorial two-column block: heading on the left, body on the right.
 *
 * Used for the sections that qualify what the platform does, so they sit on
 * the same grid as the rest of the page instead of floating in a narrow
 * centred column.
 */
export function SplitSection({ eyebrow, title, lead, children, id }: SplitSectionProps) {
  return (
    <section className="section section--ruled split" id={id}>
      <div className="container split__inner">
        <Reveal className="split__head">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="split__title">{title}</h2>
        </Reveal>

        <Reveal className="split__body" delay={1}>
          {lead ? <p className="split__lead">{lead}</p> : null}
          {children}
        </Reveal>
      </div>
    </section>
  );
}

import type { ReactNode } from 'react';
import { Reveal } from './Reveal';
import './SectionHeading.css';

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  /** Heading level. Defaults to h2 for in-page sections. */
  as?: 'h1' | 'h2' | 'h3';
  align?: 'start' | 'center';
  /** Optional trailing element, e.g. a link sitting opposite the title. */
  action?: ReactNode;
  id?: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  lead,
  as: Tag = 'h2',
  align = 'start',
  action,
  id,
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      as="header"
      className={['sec-head', `sec-head--${align}`, action ? 'sec-head--split' : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="sec-head__main">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <Tag id={id} className="sec-head__title">
          {title}
        </Tag>
        {lead ? <p className="sec-head__lead lead">{lead}</p> : null}
      </div>
      {action ? <div className="sec-head__action">{action}</div> : null}
    </Reveal>
  );
}

/** Small uppercase label with a square node mark. Used above section titles. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="eyebrow">
      <span className="eyebrow__mark" aria-hidden="true" />
      {children}
    </p>
  );
}

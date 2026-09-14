import type { ReactNode } from 'react';
import { Eyebrow } from '../ui/SectionHeading';
import { Photo } from '../ui/Photo';
import type { Media } from '../../data/media';
import './PageHero.css';

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  /** Optional supporting paragraph under the lead. */
  children?: ReactNode;
  /** Adds a wide image band below the text. */
  image?: Media;
};

/** The opening block on every page except the home page. */
export function PageHero({ eyebrow, title, lead, children, image }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="container page-hero__inner">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="page-hero__title">{title}</h1>
        {lead ? <p className="page-hero__lead">{lead}</p> : null}
        {children ? <div className="page-hero__extra">{children}</div> : null}
      </div>

      {image ? (
        <div className="container page-hero__media">
          <Photo media={image} ratio="21 / 9" priority />
        </div>
      ) : null}
    </section>
  );
}

import { Link } from 'react-router-dom';
import { Photo } from '../ui/Photo';
import { Reveal } from '../ui/Reveal';
import type { MaterialCategory } from '../../data/materials';
import './MaterialCard.css';

type MaterialCardProps = {
  category: MaterialCategory;
  /** Where the whole card should link. Omit for a non-interactive card. */
  to?: string;
  delay?: number;
  ratio?: string;
};

export function MaterialCard({ category, to, delay = 0, ratio = '4 / 3' }: MaterialCardProps) {
  const body = (
    <>
      <Photo media={category.image} ratio={ratio} zoom={Boolean(to)} className="material-card__photo" />
      <div className="material-card__text">
        <h3 className="material-card__name">{category.name}</h3>
        <p className="material-card__summary">{category.summary}</p>
      </div>
    </>
  );

  return (
    <Reveal as="article" className="material-card" delay={delay}>
      {to ? (
        <Link to={to} className="material-card__link">
          {body}
        </Link>
      ) : (
        body
      )}
    </Reveal>
  );
}

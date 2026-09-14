import { useState } from 'react';
import type { CSSProperties } from 'react';
import { sourcesFor } from '../../data/media';
import type { Media } from '../../data/media';
import './Photo.css';

type PhotoProps = {
  media: Media;
  /** CSS aspect-ratio string, e.g. "4 / 3". */
  ratio?: string;
  /** Eager-loads and raises fetch priority. Use for the hero image only. */
  priority?: boolean;
  /** Slow scale-up on hover. Used for cards that are themselves links. */
  zoom?: boolean;
  /** Darkens the image so overlaid text stays legible. */
  scrim?: 'none' | 'soft' | 'strong';
  className?: string;
};

/**
 * Every photograph on the site goes through this component.
 *
 * It walks a list of sources in order and shows the first that loads: the
 * local file in `public/images` if one has been added, then the remote
 * placeholder, and finally nothing. A two-tone panel built from the image's
 * own `tone` pair is painted in the box underneath throughout, so the layout
 * holds while sources are tried and stays intact if none of them resolve.
 */
export function Photo({
  media,
  ratio = '4 / 3',
  priority = false,
  zoom = false,
  scrim = 'none',
  className,
}: PhotoProps) {
  const sources = sourcesFor(media);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const exhausted = index >= sources.length;

  return (
    <div
      className={[
        'photo',
        zoom ? 'photo--zoom' : '',
        scrim !== 'none' ? `photo--scrim-${scrim}` : '',
        loaded ? 'is-loaded' : 'is-pending',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        {
          aspectRatio: ratio,
          '--tone-a': media.tone[0],
          '--tone-b': media.tone[1],
        } as CSSProperties
      }
    >
      {exhausted ? null : (
        <img
          /* Keying on the source restarts decoding cleanly when we fall back. */
          key={sources[index]}
          className="photo__img"
          src={sources[index]}
          alt={media.alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          onError={() => setIndex((current) => current + 1)}
        />
      )}
    </div>
  );
}

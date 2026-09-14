import { useState } from 'react';
import type { CSSProperties } from 'react';
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
 * A two-tone panel derived from the image's own `tone` pair is painted in the
 * box first, so the layout is never empty: the photograph fades in over it
 * once decoded, and if the file fails to load the panel simply stays. That
 * keeps the page intact when an image is slow, blocked or not yet replaced
 * with a licensed asset.
 */
export function Photo({
  media,
  ratio = '4 / 3',
  priority = false,
  zoom = false,
  scrim = 'none',
  className,
}: PhotoProps) {
  const [state, setState] = useState<'loading' | 'loaded' | 'failed'>('loading');

  return (
    <div
      className={[
        'photo',
        zoom ? 'photo--zoom' : '',
        scrim !== 'none' ? `photo--scrim-${scrim}` : '',
        `is-${state}`,
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
      <img
        className="photo__img"
        src={media.src}
        alt={media.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setState('loaded')}
        onError={() => setState('failed')}
      />
    </div>
  );
}

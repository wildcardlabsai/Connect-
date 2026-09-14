import { useEffect } from 'react';

export const SITE_NAME = 'ConnectCymru';
export const SITE_TAGLINE = 'Connecting Welsh industry.';

type SeoInput = {
  /** Full <title>. Include the brand, e.g. "Materials | ConnectCymru". */
  title: string;
  description: string;
  /** Path of the current page, used for canonical and og:url. */
  path: string;
  /** Overrides the default social share image. Root-relative. */
  image?: string;
};

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    document.head.appendChild(el);
  }
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Applies per-page document metadata.
 *
 * URLs are resolved against the live origin rather than a hard-coded domain,
 * so the same build works on any host it is deployed to.
 */
export function useSeo({ title, description, path, image = '/og.png' }: SeoInput) {
  useEffect(() => {
    const origin = window.location.origin;
    const url = `${origin}${path}`;
    const imageUrl = `${origin}${image}`;

    document.title = title;

    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertLink('canonical', url);

    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl });
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'en_GB' });

    upsertMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    upsertMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: description,
    });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl });
  }, [title, description, path, image]);
}

/* ==========================================================================
   Image registry
   --------------------------------------------------------------------------
   Every photograph on the site is referenced from this one file. Nothing else
   hard-codes an image URL.

   HOW TO ADD YOUR OWN PHOTOGRAPHY (no code changes needed)
   --------------------------------------------------------------------------
   Save a photograph into `public/images/` using the `file` name listed against
   each entry below, for example `public/images/timber-yard.jpg`. That is the
   whole job. The site loads the local file if it is there and falls back to
   the remote placeholder if it is not, so you can add photographs one at a
   time and see each one appear.

   `public/images/README.md` lists every filename and what each shot needs to
   show. Update the `alt` text here when you swap a photograph, so it still
   describes the picture people are actually looking at.

   ABOUT THE PLACEHOLDERS
   --------------------------------------------------------------------------
   The `placeholder` URLs point at Unsplash. They were written without network
   access to verify them, so treat them as unconfirmed: some may not resolve,
   and any that do may not show the subject described in `alt`. They exist so
   the site is not empty before real photography arrives, not as a final asset
   choice.

   Each entry also carries a `tone` pair. It paints a considered two-colour
   panel behind the image, so a slow, missing or unreplaced picture never
   leaves a hole in the layout.
   ========================================================================== */

export type Media = {
  /** Filename to look for in `public/images`. Tried first. */
  file: string;
  /** Unconfirmed remote stand-in, used only until the local file exists. */
  placeholder?: string;
  /** Meaningful alternative text. Never leave this empty for content images. */
  alt: string;
  /** [shadow, highlight] used for the loading / fallback panel. */
  tone: [string, string];
};

/** Where local photography lives, relative to the deployed base path. */
const LOCAL_DIR = 'images';

/**
 * The sources to try for an image, in order: the local file first, then the
 * remote placeholder. `BASE_URL` keeps this correct when the site is served
 * from a subdirectory.
 */
export function sourcesFor(media: Media): string[] {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  return [`${base}${LOCAL_DIR}/${media.file}`, media.placeholder].filter(
    (source): source is string => Boolean(source),
  );
}

const UNSPLASH = 'https://images.unsplash.com';

/** Builds a sized, cropped Unsplash URL. Only used by the placeholders below. */
function ph(id: string, w = 1600): string {
  return `${UNSPLASH}/${id}?auto=format&fit=crop&w=${w}&q=72`;
}

export const media = {
  heroWorkshop: {
    file: 'hero-workshop.jpg',
    placeholder: ph('photo-1565043666747-69f6646db940', 2000),
    alt: 'Wide interior of a Welsh manufacturing workshop, with rows of machinery, stacked material and pallets under skylights.',
    tone: ['#23262a', '#4a4f54'],
  },
  fabrication: {
    file: 'fabrication.jpg',
    placeholder: ph('photo-1504328345606-18bbc8c9d7d1', 1400),
    alt: 'A pair of hands filing a steel bracket clamped in a vice at a workbench, tools laid out around it.',
    tone: ['#1d2124', '#44494d'],
  },
  timberYard: {
    file: 'timber-yard.jpg',
    placeholder: ph('photo-1516937941344-00b4e0337589', 1400),
    alt: 'Sawn oak boards stacked and banded in a timber yard, with more stock racked behind.',
    tone: ['#3a2a1c', '#8a6338'],
  },
  metalStock: {
    file: 'metal-stock.jpg',
    placeholder: ph('photo-1581091226825-a6a2a5aee158', 1400),
    alt: 'Steel box section and sheet offcuts racked on shelving in a metal fabrication workshop.',
    tone: ['#25292d', '#5d666c'],
  },
  plasticsStock: {
    file: 'plastics-stock.jpg',
    placeholder: ph('photo-1581093458791-9f3c3900df4b', 1400),
    alt: 'A metal stillage full of moulded plastic parts and offcuts, on a factory floor with machinery behind.',
    tone: ['#1b2a2e', '#3f6d75'],
  },
  textiles: {
    file: 'textiles.jpg',
    placeholder: ph('photo-1558769132-cb1aea458c5e', 1400),
    alt: 'Rolls of fabric in muted colours stacked on steel racking, with hills visible through a warehouse window.',
    tone: ['#2c2026', '#6d4a56'],
  },
  packaging: {
    file: 'packaging.jpg',
    placeholder: ph('photo-1607344645866-009c320c5ab8', 1400),
    alt: 'Baled and stacked flattened cardboard on pallets in a warehouse, with boxed stock racked behind.',
    tone: ['#332a1e', '#7d6540'],
  },
  manufacturingSurplus: {
    file: 'manufacturing-surplus.jpg',
    placeholder: ph('photo-1517048676732-d65bc937f952', 1400),
    alt: 'Crates of mixed offcuts, straps and part-used components on a factory floor, machinery out of focus behind.',
    tone: ['#26282a', '#565c60'],
  },
  warehouseAisle: {
    file: 'warehouse-aisle.jpg',
    placeholder: ph('photo-1553413077-190dd305871c', 1600),
    alt: 'A long warehouse aisle with mixed materials, timber, metal, fabric and boxed stock, racked on both sides.',
    tone: ['#22262a', '#4f575d'],
  },
  productionLine: {
    file: 'production-line.jpg',
    placeholder: ph('photo-1581092160562-40aa08e78837', 1600),
    alt: 'A wide view along a manufacturing production line, with an operator working at the far end.',
    tone: ['#1f2326', '#4b5257'],
  },
  joinery: {
    file: 'joinery.jpg',
    placeholder: ph('photo-1572981779307-38b8cabb2407', 1400),
    alt: 'A pair of hands guiding a timber board through a table saw, sawdust scattered across the bench.',
    tone: ['#38281a', '#8b6640'],
  },
  palletStack: {
    file: 'pallet-stack.jpg',
    placeholder: ph('photo-1587293852726-70cdb56c2866', 1400),
    alt: 'Stacked wooden pallets and bundled offcut material beside an open loading bay door.',
    tone: ['#342a1d', '#856a42'],
  },
} satisfies Record<string, Media>;

export type MediaKey = keyof typeof media;

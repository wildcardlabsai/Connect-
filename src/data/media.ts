/* ==========================================================================
   Image registry
   --------------------------------------------------------------------------
   Every photograph on the site is referenced from this one file. Nothing else
   hard-codes an image URL.

   The `src` values below are DEVELOPMENT PLACEHOLDERS pointing at Unsplash.
   To move to licensed or commissioned photography:

     1. Drop the files into `public/images/`.
     2. Change the `src` of each entry to `/images/<filename>`.

   Nothing else in the codebase needs to change. Every entry also carries a
   `tone` pair, used to paint a considered two-colour panel behind the image
   while it loads and in place of it if the file is ever missing, so a broken
   or slow image never leaves an empty hole in the layout.
   ========================================================================== */

export type Media = {
  src: string;
  /** Meaningful alternative text. Never leave this empty for content images. */
  alt: string;
  /** [shadow, highlight] used for the loading / fallback panel. */
  tone: [string, string];
};

const UNSPLASH = 'https://images.unsplash.com';

/** Builds a sized, cropped Unsplash URL. Only used by the placeholders below. */
function ph(id: string, w = 1600): string {
  return `${UNSPLASH}/${id}?auto=format&fit=crop&w=${w}&q=72`;
}

export const media = {
  heroWorkshop: {
    src: ph('photo-1565043666747-69f6646db940', 2000),
    alt: 'Interior of a working manufacturing unit, with machinery and stacked stock under industrial roof lights.',
    tone: ['#23262a', '#4a4f54'],
  },
  fabrication: {
    src: ph('photo-1504328345606-18bbc8c9d7d1', 1400),
    alt: 'A fabricator working at a bench in a metal workshop.',
    tone: ['#1d2124', '#44494d'],
  },
  timberYard: {
    src: ph('photo-1516937941344-00b4e0337589', 1400),
    alt: 'Sawn timber boards stacked and banded in a timber yard.',
    tone: ['#3a2a1c', '#8a6338'],
  },
  metalStock: {
    src: ph('photo-1581091226825-a6a2a5aee158', 1400),
    alt: 'Sheet metal and steel sections racked in a fabrication workshop.',
    tone: ['#25292d', '#5d666c'],
  },
  plasticsStock: {
    src: ph('photo-1581093458791-9f3c3900df4b', 1400),
    alt: 'Moulded plastic components collected in stillages beside a production line.',
    tone: ['#1b2a2e', '#3f6d75'],
  },
  textiles: {
    src: ph('photo-1558769132-cb1aea458c5e', 1400),
    alt: 'Rolls of fabric stacked on shelving in a textile production unit.',
    tone: ['#2c2026', '#6d4a56'],
  },
  packaging: {
    src: ph('photo-1607344645866-009c320c5ab8', 1400),
    alt: 'Flattened cardboard and packaging materials baled and stacked in a warehouse.',
    tone: ['#332a1e', '#7d6540'],
  },
  manufacturingSurplus: {
    src: ph('photo-1517048676732-d65bc937f952', 1400),
    alt: 'Offcuts and part-used production materials collected at the end of a manufacturing line.',
    tone: ['#26282a', '#565c60'],
  },
  warehouseAisle: {
    src: ph('photo-1553413077-190dd305871c', 1600),
    alt: 'Palletised stock racked in a distribution warehouse.',
    tone: ['#22262a', '#4f575d'],
  },
  productionLine: {
    src: ph('photo-1581092160562-40aa08e78837', 1600),
    alt: 'An operator checking parts part-way along a production line.',
    tone: ['#1f2326', '#4b5257'],
  },
  joinery: {
    src: ph('photo-1572981779307-38b8cabb2407', 1400),
    alt: 'A joiner cutting board material in a woodworking workshop.',
    tone: ['#38281a', '#8b6640'],
  },
  palletStack: {
    src: ph('photo-1587293852726-70cdb56c2866', 1400),
    alt: 'Wooden pallets stacked against the wall of a loading bay.',
    tone: ['#342a1d', '#856a42'],
  },
} satisfies Record<string, Media>;

export type MediaKey = keyof typeof media;

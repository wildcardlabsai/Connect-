import { media } from './media';
import type { Media } from './media';

export type MaterialCategory = {
  id: string;
  name: string;
  /** One line, used on the home page grid. */
  summary: string;
  /** Longer explanation, used on the materials directory page. */
  detail: string;
  /** Typical items a business might list. Not a guarantee of suitability. */
  examples: string[];
  image: Media;
};

export const materialCategories: MaterialCategory[] = [
  {
    id: 'timber',
    name: 'Timber',
    summary: 'Offcuts, boards, pallets and other usable timber.',
    detail:
      'Timber leaves workshops and production lines in useful sizes. Offcuts from cutting lists, surplus board, part-used sheet material and pallets that are still sound can all have a second use for another business.',
    examples: ['Offcuts and cutting list remnants', 'Surplus boards and sheet material', 'Pallets and crating', 'Batten, ply and MDF stock'],
    image: media.timberYard,
  },
  {
    id: 'metals',
    name: 'Metals',
    summary: 'Fabrication offcuts, sheet materials and other metal surplus.',
    detail:
      'Fabrication produces steady volumes of offcut and drop material. Sheet remnants, bar ends, tube lengths and surplus profiles are often perfectly usable for smaller components or one-off jobs elsewhere.',
    examples: ['Sheet and plate remnants', 'Bar, tube and section drops', 'Surplus profiles and blanks', 'Non-ferrous offcuts'],
    image: media.metalStock,
  },
  {
    id: 'plastics',
    name: 'Plastics',
    summary: 'Production plastics, offcuts and reusable stock.',
    detail:
      'Plastic surplus covers a wide range, from sheet and film to moulded parts and part-used raw stock. Grade, condition and contamination all matter, so listings benefit from clear specification.',
    examples: ['Sheet and film offcuts', 'Moulded parts and trial runs', 'Part-used raw stock', 'Reusable containers and trays'],
    image: media.plasticsStock,
  },
  {
    id: 'textiles',
    name: 'Textiles',
    summary: 'Fabric, production surplus and other textile materials.',
    detail:
      'Cut-and-sew operations, upholstery and technical textile production all generate roll ends, sampling surplus and fabric that no longer fits a current order but remains in good condition.',
    examples: ['Roll ends and part rolls', 'Sampling and swatch surplus', 'Cut-and-sew offcuts', 'Webbing, trims and components'],
    image: media.textiles,
  },
  {
    id: 'packaging',
    name: 'Packaging',
    summary: 'Cardboard, packaging materials and reusable packaging stock.',
    detail:
      'Packaging arrives in quantity and often leaves as a disposal cost. Clean cardboard, undamaged boxes, stretch and strapping stock, and returnable transit packaging can frequently be used again.',
    examples: ['Clean cardboard and corrugate', 'Boxes and cases in good condition', 'Returnable transit packaging', 'Surplus void fill and protective materials'],
    image: media.packaging,
  },
  {
    id: 'manufacturing-surplus',
    name: 'Manufacturing surplus',
    summary: 'Other useful materials and by-products created during production.',
    detail:
      'Production creates materials that sit outside the usual categories: process by-products, discontinued components, over-ordered consumables and stock left behind when a specification changes.',
    examples: ['Process by-products', 'Discontinued or superseded components', 'Over-ordered consumables', 'Stock left by a specification change'],
    image: media.manufacturingSurplus,
  },
];

/** Shown only on the full materials directory, after the six main categories. */
export const otherCategory: MaterialCategory = {
  id: 'other',
  name: 'Other',
  summary: 'Materials that do not fit neatly into a standard category.',
  detail:
    'Plenty of useful material does not fit a standard heading. If your business regularly has something that another business might use, it is worth describing it properly rather than assuming there is no category for it.',
  examples: ['Mixed or composite materials', 'Aggregates and mineral by-products', 'Glass and ceramics', 'Materials specific to your process'],
  image: media.warehouseAisle,
};

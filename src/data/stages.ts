export type Stage = {
  number: string;
  title: string;
  summary: string;
  /** Expanded explanation used on the How It Works page. */
  detail: string;
  /** The specific information involved at this stage. */
  points: string[];
};

export const stages: Stage[] = [
  {
    number: '01',
    title: 'List',
    summary:
      'A business lists the material it has available, including quantity, condition, location and frequency.',
    detail:
      'A listing describes what the material actually is. The more precise the description, the more likely it is that the right business recognises it. Photographs help, and so does being honest about condition.',
    points: [
      'Material type and specification',
      'Quantity and units',
      'Condition and any known contamination',
      'Location and collection arrangements',
      'Whether it is one-off, occasional or regular',
      'Photographs of the material as it stands',
    ],
  },
  {
    number: '02',
    title: 'Discover',
    summary: 'Businesses can discover materials that may be useful to them.',
    detail:
      'Businesses looking for material can search by type, quantity and location, or describe a standing requirement so relevant listings surface as they appear.',
    points: [
      'Search by material type and specification',
      'Filter by quantity and location',
      'Record a standing requirement',
      'See new listings that fit what you need',
    ],
  },
  {
    number: '03',
    title: 'Match',
    summary:
      'ConnectCymru identifies potential opportunities based on material type, requirements, quantity and location.',
    detail:
      'Listings and requirements are compared to find combinations worth a conversation. A potential match is a prompt to look properly, not a decision.',
    points: [
      'Material compatibility',
      'Quantity',
      'Location',
      'Frequency',
      'Condition',
      'Stated requirements',
    ],
  },
  {
    number: '04',
    title: 'Connect',
    summary:
      'Businesses can make contact and explore whether the material is genuinely suitable.',
    detail:
      'From there it is a normal business conversation. The two companies agree whether the material works, what it is worth and how it moves.',
    points: [
      'Make contact directly',
      'Share samples or further detail',
      'Agree terms, price and collection',
      'Set up a repeat arrangement if it suits both sides',
    ],
  },
];

/** The criteria a potential match is assessed against. */
export const matchCriteria = [
  {
    title: 'Material compatibility',
    body: 'Whether the material type and specification line up with what the other business actually works with.',
  },
  {
    title: 'Quantity',
    body: 'Whether the volume available is workable for the business that needs it, in one go or over time.',
  },
  {
    title: 'Location',
    body: 'How far the material would have to travel, and whether that is practical for both sides.',
  },
  {
    title: 'Frequency',
    body: 'Whether this is a one-off batch or a regular output that could support an ongoing arrangement.',
  },
  {
    title: 'Condition',
    body: 'The state the material is in, including handling, storage and anything that affects how it can be used.',
  },
  {
    title: 'Requirements',
    body: 'Any specifics the receiving business has set out, from grade and tolerance to packaging and collection.',
  },
];

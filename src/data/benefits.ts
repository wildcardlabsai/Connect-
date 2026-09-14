export type Benefit = {
  title: string;
  body: string;
};

export const benefits: Benefit[] = [
  {
    title: 'Reduce avoidable disposal',
    body: 'Find potential uses for materials that might otherwise become a disposal cost.',
  },
  {
    title: 'Find local opportunities',
    body: 'Discover businesses closer to home that may need what you have.',
  },
  {
    title: 'Build new connections',
    body: 'Create relationships between businesses that may never have found each other otherwise.',
  },
  {
    title: 'Keep materials moving',
    body: 'Help useful resources stay in circulation for longer.',
  },
];

export type Value = {
  title: string;
  body: string;
};

export const values: Value[] = [
  { title: 'Practical', body: 'Built around real business problems.' },
  { title: 'Local', body: 'Focused on connections within Wales.' },
  {
    title: 'Responsible',
    body: 'Designed with material suitability and regulatory considerations in mind.',
  },
  { title: 'Connected', body: 'Focused on relationships between businesses.' },
];

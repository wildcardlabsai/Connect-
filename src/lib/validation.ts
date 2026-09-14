export type Errors<T extends string> = Partial<Record<T, string>>;

/** Deliberately permissive: enough to catch typos, not to police addresses. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function requiredText(value: string, label: string): string | undefined {
  if (value.trim().length === 0) return `${label} is required.`;
  return undefined;
}

export function requiredEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) return 'Email address is required.';
  if (!EMAIL.test(trimmed)) return 'Enter an email address in the format name@company.co.uk.';
  return undefined;
}

/** Removes undefined entries so `Object.keys` reflects real errors only. */
export function compact<T extends string>(errors: Errors<T>): Errors<T> {
  const result: Errors<T> = {};
  for (const [key, value] of Object.entries(errors) as Array<[T, string | undefined]>) {
    if (value) result[key] = value;
  }
  return result;
}

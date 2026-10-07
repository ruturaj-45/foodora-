export const generateOrderId = (): string => {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `FD${num}`;
};

export const safeJson = <T>(val: string | null | undefined, fallback: T): T => {
  if (!val) return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
};

/** Convert a DB row with snake_case keys to camelCase */
export const toCamel = (row: Record<string, unknown>): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(row)) {
    const camel = key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    out[camel] = row[key];
  }
  return out;
};

export const rowsToCamel = (rows: Record<string, unknown>[]): Record<string, unknown>[] =>
  rows.map(toCamel);

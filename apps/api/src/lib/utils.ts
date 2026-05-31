export function cleanUndefined<T extends object>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined),
  ) as { [K in keyof T]-?: NonNullable<T[K]> };
}

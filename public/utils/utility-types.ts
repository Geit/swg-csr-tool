export type MapValueType<A> = A extends Map<any, infer V> ? V : never;

export function isPresent<T>(t: T | undefined | null | void): t is T {
  return t != null;
}

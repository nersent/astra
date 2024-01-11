export const asArray = <T>(value: T | T[]): T[] => {
  return Array.isArray(value) ? value : [value];
};

export const duplicate = <T>(value: T, count: number): T[] => {
  return new Array(count).fill(value);
};

export const pushSet = <T>(set: Set<T>, values: T[]): void => {
  for (const value of values) {
    set.add(value);
  }
};

export const pushMap = <K, V>(map: Map<K, V>, values: [K, V][]): void => {
  for (const [key, value] of values) {
    map.set(key, value);
  }
};

export const toChunks = <T>(arr: T[], size: number): T[][] => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    const chunk = arr.slice(i, i + size);
    chunks.push(chunk);
  }
  return chunks;
};

export type Filterable<T> = false | undefined | null | T;

export const filterNullable = <T>(
  items: Filterable<T>[],
  mode: "loose" | "strict" = "strict",
): T[] => {
  return items.filter(
    (item) =>
      item != null &&
      ((mode === "loose" && item !== false) || mode === "strict"),
  ) as T[];
};

export const unique = <T>(items: (T | null | undefined)[]): T[] => {
  return [...new Set(items)] as T[];
};

export const disjointSet = <T>(a: T[], b: T[]): T[] => {
  return a.filter((item) => !b.includes(item));
};

export const fromSet = <T>(set: Set<T>): T[] => {
  return Array.from(set);
};

export const arrayToMap = <T extends Record<string, any>, K extends keyof T>(
  items: T[],
  getKeyDelegate: K,
): Map<T[K], T> => {
  const map = new Map<T[K], T>();
  for (const item of items) {
    const key = item[getKeyDelegate];
    map.set(key, item);
  }
  return map;
};

export const indexOrEos = (
  input: string,
  search: string,
  startIndex?: number,
): number => {
  const index = input.indexOf(search, startIndex);
  if (index === -1) return input.length;
  return index;
};

export const indexOfAfter = (input: string, search: string): number => {
  return input.indexOf(search) + search.length;
};

export const lastIndexOfAfter = (input: string, search: string): number => {
  return input.lastIndexOf(search) + search.length;
};

export const range = (start: number, end?: number, step = 1): number[] => {
  if (!end) {
    end = start;
    start = 0;
  }
  const arr: number[] = [];
  for (let i = start; i < end; i += step) {
    arr.push(i);
  }
  return arr;
};

export const getLastItem = <T>(arr: T[]): T | undefined => {
  return arr[arr.length - 1];
};

export const copyArray = <T>(arr: T[]): T[] => {
  return [...arr];
};

export const removeFromArray = <T>(arr: T[], item: T): number => {
  const index = arr.indexOf(item);
  if (index === -1) return -1;
  arr.splice(index, 1);
  return index;
};

import * as _deepMerge from "deepmerge";

export const deepMerge = <T = any, K = any, R = any>(
  target: T,
  source: K,
): R => {
  return _deepMerge.all(target as any, source as any) as R;
};

export const mapToObject = <T = any>(
  map: Map<string, T>,
): { [key: string]: T } => {
  const obj = {};
  map.forEach((v, k) => {
    (obj as any)[k] = v;
  });
  return obj;
};

export const deepCopy = <T = any>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

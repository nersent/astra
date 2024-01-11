// Min and max are both inclusive
export const minMax = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

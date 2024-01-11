export const formatNumber = (
  value: number,
  style: "commas" | "spaces" = "spaces",
): string => {
  return value.toLocaleString(style === "commas" ? "en-US" : "pl-PL");
};

export const tryParseInt = (value: number | string): number | undefined => {
  if (typeof value === "string") value = parseInt(value.trim());
  return Number.isSafeInteger(value) ? value : undefined;
};

export const tryParseFloat = (value: number): number | undefined => {
  return Number.isFinite(value) ? value : undefined;
};

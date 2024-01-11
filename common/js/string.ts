export const removeAccent = (str: string): string => {
  return str
    .trim()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .replaceAll(/[\W_]+/g, "")
    .replaceAll("-", "hyphen")
    .replaceAll("±", "plusminus")
    .trim();
};

export const parseLines = (text: string): string[] => {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
};

export const wrapLines = (str: string, perChars = 80): string => {
  let newStr = "";

  for (let i = 0; i < str.length; i += perChars) {
    newStr += str[i];
    if (i % perChars === 0 && i !== 0) {
      newStr += "\n";
    }
  }
  return newStr;
};

export const removeQuotes = (str: string): string => {
  if (str.startsWith('"')) {
    str = str.slice(1);
  }
  if (str.endsWith('"')) {
    str = str.slice(0, -1);
  }
  return str;
};

export const nullIfEmpty = (str?: string, trim = true): string | undefined => {
  if (str == null) return undefined;
  if (trim) str = str.trim();
  if (str.length === 0) {
    return undefined;
  }
  return str;
};

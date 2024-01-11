export const RANDOM_ID_LETTERS_LOWERCASE = "abcdefghijklmnopqrstuvwxyz";

export const RANDOM_ID_NUMBERS = "0123456789";

export const RANDOM_ID_CHARS = `${RANDOM_ID_LETTERS_LOWERCASE}${RANDOM_ID_LETTERS_LOWERCASE.toUpperCase()}${RANDOM_ID_NUMBERS}`;

export const randomString = (length = 12, chars = RANDOM_ID_CHARS): string => {
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

/**
 * Returns a random integer between min (exlusive) and max (exlusive).
 */
export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randomArrayItem = <T>(items: T[]): T => {
  const randomIndex = randomInt(0, items.length - 1);
  return items[randomIndex];
};

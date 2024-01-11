import { promisify } from "util";

import { hash, compare } from "bcryptjs";

export const encryptString = async (
  str: string,
  rounds: number,
): Promise<string> => {
  return await promisify(hash)(str, rounds);
};

export const compareEncrypted = async (
  value: string,
  hashedValue: string,
): Promise<boolean> => {
  return await promisify(compare)(value, hashedValue);
};

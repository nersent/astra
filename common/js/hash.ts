import { MD5 as hashObjectWithMD5 } from "object-hash";

export const computeHash = (obj: any): string => {
  return hashObjectWithMD5(obj);
};

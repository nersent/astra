import { randomUUID as _randomUuid } from "node:crypto";

import { randomBytes } from "./crypto";

export const randomStringAsync = async (length = 12): Promise<string> => {
  const entropyLength = Math.ceil(length / 2);

  const buffer = await randomBytes(entropyLength);
  const str = buffer.toString("hex");

  return str.slice(0, length);
};

export const randomUuid = (): string => {
  return _randomUuid();
};

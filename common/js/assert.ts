export const throwIfEmpty = <T = any>(val?: T, message?: string | Error): T => {
  if (!val) {
    if (message instanceof Error) throw message;
    throw new Error(message || "Value is empty");
  }
  return val;
};

export const assertValue = throwIfEmpty;

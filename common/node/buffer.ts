export type SizeType = "uint8" | "uint16" | "uint32" | "uint64";

export const uint32 = (val: number): Buffer => {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(val, 0);
  return buffer;
};

export const uint64 = (val: number): Buffer => {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(BigInt(val), 0);
  return buffer;
};

export const uint16 = (val: number): Buffer => {
  const buffer = Buffer.alloc(2);
  buffer.writeUint16LE(val, 0);
  return buffer;
};

export const uint8 = (val: number): Buffer => {
  const buffer = Buffer.alloc(1);
  buffer.writeUint8(val, 0);
  return buffer;
};

export const lengthFromSizeType = (sizeType: SizeType): number => {
  switch (sizeType) {
    case "uint8":
      return 1;
    case "uint16":
      return 2;
    case "uint32":
      return 4;
    case "uint64":
      return 8;
    default:
      throw new Error("Unknown size type");
  }
};

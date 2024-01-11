import { Readable } from "stream";

import { MultipartFile as _MultipartFile } from "@fastify/multipart";

import { Storage, StorageFile } from "./storage";

export type MultipartFile = Omit<_MultipartFile, "file"> & {
  value?: any;
  file: Readable & { truncated?: boolean };
};

export const removeStorageFiles = async (
  storage: Storage,
  files?: (StorageFile | undefined)[],
  force?: boolean,
): Promise<void> => {
  if (files == null) return;
  await Promise.all(files.map((file) => file && storage.remove(file, force)));
};

import * as busboy from "busboy";

import { UploadFilterHandler } from "./filter";
import { MemoryStorage } from "./memory_storage";
import { Storage } from "./storage";

export type UploadOptions = busboy.BusboyConfig & {
  dest?: string;
  storage?: Storage;
  filter?: UploadFilterHandler;
};

export const DEFAULT_UPLOAD_OPTIONS: Partial<UploadOptions> = {
  storage: new MemoryStorage() as any,
};

export const transformUploadOptions = (opts?: UploadOptions): UploadOptions => {
  if (opts == null) return DEFAULT_UPLOAD_OPTIONS;

  // if (opts.dest != null) {
  //   return {
  //     ...opts,
  //     storage: new DiskStorage({
  //       dest: opts.dest,
  //       ...opts.storage?.options,
  //     }),
  //   };
  // }

  return { ...DEFAULT_UPLOAD_OPTIONS, ...opts };
};

import { createWriteStream } from "fs";
import { mkdir, unlink } from "fs/promises";
import { Server, IncomingMessage } from "http";
import { tmpdir } from "os";
import { join } from "path";
import { pipeline } from "stream";
import { promisify } from "util";

import { MultipartFile } from "@fastify/multipart";
import { FastifyRequest } from "fastify";
import { RouteGenericInterface } from "fastify/types/route";

import { exists, getUniqueFilename } from "../../node/fs";

import { StorageFile, Storage } from "./storage";

export interface DiskStorageFile extends StorageFile {
  path: string;
}

type DiskStorageOptionHandler =
  | ((file: MultipartFile, req: FastifyRequest) => Promise<string> | string)
  | string;

export interface DiskStorageOptions {
  dest?: DiskStorageOptionHandler;
  filename?: DiskStorageOptionHandler;
  removeAfter?: boolean;
}

const excecuteStorageHandler = (
  file: MultipartFile,
  req: FastifyRequest,
  obj?: DiskStorageOptionHandler,
): any => {
  if (typeof obj === "function") {
    return obj(file, req);
  }

  if (obj != null) return obj;

  return null;
};

export class DiskStorage
  implements Storage<DiskStorageFile, DiskStorageOptions>
{
  public readonly options?: DiskStorageOptions;

  constructor(options?: DiskStorageOptions) {
    this.options = options;

    if (options?.dest == null) {
      throw new Error("DiskStorage: dest option is required");
    }
  }

  public async handle(
    file: MultipartFile,
    req: FastifyRequest<RouteGenericInterface, Server, IncomingMessage>,
  ): Promise<DiskStorageFile> {
    const filename = await this.getFilename(file, req, this.options?.filename);
    const dest = await this.getFileDestination(file, req, this.options?.dest);

    if (!(await exists(dest))) {
      await mkdir(dest, { recursive: true });
    }

    const path = join(dest, filename);
    const stream = createWriteStream(path);

    await promisify(pipeline)(file.file, stream);

    const { encoding, fieldname, mimetype } = file;

    return {
      size: stream.bytesWritten,
      filename,
      path,
      mimetype,
      encoding,
      fieldname,
    };
  }

  public async remove(file: DiskStorageFile, force?: boolean): Promise<void> {
    if (!this.options?.removeAfter && !force) return;
    await unlink(file.path);
  }

  protected async getFilename(
    file: MultipartFile,
    req: FastifyRequest,
    obj?: DiskStorageOptionHandler,
  ): Promise<string> {
    return (
      excecuteStorageHandler(file, req, obj) ?? getUniqueFilename(file.filename)
    );
  }

  protected async getFileDestination(
    file: MultipartFile,
    req: FastifyRequest,
    obj?: DiskStorageOptionHandler,
  ): Promise<string> {
    return excecuteStorageHandler(file, req, obj) ?? tmpdir();
  }
}

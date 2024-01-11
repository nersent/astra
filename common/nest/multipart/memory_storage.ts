import { Server, IncomingMessage } from "http";

import { MultipartFile } from "@fastify/multipart";
import { FastifyRequest } from "fastify";
import { RouteGenericInterface } from "fastify/types/route";

import { StorageFile, Storage } from "./storage";

export interface MemoryStorageFile extends StorageFile {
  buffer: Buffer;
}

export class MemoryStorage implements Storage<MemoryStorageFile> {
  public async handle(
    file: MultipartFile,
    req: FastifyRequest<RouteGenericInterface, Server, IncomingMessage>,
  ): Promise<MemoryStorageFile> {
    const buffer = await file.toBuffer();

    const { encoding, mimetype, fieldname } = file;

    return {
      buffer,
      size: buffer.length,
      encoding,
      mimetype,
      fieldname,
      filename: file.filename,
    };
  }

  public async remove(file: MemoryStorageFile): Promise<void> {
    delete (file as any).buffer;
  }
}

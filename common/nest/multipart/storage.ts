import { MultipartFile } from "@fastify/multipart";
import { FastifyRequest } from "fastify";

export interface StorageFile {
  size: number;
  fieldname: string;
  encoding: string;
  mimetype: string;
  filename: string;
}

export interface Storage<T extends StorageFile = StorageFile, K = any> {
  handle: (file: MultipartFile, req: FastifyRequest) => Promise<T>;
  remove: (file: T, force?: boolean) => Promise<void> | void;
  options?: K;
}

import { IncomingMessage, Server } from "http";

import { BadRequestException } from "@nestjs/common";
import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import { FastifyRequest } from "fastify";
import { RouteGenericInterface } from "fastify/types/route";

import { UploadOptions } from "../multipart/options";

import { MultipartFile } from "./file";
import { StorageFile } from "./storage";

export type FastifyMultipartRequest = FastifyRequest<
  RouteGenericInterface,
  Server,
  IncomingMessage
> & {
  storageFile?: StorageFile;
  storageFiles?: StorageFile[] | Record<string, StorageFile[]>;
};

export const getMultipartRequest = (
  ctx: HttpArgumentsHost,
): FastifyMultipartRequest => {
  const req = ctx.getRequest<FastifyMultipartRequest>();

  if (!req.isMultipart()) {
    throw new BadRequestException("Not a multipart request");
  }

  return req;
};

export const getParts = (
  req: FastifyRequest,
  options: UploadOptions,
): MultipartsIterator => {
  return req.parts(options) as MultipartsIterator;
};

export type MultipartsIterator = AsyncIterableIterator<MultipartFile>;

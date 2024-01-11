import { copyFile, readdir } from "fs/promises";
import { WriteStream, createWriteStream } from "node:fs";
import { basename, resolve } from "path";
import { pipeline } from "stream";
import { promisify } from "util";

import axios, { AxiosInstance, AxiosPromise, AxiosRequestConfig } from "axios";
import * as http2 from "http2-wrapper";
import { extension as getExtensionForMimeType } from "mime-types";

import { asArray } from "../js/array";
import { randomString } from "../js/random";
import { nullIfEmpty } from "../js/string";

import {
  deleteFile,
  ensureDir,
  formatUniqueFilename,
  getExtension,
} from "./fs";
import getPort from "./third_party/get_port";

export const axiosHttp2Adapter = (config: AxiosRequestConfig): AxiosPromise => {
  let req: http2.ClientRequest | undefined = undefined;
  (config as any).transport = {
    request: function request(options: any, handleResponse: any): any {
      req = http2.request(options, handleResponse);
      return req;
    },
  };
  const ret = (axios.defaults.adapter as any)!(config);
  // Remove the axios action `socket.setKeepAlive` because the HTTP/2 sockets should not be directly manipulated
  const listeners = req!.listeners("socket");
  if (listeners.length) req!.removeListener("socket", listeners[0] as any);
  return ret;
};

export const downloadFile = async (
  url: string,
  writeStream: WriteStream,
  axiosInstance: AxiosInstance = axios,
): Promise<void> => {
  const req = await axiosInstance({
    method: "get",
    url,
    responseType: "stream",
  });

  const _pipeline = promisify(pipeline);
  await _pipeline(req.data, writeStream);
};

export const downloadFileToPath = async (
  url: string,
  path: string,
): Promise<void> => {
  try {
    const writeStream = createWriteStream(path);
    await downloadFile(url, writeStream);
  } catch (error) {
    await deleteFile(path);
    throw error;
  }
};

export const getUrlHeaders = async (
  url: string,
  axiosInstance: AxiosInstance = axios,
): Promise<Record<string, any>> => {
  const req = await axiosInstance({
    method: "head",
    url,
  });
  return req.headers;
};

export interface DownloadUrlToFolderOptions {
  url: string;
  folderPath: string;
  getFiles?: (path: string) => Promise<string[]>;
}

export const downloadUrlToFolder = async ({
  getFiles,
  url,
  folderPath,
}: DownloadUrlToFolderOptions): Promise<string> => {
  getFiles ??= readdir;
  await ensureDir(folderPath);

  const isLocal = !url.startsWith("http");

  let filename: string | undefined = undefined;

  let headers: Record<string, any> = {};

  if (!isLocal) {
    headers = await getUrlHeaders(url);
  } else {
    filename = basename(url);
  }

  if (headers["content-disposition"] != null) {
    const match = headers["content-disposition"].match(/filename="(.+)"/);
    if (match != null) {
      filename = match[1];
    }
  }

  let fileExt: string | undefined = undefined;
  const contentType: string | undefined = headers["content-type"];

  if (fileExt == null && filename != null) {
    fileExt = getExtension(filename);
  }

  if (fileExt == null && contentType != null) {
    fileExt = getExtensionForMimeType(contentType) || undefined;
  }

  if (filename == null) {
    const urlParts = url.split("/");
    if (urlParts.length > 0) {
      filename = urlParts[urlParts.length - 1];
      filename = filename.split("?")[0];

      if (fileExt == null && filename.includes(".")) {
        fileExt = getExtension(filename);
      }
    }
  }
  filename = nullIfEmpty(filename);

  if (filename == null) {
    filename = randomString(10);
  }

  if (fileExt != null && !filename.includes(".")) {
    filename = `${filename}.${fileExt}`;
  }

  const files = await getFiles(folderPath);
  filename = formatUniqueFilename(filename, files);

  const filePath = resolve(folderPath, filename);
  if (!isLocal) {
    await downloadFileToPath(url, filePath);
  } else {
    await copyFile(url, filePath);
  }

  return filePath;
};

export const findPort = async (options?: {
  port?: number;
  exclude?: number | number[];
}): Promise<number> => {
  const port = await getPort({
    port: options?.port,
    exclude: asArray(options?.exclude ?? []),
  });
  return port;
};

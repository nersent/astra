import { existsSync, mkdirSync, unlinkSync } from "node:fs";
import {
  mkdir,
  readFile,
  readdir,
  stat,
  unlink,
  utimes,
  writeFile,
} from "node:fs/promises";
import { basename, dirname, extname, normalize, relative, resolve } from "path";

import { rimraf as rf } from "rimraf";

import { randomString } from "../js/random";

export const exists = async (path: string): Promise<boolean> => {
  try {
    await stat(path);
  } catch (err) {
    return false;
  }
  return true;
};

export const deleteFile = async (path: string): Promise<void> => {
  try {
    await unlink(path);
  } catch (err) {
    if ((err as any)?.code !== "ENOENT") {
      throw err;
    }
  }
};

export const deleteFileSync = (path: string): void => {
  try {
    unlinkSync(path);
  } catch (e) {}
};

export const deletePath = async (...path: string[]): Promise<void> => {
  await Promise.all(path.map((p) => rf(p)));
};

export const ensureDir = async (...paths: string[]): Promise<void> => {
  await Promise.all(
    paths.map(async (path) => {
      if (!(await exists(path))) {
        await mkdir(path, { recursive: true });
      }
    }),
  );
};

export const ensureDirSync = (...paths: string[]): void => {
  for (const path of paths) {
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
    }
  }
};

export const mtime = async (filePath: string): Promise<Date> => {
  const { mtime } = await stat(filePath);
  return mtime;
};

export const setFileMtime = (
  path: string,
  mtime: Date | number,
): Promise<void> => {
  return utimes(path, mtime, mtime);
};

export const prettyPath = (path: string): string => {
  return normalize(path).startsWith(process.cwd())
    ? relative(process.cwd(), path)
    : path;
};

export const getUniqueFilename = (filename: string, length = 16): string => {
  return randomString(length) + extname(filename);
};

export const removeExtension = (filename: string): string => {
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex === -1) {
    return filename;
  }
  return filename.split(".").slice(0, -1).join(".");
};

export const replaceExtension = (path: string, newExt: string): string => {
  return dirname(path) + removeExtension(basename(path)) + newExt;
};

export const fileSize = (path: string): Promise<number> => {
  return stat(path).then((r) => r.size);
};

export const clearDir = async (path: string): Promise<void> => {
  const files = await readdir(path);

  await Promise.all(
    files.map(async (file) => await unlink(resolve(path, file))),
  );
};

export const isDir = async (path: string): Promise<boolean> => {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch (err) {
    return false;
  }
};

export const readJson = async <T = any>(path: string): Promise<T> => {
  return await readFile(path, "utf8").then((r) => JSON.parse(r));
};

export const writeJson = async <T>(
  path: string,
  data: T,
  formatted = false,
): Promise<void> => {
  await writeFile(
    path,
    formatted ? JSON.stringify(data, null, 2) : JSON.stringify(data),
    "utf8",
  );
};

export const normalizeFilename = (filename: string): string => {
  const paramsIndex = filename.indexOf("?");
  if (paramsIndex !== -1) {
    filename = filename.slice(0, paramsIndex);
  }
  const ext = extname(filename);
  filename = filename.trim();
  filename = removeExtension(filename);
  filename = filename.replaceAll(":", "_");
  filename = filename.replaceAll(",", "_");
  filename = filename.replaceAll("?", "_");
  filename = filename.replaceAll("!", "_");
  filename = filename.replaceAll("(", "_");
  filename = filename.replaceAll(")", "_");
  filename = filename.replaceAll("[", "_");
  filename = filename.replaceAll("]", "_");
  filename = filename.replaceAll("{", "_");
  filename = filename.replaceAll("}", "_");
  filename = filename.replaceAll("/", "_");
  filename = filename.replaceAll("\\", "_");
  filename = filename.replaceAll("|", "_");
  filename = filename.replaceAll("<", "_");
  filename = filename.replaceAll(">", "_");
  filename = filename.replaceAll('"', "_");
  filename = filename.replaceAll("*", "_");
  filename = filename.replaceAll("&", "_");
  filename = filename.replaceAll("%", "_");
  filename = filename.replaceAll("$", "_");
  filename = filename.replaceAll("#", "_");
  filename = filename.replaceAll("@", "_");
  filename = filename.replaceAll("=", "_");
  filename = filename.replaceAll("+", "_");
  filename = filename.replaceAll("`", "_");
  filename = filename.replaceAll("~", "_");
  filename = filename.replaceAll(";", "_");
  filename = `${filename}${ext}`;
  return filename;
};

export const withExtension = (path: string, ext: string): string => {
  return `${path}.${ext}`;
};

export const getExtension = (path: string): string => {
  return extname(path).slice(1).trim();
};

export const formatUniqueFilename = (
  filename: string,
  files: string[] = [],
): string => {
  filename = normalizeFilename(filename);
  const ext = extname(filename);
  filename = filename.trim();
  filename = removeExtension(filename);
  const base = filename;
  filename = `${base}${ext}`;
  let i = 1;
  while (files.includes(filename)) {
    filename = `${base}_${i++}${ext}`;
  }
  return filename;
};

export const hasExtension = (path: string, ext: string): boolean => {
  return path.trim().toLowerCase().endsWith(`.${ext.toLowerCase()}`);
};

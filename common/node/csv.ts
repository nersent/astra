import { createReadStream } from "node:fs";
import { basename, dirname } from "path";

import CsvReadableStream from "csv-reader";
import { createArrayCsvWriter } from "csv-writer";

import { ensureDir, deleteFile } from "./fs";

export const getCsvWriter = (
  path: string,
  headers: string[],
  append?: boolean,
): CsvWriter => {
  return createArrayCsvWriter({
    path,
    header: headers,
    append,
  });
};

export type CsvWriter = ReturnType<typeof createArrayCsvWriter>;

export interface CsvFrameOptions {
  path: string;
  headers?: string[];
}

export class CsvFrame<T extends Record<string, any>> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private _headers: string[] = [];

  private writer: CsvWriter | undefined = undefined;

  private isInitialized = false;

  constructor(private readonly options: CsvFrameOptions) {
    if (options.headers) {
      this._headers = options.headers;
    }
  }

  public get path(): string {
    return this.options.path;
  }

  public get headers(): string[] {
    return this._headers;
  }

  private async init(headers: string[]): Promise<void> {
    this._headers = headers;
    this.writer = getCsvWriter(this.path, headers, true);
    await this.writer.writeRecords([this._headers]);
    this.isInitialized = true;
  }

  public async append(entries: T[]): Promise<void> {
    // console.log(!this.isInitialized && entries.length > 0);
    if (
      !this.isInitialized &&
      entries.length > 0 &&
      this._headers.length === 0
    ) {
      // console.log("xd");
      const headers = Object.keys(entries[0]).sort((a, b) =>
        a.localeCompare(b, "en-US"),
      );
      // console.log(headers);
      await this.init(headers);
    }
    const records = entries.map((entry) =>
      this.headers.map((header) => entry[header]),
    );
    await this.writer!.writeRecords(records);
  }

  public async write(...entries: T[]): Promise<void> {
    // console.log("write");
    await ensureDir(dirname(this.path));
    await deleteFile(this.path);
    // console.log("before append");
    await this.append(entries);
  }

  public async writeArr(entries: T[]): Promise<void> {
    // console.log("write");
    await ensureDir(dirname(this.path));
    await deleteFile(this.path);
    // console.log("before append");
    await this.append(entries);
  }

  public iterate(): {
    [Symbol.asyncIterator](): {
      next(): Promise<IteratorResult<T>>;
      return(): Promise<IteratorResult<T>>;
    };
  } {
    const stream = createReadStream(this.options.path, "utf8")
      .pipe(
        new CsvReadableStream({
          parseNumbers: true,
          parseBooleans: true,
          trim: true,
          multiline: true,
          asObject: true,
        }),
      )
      .pause();

    return {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      [Symbol.asyncIterator]() {
        return {
          next(): Promise<IteratorResult<T>> {
            return new Promise<IteratorResult<T>>((resolve) => {
              const endListener = (): void => {
                resolve({ value: null, done: true });
              };

              stream.once("end", endListener);

              stream.once("data", (row) => {
                stream.pause();
                stream.removeListener("end", endListener);
                resolve({ value: row as T, done: row == null });
              });
              stream.resume();
            });
          },
          return(): Promise<IteratorResult<T>> {
            return new Promise<IteratorResult<T>>((resolve) => {
              stream.destroy();
              resolve({ value: null, done: true });
            });
          },
        };
      },
    };
  }
}

import {} from "nodejs-polars";
import { createReadStream, createWriteStream } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { Writable } from "node:stream";
import { dirname } from "path";

import CsvReadableStream from "csv-reader";
// eslint-disable-next-line import/no-unresolved
import { stringify as stringifyCsv } from "csv-stringify/sync";

import { ensureDir, exists } from "./fs";

import { asArray } from "@common/js";

export type CsvFrameDtype = "string" | "number" | "boolean" | "object" | "date";

export interface CsvFrameDelegates {
  onFlushed?: () => void;
}

export interface CsvFrameOptions {
  columns: string[];
  dtypes: Record<string, CsvFrameDtype>;
  delegates?: CsvFrameDelegates;
}

export type CsvFrameRow = Record<string, any>;

export interface CsvFrameIterateOptions {
  limit?: number;
}

export class CsvFrame {
  private _isLoaded = false;

  private writeStream: Writable | undefined = undefined;

  private _path: string | undefined = undefined;

  constructor(private readonly options: CsvFrameOptions) {}

  public get columns(): string[] {
    return this.options.columns;
  }

  public get dtypes(): Record<string, CsvFrameDtype> {
    return this.options.dtypes;
  }

  public get path(): string {
    return this._path!;
  }

  public get isLoaded(): boolean {
    return this._isLoaded;
  }

  public async load(path: string): Promise<void> {
    await ensureDir(dirname(path));

    this._isLoaded = false;
    this._path = path;

    if (!(await exists(this.path))) {
      await this.clear();
    }

    this.writeStream = createWriteStream(this.path, {
      flags: "a",
      encoding: "utf8",
    });

    this.writeStream.on("finish", () => {
      this.options.delegates?.onFlushed?.();
    });

    this._isLoaded = true;
  }

  private get columnsAsRow(): string {
    return stringifyCsv([this.columns]);
  }

  public async clear(): Promise<void> {
    const content = `${this.columnsAsRow}`;
    await writeFile(this.path, content, "utf8");
  }

  private getDtypeForColumn(column: string): CsvFrameDtype {
    return this.dtypes[column];
  }

  private normalizeColumnValue(column: string, value: any): any {
    if (value == null) return undefined;
    const dtype = this.getDtypeForColumn(column);
    if ((["string", "number", "boolean"] as CsvFrameDtype[]).includes(dtype)) {
      return value;
    }
    if (dtype === "date") return (value as Date).getTime();
    return JSON.stringify(value);
  }

  private formatRowToCsv(
    data: CsvFrameRow | any[],
    ignoreUnknownColumns = true,
  ): string {
    let values: any[] = [];

    if (Array.isArray(data)) {
      const columns = this.columns;
      values = data.map((value, i) =>
        this.normalizeColumnValue(columns[i], value),
      );
    } else {
      const columns = Object.keys(data);

      values = Array.from({ length: columns.length - 1 });

      for (const column of columns) {
        const columnIndex = this.columns.indexOf(column);

        if (columnIndex === -1) {
          if (ignoreUnknownColumns) continue;
          throw new Error(`Column ${column} not found`);
        }

        values[columnIndex] = this.normalizeColumnValue(column, data[column]);
      }
    }

    return stringifyCsv([values]);
  }

  public hasColumn(column: string): boolean {
    return this.columns.includes(column);
  }

  private parseRowColumn(column: string, value: string): any {
    if (value == null) return null;
    const dtype = this.getDtypeForColumn(column);
    if (dtype === "string") return value.toString();
    if (dtype === "number") return Number(value);
    if (dtype === "boolean") return value === "true";
    if (dtype === "date") return new Date(value);
    if (dtype === "object") {
      try {
        return JSON.parse(value);
      } catch (error) {
        return value;
      }
    }
    throw new Error(`Unknown dtype ${dtype}`);
  }

  public append(row: CsvFrameRow | CsvFrameRow[]): void {
    if (row == null) return;
    const rows = asArray(row);
    if (rows.length === 0) return;

    let chunk = "";

    for (const row of rows) {
      chunk += this.formatRowToCsv(row);
    }

    this.writeStream!.write(chunk);
  }

  public async flush(): Promise<void> {
    if (this.writeStream!.writableFinished) return;

    return new Promise((resolve) => {
      this.writeStream!.once("finish", resolve);
    });
  }

  public iterate(options?: CsvFrameIterateOptions): {
    [Symbol.asyncIterator](): {
      next(): Promise<IteratorResult<Record<string, any>>>;
      return(): Promise<IteratorResult<Record<string, any>>>;
    };
  } {
    const stream = createReadStream(this.path, "utf8")
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

    let currentRow = 0;

    const formatRow = (rawRow: Record<string, any>): Record<string, any> => {
      const row: Record<string, any> = {};
      for (const key in rawRow) {
        if (!this.hasColumn(key)) continue;
        row[key] = this.parseRowColumn(key, rawRow[key]);
      }
      return row;
    };

    return {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      [Symbol.asyncIterator]() {
        return {
          next(): Promise<IteratorResult<Record<string, any>>> {
            return new Promise<IteratorResult<Record<string, any>>>(
              (resolve) => {
                const endListener = (): void => {
                  resolve({ value: null, done: true });
                };

                stream.once("end", endListener);

                stream.once("data", (rawRow) => {
                  stream.pause();
                  stream.removeListener("end", endListener);

                  currentRow++;

                  let done = rawRow == null;

                  if (options?.limit != null && currentRow > options.limit) {
                    done = true;
                    stream.destroy();
                  }

                  const row = formatRow(rawRow);

                  resolve({ value: row, done });
                });
                stream.resume();
              },
            );
          },
          return(): Promise<IteratorResult<Record<string, any>>> {
            return new Promise<IteratorResult<Record<string, any>>>(
              (resolve) => {
                stream.destroy();
                resolve({ value: null, done: true });
              },
            );
          },
        };
      },
    };
  }

  public async readAllRows(): Promise<string[]> {
    const content = await readFile(this.path, "utf8");

    const rows = content.split("\n");
    if (rows.length === 0) return [];

    const startIndex = 1;
    const lastIndex =
      rows[rows.length - 1].trim() === "" ? rows.length - 1 : rows.length;

    return rows.slice(startIndex, lastIndex);
  }

  public async readAllAsSet(): Promise<Set<string>> {
    const rows = await this.readAllRows();
    return new Set(rows);
  }
}

export class UnstructedCsvFrame extends CsvFrame {
  constructor(options: Pick<CsvFrameOptions, "delegates">) {
    super({
      columns: ["data"],
      dtypes: { data: "object" },
      delegates: options.delegates,
    });
  }

  public override append(row: CsvFrameRow | CsvFrameRow[]): void {
    const rows = asArray(row).map((row) => ({ data: row }));
    super.append(rows);
  }
}

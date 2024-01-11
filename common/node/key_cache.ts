import { CsvFrame, CsvFrameRow } from "./csv_frame";

import { asArray } from "@common/js";

export type KeyCacheType = number | string;

export interface KeyCacheOptions {
  delegates?: KeyCacheDelegates;
}

export interface KeyCacheDelegates {
  onFlushed?: () => void;
}

export class KeyCache {
  private csv: CsvFrame | undefined = undefined;

  private keys: Set<string> | undefined = undefined;

  private path: string | undefined = undefined;

  constructor(private readonly options: KeyCacheOptions = {}) {}

  public async load(path: string): Promise<void> {
    this.path = path;

    this.csv = new CsvFrame({
      columns: ["key"],
      dtypes: {
        key: "string",
      },
      delegates: {
        onFlushed: this.options.delegates?.onFlushed,
      },
    });

    await this.csv.load(this.path);

    const keys = await this.csv.readAllRows();
    this.keys = new Set(keys);
  }

  public async flush(): Promise<void> {
    await this.csv!.flush();
  }

  public has(key: string | number): boolean {
    return this.keys!.has(key.toString());
  }

  public add(key: KeyCacheType | KeyCacheType[]): void {
    const keys = asArray(key);
    const rows: CsvFrameRow[] = [];

    for (const key of keys) {
      if (this.has(key)) continue;
      const _key = key.toString();
      rows.push({ key: _key });
      this.keys!.add(_key);
    }

    this.csv!.append(rows);
  }

  public get size(): number {
    return this.keys!.size;
  }
}

// // import { stringify } from "csv-stringify/sync";
// // import { parse } from "csv-parse/sync";
// // import * as readline from "readline";
// // import { createReadStream } from "fs";

// // type KeyType = "string" | "int";

// // export abstract class BaseConverter<T extends object> {
// //   public abstract toString(data: T): string;
// //   public abstract fromString(str: string): T;

// //   toBuffer(data: T): Buffer {
// //     return Buffer.from(this.toString(data));
// //   }

// //   fromBuffer(buf: Buffer): T {
// //     return this.fromString(buf.toString());
// //   }
// // }

// // export class SpaceSeparatedLineConverter<T> extends BaseConverter<T> {
// //   public constructor(private keys: [string, KeyType][]) {
// //     super();
// //   }

// //   toString(data: T): string {
// //     return this.keys.map(([key]) => data[key]).join(" ") + "\n";
// //   }

// //   fromString(str: string): T {
// //     const split = str.trim().split(" ");

// //     const obj: any = {};
// //     for (let i = 0; i < this.keys.length; i++) {
// //       const [key, type] = this.keys[i];
// //       let value: any = split[i];
// //       if (type === "int") value = parseInt(value, 10);
// //       obj[key] = value;
// //     }

// //     return obj;
// //   }
// // }

// // export class CSVConverter<T extends object> extends BaseConverter<T> {
// //   public constructor(private keys: [string, KeyType][]) {
// //     super();
// //   }

// //   toString(data: T): string {
// //     return stringify([Object.values(data)]);
// //   }

// //   fromString(str: string): T {
// //     const obj: any = {};

// //     const [parsed] = parse(str);
// //     if (!parsed) {
// //       throw new Error(Parsing failed for the following string: "${str}");
// //     }

// //     for (let i = 0; i < this.keys.length; i++) {
// //       const [key, type] = this.keys[i];
// //       let value: any = parsed[i];
// //       if (type === "int") value = parseInt(value, 10);
// //       obj[key] = value;
// //     }

// //     return obj;
// //   }
// // }

// // export class JSONConverter<T extends object> extends BaseConverter<T> {
// //   toString(data: T): string {
// //     return JSON.stringify(data);
// //   }

// //   fromString(str: string): T {
// //     return JSON.parse(str);
// //   }
// // }

// // export class FileLineByLineReader<T extends object> {
// //   private rl: readline.Interface;

// //   public constructor(
// //     private path: string,
// //     private converter: BaseConverter<T>,
// //   ) {
// //     this.rl = readline.createInterface({
// //       input: createReadStream(path),
// //       crlfDelay: Infinity,
// //     });
// //   }

// //   async *read(): AsyncGenerator<T> {
// //     for await (const line of this.rl) {
// //       if (line.trim().length === 0) continue;
// //       yield this.converter.fromString(line);
// //     }
// //   }

// //   async readAll(): Promise<T[]> {
// //     const arr: T[] = [];
// //     for await (const item of this.read()) {
// //       arr.push(item);
// //     }
// //     return arr;
// //   }
// // }

// // export class JSONLReader<T extends object> extends FileLineByLineReader<T> {
// //   public constructor(path: string) {
// //     super(path, new JSONConverter());
// //   }
// // }

// // export class CSVReader<T extends object> extends FileLineByLineReader<T> {
// //   public constructor(path: string, keys: [string, KeyType][]) {
// //     super(path, new CSVConverter(keys));
// //   }
// // }

// Eryk Rakowski
// import { getRandomIntBetween } from "./math.js";

// export function* enumerate(iterable) {
//   let i = 0;

//   for (const x of iterable) {
//     yield [i, x];
//     i++;
//   }
// }

// export const pickRandom = <T>(arr: T[]) =>
//   arr[getRandomIntBetween(0, arr.length)];

// export const endIndex = <T>(arr: T[]): number => arr.length - 1;

// export const isEndIndex = <T>(arr: T[], index: number): boolean =>
//   index === endIndex(arr);

// export const sample = <T>(arr: T[], size: number): T[] => {
//   if (size > arr.length) {
//     throw new Error("Sample size exceeds array length");
//   }

//   if (size === arr.length) {
//     return arr;
//   }

//   if (size === 0) {
//     return [];
//   }

//   if (size === 1) {
//     return [pickRandom(arr)];
//   }

//   const shuffled = arr.slice(0);
//   let i = arr.length;
//   let temp;
//   let index;

//   while (i--) {
//     index = Math.floor((i + 1) * Math.random());
//     temp = shuffled[index];
//     shuffled[index] = shuffled[i];
//     shuffled[i] = temp;
//   }

//   return shuffled.slice(0, size);
// };

// import { cpus } from "os";
// import pLimit from "p-limit";

// export const getDefaultThreadsCount = () => {
//   return cpus().length + 4;
// };

// export const limitedArrayMap = async <T, U>(
//   array: T[],
//   fn: (item: T, index: number) => Promise<U>,
//   threads?: number,
// ): Promise<U[]> => {
//   if (threads === undefined) threads = getDefaultThreadsCount();

//   const limit = pLimit(threads);

//   return Promise.all(
//     array.map(
//       async (entry, i) =>
//         await limit(async () => {
//           return await fn(entry, i);
//         }),
//     ),
//   );
// };

// export const createThrottle = (time: number) => {
//   let last = 0;
//   return () => {
//     if (last + time < performance.now()) {
//       last = performance.now();
//       return true;
//     }
//     return false;
//   };
// };

// export class LockedScheduler {
//   private isLocked = false;

//   private lockedQueue: any[] = [];

//   public async schedule<T>(fn: () => Promise<T>) {
//     if (this.isLocked) {
//       return new Promise<T>((resolve, reject) => {
//         this.lockedQueue.push(async () => {
//           try {
//             resolve(await fn());
//           } catch (e) {
//             reject(e);
//           }
//         });
//       });
//     }

//     return await fn();
//   }

//   public lock() {
//     this.isLocked = true;
//   }

//   public unlock() {
//     this.isLocked = false;
//     this.lockedQueue.forEach(x => x());
//     this.lockedQueue = [];
//   }
// }

// export class TimedScheduler extends LockedScheduler {
//   private timeout: any;

//   public unlockAfter(ms: number) {
//     this.lock();
//     clearTimeout(this.timeout);
//     this.timeout = setTimeout(() => {
//       clearTimeout(this.timeout);
//       this.timeout = undefined;
//       this.unlock();
//     }, ms);
//   }
// }

export type PayloadOrAny = Payload | any;

export class Payload {
  public static empty(): Payload {
    return new Payload();
  }

  public static from(value: any): Payload {
    if (value == null) {
      return Payload.empty();
    }
    if (value instanceof Payload) {
      return value;
    }
    if (typeof value === "string") {
      return Payload.fromString(value);
    }
    if (value instanceof Uint8Array) {
      return Payload.fromUint8Array(value);
    }
    if (value instanceof Buffer) {
      return Payload.fromBuffer(value);
    }
    return Payload.fromJson(value);
  }

  public static fromBuffer(buffer: Buffer): Payload {
    return new Payload().setBuffer(buffer);
  }

  public static fromUint8Array(arr: Uint8Array): Payload {
    return Payload.fromBuffer(Buffer.from(arr));
  }

  public static fromJson(json: any): Payload {
    return Payload.fromBuffer(Buffer.from(JSON.stringify(json)));
  }

  public static fromString(str: string): Payload {
    return Payload.fromBuffer(Buffer.from(str));
  }

  private data: Buffer | undefined = undefined;

  public buffer(): Buffer {
    if (this.data == null) {
      throw new Error("Payload is empty");
    }
    return this.data;
  }

  public get isEmpty(): boolean {
    return this.data == null;
  }

  public get isNotEmpty(): boolean {
    return !this.isEmpty;
  }

  public setBuffer(buffer: Buffer): Payload {
    this.data = buffer;
    return this;
  }

  public json<T = any>(): T {
    const buffer = this.buffer();
    const json = JSON.parse(buffer.toString());
    return json;
  }

  public string(): string | undefined {
    if (this.isEmpty) return undefined;
    const buffer = this.buffer();
    return buffer.toString();
  }
}

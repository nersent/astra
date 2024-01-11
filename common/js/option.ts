export class Option<T = any> {
  constructor(
    private readonly value: T | null,
    private readonly _isSome: boolean,
  ) {}

  public get isSome(): boolean {
    return this._isSome;
  }

  public get isNone(): boolean {
    return !this._isSome;
  }

  public unwrap(): T {
    if (this.isNone) throw new OptionNoValueException();
    return this.value as T;
  }

  public unwrapOr(defaultValue: T): T {
    return this.isNone ? defaultValue : this.unwrap();
  }

  public unwrapUnchecked(): T | undefined | null {
    return this.value;
  }
}

export class OptionNoValueException extends Error {
  constructor() {
    super(`No value`);
    this.name = "OptionNoValueException";

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export const Some = <T = any>(value: T): Option<T> =>
  new Option<T>(value, true);

export const None = new Option<any>(null, false);

export const unwrapOrThrow = <T>(
  value: T | undefined,
  err?: string | Error,
): T => {
  if (value == null) {
    throw err || new Error(`Value is null or undefined`);
  }
  return value;
};

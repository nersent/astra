import { None, Some, Option } from "./option";

export function Ok<E = any>(): Result<void, E>;
export function Ok<T, E = any>(value: T): Result<T, E>;
export function Ok<T = void, E = any>(value?: T): Result<T, E> {
  return new Result<T, E>(value as T, null, true);
}

export const Err = <T = any, E = any>(e: E): Result<T, E> =>
  new Result<T, E>(null, e, false);

export class Result<T = void, E = any> {
  constructor(
    private readonly value: T | null,
    private readonly error: E | null,
    private readonly _isOk: boolean,
  ) {}

  public get isOk(): boolean {
    return this._isOk;
  }

  public get isErr(): boolean {
    return !this._isOk;
  }

  public unwrap(): T {
    if (this.isErr) throw this.error || new ResultNoValueException();
    return this.value as T;
  }

  public unwrapOr(defaultValue: T): T {
    return this.isErr ? defaultValue : this.unwrap();
  }

  public unwrapUnchecked(): T | undefined | null {
    return this.value;
  }

  public unwrapErr(): E {
    if (this.isOk) throw new ResultNoErrorException();
    return this.error as E;
  }

  public unwrapErrOr(defaultValue: E): E {
    return this.isOk ? defaultValue : this.unwrapErr();
  }

  public unwrapErrUnchecked(): E | undefined | null {
    return this.error;
  }

  public ok(): Option<T> {
    return this.isOk ? Some(this.value as T) : None;
  }

  public err(): Option<E> {
    return this.isErr ? Some(this.error as E) : None;
  }
}

export class ResultNoValueException extends Error {
  constructor() {
    super(`No result`);
    this.name = "ResultNoValueException";

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export class ResultNoErrorException extends Error {
  constructor() {
    super(`No error`);
    this.name = "ResultNoErrorException";

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

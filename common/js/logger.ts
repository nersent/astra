export interface Logger {
  log: (...data: any) => any;
  info: (...data: any) => any;
  error: (...data: any) => any;
  debug: (...data: any) => any;
  verbose: (...data: any) => any;
  warn: (...data: any) => any;
}

export const createLoggerFromConsole = (): Logger => {
  return {
    log: console.log,
    info: console.info,
    error: console.error,
    debug: console.debug,
    verbose: console.debug,
    warn: console.warn,
  };
};

export interface FormatLoggerOptions {
  prefix?: string;
}

export const formatLogger = (
  logger: Logger,
  options: FormatLoggerOptions = {},
): Logger => {
  const delegate =
    (fn: any) =>
    (...data: any): void => {
      return fn(options.prefix, ...data);
    };
  return {
    log: delegate(logger.log),
    info: delegate(logger.info),
    error: delegate(logger.error),
    debug: delegate(logger.debug),
    verbose: delegate(logger.debug),
    warn: delegate(logger.warn),
  };
};

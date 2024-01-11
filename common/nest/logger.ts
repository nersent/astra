import { resolve } from "path";

import { LoggerService, Logger as NestLogger } from "@nestjs/common";
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from "nest-winston";
import * as winston from "winston";
import { format } from "winston";

import { Logger } from "~/common/js/logger";

export const createLoggerFromNest = (logger: NestLogger): Logger => {
  return {
    log: (message: string) => logger.log(message),
    error: (message: string) => logger.error(message),
    warn: (message: string) => logger.warn(message),
    debug: (message: string) => logger.debug(message),
    info: (message: string) => logger.verbose(message),
    verbose: (message: string) => logger.verbose(message),
  };
};

export interface CreateLoggerOptions {
  consoleLevel?: string;
  path?: string;
}

export const createLogger = (
  options: CreateLoggerOptions = {},
): LoggerService => {
  return WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        level: options.consoleLevel,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          nestWinstonModuleUtilities.format.nestLike("Main", {
            colors: true,
            prettyPrint: true,
          }),
        ),
      }),
      ...(options.path != null
        ? [
            new winston.transports.File({
              filename: resolve(options.path),
              format: format.combine(format.timestamp(), format.json()),
            }),
          ]
        : []),
    ],
  });
};

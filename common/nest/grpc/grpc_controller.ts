import "reflect-metadata";
import * as grpc from "@grpc/grpc-js";
import { CONTROLLER_WATERMARK, PATH_METADATA } from "@nestjs/common/constants";

import { RemoveIndexSignature } from "~/common/js/types";

export type IGrpcController<
  T extends grpc.ServiceDefinition<any> = grpc.ServiceDefinition<any>,
> = {
  [K in keyof RemoveIndexSignature<T>]: T[K] extends grpc.MethodDefinition<
    infer TReq,
    infer TRes
  >
    ? T[K] extends { requestStream: false; responseStream: false }
      ? GrpcUnaryMethod<TReq, TRes>
      : T[K] extends { requestStream: true; responseStream: true }
      ? GrpcDuplexStreamMethod<TReq, TRes>
      : T[K] extends { requestStream: false; responseStream: true }
      ? GrpcWritableMethod<TReq, TRes>
      : never
    : never;
};

export type GrpcUnaryMethod<TReq = any, TRes = any> = (
  req: TReq,
) => Promise<TRes> | TRes;

export type GrpcDuplexStreamMethod<TReq = any, TRes = any> = (
  call: grpc.ServerDuplexStream<TReq, TRes>,
) => Promise<void> | void;

export type GrpcWritableMethod<TReq = any, TRes = any> = (
  call: grpc.ServerWritableStream<TReq, TRes>,
) => Promise<void> | void;

export const GRPC_CONTROLLER_SERVICE_DEF_METADATA =
  "GRPC_CONTROLLER_SERVICE_DEF_METADATA";

export const GrpcController = <S extends grpc.ServiceDefinition<any>>(
  service: S,
): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata(CONTROLLER_WATERMARK, true, service);
    Reflect.defineMetadata(
      GRPC_CONTROLLER_SERVICE_DEF_METADATA,
      service,
      target,
    );
    Reflect.defineMetadata(PATH_METADATA, "", target);
  };
};

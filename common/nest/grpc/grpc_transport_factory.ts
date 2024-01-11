import { INestApplication } from "@nestjs/common";
import { MicroserviceOptions } from "@nestjs/microservices";

import {
  GrpcServer,
  GrpcServerListenOptions,
  getGrpcServer,
} from "./grpc_server";
import {
  GRPC_SERVER_TRANSPORT_TOKEN,
  GrpcTransportStrategy,
} from "./grpc_transport_strategy";

export const createGrpcTransport = (
  options: GrpcServerListenOptions,
  app: INestApplication<any>,
): MicroserviceOptions => {
  return {
    strategy: new GrpcTransportStrategy(options, getGrpcServer(app)),
    options: {
      package: GRPC_SERVER_TRANSPORT_TOKEN,
    },
  };
};

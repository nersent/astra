import { CustomTransportStrategy, Server } from "@nestjs/microservices";

import { GrpcServer, GrpcServerListenOptions } from "./grpc_server";

export const GRPC_SERVER_TRANSPORT_TOKEN = "GRPC_SERVER_TRANSPORT";

export const GRPC_SERVER_TRANSPORT_ID = Symbol(GRPC_SERVER_TRANSPORT_TOKEN);

export class GrpcTransportStrategy
  extends Server
  implements CustomTransportStrategy
{
  constructor(
    private readonly options: GrpcServerListenOptions,
    private readonly grpcServer: GrpcServer,
  ) {
    super();
  }

  public get transportId(): symbol {
    return GRPC_SERVER_TRANSPORT_ID;
  }

  public listen(cb: (err: any, address?: string) => void): void {
    this.grpcServer
      .listen(this.options)
      .then((address) => {
        cb(undefined, address);
      })
      .catch((err) => {
        cb(err, undefined);
      });
  }

  public close(): void {
    this.grpcServer.forceShutdown();
  }
}

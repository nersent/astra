import { ChannelOptions, Server, ServerCredentials } from "@grpc/grpc-js";
import {
  INestApplication,
  INestApplicationContext,
  Injectable,
} from "@nestjs/common";

export type GrpcServerListenOptions = {
  credentials?: ServerCredentials;
} & ({ url: string } | { port: number });

@Injectable()
export class GrpcServer {
  public instance: Server | undefined;

  private isListening = false;

  private _credentials: ServerCredentials = ServerCredentials.createInsecure();

  public get credentials(): ServerCredentials {
    return this._credentials;
  }

  public onListenDelegate: ((server: Server) => void) | undefined;

  public async listen(
    options: GrpcServerListenOptions,
    channelOptions?: ChannelOptions,
  ): Promise<string> {
    this.instance = new Server(channelOptions);

    this.onListenDelegate?.(this.instance);

    let address: string | undefined;

    this._credentials = options.credentials ?? this._credentials;

    if ("url" in options && options.url != null) {
      address = options.url;
    }
    if ("port" in options && options.port != null) {
      address = `0.0.0.0:${options.port}`;
    }

    if (address == null) {
      throw new Error("address is null");
    }

    return new Promise<string>((resolve, reject) => {
      this.instance!.bindAsync(address!, this.credentials, (err, port) => {
        if (err) {
          return reject(err);
        }
        this.isListening = true;
        this.instance!.start();
        resolve(address!);
      });
    });
  }

  public forceShutdown(): void {
    this.instance?.forceShutdown();
    this.isListening = false;
  }
}

export const getGrpcServer = (
  app: INestApplication | INestApplicationContext,
): GrpcServer => {
  const grpcServer = app.get(GrpcServer, {});
  // assert(grpcServer instanceof GrpcServer, "Not GrpcServer");
  return grpcServer;
};

export const runGrpcServer = async (
  app: INestApplication | INestApplicationContext,
  options: GrpcServerListenOptions,
  channelOptions?: ChannelOptions,
): Promise<string> => {
  const grpcServer = getGrpcServer(app);
  return await grpcServer.listen(options, channelOptions);
};

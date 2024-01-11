import * as grpc from "@grpc/grpc-js";
import {
  Inject,
  Module,
  OnApplicationBootstrap,
  OnModuleInit,
} from "@nestjs/common";
import {
  DiscoveryModule,
  DiscoveryService,
  ModuleRef,
  NestApplication,
  NestContainer,
} from "@nestjs/core";
import { ClientsModule } from "@nestjs/microservices";

import {
  GRPC_CONTROLLER_SERVICE_DEF_METADATA,
  IGrpcController,
} from "./grpc_controller";
import { GrpcServer } from "./grpc_server";
import { GRPC_SERVER_TRANSPORT_TOKEN } from "./grpc_transport_strategy";

interface NestGrpcController {
  controller: IGrpcController;
  grpcServiceDef: grpc.ServiceDefinition<any>;
}

@Module({
  imports: [
    DiscoveryModule,
    ClientsModule.register([
      {
        name: GRPC_SERVER_TRANSPORT_TOKEN,
        options: {
          package: GRPC_SERVER_TRANSPORT_TOKEN,
        },
      },
    ]),
  ],
  providers: [GrpcServer],
  exports: [GrpcServer],
})
export class GrpcModule implements OnApplicationBootstrap {
  constructor(
    @Inject(DiscoveryService) private readonly discovery: DiscoveryService,
    @Inject(GrpcServer) private readonly grpcServer: GrpcServer,
  ) {
    this.grpcServer.onListenDelegate = (): void => {
      this.build();
    };
  }

  public onApplicationBootstrap(): void {
    //
  }

  private build(): void {
    const controllers = this.getNestGrpcControllers();

    for (const { controller, grpcServiceDef } of controllers) {
      this.createGrpcService(controller, grpcServiceDef);
    }
  }

  private get instance(): grpc.Server | undefined {
    return this.grpcServer.instance;
  }

  private createGrpcService(
    controller: IGrpcController,
    grpcServiceDef: grpc.ServiceDefinition<any>,
  ): void {
    this.instance!.addService(
      grpcServiceDef,
      this.buildGrpcProxy(controller, grpcServiceDef),
    );
  }

  private buildGrpcProxy(
    controller: IGrpcController,
    serviceDef: grpc.ServiceDefinition<any>,
  ): Record<string, any> {
    const proxy: Record<string, any> = {};

    for (const [methodName, methodDef] of Object.entries(serviceDef)) {
      const handler = (controller as any)[methodName];
      if (
        methodDef.requestStream === false &&
        methodDef.responseStream === false
      ) {
        proxy[methodName] = async (
          call: grpc.ServerUnaryCall<any, any>,
          callback: grpc.sendUnaryData<any>,
        ): Promise<void> => {
          const result = await handler.bind(controller)(call.request);
          callback(null, result);
        };
      } /* else if (methodDef.req */
      // requestStream: false, responseStream: true | grpc.ServerWritableStream<SubscribeRequest, SubscribeResponse>
      // requestStream: true, responseStream: true | grpc.ServerDuplexStream<SubscribeRequest, SubscribeResponse>
      else {
        proxy[methodName] = handler.bind(controller);
      }
      //  else {
      //   console.log(methodName, methodDef);
      //   throw new Error("Not implemented");
      // }
    }

    return proxy;
  }

  private getNestGrpcControllers(): NestGrpcController[] {
    const controllers = this.discovery
      .getControllers()
      .filter(
        (wrapper) =>
          wrapper.metatype &&
          Reflect.getMetadata(
            GRPC_CONTROLLER_SERVICE_DEF_METADATA,
            wrapper.metatype,
          ),
      );
    const items: NestGrpcController[] = controllers.map((wrapper) => {
      const grpcServiceDef = Reflect.getMetadata(
        GRPC_CONTROLLER_SERVICE_DEF_METADATA,
        wrapper.metatype,
      );
      const controller = wrapper.instance as IGrpcController;
      return {
        controller,
        grpcServiceDef,
      };
    });
    return items;
  }
}

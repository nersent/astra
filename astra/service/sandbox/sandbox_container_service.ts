import { resolve } from "path";

import { Injectable, Logger } from "@nestjs/common";
import { throwIfEmpty } from "~/common/js/assert";
import { exec } from "~/common/node/command";
import { ensureDir } from "~/common/node/fs";

import { ConfigService } from "../config_service";

export interface CreateSandboxContainerOptions {
  id: string;
  name?: string;
  ports: Record<number, number>;
  volumes: {
    dirs: Record<string, string>;
  };
}

export interface SandboxContainer extends CreateSandboxContainerOptions {
  name: string;
  containerId: string;
}

@Injectable()
export class SandboxContainerService {
  private readonly logger = new Logger(SandboxContainerService.name);

  public containers = new Map<string, SandboxContainer>();

  constructor(private readonly configService: ConfigService) {}

  public async create(
    options: CreateSandboxContainerOptions,
  ): Promise<SandboxContainer> {
    const dirVolumes = Object.keys(options.volumes.dirs).map((r) => resolve(r));
    await ensureDir(...dirVolumes);

    const imageName = this.configService.sandboxImage;
    const containerName = options.name ?? `astra_sandbox_${options.id}`;

    let command = "docker run";
    for (const [hostPort, containerPort] of Object.entries(options.ports)) {
      command += ` -p ${hostPort}:${containerPort}`;
    }
    for (const [hostDir, containerDir] of Object.entries(
      options.volumes.dirs,
    )) {
      command += ` -v ${hostDir}:${containerDir}`;
    }
    command += ` --name ${containerName} -dit ${imageName}`;

    this.logger.log(
      `Creating container ${containerName} with command ${command}`,
    );
    const res = await exec(command);
    this.logger.log(`Created container ${containerName}\n${res}`);

    const container: SandboxContainer = {
      ...options,
      name: containerName,
      containerId: res.stdout.trim(),
    };

    this.containers.set(containerName, container);

    return container;
  }

  public async stop(containerId: string): Promise<void> {
    const command = `docker stop ${containerId}`;
    this.logger.log(
      `Stopping container ${containerId} with command ${command}`,
    );
    const res = await exec(command);
    this.logger.log(`Stopped container ${containerId}\n${JSON.stringify(res)}`);
  }

  public async stopAll(): Promise<void> {
    const command = `docker ps -a --filter ancestor=${this.configService.sandboxImage} --format "{{.ID}}"`;
    const res = await exec(command);
    const containerIds = res.stdout
      .trim()
      .split("\n")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);
    this.logger.log(`Stopping containers ${containerIds.join(", ")}`);
    await Promise.all(containerIds.map((id) => this.stop(id)));
    this.logger.log(`Stopped containers ${containerIds.join(", ")}`);
  }

  public async remove(containerId: string): Promise<void> {
    const command = `docker rm ${containerId}`;
    this.logger.log(
      `Removing container ${containerId} with command ${command}`,
    );
    const res = await exec(command);
    this.logger.log(`Removed container ${containerId}\n${JSON.stringify(res)}`);
  }

  public async removeAll(): Promise<void> {
    const command = `docker ps -a --filter ancestor=${this.configService.sandboxImage} --format "{{.ID}}"`;
    const res = await exec(command);
    const containerIds = res.stdout
      .trim()
      .split("\n")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);
    this.logger.log(`Removing containers ${containerIds.join(", ")}`);
    await Promise.all(containerIds.map((id) => this.remove(id)));
    this.logger.log(`Removed containers ${containerIds.join(", ")}`);
  }
}

import { resolve } from "path";

import { Injectable, Logger } from "@nestjs/common";
import { Logger as NodeLogger } from "~/common/js/logger";
import { ensureDir } from "~/common/node/fs";
import { findPort } from "~/common/node/network";
import { SshClient } from "~/common/node/ssh_client";

import { ConfigService } from "../config_service";

import { Sandbox } from "./sandbox";
import {
  SandboxContainer,
  SandboxContainerService,
} from "./sandbox_container_service";

export interface CreateSandboxFromSshOptions {
  id: string;
  sshClient: SshClient;
  logger: NodeLogger;
}

export interface SandboxSshOptions {
  host: string;
  port: number; // port on local side, not container side
  username: string;
  password: string;
}

export interface SandboxOptions {
  ssh: SandboxSshOptions;
  chromePort: number;
  chromeProxyPort: number;
}

export interface CreateSandboxContainerOptions {
  sandboxId: string;
  options: SandboxOptions;
  path: string;
}

export interface CreateSandboxSshClientOptions extends SandboxSshOptions {}

@Injectable()
export class SandboxService {
  private readonly logger = new Logger(SandboxService.name);

  public sandboxes = new Map<string, Sandbox>();
  public sandboxIdToContainerId = new Map<string, string>();

  constructor(
    private readonly configService: ConfigService,
    private readonly sandboxContainerService: SandboxContainerService,
  ) {}

  public async createOptions(): Promise<SandboxOptions> {
    const sshPort = await findPort();
    const chromePort = await findPort({ exclude: sshPort });
    const sshOptions: SandboxSshOptions = {
      host: "localhost",
      port: sshPort,
      username: "root",
      password: "root",
    };
    return {
      ssh: sshOptions,
      chromePort,
      chromeProxyPort: chromePort,
    };
  }

  public async createSshClient(
    options: CreateSandboxSshClientOptions,
  ): Promise<SshClient> {
    const { host, port, username, password } = options;
    const sshClient = new SshClient({});
    await sshClient.connect({
      host,
      port,
      username,
      password,
    });
    return sshClient;
  }

  public async createContainer(
    options: CreateSandboxContainerOptions,
  ): Promise<SandboxContainer> {
    const {
      path: localSandboxPath,
      sandboxId,
      options: { chromePort, chromeProxyPort, ssh },
    } = options;
    const localMntDataPath = resolve(localSandboxPath, "mnt/data");
    const localRootPath = resolve(localSandboxPath, "root");
    const localTmpPath = resolve(localSandboxPath, "tmp");
    await ensureDir(localSandboxPath, localMntDataPath, localRootPath);
    const container = await this.sandboxContainerService.create({
      id: sandboxId,
      ports: {
        [ssh.port]: 22,
        [chromePort]: 9222,
        [chromeProxyPort]: 2001,
      },
      volumes: {
        dirs: {
          [localMntDataPath]: "/mnt/data",
          [localRootPath]: "/root",
          [localTmpPath]: "/tmp",
        },
      },
    });
    return container;
  }

  public async createSandboxFromSsh(
    options: CreateSandboxFromSshOptions,
    sandboxOptions: SandboxOptions,
  ): Promise<Sandbox> {
    this.logger.log(`Creating sandbox ${options.id}`);
    const sandbox = new Sandbox(
      options.id,
      options.sshClient,
      options.logger,
      sandboxOptions.chromeProxyPort,
    );
    this.sandboxes.set(sandbox.id, sandbox);
    this.logger.log(`Created sandbox ${options.id}`);
    return sandbox;
  }
}

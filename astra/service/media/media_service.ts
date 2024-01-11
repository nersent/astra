import { ReadStream, createReadStream } from "fs";
import { copyFile, writeFile } from "fs/promises";
import { basename, resolve } from "path";

import { EntityRepository, EntityManager, MikroORM } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { lookup as getMimeTypeFromExt } from "mime-types";
import OpenAI from "openai";
import * as sharp from "sharp";
import { Sharp } from "sharp";
import { v4 as uuid } from "uuid";
import { Media as ApiMedia } from "~/astra/common/media";

import { EventEmitter } from "../../../common/js/event_emitter";
import { EventRegistry } from "../../../common/js/event_registry";
import { exists, getExtension } from "../../../common/node/fs";
import { ConfigService } from "../config_service";
import { OPEN_AI_CLIENT } from "../openai_client_provider";
import { UserEntity } from "../user/user_entity";

import { MediaAccessEntity } from "./media_access_entity";
import { MediaEntity, MediaType } from "./media_entity";

export interface CreateMediaOptions {
  isPublic?: boolean;
  visibleFor?: UserEntity[];
  owner?: UserEntity;
}

export interface CreateMediaFromPathOptions extends CreateMediaOptions {
  path: string;
}

export interface CreateMediaFromBufferOptions extends CreateMediaOptions {
  buffer: Buffer;
  filename: string;
}

export interface CreateMediaFromBase64Options extends CreateMediaOptions {
  base64: string;
  filename?: string;
}

export type MediaServiceEvents = {};

@Injectable()
export class MediaService extends EventRegistry<MediaServiceEvents> {
  private readonly emitter = new EventEmitter<MediaServiceEvents>(this);

  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly em: EntityManager,
    @InjectRepository(MediaEntity)
    private readonly mediaRepo: EntityRepository<MediaEntity>,
    @InjectRepository(MediaAccessEntity)
    private readonly mediaAccessRepo: EntityRepository<MediaAccessEntity>,
    @Inject(OPEN_AI_CLIENT) private readonly openAiClient: OpenAI,
  ) {
    super();
  }

  public loadImage(path: string): Sharp {
    return (sharp as any)(path);
  }

  public loadImageFromMedia(media: MediaEntity): Sharp {
    const path = this.getMediaPath(media);
    return this.loadImage(path);
  }

  public async createMedia(
    opts:
      | CreateMediaFromPathOptions
      | CreateMediaFromBufferOptions
      | CreateMediaFromBase64Options,
  ): Promise<MediaEntity> {
    const media = new MediaEntity({
      uuid: uuid(),
      type: MediaType.Image,
      isPublic: opts.isPublic,
      owner: opts.owner as any,
    });
    if ("path" in opts) {
      const { path } = opts;
      if (!(await exists(path))) {
        throw new Error(`File does not exist at ${path}`);
      }
      media.originalFilename = basename(path);
      media.ext = getExtension(path);
      media.filename = `${media.uuid}.${media.ext}`;
      const dstPath = resolve(this.configService.mediaPath, media.filename);
      await copyFile(path, dstPath);
      this.logger.log(`Copied media ${media.uuid} from ${path} to ${dstPath}`);
    } else if ("buffer" in opts) {
      const { buffer, filename } = opts;
      media.originalFilename = filename;
      media.ext = getExtension(filename);
      media.filename = `${media.uuid}.${media.ext}`;
      const dstPath = resolve(this.configService.mediaPath, media.filename);
      await writeFile(dstPath, buffer);
      this.logger.log(`Copied media ${media.uuid} from buffer to ${dstPath}`);
    } else if ("base64" in opts) {
      const { base64, filename } = opts;
      const buffer = Buffer.from(base64, "base64");
      const img = (sharp as any)(buffer) as Sharp;
      const ext =
        filename != null
          ? getExtension(filename)
          : await img.metadata().then((r) => r.format);
      if (ext == null) throw new Error("Could not determine image format");
      const originalFilename = filename ?? `${media.uuid}.${ext}`;
      media.originalFilename = originalFilename;
      media.ext = ext;
      media.filename = `${media.uuid}.${media.ext}`;
      await img.toFile(this.getMediaPath(media));
    }

    media.ext = media.ext.toLowerCase().trim();

    if (media.originalFilename == null) throw new Error("No original filename");
    if (media.ext == null) throw new Error("No extension");
    if (media.type == null) throw new Error("No type");
    if (media.ext != null && media.mimeType == null) {
      const mt = getMimeTypeFromExt(media.ext);
      if (typeof mt === "string") media.mimeType = mt;
    }

    const permissionEntities: MediaAccessEntity[] = [];

    if (opts.owner != null) {
      const permission = new MediaAccessEntity({ forUser: opts.owner, media });
      permissionEntities.push(permission);
    }

    if (opts.visibleFor != null) {
      for (const user of opts.visibleFor) {
        const permission = new MediaAccessEntity({ forUser: user, media });
        permissionEntities.push(permission);
      }
    }

    await this.em.persistAndFlush([media, ...permissionEntities]);
    this.logger.log(`Saved media ${media.uuid} to db`);

    return media;
  }

  public getMediaPath(media: MediaEntity): string {
    return resolve(this.configService.mediaPath, media.filename);
  }

  public async createMediaReadStream(media: MediaEntity): Promise<ReadStream> {
    const path = this.getMediaPath(media);
    if (!(await exists(path))) {
      throw new NotFoundException(`Media ${media.uuid} does not exist`);
    }
    return createReadStream(path);
  }

  public formatMediaUrl(media: MediaEntity): string {
    const { uuid, filename } = media;
    return `${this.configService.apiUrl}/media/view/${uuid}`;
  }

  public async getMediaByUuid(uuid: string): Promise<MediaEntity> {
    return this.mediaRepo.findOneOrFail({ uuid });
  }

  public async asApiMedia(media: MediaEntity): Promise<ApiMedia> {
    return {
      uuid: media.uuid,
      url: this.formatMediaUrl(media),
    };
  }

  public async giveUserMediaPermission(
    user: UserEntity,
    media: MediaEntity,
  ): Promise<MediaAccessEntity> {
    const entity = new MediaAccessEntity({ forUser: user, media });
    await this.em.persistAndFlush(entity);
    return entity;
  }

  public async canAccessMedia(
    media: MediaEntity,
    user?: UserEntity,
  ): Promise<boolean> {
    if (media.isPublic) return true;
    if (user == null) return false;
    return await this.canUserAccessMedia(user, media);
  }

  public async canUserAccessMedia(
    user: UserEntity,
    media: MediaEntity,
  ): Promise<boolean> {
    if (media.isPublic) return true;
    const access = await this.mediaAccessRepo.findOne({
      forUser: user,
      media,
    });
    return access != null;
  }
}

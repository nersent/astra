import { createReadStream } from "fs";

import {
  Controller,
  Body,
  Post,
  UseGuards,
  Param,
  Query,
  Get,
  Res,
  ForbiddenException,
  Response,
  StreamableFile,
  Request,
  Header,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  GetMediaRequest,
  GetMediaResponse,
  UploadMediaResponse,
} from "~/astra/common/media_api";
import { DiskStorageFile } from "~/common/nest/multipart/disk_storage";
import { FileInterceptor } from "~/common/nest/multipart/file_interceptor";
import { FilesInterceptor } from "~/common/nest/multipart/files_interceptor";
import { MemoryStorageFile } from "~/common/nest/multipart/memory_storage";
import { UploadedFile } from "~/common/nest/multipart/uploaded_file_decorator";
import { UploadedFiles } from "~/common/nest/multipart/uploaded_files_decorator";

import { SessionUser } from "../auth/auth_decorators";
import { AuthGuard } from "../auth/auth_guard";
import { AuthService } from "../auth/auth_service";
import { ConfigService } from "../config_service";
import { UserEntity } from "../user/user_entity";

import { MediaService } from "./media_service";

@Controller("media")
export class MediaApiController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post("/upload")
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor("file", {}))
  public async upload(
    @UploadedFile() file: MemoryStorageFile,
    @SessionUser() user: UserEntity,
  ): Promise<UploadMediaResponse> {
    if (file?.buffer == null) throw new BadRequestException();
    const media = await this.mediaService.createMedia({
      buffer: file.buffer,
      filename: file.filename,
      owner: user,
    });
    return {
      media: await this.mediaService.asApiMedia(media),
    };
  }

  @Get("/info/:uuid")
  @UseGuards(AuthGuard)
  public async getMediaStatus(
    @Query() body: GetMediaRequest,
    @Param("uuid") uuid: string,
    @SessionUser() user: UserEntity,
  ): Promise<GetMediaResponse> {
    const mediaEntity = await this.mediaService.getMediaByUuid(uuid);
    const media = await this.mediaService.asApiMedia(mediaEntity);
    return {
      media,
    };
  }

  @Get("/view/:uuid")
  public async viewMedia(
    @Param("uuid") uuid: string,
    @Request() req: FastifyRequest,
    @Response({ passthrough: true }) res: FastifyReply,
  ): Promise<StreamableFile> {
    const media = await this.mediaService.getMediaByUuid(uuid);
    const user = await this.authService.tryHandleJwtReq(req);
    const canAccess = await this.mediaService.canAccessMedia(media, user);
    if (!canAccess) throw new ForbiddenException();
    const stream = await this.mediaService.createMediaReadStream(media);
    res.headers({
      "Content-Type": media.mimeType,
      "Cache-Control": `max-age=${60 * 60 * 24 * 7}`, // 7 days
    });
    return new StreamableFile(stream);
  }
}

import { Media } from "./media";

export class GetMediaRequest {}

export interface GetMediaResponse {
  media: Media;
}

export interface UploadRequest {}

export interface UploadMediaResponse {
  media: Media;
}

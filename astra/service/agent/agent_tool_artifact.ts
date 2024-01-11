export enum ArtifactType {
  Image = "image",
  Json = "json",
  Text = "text",
  Command = "command",
}

export interface ImageArtifact {
  type: ArtifactType.Image;
  buffer: Buffer;
  description?: string;
}

export interface JsonArtifact {
  type: ArtifactType.Json;
  data: any;
}

export interface TextArtifact {
  type: ArtifactType.Text;
  data: string;
}

export interface CommandArtifact {
  type: ArtifactType.Command;
  command?: string;
  stdout: string;
  exitCode: number;
}

export type Artifact =
  | ImageArtifact
  | JsonArtifact
  | TextArtifact
  | CommandArtifact;

export const artifactToText = (artifact: Artifact): string => {
  switch (artifact.type) {
    case ArtifactType.Image: {
      let text = "[image";
      if (artifact.description != null) {
        text += ` - ${artifact.description}`;
      }
      text += "]";
      return text;
    }
    case ArtifactType.Json: {
      return JSON.stringify(artifact.data, null, 2);
    }
    case ArtifactType.Text: {
      return artifact.data;
    }
    case ArtifactType.Command: {
      return `Exit code: ${artifact.exitCode}\n${artifact.stdout}`;
    }
    default: {
      throw new Error(
        `Unknown artifact type: ${JSON.stringify(artifact, null, 2)}`,
      );
    }
  }
};

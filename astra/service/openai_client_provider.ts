import { OpenAI } from "openai";

import { ConfigService } from "./config_service";

export const OPEN_AI_CLIENT = "OPENAI_CLIENT_PROVIDER";

export type GptMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export const openAiClientProvider = {
  provide: OPEN_AI_CLIENT,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<OpenAI> => {
    const client = new OpenAI({
      apiKey: configService.openAiAccessToken,
    });
    return client;
  },
};

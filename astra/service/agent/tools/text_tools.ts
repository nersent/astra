import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import OpenAI from "openai";
import { getLastItem } from "~/common/js/array";

import { ConfigService } from "../../config_service";
import { OPEN_AI_CLIENT } from "../../openai_client_provider";
import { AgentTool } from "../agent_tool";

@Injectable()
export class TextTools {
  constructor(
    private readonly configService: ConfigService,
    @Inject(OPEN_AI_CLIENT) private readonly openAiClient: OpenAI,
  ) {}

  public translateFile(): AgentTool {
    return {
      id: "translate_file",
      description:
        "Translates file inside text file from one language to another",
      arguments: {
        path: {
          type: "string",
          description: "Path to source file",
          required: true,
        },
        lang: {
          type: "string",
          description: "Language to translate to",
          required: true,
        },
      },
      impl: async (ctx): Promise<void> => {
        const { path, lang } = ctx.args;

        ctx.out.json({
          title: "summary",
          src: path,
          dst: "xd.json",
          lang,
        });
        //       const agent = ctx.agent
        //         .child()
        //         .withSystemPrompt(
        //           `
        // Translate text below to ${lang}
        // `.trim(),
        //         )
        //         .withUserPrompt(text)
        //         .build();

        //       await agent.next();

        //       const message = getLastItem(agent.gptCtx);
        //       const translated = message?.content;

        //       await ctx.out(translated);
        //       await ctx.done();
      },
    };
  }

  //   public help(): Tool {
  //     return {
  //       id: "help",
  //       description: "Ask for help",
  //       arguments: {
  //         question: {
  //           type: "string",
  //           description: "Clear and precise question",
  //           required: true,
  //         },
  //       },
  //       impl: async (ctx): Promise<void> => {
  //         const { question } = ctx.args;

  //         const agent = ctx.agent
  //           .child()
  //           .withId("help")
  //           .withUserPrompt(question)
  //           .withModel("gpt4")
  //           .build();

  //         await agent.next();

  //         const message = getLastItem(agent.gptCtx);
  //         const out = message?.content;

  //         await ctx.out(out);
  //         await ctx.done();
  //       },
  //     };
  //   }
}

import { createWriteStream } from "fs";
import { readdir } from "fs/promises";
import { basename, resolve } from "path";

import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import axios from "axios";
import { google } from "googleapis";
import { extension as getExtensionForMimeType } from "mime-types";
import OpenAI from "openai";
import { Browser, chromium, Page } from "playwright";
import * as sharp from "sharp";
import { tryParseInt } from "~/common/js/number";
import { randomString } from "~/common/js/random";
import { secondsToMs } from "~/common/js/time";
import {
  ensureDir,
  formatUniqueFilename,
  getExtension,
} from "~/common/node/fs";
import {
  downloadFile,
  downloadFileToPath,
  downloadUrlToFolder,
  getUrlHeaders,
} from "~/common/node/network";

import { ConfigService } from "../../config_service";
import { AgentTool } from "../agent_tool";

@Injectable()
export class BrowserTools {
  constructor(private readonly configService: ConfigService) {}

  public webSearch(): AgentTool {
    return {
      id: "web_search",
      description: `
Searches the web for the given query.
`.trim(),
      arguments: {
        query: {
          type: "string",
          required: true,
        },
        page: {
          type: "number",
          required: false,
        },
      },
      impl: async (ctx): Promise<void> => {
        const { query } = ctx.args;
        const page = tryParseInt(ctx.args["page"]) ?? 0;
        const perPage = 5;

        const googleSearchClient = google.customsearch("v1");
        const { data: res } = await googleSearchClient.cse.list({
          cx: this.configService.googleSearchApiCx,
          auth: this.configService.googleSearchApiToken,
          q: query,
          num: perPage,
          start: page * perPage + 1,
          gl: "us",
        });

        const items = (res.items ?? []).map((r) => {
          return {
            title: r.title,
            description: r.snippet,
            url: r.link,
          };
        });

        const nextPage = page + 1;

        ctx.out.json({ query, page, nextPage, items });
      },
    };
  }

  public imageSearch(): AgentTool {
    return {
      id: "image_search",
      description: "Searches images for the given query",
      arguments: {
        query: {
          type: "string",
          required: true,
        },
        page: {
          type: "number",
          required: false,
        },
      },
      impl: async (ctx): Promise<void> => {
        const { query } = ctx.args;
        const page = tryParseInt(ctx.args["page"]) ?? 0;
        const perPage = 5;

        const googleSearchClient = google.customsearch("v1");
        const { data: res } = await googleSearchClient.cse.list({
          cx: this.configService.googleSearchApiCx,
          auth: this.configService.googleSearchApiToken,
          q: query,
          num: perPage,
          start: page * perPage + 1,
          gl: "us",
          searchType: "image",
        });

        const items = (res.items ?? []).map((r) => {
          return {
            title: r.title,
            description: r.snippet,
            mimeType: r.mime,
            image: {
              url: r.link,
              width: r.image?.width,
              height: r.image?.height,
            },
          };
        });

        const nextPage = page + 1;

        ctx.out.json({ query, page, nextPage, items });
      },
    };
  }

  public newsSearch(): AgentTool {
    return {
      id: "news_search",
      description: "Searches news for the given query",
      arguments: {
        query: {
          type: "string",
          required: true,
        },
        page: {
          type: "number",
          required: false,
        },
      },
      impl: async (ctx): Promise<void> => {
        const { query } = ctx.args;
        const page = tryParseInt(ctx.args["page"]) ?? 0;
        const perPage = 10;

        const { data: res } = await axios.get(
          `https://api.bing.microsoft.com/v7.0/search`,
          {
            params: {
              q: query,
              count: perPage,
              offset: page * perPage,
              mkt: "en-US",
              responseFilter: "News",
            },
            headers: {
              "Ocp-Apim-Subscription-Key":
                this.configService.bingSearchApiToken,
            },
          },
        );

        const items = (res.news?.value ?? []).map((r: any) => {
          return {
            title: r.name,
            description: r.description,
            category: r.category,
            publishedAt: r.datePublished,
            url: r.link,
          };
        });

        const nextPage = page + 1;

        ctx.out.json({ query, page, nextPage, items });
      },
    };
  }

  public browserGoTo(): AgentTool {
    return {
      description: "Opens the given URL in the browser.",
      id: "browser_goto_url",
      arguments: {
        url: {
          type: "string",
          required: true,
        },
      },
      impl: async (ctx): Promise<void> => {
        let url = ctx.args["url"] as string;
        if (!url.startsWith("http")) url = `http://${url}`;
        const page = await ctx.sandbox.getPage();
        await page.goto(url, { waitUntil: "domcontentloaded" });
        ctx.out.json({
          url: page.url(),
          title: await page.title(),
          length: (await page.content()).length,
        });
      },
    };
  }

  public download(): AgentTool {
    return {
      id: "download",
      description: "Downloads the given URL",
      arguments: {
        url: {
          type: "string",
          required: true,
        },
        // folder: {
        //   type: "string",
        //   description: "Absolute path to the folder to download to",
        //   required: false,
        // },
      },
      impl: async (ctx): Promise<void> => {
        const url = ctx.args["url"] as string;
        const downloadsPath = "/mnt/data/downloads";

        const res = await ctx.sandbox.downloadUrl(url, downloadsPath);

        ctx.out.json(res);

        // if (!url.startsWith("http")) {
        //   let path: string = url;
        //   if (url.startsWith("file://")) {
        //     path = url.replace("file://", "");
        //   }
        //   if (url.startsWith("sandbox:")) {
        //     path = url.replace("sandbox:", "");
        //   }
        //   ctx.out.json({ filename: basename(path), filePath: path });
        //   return;
        // }

        // const folder = ctx.args["folder"] ?? "root";
        // const folder = ctx.args["folder"] ?? "root";

        // const localPath = resolve("out", "astra", "env");

        // let localFolder = folder;

        // if (folder.startsWith("/root/")) {
        //   localFolder = folder.replace("/root/", "");
        // } else if (folder.startsWith("root/")) {
        //   localFolder = folder.replace("root/", "");
        // } else if (folder.startsWith("root")) {
        //   localFolder = folder.replace("root", "");
        // } else if (folder.startsWith("/root")) {
        //   localFolder = folder.replace("/root", "");
        // }
        // const localFolder = "mnt/data/downloads";

        // const folderPath = resolve(localPath, localFolder);

        // const filePath = await downloadUrlToFolder({ url, folderPath });
        // const filename = basename(filePath);

        // const sandboxPath = `/${localFolder}/${filename}`;

        // ctx.agent["logger"].log(
        //   `Downloading ${url} to ${filePath} | ${sandboxPath}`,
        // );

        // ctx.out.json({ filename, filePath: sandboxPath });
      },
    };
  }

  public browserEvalJs(): AgentTool {
    return {
      id: "browser_eval_js",
      description: "Evaluates JavaScript code on loaded page",
      arguments: {
        js: {
          type: "string",
          description: "Tip: puppeteer's page.evaluate()",
          required: true,
        },
      },
      impl: async (ctx): Promise<void> => {
        const { js } = ctx.args;
        const page = await ctx.sandbox.getPage();
        const res = await page.evaluate(js);
        ctx.out.any(res);
      },
    };
  }

  public browserGetText(): AgentTool {
    return {
      id: "browser_get_text",
      description: "Returns text from loaded page",
      impl: async (ctx): Promise<void> => {
        const page = await ctx.sandbox.getPage();
        const res = await page.evaluate(() => {
          return document.body.innerText;
        });
        ctx.out.any(res);
      },
    };
  }

  public browserGetLinks(): AgentTool {
    return {
      id: "browser_get_links",
      description: "Returns all links from loaded page",
      impl: async (ctx): Promise<void> => {
        const page = await ctx.sandbox.getPage();
        const res = await page.evaluate(() => {
          return Array.from(document.querySelectorAll("a")).map((a) => {
            return {
              href: a.href,
              text: a.innerText,
            };
          });
        });
        ctx.out.json(res);
      },
    };
  }
}

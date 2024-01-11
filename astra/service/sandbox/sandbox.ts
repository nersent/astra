import {
  extension as getExtensionForMimeType,
  contentType as getExtensionForContentType,
  extensions as contentTypeToExtension,
} from "mime-types";
import { Browser, Page, chromium } from "playwright";
import { Logger } from "~/common/js/logger";
import { randomString } from "~/common/js/random";
import { nullIfEmpty } from "~/common/js/string";
import {
  formatUniqueFilename,
  getExtension,
  hasExtension,
} from "~/common/node/fs";
import {
  SshClient,
  SshClientExecRequest,
  SshClientExecResult,
} from "~/common/node/ssh_client";
export class Sandbox {
  public data = new Map<string, any>();

  constructor(
    public readonly id: string,
    public readonly sshClient: SshClient,
    public readonly logger: Logger,
    public readonly chromePort: number,
  ) {}

  public set(key: string, value: any): void {
    this.data.set(key, value);
  }

  public get<T>(key: string): T | undefined {
    return this.data.get(key) as T | undefined;
  }

  public getOrFail<T>(key: string): T {
    const value = this.get<T>(key);
    if (value === undefined) {
      throw new Error(`Missing sandbox data for key ${key}`);
    }
    return value;
  }

  public async exec(
    options: SshClientExecRequest,
  ): Promise<SshClientExecResult> {
    if (typeof options === "string") {
      options = {
        command: options,
      };
    }
    return this.sshClient.exec({
      ...options,
      interactive: options.interactive ?? true,
    });
  }

  public async cd(path: string): Promise<SshClientExecResult> {
    return await this.exec(`cd "${path}"`);
  }

  public async pwd(): Promise<string> {
    const result = await this.exec("pwd");
    return result.stdout.trim();
  }

  public async writeFile(
    path: string,
    content: string,
  ): Promise<SshClientExecResult> {
    const encodedContent = Buffer.from(content).toString("base64");
    return await this.exec(`echo ${encodedContent} | base64 -d > ${path}`);
  }

  public async readFile(path: string): Promise<string> {
    const result = await this.exec(`cat "${path}" | base64`);
    const base64 = result.stdout.trim();
    const res = Buffer.from(base64, "base64").toString("utf-8");
    return res;
  }

  public async exists(path: string): Promise<boolean> {
    const result = await this.exec(`ls "${path}"`);
    return result.exitCode === 0;
  }

  public async uploadFile(
    localPath: string,
    remotePath: string,
  ): Promise<void> {}

  public async getFiles(path: string): Promise<string[]> {
    const result = await this.exec(`ls -1 "${path}"`);
    return result.stdout
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  public async downloadUrl(
    url: string,
    folderPath = "/mnt/data",
  ): Promise<{ path: string; url: string; contentType?: string }> {
    if (!url.startsWith("http")) {
      if (url.startsWith("sandbox:")) {
        url = url.replace("sandbox:", "");
      }
      if (url.startsWith("file:")) {
        url = url.replace("file:", "");
        // remove all / from start
      }
      if (url.startsWith("//")) {
        url = url.replace("//", "");
      }
      if (!url.startsWith("/")) {
        const pwd = await this.pwd();
        url = `${pwd}/${url}`;
      }
      // console.log(url);
      url = `file://${url}`;
    }

    await this.mkdir(folderPath);
    const curlHeaders = await this.exec(`curl -s -I -X HEAD "${url}"`);
    const headers = ((res: string): Record<string, string> => {
      const lines = res.split("\n");
      const headers: Record<string, string> = {};
      for (const line of lines) {
        const [key, value] = line.split(": ").map((r) => r.trim());
        headers[key] = value;
      }
      return headers;
    })(curlHeaders.stdout);

    let filename: string | undefined = undefined;
    if (headers["content-disposition"] != null) {
      const match = headers["content-disposition"].match(/filename="(.+)"/);
      if (match != null) {
        filename = match[1];
      }
    }

    let fileExt: string | undefined = undefined;
    let contentType: string | undefined = headers["content-type"];

    // console.log(curlHeaders);

    if (fileExt == null && contentType != null) {
      contentType = contentType.split(";")[0].trim();
      fileExt = contentTypeToExtension[contentType]?.[0];
    }

    if (fileExt == null && filename != null) {
      fileExt = getExtension(filename);
    }

    if (fileExt == null && contentType != null) {
      fileExt = getExtensionForMimeType(contentType) || undefined;
    }

    if (filename == null) {
      const urlParts = url.split("/");
      if (urlParts.length > 0) {
        filename = urlParts[urlParts.length - 1];
        filename = filename.split("?")[0];

        if (fileExt == null && filename.includes(".")) {
          fileExt = getExtension(filename);
        }
      }
    }
    filename = nullIfEmpty(filename);

    if (filename == null) {
      filename = randomString(10);
    }

    if (fileExt != null && !hasExtension(filename, fileExt)) {
      filename = `${filename}.${fileExt}`;
    }

    const files = await this.getFiles(folderPath);
    filename = formatUniqueFilename(filename, files);

    const path = `${folderPath}/${filename}`;

    const res = await this.exec(`curl -o ${path} "${url}"`);
    if (res.exitCode) {
      throw new Error(`Failed to download url ${url}. ${res.stdout}`);
    }

    return { url, path, contentType };
  }

  public async isDirectory(path: string): Promise<boolean> {
    const result = await this.exec(`test -d "${path}"`);
    return result.exitCode === 0;
  }

  public async mkdir(path: string): Promise<SshClientExecResult> {
    return await this.exec(`mkdir -p "${path}"`);
  }

  public async findChromePath(): Promise<string | undefined> {
    const result = await this.exec({
      command: "which google-chrome",
      interactive: false,
    });
    if (result.exitCode !== 0) {
      return undefined;
    }
    return result.stdout.trim();
  }

  public async waitForPort(
    port: number,
    timeout = 1000 * 10,
  ): Promise<SshClientExecResult> {
    const command: SshClientExecRequest = {
      command: "npx",
      args: [`wait-port`, "-t", timeout.toString(), `${port}`],
    };
    return await this.exec(command);
  }

  public async isChromeRunning(): Promise<boolean> {
    const result = await this.exec("pgrep chrome");
    return result.exitCode === 0;
  }

  public async launchChrome(
    port: number = 2001,
    containerPort: number = 9222,
  ): Promise<void> {
    if (await this.isChromeRunning()) {
      return;
    }
    const chromePath = await this.findChromePath();
    if (!chromePath) {
      throw new Error("Chrome not found");
    }
    this.logger.log(
      `Preparing chrome at port ${port}/${containerPort} and ${chromePath}`,
    );
    const args: string[] = [];
    const userDataDir = `/mnt/data/chrome/user`;
    await this.exec(`rm -rf ${userDataDir}`);
    await this.mkdir(userDataDir);
    await this.exec(`service dbus start`);
    await this.exec(`Xvfb -ac :99 -screen 0 1920x1080x16 &`);
    await this.killPort(containerPort);
    const remoteDebuggingPort = containerPort;
    args.push(`--user-data-dir=${userDataDir}`);
    args.push(`--no-sandbox`);
    args.push(`--no-first-run`);
    args.push(`--disable-gpu`);
    args.push(`--disable-software-rasterizer`);
    args.push(`--disable-dev-shm-usage`);
    args.push(`--disable-setuid-sandbox`);
    args.push(`--disable-extensions`);
    args.push(`--disable-background-networking`);
    args.push(`--disable-default-apps`);
    args.push(`--disable-sync`);
    args.push(`--disable-translate`);
    args.push(`--disable-notifications`);
    args.push(`--remote-debugging-port=${remoteDebuggingPort}`);
    args.push(`--remote-debugging-address=0.0.0.0`);
    this.logger.log(
      `Launching chrome on port ${remoteDebuggingPort} with args ${args.join(
        " ",
      )}`,
    );
    this.exec({
      command: chromePath,
      args,
      env: {
        DISPLAY: ":99",
      },
      interactive: false,
    }).then((res) => {
      if (res.exitCode !== 0) {
        throw new Error(`Failed to launch chrome: ${res.stdout}`);
      }
    });
    this.logger.log(
      `Waiting for chrome to start on port ${remoteDebuggingPort}`,
    );
    await this.waitForPort(remoteDebuggingPort);
    if (!(await this.isChromeRunning())) {
      throw new Error("Chrome failed to start");
    }
    this.logger.log(`Chrome started at port ${remoteDebuggingPort}`);
    await this.killPort(port);
    this.exec({
      command: `socat tcp-listen:${port},fork tcp:localhost:${remoteDebuggingPort}`,
      interactive: false,
    }).then((res) => {
      this.logger.log(res);
      if (res.exitCode !== 0) {
        throw new Error(`Failed to launch socat: ${res.stdout}`);
      }
    });
    this.logger.log(`Waiting for socat to start at port ${port}`);
    await this.waitForPort(port);
    this.logger.log(`Socat started at port ${port}`);
    this.logger.log(`Chrome launched`);
  }

  public async killChrome(): Promise<void> {
    await this.exec(`pkill chrome`);
    await this.killPort(2001);
    await this.killPort(9222);
  }

  public async killPort(port: number): Promise<void> {
    await this.exec(`npx kill-port ${port}`);
  }

  public async getBrowser(): Promise<Browser> {
    let browser = this.get<Browser>("browser");

    if (browser == null) {
      console.log("Chrome running", await this.isChromeRunning());
      const cdpUrl = `http://localhost:${this.chromePort}`;
      try {
        await this.launchChrome();
        browser = await chromium.connectOverCDP(cdpUrl);
      } catch (error) {
        await this.killChrome();
        await this.launchChrome();
        browser = await chromium.connectOverCDP(cdpUrl);
      }
      this.set("browser", browser);
    }

    return browser;
  }

  public async getPage(): Promise<Page> {
    const browser = await this.getBrowser();
    let browserPage = this.get<Page>("browserPage");

    if (browserPage == null) {
      browserPage = await browser.newPage();
      this.set("browserPage", browserPage);
    }

    return browserPage;
  }
}

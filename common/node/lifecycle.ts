export const panic = (...messages: string[]): void => {
  console.error(...messages);
  process.exit(1);
};

export const runApp = async (delegate: () => Promise<void>): Promise<void> => {
  process.on("exit", () => {
    console.log("Process exited");
  });

  await delegate();
};

// export class AppBlocker {
//   private timer: NodeJS.Timeout | undefined = undefined;

//   public block(): AppBlocker {
//     this.timer = setInterval(() => {}, Number.MAX_SAFE_INTEGER);
//     return this;
//   }

//   public unblock(): AppBlocker {
//     this.timer?.unref();
//     this.timer = undefined;
//     return this;
//   }
// }

export const runForever = (): Promise<void> => {
  return new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("SIGINT");
      resolve();
    });
    process.on("SIGTERM", () => {
      console.log("SIGTERM");
      resolve();
    });
  });
};

export type ApiProxy<T> = {
  [K in keyof T]: T[K] extends (...args: infer ARGS) => infer RET
    ? (...args: ARGS) => Promise<RET>
    : never;
};

export const proxify = <T extends object>(
  obj: T,
  proxyFnFactory: (key: string) => any,
): ApiProxy<T> => {
  const executor: any = {};
  for (const key of Object.keys(obj)) {
    executor[key] = proxyFnFactory(key);
  }
  return executor;
};

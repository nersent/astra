type RefsArray<T> = Array<
  React.MutableRefObject<T | null> | React.ForwardedRef<T | null> | undefined
>;

export const setRefs = <T>(instance: T | null, ...refs: RefsArray<T>) => {
  refs.forEach((r) => {
    if (!r) return;
    if (typeof r === "object") r.current = instance;
    if (typeof r === "function") r(instance);
  });
};

export const mergeRefs =
  <T>(...refs: RefsArray<T>) =>
  (instance: T) =>
    setRefs(instance, ...refs);

type Unpacked<T> = T extends (infer K)[] ? K : T;

export const mergeEvents = <T extends Record<string, any>>(map: T) => {
  const finalObj: Record<string, any> = {};

  Object.keys(map).forEach((key) => {
    finalObj[key] = (...args: any[]) => {
      map[key].forEach((cb: any) => {
        cb?.(...args);
      });
    };
  });

  return finalObj as any as { [K in keyof T]: Unpacked<T[K]> };
};

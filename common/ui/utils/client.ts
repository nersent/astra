export const isAndroid = (userAgent: string) =>
  Boolean(userAgent.match(/Android/i));

export const isIos = (userAgent: string) =>
  Boolean(userAgent.match(/iPhone|iPad|iPod/i));

export const isOpera = (userAgent: string) =>
  Boolean(userAgent.match(/Opera Mini/i));

export const isWindowsMobile = (userAgent: string) =>
  Boolean(userAgent.match(/IEMobile/i));

export const isSSR = (userAgent: string) => Boolean(userAgent.match(/SSR/i));

export const isMobile = (userAgent: string) => {
  return (
    isAndroid(userAgent) ||
    isIos(userAgent) ||
    isOpera(userAgent) ||
    isWindowsMobile(userAgent)
  );
};

export const isDesktop = (userAgent: string) => {
  return !isMobile(userAgent) && !isSSR(userAgent);
};

export const getUserAgent = () => {
  return typeof navigator === "undefined" ? "SSR" : navigator.userAgent;
};

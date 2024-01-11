export const urlPort = (url: string): number => {
  if (!url.match(/^[a-z]+:\/\//)) {
    url = `http://${url}`;
  }
  const port = new URL(url).port;
  if (port) {
    return parseInt(port);
  }
  return 80;
};

export const removeUrlPort = (url: string): string => {
  const port = urlPort(url);
  return url.replace(`:${port}`, "");
};

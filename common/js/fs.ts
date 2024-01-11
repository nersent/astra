export const readBrowserFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (): void => resolve(reader.result as string);
    reader.onerror = (): void => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

export const mbToBytes = (mb: number): number => {
  return mb * 1024 * 1024;
};

export const clearInput = (
  el?: HTMLInputElement | HTMLTextAreaElement | null | false,
): void => {
  if (!el) return;
  el.value = "";
};

export const focusInput = (
  el?: HTMLInputElement | HTMLTextAreaElement | null | false,
  immediate: boolean = true,
): void => {
  if (!el) return;
  if (immediate) return el.focus();
  requestAnimationFrame(() => el.focus());
};

export const loadImage = (url: string): Promise<HTMLImageElement> => {
  const img = new Image();
  img.src = url;
  return new Promise<HTMLImageElement>((resolve, reject) => {
    img.onload = (): void => resolve(img);
    img.onerror = reject;
  });
};

export const hasWindow = typeof window !== "undefined";

export const openFileSelectPopup = ({
  accept,
  multiple,
}: {
  accept?: string;
  multiple?: boolean;
}): Promise<File[]> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept ?? "*/*";
    input.multiple = multiple ?? false;
    input.onchange = (): void => {
      const files = input.files;
      if (!files) return reject("No files selected");
      resolve(Array.from(files));
    };
    input.click();
  });
};

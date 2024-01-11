export const stdTransition = ({
  background = true,
  color = true,
  boxShadow = true,
  time = 0.15,
  opacity = true,
}: {
  background?: boolean;
  color?: boolean;
  boxShadow?: boolean;
  opacity?: boolean;
  time?: number;
} = {}): string => {
  const items: string[] = [];
  if (background) items.push("background-color");
  if (color) items.push("color");
  if (boxShadow) items.push("box-shadow");
  if (opacity) items.push("opacity");
  return items.map((item) => `${item} ${time}s`).join(", ");
};

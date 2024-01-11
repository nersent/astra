import defaultDarkTheme from "./default-dark-theme";

export type ThemeKey<T extends Record<string, any>> = Join<
  PathsToStringProps<T>,
  "."
>;

export const th = <T extends Record<string, any>, K = typeof defaultDarkTheme>(
  key: ThemeKey<T>,
  includeVar = true,
) => {
  const variableName = key.replaceAll(".", "-");
  const str = `--${variableName}`;
  return includeVar ? `var(${str})` : str;
};

export const createThDelegate =
  <T extends Record<string, any>>() =>
  (key: ThemeKey<T>, includeVar?: boolean) => {
    return th<T>(key, includeVar);
  };

type PathsToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>];
    }[Extract<keyof T, string>];

type Join<T extends string[], D extends string> = T extends []
  ? never
  : T extends [infer F]
  ? F
  : T extends [infer F, ...infer R]
  ? F extends string
    ? `${F}${D}${Join<Extract<R, string[]>, D>}`
    : never
  : string;

const normalizeThemeKey = (key: string) => {
  return key.replaceAll(".", "-");
};

const stringifyTheme = (theme: Record<string, any>, prefix = "--") => {
  let str = "--nersent-ui-breakpoint-lg: 1000px;";

  for (const key in theme) {
    if (typeof theme[key] === "object") {
      str += stringifyTheme(theme[key], `${prefix}${key}-`);
    } else {
      str += `${prefix}${key}: ${theme[key]};`;
    }
  }

  return str;
};

export const applyTheme = (
  element: HTMLElement,
  ...themes: Record<string, any>[]
) => {
  const theme: Record<string, any> = Object.assign({}, ...themes);

  const str = stringifyTheme(theme);
  const css = `:root { ${str} }`;

  try {
    const sheet = new CSSStyleSheet();
    sheet.insertRule(css);
    (document as any).adoptedStyleSheets = [sheet];
  } catch (error) {
    console.warn(error);
    console.log("Fallback style loaded");

    const oldStyle = [...document.head.children].find(
      (r) => r.getAttribute("nersent-ui-style-sheet") != null,
    );

    if (oldStyle != null) {
      document.head.removeChild(oldStyle);
    }

    const style = document.createElement("style") as HTMLStyleElement;
    style.type = "text/css";
    style.appendChild(document.createTextNode(css));
    style.setAttribute("nersent-ui-style-sheet", "");
    document.head.appendChild(style);
  }
};

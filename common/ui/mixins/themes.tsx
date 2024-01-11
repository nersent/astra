import { asArray } from "../../js/array";

export const asVar = (name: string) => `var(${name})`;

export const vars = (
  varsOrValue: Record<string, string> | string,
  vars?: string[] | string,
) => {
  if (typeof varsOrValue !== "string") {
    return Object.entries(varsOrValue)
      .map(([name, value]) => `${name}: ${value};`)
      .join("\n");
  }
  return asArray(vars ?? [])
    .map((name) => `${name}: ${varsOrValue};`)
    .join("\n");
};

export const setVars = vars;

export const setVar = (name: string, value: string) => {
  return `${name}: ${value};`;
};

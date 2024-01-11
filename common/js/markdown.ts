export interface CodeBlock {
  lang: string;
  content: string;
}

export const getCodeBlocks = (text: string): CodeBlock[] => {
  const blocks: CodeBlock[] = [];

  const regexp = /```[^`]*```/gim;
  let match: RegExpExecArray | null;

  if (text.match(/```[^`]*$/)) {
    text += "```";
  }

  while ((match = regexp.exec(text))) {
    const text = match[0];
    const langMatches = /```(.*)\n/im.exec(text);
    if (langMatches == null) {
      throw new Error("Invalid block code");
    }
    const lang = langMatches[1];
    const content = text
      .replace(/```.*\n/, "")
      .replace(/```/, "")
      .trim();
    const block = { lang, content } as CodeBlock;
    blocks.push(block);
  }

  return blocks;
};

export const codeBlock = (content: string, lang?: string): string => {
  return `\`\`\`${lang ?? ""}\n${content}\n\`\`\``;
};

// export const extractMarkdownSection = (md: string, sectionName: string) => {
//   const sections = md.split(/(#{1,} [^\n]*)/);
//   const index = sections.findIndex(section =>
//     section.match(new RegExp(^#{1,} ${sectionName}$, "i")),
//   );
//   if (index !== -1) {
//     let nextIndex = sections
//       .slice(index + 1)
//       .findIndex(section => section.match(/^#{1,2} [^\n]*$/i));
//     nextIndex = nextIndex === -1 ? sections.length : nextIndex + index + 1;
//     return sections.slice(index, nextIndex).join("");
//   }
//   return "";
// };

// export const removeMarkdownSection = (md: string, sectionName: string) => {
//   const section = extractMarkdownSection(md, sectionName);

//   if (section) {
//     return md.replace(section, "").trim();
//   }

//   return md;
// };

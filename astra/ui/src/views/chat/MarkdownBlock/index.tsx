import React from "react";
import { CodeBlock, atomOneDark, atomOneLight } from "react-code-blocks";
import Markdown, { Components, ExtraProps } from "react-markdown";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ChatMarkdownEvent as ApiChatMarkdownEvent } from "~/astra/common/chat";

import {
  StyledImageRenderer,
  StyledCodeRenderer,
  CodeBlockBar,
  StyledParagraphRenderer,
  StyledMarkdownBlock,
} from "./style";

const ParagraphRenderer = ({ children, ...props }: any) => {
  return <StyledParagraphRenderer>{children}</StyledParagraphRenderer>;
};

const ImageRenderer = ({ src, alt }: any) => {
  return <StyledImageRenderer src={src} alt={alt} />;
};

const CodeRenderer = ({ children, className, node, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1] : "text";
  return (
    <StyledCodeRenderer>
      <CodeBlockBar>{lang}</CodeBlockBar>
      <CodeBlock
        text={children.trim()}
        language={lang}
        theme={atomOneLight}
        showLineNumbers
        customStyle={{ borderRadius: "0px" }}
      />
    </StyledCodeRenderer>
  );
};

export const MarkdownBlock = ({
  event,
}: {
  event: ApiChatMarkdownEvent & { $isOwn?: boolean };
}) => {
  const { data } = event;
  if (!data?.length) return;
  return (
    <StyledMarkdownBlock>
      {/* <StyledParagraphRenderer> */}
      <Markdown
        skipHtml={false}
        components={{
          img: ImageRenderer,
          code: CodeRenderer,
          p: ParagraphRenderer,
        }}
      >
        {data}
      </Markdown>
      {/* </StyledParagraphRenderer> */}
    </StyledMarkdownBlock>
  );
};

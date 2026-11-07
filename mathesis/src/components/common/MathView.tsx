import React, { useMemo } from "react";
import katex from "katex";

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math, block = false, className = "" }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
      });
    } catch (e) {
      return math;
    }
  }, [math, block]);

  if (block) {
    return (
      <div
        className={`katex-display my-3 overflow-x-auto overflow-y-hidden text-center ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline-block ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export const RichMathText: React.FC<{ text: string; className?: string }> = ({
  text,
  className = "",
}) => {
  // Parses inline math $...$ and block math $$...$$
  const parts = useMemo(() => {
    const list: { type: "text" | "inline" | "block"; content: string }[] = [];
    const blockSplit = text.split(/\$\$(.+?)\$\$/s);

    for (let i = 0; i < blockSplit.length; i++) {
      if (i % 2 === 1) {
        list.push({ type: "block", content: blockSplit[i] });
      } else {
        const inlineSplit = blockSplit[i].split(/\$(.+?)\$/s);
        for (let j = 0; j < inlineSplit.length; j++) {
          if (j % 2 === 1) {
            list.push({ type: "inline", content: inlineSplit[j] });
          } else if (inlineSplit[j]) {
            list.push({ type: "text", content: inlineSplit[j] });
          }
        }
      }
    }
    return list;
  }, [text]);

  return (
    <span className={className}>
      {parts.map((p, idx) => {
        if (p.type === "block") {
          return <MathView key={idx} math={p.content} block />;
        }
        if (p.type === "inline") {
          return <MathView key={idx} math={p.content} block={false} />;
        }
        return <span key={idx}>{p.content}</span>;
      })}
    </span>
  );
};

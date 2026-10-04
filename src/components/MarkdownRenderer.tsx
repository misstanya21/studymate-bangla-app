import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  fontSize?: 'small' | 'medium' | 'large';
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  fontSize = 'medium',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const textClass =
    fontSize === 'large'
      ? 'text-lg leading-relaxed'
      : fontSize === 'small'
      ? 'text-sm leading-normal'
      : 'text-base leading-relaxed';

  // Helper to format inline bold, italics, code, math
  const formatInline = (text: string): React.ReactNode => {
    // Process markdown inline styling
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\$\$.*?\$\$|\$.*?\$)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={index} className="italic text-slate-800 dark:text-slate-200">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-mono text-sm font-semibold"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if ((part.startsWith('$$') && part.endsWith('$$')) || (part.startsWith('$') && part.endsWith('$'))) {
        const math = part.replace(/^\$\$?|\$\$?$/g, '');
        return (
          <span
            key={index}
            className="font-serif italic text-emerald-700 dark:text-emerald-300 font-semibold px-1 bg-emerald-50 dark:bg-emerald-950/40 rounded"
          >
            {math}
          </span>
        );
      }
      return part;
    });
  };

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let listBuffer: string[] = [];
  let isNumbered = false;

  const flushList = () => {
    if (listBuffer.length === 0) return;
    if (isNumbered) {
      elements.push(
        <ol key={`ol-${elements.length}`} className="list-decimal list-inside space-y-1.5 my-3 pl-2">
          {listBuffer.map((item, idx) => (
            <li key={idx} className="text-slate-700 dark:text-slate-300">
              {formatInline(item)}
            </li>
          ))}
        </ol>
      );
    } else {
      elements.push(
        <ul key={`ul-${elements.length}`} className="space-y-1.5 my-3 pl-1">
          {listBuffer.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
              <span className="text-emerald-500 mt-1 select-none font-bold">•</span>
              <span>{formatInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    }
    listBuffer = [];
    isNumbered = false;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Check for lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (isNumbered) flushList();
      listBuffer.push(trimmed.slice(2));
      return;
    }

    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      if (!isNumbered && listBuffer.length > 0) flushList();
      isNumbered = true;
      listBuffer.push(numMatch[2]);
      return;
    }

    // Flush any pending list
    flushList();

    if (!trimmed) {
      elements.push(<div key={`spacer-${index}`} className="h-2" />);
      return;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***') {
      elements.push(
        <hr key={`hr-${index}`} className="my-4 border-slate-200 dark:border-slate-800" />
      );
      return;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4
          key={`h4-${index}`}
          className="text-base font-bold text-emerald-700 dark:text-emerald-400 mt-4 mb-2 flex items-center gap-1.5"
        >
          {formatInline(trimmed.slice(4))}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3
          key={`h3-${index}`}
          className="text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2 pb-1 border-b border-slate-100 dark:border-slate-800"
        >
          {formatInline(trimmed.slice(3))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h2
          key={`h2-${index}`}
          className="text-xl font-extrabold text-slate-900 dark:text-white mt-4 mb-3"
        >
          {formatInline(trimmed.slice(2))}
        </h2>
      );
      return;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      elements.push(
        <div
          key={`quote-${index}`}
          className="my-3 pl-3.5 py-1.5 border-l-4 border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-r-lg text-slate-700 dark:text-slate-300 italic"
        >
          {formatInline(trimmed.slice(2))}
        </div>
      );
      return;
    }

    // Standard paragraph
    elements.push(
      <p key={`p-${index}`} className="my-1.5 text-slate-700 dark:text-slate-300">
        {formatInline(line)}
      </p>
    );
  });

  flushList();

  return (
    <div className={`relative ${textClass}`}>
      <div className="flex justify-end mb-2">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          title="সম্পূর্ণ উত্তর কপি করুন"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">কপি হয়েছে!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>কপি করুন</span>
            </>
          )}
        </button>
      </div>
      <div className="space-y-1">{elements}</div>
    </div>
  );
};

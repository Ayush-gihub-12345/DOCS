import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useEffect } from 'react';

interface PreviewProps {
  content: string;
}

export default function Preview({ content }: PreviewProps) {
  useEffect(() => {
    // Add highlight.js styles dynamically
    const style = document.createElement('style');
    style.textContent = `
      .hljs {
        background: #1e293b !important;
        color: #e2e8f0 !important;
        padding: 1rem !important;
        border-radius: 0.5rem !important;
      }
      .hljs-comment, .hljs-quote { color: #64748b; }
      .hljs-keyword, .hljs-selector-tag { color: #c084fc; }
      .hljs-string { color: #86efac; }
      .hljs-number { color: #fbbf24; }
      .hljs-function { color: #60a5fa; }
      .hljs-title { color: #38bdf8; }
      .hljs-variable { color: #f472b6; }
      .hljs-attribute { color: #fb923c; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="w-[400px] border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 overflow-y-auto">
      <div className="p-6">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Live Preview
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-bold mt-5 mb-3 text-gray-900 dark:text-white">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-bold mt-4 mb-2 text-gray-900 dark:text-white">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 mb-4 text-gray-700 dark:text-gray-300">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="mb-1">{children}</li>
              ),
              code: ({ className, children, ...props }) => {
                const isInline = !className;
                return isInline ? (
                  <code className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 rounded text-sm font-mono text-gray-900 dark:text-gray-100">
                    {children}
                  </code>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className="mb-4 p-4 bg-gray-900 rounded-lg overflow-x-auto">
                  {children}
                </pre>
              ),
              a: ({ children, href }) => (
                <a
                  href={href}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              img: ({ src, alt }) => (
                <img
                  src={src}
                  alt={alt}
                  className="max-w-full h-auto rounded-lg my-4"
                />
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-indigo-600 pl-4 my-4 text-gray-600 dark:text-gray-400 italic">
                  {children}
                </blockquote>
              )
            }}
          >
            {content || '*Start typing to see preview...*'}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

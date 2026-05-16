import { X, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import JSZip from 'jszip';
import { Page } from './Sidebar';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: Page[];
}

export default function ExportModal({ isOpen, onClose, pages }: ExportModalProps) {
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const markdownToHtml = (markdown: string): string => {
    let html = markdown;

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Code blocks
    html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Lists
    html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Paragraphs
    html = html.split('\n\n').map(para => {
      if (!para.match(/^<[h|u|o|p|l]/)) {
        return `<p>${para}</p>`;
      }
      return para;
    }).join('\n');

    return html;
  };

  const generateHtmlPage = (page: Page, allPages: Page[]): string => {
    const htmlContent = markdownToHtml(page.content);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title} - QubeDocs</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="layout">
        <nav class="sidebar">
            <div class="sidebar-header">
                <h1>QubeDocs</h1>
            </div>
            <ul class="nav-list">
                ${allPages.map(p => `
                    <li class="${p.id === page.id ? 'active' : ''}">
                        <a href="${p.id}.html">${p.title}</a>
                    </li>
                `).join('')}
            </ul>
        </nav>
        <main class="content">
            <h1 class="page-title">${page.title}</h1>
            <div class="markdown-content">
                ${htmlContent}
            </div>
        </main>
    </div>
</body>
</html>`;
  };

  const generateCSS = (): string => {
    return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #0f172a;
    color: #e2e8f0;
    line-height: 1.6;
}

.layout {
    display: flex;
    min-height: 100vh;
}

.sidebar {
    width: 250px;
    background: #1e293b;
    border-right: 1px solid #334155;
    padding: 20px;
    position: fixed;
    height: 100vh;
    overflow-y: auto;
}

.sidebar-header h1 {
    font-size: 1.5rem;
    color: #6366f1;
    margin-bottom: 30px;
}

.nav-list {
    list-style: none;
}

.nav-list li {
    margin-bottom: 8px;
}

.nav-list a {
    display: block;
    padding: 10px 15px;
    color: #94a3b8;
    text-decoration: none;
    border-radius: 6px;
    transition: all 0.2s;
}

.nav-list a:hover {
    background: #334155;
    color: #e2e8f0;
}

.nav-list li.active a {
    background: #6366f1;
    color: white;
}

.content {
    flex: 1;
    margin-left: 250px;
    padding: 60px 80px;
    max-width: 900px;
}

.page-title {
    font-size: 2.5rem;
    margin-bottom: 30px;
    color: white;
}

.markdown-content h1 {
    font-size: 2rem;
    margin-top: 40px;
    margin-bottom: 20px;
    color: white;
}

.markdown-content h2 {
    font-size: 1.5rem;
    margin-top: 30px;
    margin-bottom: 15px;
    color: white;
}

.markdown-content h3 {
    font-size: 1.25rem;
    margin-top: 25px;
    margin-bottom: 12px;
    color: white;
}

.markdown-content p {
    margin-bottom: 16px;
    color: #cbd5e1;
}

.markdown-content ul, .markdown-content ol {
    margin-bottom: 16px;
    padding-left: 30px;
}

.markdown-content li {
    margin-bottom: 8px;
    color: #cbd5e1;
}

.markdown-content code {
    background: #1e293b;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
}

.markdown-content pre {
    background: #1e293b;
    padding: 20px;
    border-radius: 8px;
    overflow-x: auto;
    margin-bottom: 20px;
}

.markdown-content pre code {
    background: none;
    padding: 0;
}

.markdown-content a {
    color: #6366f1;
    text-decoration: none;
}

.markdown-content a:hover {
    text-decoration: underline;
}

.markdown-content strong {
    font-weight: 600;
    color: white;
}

.markdown-content em {
    font-style: italic;
}

@media (max-width: 768px) {
    .sidebar {
        width: 200px;
    }

    .content {
        margin-left: 200px;
        padding: 40px 30px;
    }
}`;
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      const zip = new JSZip();

      // Generate HTML files
      pages.forEach(page => {
        const html = generateHtmlPage(page, pages);
        zip.file(`${page.id}.html`, html);
      });

      // Create index.html as the first page
      if (pages.length > 0) {
        const indexHtml = generateHtmlPage(pages[0], pages);
        zip.file('index.html', indexHtml);
      }

      // Add CSS
      zip.file('style.css', generateCSS());

      // Add README
      zip.file('README.txt', `QubeDocs Export

This is your exported documentation website.

To view:
1. Extract this ZIP file
2. Open index.html in your web browser

All pages are linked in the sidebar navigation.
The site works completely offline without any server.

Generated on ${new Date().toLocaleString()}
`);

      // Generate and download ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qubedocs-export.zip';
      a.click();
      URL.revokeObjectURL(url);

      setTimeout(() => {
        setExporting(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Export failed:', error);
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Export Documentation
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Export your documentation as a static HTML website. The exported files will work offline and can be hosted anywhere.
        </p>

        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Export includes:</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• {pages.length} HTML pages</li>
            <li>• Complete CSS styling</li>
            <li>• Sidebar navigation</li>
            <li>• All content and images</li>
          </ul>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
        >
          {exporting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download ZIP
            </>
          )}
        </button>
      </div>
    </div>
  );
}

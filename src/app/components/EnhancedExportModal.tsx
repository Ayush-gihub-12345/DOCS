import { X, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import JSZip from 'jszip';
import { Page, Category, ProjectSettings } from '../types';

interface EnhancedExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: Page[];
  categories: Category[];
  globalPageIds: string[];
  settings: ProjectSettings;
}

export default function EnhancedExportModal({
  isOpen,
  onClose,
  pages,
  categories,
  globalPageIds,
  settings
}: EnhancedExportModalProps) {
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const extractMetadata = (content: string) => {
    const lines = content.split('\n');
    let title = '';
    let description = '';

    // Extract title from first heading
    for (const line of lines) {
      if (line.startsWith('# ')) {
        title = line.replace('# ', '').trim();
        break;
      }
    }

    // Extract description from first paragraph
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('```') && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
        description = trimmed.substring(0, 160);
        break;
      }
    }

    return { title, description };
  };

  const markdownToHtml = (markdown: string, allPages: Page[]): string => {
    let html = markdown;

    // Convert @page links: [Page Title](#pageId) to actual links
    html = html.replace(/\[([^\]]+)\]\(#([^)]+)\)/g, (match, linkText, pageId) => {
      return `<a href="${pageId}.html" class="internal-link">${linkText}</a>`;
    });

    // Headings
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Code blocks
    html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Lists
    const lines = html.split('\n');
    let inList = false;
    let listType = '';
    const processedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.match(/^\* /)) {
        if (!inList || listType !== 'ul') {
          if (inList) processedLines.push(`</${listType}>`);
          processedLines.push('<ul>');
          inList = true;
          listType = 'ul';
        }
        processedLines.push(`<li>${line.replace(/^\* /, '')}</li>`);
      } else if (line.match(/^\d+\. /)) {
        if (!inList || listType !== 'ol') {
          if (inList) processedLines.push(`</${listType}>`);
          processedLines.push('<ol>');
          inList = true;
          listType = 'ol';
        }
        processedLines.push(`<li>${line.replace(/^\d+\. /, '')}</li>`);
      } else {
        if (inList) {
          processedLines.push(`</${listType}>`);
          inList = false;
        }
        processedLines.push(line);
      }
    }

    if (inList) processedLines.push(`</${listType}>`);
    html = processedLines.join('\n');

    // Paragraphs
    html = html.split('\n\n').map(para => {
      const trimmed = para.trim();
      if (!trimmed) return '';
      if (trimmed.match(/^<[h|u|o|p|l|d]/)) return trimmed;
      return `<p>${trimmed}</p>`;
    }).join('\n');

    return html;
  };

  const generateSidebarHtml = (currentPageId: string): string => {
    const globalPages = globalPageIds.map(id => pages.find(p => p.id === id)).filter(Boolean) as Page[];

    let sidebarHtml = '';

    // Global pages
    if (globalPages.length > 0) {
      globalPages.forEach(page => {
        sidebarHtml += `
          <li class="${currentPageId === page.id ? 'active' : ''}">
            <a href="${page.id}.html">
              <span class="icon">📄</span>
              ${page.title}
            </a>
          </li>
        `;
      });
    }

    // Categories
    categories.forEach(category => {
      const categoryPages = category.pageIds.map(id => pages.find(p => p.id === id)).filter(Boolean) as Page[];

      sidebarHtml += `
        <li class="category">
          <div class="category-header">
            <span class="icon">📁</span>
            ${category.name}
          </div>
          <ul class="category-pages">
            ${categoryPages.map(page => `
              <li class="${currentPageId === page.id ? 'active' : ''}">
                <a href="${page.id}.html">${page.title}</a>
              </li>
            `).join('')}
          </ul>
        </li>
      `;
    });

    return sidebarHtml;
  };

  const generateHtmlPage = (page: Page): string => {
    const htmlContent = markdownToHtml(page.content, pages);
    const metadata = extractMetadata(page.content);
    const sidebarHtml = generateSidebarHtml(page.id);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metadata.title || page.title} - ${settings.name}</title>
    <meta name="description" content="${metadata.description || 'Documentation page'}">
    <meta property="og:title" content="${metadata.title || page.title}">
    <meta property="og:description" content="${metadata.description || 'Documentation page'}">
    <meta name="twitter:card" content="summary">
    <link rel="stylesheet" href="style.css">
    ${settings.logo ? `<link rel="icon" href="logo.png" type="image/png">` : ''}
</head>
<body>
    <div class="layout">
        <nav class="sidebar">
            <div class="sidebar-header">
                ${settings.logo ? `<img src="logo.png" alt="${settings.name}" class="logo">` : ''}
                <h1>${settings.name}</h1>
            </div>
            <div class="search-box">
                <input type="text" id="searchInput" placeholder="Search..." onkeyup="searchDocs()">
            </div>
            <ul class="nav-list">
                ${sidebarHtml}
            </ul>
        </nav>
        <main class="content">
            <article>
                <h1 class="page-title">${page.title}</h1>
                <div class="markdown-content">
                    ${htmlContent}
                </div>
            </article>
        </main>
    </div>
    <script src="search.js"></script>
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
    background: #0f172a;
    color: #e2e8f0;
    line-height: 1.6;
}

.layout {
    display: flex;
    min-height: 100vh;
}

.sidebar {
    width: 280px;
    background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
    border-right: 1px solid #334155;
    padding: 24px 16px;
    position: fixed;
    height: 100vh;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #475569 #1e293b;
}

.sidebar::-webkit-scrollbar {
    width: 8px;
}

.sidebar::-webkit-scrollbar-track {
    background: #1e293b;
}

.sidebar::-webkit-scrollbar-thumb {
    background: #475569;
    border-radius: 4px;
}

.sidebar-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #334155;
}

.sidebar-header .logo {
    width: 40px;
    height: 40px;
    margin-bottom: 12px;
    border-radius: 8px;
}

.sidebar-header h1 {
    font-size: 1.25rem;
    color: #f8fafc;
    font-weight: 600;
}

.search-box {
    margin-bottom: 20px;
}

.search-box input {
    width: 100%;
    padding: 10px 12px;
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 14px;
    transition: all 0.2s;
}

.search-box input:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.nav-list {
    list-style: none;
}

.nav-list > li {
    margin-bottom: 4px;
}

.nav-list a {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    color: #cbd5e1;
    text-decoration: none;
    border-radius: 6px;
    transition: all 0.2s;
    font-size: 14px;
}

.nav-list a:hover {
    background: #334155;
    color: #f8fafc;
}

.nav-list li.active > a {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    font-weight: 500;
}

.nav-list .icon {
    font-size: 16px;
}

.category {
    margin-top: 12px;
}

.category-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    color: #94a3b8;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.category-pages {
    list-style: none;
    margin-left: 12px;
    margin-top: 4px;
}

.category-pages li {
    margin-bottom: 2px;
}

.content {
    flex: 1;
    margin-left: 280px;
    padding: 60px 80px;
    max-width: 1200px;
}

article {
    animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.page-title {
    font-size: 2.5rem;
    margin-bottom: 30px;
    color: white;
    font-weight: 700;
    line-height: 1.2;
}

.markdown-content h1 {
    font-size: 2rem;
    margin-top: 48px;
    margin-bottom: 20px;
    color: white;
    font-weight: 600;
    padding-bottom: 12px;
    border-bottom: 2px solid #334155;
}

.markdown-content h2 {
    font-size: 1.5rem;
    margin-top: 36px;
    margin-bottom: 16px;
    color: white;
    font-weight: 600;
}

.markdown-content h3 {
    font-size: 1.25rem;
    margin-top: 28px;
    margin-bottom: 12px;
    color: #f1f5f9;
    font-weight: 600;
}

.markdown-content h4 {
    font-size: 1.1rem;
    margin-top: 24px;
    margin-bottom: 10px;
    color: #f1f5f9;
    font-weight: 600;
}

.markdown-content p {
    margin-bottom: 18px;
    color: #cbd5e1;
    font-size: 16px;
    line-height: 1.7;
}

.markdown-content ul, .markdown-content ol {
    margin-bottom: 18px;
    padding-left: 28px;
}

.markdown-content li {
    margin-bottom: 8px;
    color: #cbd5e1;
}

.markdown-content code {
    background: #1e293b;
    padding: 3px 8px;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
    font-size: 0.9em;
    color: #e879f9;
    border: 1px solid #334155;
}

.markdown-content pre {
    background: #1e293b;
    padding: 20px;
    border-radius: 8px;
    overflow-x: auto;
    margin-bottom: 24px;
    border: 1px solid #334155;
}

.markdown-content pre code {
    background: none;
    padding: 0;
    border: none;
    color: #e2e8f0;
}

.markdown-content a {
    color: #6366f1;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: all 0.2s;
}

.markdown-content a:hover {
    color: #818cf8;
    border-bottom-color: #818cf8;
}

.markdown-content .internal-link {
    color: #8b5cf6;
    font-weight: 500;
}

.markdown-content .internal-link:hover {
    color: #a78bfa;
    border-bottom-color: #a78bfa;
}

.markdown-content strong {
    font-weight: 600;
    color: white;
}

.markdown-content em {
    font-style: italic;
    color: #e2e8f0;
}

.markdown-content blockquote {
    border-left: 4px solid #6366f1;
    padding-left: 20px;
    margin: 24px 0;
    color: #94a3b8;
    font-style: italic;
}

.markdown-content img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 24px 0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.markdown-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 24px 0;
}

.markdown-content table th,
.markdown-content table td {
    padding: 12px;
    border: 1px solid #334155;
    text-align: left;
}

.markdown-content table th {
    background: #1e293b;
    font-weight: 600;
    color: white;
}

@media (max-width: 1024px) {
    .sidebar {
        width: 240px;
    }
    .content {
        margin-left: 240px;
        padding: 40px 40px;
    }
}

@media (max-width: 768px) {
    .sidebar {
        position: static;
        width: 100%;
        height: auto;
        border-right: none;
        border-bottom: 1px solid #334155;
    }
    .content {
        margin-left: 0;
        padding: 30px 20px;
    }
}`;
  };

  const generateSearchJS = (): string => {
    return `function searchDocs() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const navList = document.querySelector('.nav-list');
    const items = navList.querySelectorAll('li:not(.category)');

    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(filter)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}`;
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      const zip = new JSZip();

      // Generate HTML files
      pages.forEach(page => {
        const html = generateHtmlPage(page);
        zip.file(`${page.id}.html`, html);
      });

      // Create index.html
      if (pages.length > 0) {
        const firstPage = globalPageIds.length > 0
          ? pages.find(p => p.id === globalPageIds[0]) || pages[0]
          : pages[0];
        const indexHtml = generateHtmlPage(firstPage);
        zip.file('index.html', indexHtml);
      }

      // Add CSS and JS
      zip.file('style.css', generateCSS());
      zip.file('search.js', generateSearchJS());

      // Add logo if exists
      if (settings.logo) {
        const logoData = settings.logo.split(',')[1];
        zip.file('logo.png', logoData, { base64: true });
      }

      // Add README
      zip.file('README.md', `# ${settings.name}

This is your exported documentation website.

## Viewing Documentation

1. Extract this ZIP file
2. Open \`index.html\` in your web browser

## Features

- ✅ Responsive design
- ✅ Search functionality
- ✅ Internal page linking
- ✅ SEO optimized with meta tags
- ✅ Works completely offline

## Structure

- \`*.html\` - Documentation pages
- \`style.css\` - Stylesheet
- \`search.js\` - Search functionality
${settings.logo ? '- `logo.png` - Project logo\n' : ''}

Generated with QubeDocs on ${new Date().toLocaleString()}
`);

      // Generate and download ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${settings.name.toLowerCase().replace(/\s+/g, '-')}-docs.zip`;
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
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

        <div className="p-6 space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Export your documentation as a production-ready static website with SEO optimization and search functionality.
          </p>

          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-3">
              ✨ What's included:
            </h3>
            <ul className="text-sm text-indigo-800 dark:text-indigo-300 space-y-2">
              <li>• {pages.length} documentation pages</li>
              <li>• {categories.length} categories organized</li>
              <li>• Search functionality built-in</li>
              <li>• SEO meta tags (title & description)</li>
              <li>• Internal page linking (@page links)</li>
              <li>• Responsive design for all devices</li>
              <li>• Professional styling & animations</li>
              {settings.logo && <li>• Custom logo included</li>}
            </ul>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Project: {settings.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The exported site works offline and can be hosted on any static hosting service (Vercel, Netlify, GitHub Pages, etc.)
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 shadow-lg"
          >
            {exporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Export Documentation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

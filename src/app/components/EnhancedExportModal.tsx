import { X, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import JSZip from 'jszip';
import { Page, Category, ProjectSettings } from '../types';
import { getThemeById, Theme } from '../themes';

interface EnhancedExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: Page[];
  categories: Category[];
  globalPageIds: string[];
  settings: ProjectSettings;
  currentTheme: string;
}

export default function EnhancedExportModal({
  isOpen,
  onClose,
  pages,
  categories,
  globalPageIds,
  settings,
  currentTheme
}: EnhancedExportModalProps) {
  const [exporting, setExporting] = useState(false);
  const theme = getThemeById(currentTheme);

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

  const generateSocialBadges = (): string => {
    if (!settings.socialLinks) return '';

    const badges = [];
    if (settings.socialLinks.github) {
      badges.push(`<a href="${settings.socialLinks.github}" target="_blank" rel="noopener" class="social-badge" title="GitHub">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
      </a>`);
    }
    if (settings.socialLinks.twitter) {
      badges.push(`<a href="${settings.socialLinks.twitter}" target="_blank" rel="noopener" class="social-badge" title="Twitter">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>`);
    }
    if (settings.socialLinks.discord) {
      badges.push(`<a href="${settings.socialLinks.discord}" target="_blank" rel="noopener" class="social-badge" title="Discord">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
      </a>`);
    }
    if (settings.socialLinks.website) {
      badges.push(`<a href="${settings.socialLinks.website}" target="_blank" rel="noopener" class="social-badge" title="Website">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
      </a>`);
    }

    return badges.join('');
  };

  const generateHtmlPage = (page: Page): string => {
    const htmlContent = markdownToHtml(page.content, pages);
    const metadata = extractMetadata(page.content);
    const sidebarHtml = generateSidebarHtml(page.id);
    const socialBadges = generateSocialBadges();

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
    <header class="top-header">
        <div class="header-left">
            ${settings.logo ? `<img src="logo.png" alt="${settings.name}" class="header-logo">` : ''}
            <span class="header-title">${settings.name}</span>
        </div>
        <div class="header-center">
            <input type="text" id="headerSearch" placeholder="Search documentation..." onkeyup="searchDocs()">
        </div>
        <div class="header-right">
            ${socialBadges}
        </div>
    </header>
    <div class="layout">
        <nav class="sidebar">
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
    const t = theme.colors;
    return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
    background: ${t.background};
    color: ${t.text};
    line-height: 1.6;
    padding-top: 64px;
}

.top-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: ${t.surface};
    border-bottom: 1px solid ${t.border};
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    z-index: 1000;
    backdrop-filter: blur(10px);
}

.header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 0 0 auto;
}

.header-logo {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    object-fit: contain;
}

.header-title {
    font-size: 18px;
    font-weight: 600;
    color: ${t.text};
}

.header-center {
    flex: 1;
    max-width: 500px;
    margin: 0 24px;
}

.header-center input {
    width: 100%;
    padding: 10px 16px;
    background: ${t.background};
    border: 1px solid ${t.border};
    border-radius: 8px;
    color: ${t.text};
    font-size: 14px;
    transition: all 0.2s;
}

.header-center input:focus {
    outline: none;
    border-color: ${t.primary};
    box-shadow: 0 0 0 3px ${t.primary}20;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
}

.social-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: ${t.surfaceHover};
    color: ${t.textSecondary};
    transition: all 0.2s;
    text-decoration: none;
}

.social-badge:hover {
    background: ${t.primary};
    color: white;
    transform: translateY(-2px);
}

.layout {
    display: flex;
    min-height: calc(100vh - 64px);
}

.sidebar {
    width: 280px;
    background: ${t.surface};
    border-right: 1px solid ${t.border};
    padding: 24px 16px;
    position: fixed;
    top: 64px;
    bottom: 0;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: ${t.border} ${t.surface};
}

.sidebar::-webkit-scrollbar {
    width: 8px;
}

.sidebar::-webkit-scrollbar-track {
    background: ${t.surface};
}

.sidebar::-webkit-scrollbar-thumb {
    background: ${t.border};
    border-radius: 4px;
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
    color: ${t.textSecondary};
    text-decoration: none;
    border-radius: 6px;
    transition: all 0.2s;
    font-size: 14px;
}

.nav-list a:hover {
    background: ${t.surfaceHover};
    color: ${t.text};
}

.nav-list li.active > a {
    background: linear-gradient(135deg, ${t.primary} 0%, ${t.accent} 100%);
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
    color: ${t.textSecondary};
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
    color: ${t.text};
    font-weight: 700;
    line-height: 1.2;
}

.markdown-content h1 {
    font-size: 2rem;
    margin-top: 48px;
    margin-bottom: 20px;
    color: ${t.text};
    font-weight: 600;
    padding-bottom: 12px;
    border-bottom: 2px solid ${t.border};
}

.markdown-content h2 {
    font-size: 1.5rem;
    margin-top: 36px;
    margin-bottom: 16px;
    color: ${t.text};
    font-weight: 600;
}

.markdown-content h3 {
    font-size: 1.25rem;
    margin-top: 28px;
    margin-bottom: 12px;
    color: ${t.text};
    font-weight: 600;
}

.markdown-content h4 {
    font-size: 1.1rem;
    margin-top: 24px;
    margin-bottom: 10px;
    color: ${t.text};
    font-weight: 600;
}

.markdown-content p {
    margin-bottom: 18px;
    color: ${t.textSecondary};
    font-size: 16px;
    line-height: 1.7;
}

.markdown-content ul, .markdown-content ol {
    margin-bottom: 18px;
    padding-left: 28px;
}

.markdown-content li {
    margin-bottom: 8px;
    color: ${t.textSecondary};
}

.markdown-content code {
    background: ${t.code};
    padding: 3px 8px;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
    font-size: 0.9em;
    color: ${t.accent};
    border: 1px solid ${t.border};
}

.markdown-content pre {
    background: ${t.code};
    padding: 20px;
    border-radius: 8px;
    overflow-x: auto;
    margin-bottom: 24px;
    border: 1px solid ${t.border};
}

.markdown-content pre code {
    background: none;
    padding: 0;
    border: none;
    color: ${t.text};
}

.markdown-content a {
    color: ${t.primary};
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: all 0.2s;
}

.markdown-content a:hover {
    color: ${t.primaryHover};
    border-bottom-color: ${t.primaryHover};
}

.markdown-content .internal-link {
    color: ${t.accent};
    font-weight: 500;
}

.markdown-content .internal-link:hover {
    color: ${t.primary};
    border-bottom-color: ${t.primary};
}

.markdown-content strong {
    font-weight: 600;
    color: ${t.text};
}

.markdown-content em {
    font-style: italic;
    color: ${t.text};
}

.markdown-content blockquote {
    border-left: 4px solid ${t.primary};
    padding-left: 20px;
    margin: 24px 0;
    color: ${t.textSecondary};
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
    border: 1px solid ${t.border};
    text-align: left;
}

.markdown-content table th {
    background: ${t.surface};
    font-weight: 600;
    color: ${t.text};
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
    .top-header {
        height: 56px;
        padding: 0 16px;
    }
    .header-center {
        display: none;
    }
    .sidebar {
        position: static;
        width: 100%;
        height: auto;
        border-right: none;
        border-bottom: 1px solid ${t.border};
    }
    .content {
        margin-left: 0;
        padding: 30px 20px;
    }
}`;
  };

  const generateSearchJS = (): string => {
    return `function searchDocs() {
    const input = document.getElementById('headerSearch');
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

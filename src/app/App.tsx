import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import EnhancedSidebar from './components/EnhancedSidebar';
import EnhancedEditor from './components/EnhancedEditor';
import Preview from './components/Preview';
import EnhancedExportModal from './components/EnhancedExportModal';
import SearchModal from './components/SearchModal';
import SettingsModal from './components/SettingsModal';
import TrashModal from './components/TrashModal';
import ConfirmDialog from './components/ConfirmDialog';
import ThemeSelector from './components/ThemeSelector';
import { Page, Category, DocsData } from './types';
import { applyTheme, getThemeById } from './themes';

const STORAGE_KEY = 'qubedocs-data';

const initialPages: Page[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    content: `# Welcome to QubeDocs

QubeDocs is a modern documentation builder that helps you create beautiful documentation with ease.

## Features

- **Markdown Support**: Write documentation using simple Markdown syntax
- **Live Preview**: See your changes in real-time
- **Export to HTML**: Generate static HTML files for easy deployment
- **Dark Mode**: Built-in theme support for comfortable writing

## Getting Started

1. Create a new page using the sidebar
2. Write your content in Markdown
3. Preview your documentation in real-time
4. Export when you're ready!

Start editing this page or create a new one to begin.`
  },
  {
    id: 'installation',
    title: 'Installation',
    content: `# Installation Guide

Get started with your project quickly and easily.

## Prerequisites

Before you begin, make sure you have:

- Node.js 16 or higher
- npm or yarn package manager
- A code editor (VS Code recommended)

## Quick Start

\`\`\`bash
npm install your-package
npm start
\`\`\`

## Configuration

Create a \`config.json\` file in your project root:

\`\`\`json
{
  "name": "my-project",
  "version": "1.0.0"
}
\`\`\``
  },
  {
    id: 'api',
    title: 'API Reference',
    content: `# API Reference

Complete API documentation for developers.

## Authentication

All API requests require authentication using an API key:

\`\`\`javascript
const response = await fetch('https://api.example.com/data', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
\`\`\`

## Endpoints

### GET /api/users

Retrieve a list of users.

**Response:**

\`\`\`json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe"
    }
  ]
}
\`\`\`

### POST /api/users

Create a new user.`
  }
];

export default function App() {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [categories, setCategories] = useState<Category[]>([]);
  const [globalPageIds, setGlobalPageIds] = useState<string[]>(['introduction', 'installation', 'api']);
  const [activePage, setActivePage] = useState<string>('introduction');
  const [settings, setSettings] = useState({ name: 'QubeDocs', logo: '' });
  const [deletedPages, setDeletedPages] = useState<Page[]>([]);
  const [currentTheme, setCurrentTheme] = useState('midnight');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data: DocsData = JSON.parse(saved);
        setPages(data.pages || initialPages);
        setCategories(data.categories || []);
        setGlobalPageIds(data.globalPageIds || ['introduction', 'installation', 'api']);
        setSettings(data.settings || { name: 'QubeDocs', logo: '' });
        setDeletedPages(data.deletedPages || []);
        setCurrentTheme(data.currentTheme || 'midnight');
        setActivePage(data.pages?.[0]?.id || 'introduction');
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, []);

  // Apply theme on mount and when it changes
  useEffect(() => {
    const theme = getThemeById(currentTheme);
    applyTheme(theme);
  }, [currentTheme]);

  // Auto-save to localStorage
  useEffect(() => {
    if (pages.length === 0) return;

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      const data: DocsData = {
        pages,
        categories,
        globalPageIds,
        settings,
        deletedPages,
        currentTheme
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSaveStatus('saved');
    }, 1000);

    return () => clearTimeout(timer);
  }, [pages, categories, globalPageIds, settings, deletedPages, currentTheme]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
      // Cmd/Ctrl + , for settings
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setIsSettingsModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getCurrentPage = useCallback(() => {
    return pages.find(p => p.id === activePage) || pages[0];
  }, [pages, activePage]);

  const handleAddPage = (categoryId?: string) => {
    const newPage: Page = {
      id: `page-${Date.now()}`,
      title: 'New Page',
      content: '# New Page\n\nStart writing your content here...'
    };
    setPages([...pages, newPage]);

    if (categoryId) {
      setCategories(categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, pageIds: [...cat.pageIds, newPage.id] }
          : cat
      ));
    } else {
      setGlobalPageIds([...globalPageIds, newPage.id]);
    }

    setActivePage(newPage.id);
    setSaveStatus('unsaved');
  };

  const handleAddCategory = () => {
    const newCategory: Category = {
      id: `category-${Date.now()}`,
      name: 'New Category',
      isExpanded: true,
      pageIds: []
    };
    setCategories([...categories, newCategory]);
    setSaveStatus('unsaved');
  };

  const handleDeleteCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Category?',
      message: `Are you sure you want to delete "${category.name}"? Pages in this category will be moved to the global section.`,
      onConfirm: () => {
        // Move pages to global
        setGlobalPageIds([...globalPageIds, ...category.pageIds]);
        setCategories(categories.filter(c => c.id !== id));
        setSaveStatus('unsaved');
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleRenameCategory = (id: string, name: string) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, name } : cat
    ));
    setSaveStatus('unsaved');
  };

  const handleToggleCategory = (id: string) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, isExpanded: !cat.isExpanded } : cat
    ));
  };

  const handleDeletePage = (id: string) => {
    if (pages.length === 1) {
      alert('Cannot delete the last page');
      return;
    }

    const page = pages.find(p => p.id === id);
    if (!page) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Move to Trash?',
      message: `Are you sure you want to delete "${page.title}"? You can restore it from trash later.`,
      onConfirm: () => {
        // Move page to trash
        setDeletedPages([...deletedPages, page]);

        // Remove from pages
        const newPages = pages.filter(p => p.id !== id);
        setPages(newPages);

        // Remove from global pages
        setGlobalPageIds(globalPageIds.filter(pageId => pageId !== id));

        // Remove from categories
        setCategories(categories.map(cat => ({
          ...cat,
          pageIds: cat.pageIds.filter(pageId => pageId !== id)
        })));

        if (activePage === id) {
          setActivePage(newPages[0]?.id || '');
        }
        setSaveStatus('unsaved');
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleBulkDelete = (pageIds: string[]) => {
    if (pageIds.length === 0) return;

    if (pages.length === pageIds.length) {
      alert('Cannot delete all pages');
      return;
    }

    const pagesToDelete = pages.filter(p => pageIds.includes(p.id));

    setConfirmDialog({
      isOpen: true,
      title: 'Move to Trash?',
      message: `Are you sure you want to delete ${pageIds.length} page(s)? You can restore them from trash later.`,
      onConfirm: () => {
        // Move pages to trash
        setDeletedPages([...deletedPages, ...pagesToDelete]);

        // Remove from pages
        const newPages = pages.filter(p => !pageIds.includes(p.id));
        setPages(newPages);

        // Remove from global pages
        setGlobalPageIds(globalPageIds.filter(pageId => !pageIds.includes(pageId)));

        // Remove from categories
        setCategories(categories.map(cat => ({
          ...cat,
          pageIds: cat.pageIds.filter(pageId => !pageIds.includes(pageId))
        })));

        if (pageIds.includes(activePage)) {
          setActivePage(newPages[0]?.id || '');
        }
        setSaveStatus('unsaved');
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleRestorePage = (pageId: string) => {
    const page = deletedPages.find(p => p.id === pageId);
    if (!page) return;

    // Restore to pages and global
    setPages([...pages, page]);
    setGlobalPageIds([...globalPageIds, page.id]);

    // Remove from trash
    setDeletedPages(deletedPages.filter(p => p.id !== pageId));

    setSaveStatus('unsaved');
  };

  const handlePermanentDelete = (pageId: string) => {
    const page = deletedPages.find(p => p.id === pageId);
    if (!page) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Permanently Delete?',
      message: `Are you sure you want to permanently delete "${page.title}"? This action cannot be undone.`,
      onConfirm: () => {
        setDeletedPages(deletedPages.filter(p => p.id !== pageId));
        setSaveStatus('unsaved');
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleRenamePage = (id: string, title: string) => {
    setPages(pages.map(p => p.id === id ? { ...p, title } : p));
    setSaveStatus('unsaved');
  };

  const handleTitleChange = (title: string) => {
    setPages(pages.map(p => p.id === activePage ? { ...p, title } : p));
    setSaveStatus('unsaved');
  };

  const handleContentChange = (content: string) => {
    setPages(pages.map(p => p.id === activePage ? { ...p, content } : p));
    setSaveStatus('unsaved');
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const imageMarkdown = `\n![${file.name}](${imageUrl})\n`;
      const currentPage = getCurrentPage();
      handleContentChange(currentPage.content + imageMarkdown);
    };
    reader.readAsDataURL(file);
  };

  const currentPage = getCurrentPage();

  if (!currentPage) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No pages found
          </h1>
          <button
            onClick={() => handleAddPage()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Create First Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      <Navbar
        onExport={() => setIsExportModalOpen(true)}
        onSearch={() => setIsSearchModalOpen(true)}
        onSettings={() => setIsSettingsModalOpen(true)}
        onTrash={() => setIsTrashModalOpen(true)}
        saveStatus={saveStatus}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        trashCount={deletedPages.length}
      />

      <div className="flex-1 flex overflow-hidden">
        <EnhancedSidebar
          pages={pages}
          categories={categories}
          globalPageIds={globalPageIds}
          activePage={activePage}
          settings={settings}
          onSelectPage={setActivePage}
          onAddPage={handleAddPage}
          onDeletePage={handleDeletePage}
          onRenamePage={handleRenamePage}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          onRenameCategory={handleRenameCategory}
          onToggleCategory={handleToggleCategory}
          onBulkDelete={handleBulkDelete}
        />

        <EnhancedEditor
          title={currentPage.title}
          content={currentPage.content}
          pages={pages}
          onTitleChange={handleTitleChange}
          onContentChange={handleContentChange}
          onImageUpload={handleImageUpload}
        />

        <div className="hidden xl:block">
          <Preview content={currentPage.content} />
        </div>
      </div>

      <EnhancedExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        pages={pages}
        categories={categories}
        globalPageIds={globalPageIds}
        settings={settings}
        currentTheme={currentTheme}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        pages={pages}
        categories={categories}
        onSelectPage={(pageId) => {
          setActivePage(pageId);
          setIsSearchModalOpen(false);
        }}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={(newSettings) => {
          setSettings(newSettings);
          setSaveStatus('unsaved');
        }}
      />

      <TrashModal
        isOpen={isTrashModalOpen}
        onClose={() => setIsTrashModalOpen(false)}
        deletedPages={deletedPages}
        onRestore={handleRestorePage}
        onPermanentDelete={handlePermanentDelete}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        variant="danger"
      />
    </div>
  );
}
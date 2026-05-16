import { Plus, Trash2, FileText, Folder, ChevronRight, ChevronDown, FolderPlus, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { Page, Category, ProjectSettings } from '../types';

interface EnhancedSidebarProps {
  pages: Page[];
  categories: Category[];
  globalPageIds: string[];
  activePage: string;
  settings: ProjectSettings;
  onSelectPage: (id: string) => void;
  onAddPage: (categoryId?: string) => void;
  onDeletePage: (id: string) => void;
  onRenamePage: (id: string, title: string) => void;
  onAddCategory: () => void;
  onDeleteCategory: (id: string) => void;
  onRenameCategory: (id: string, name: string) => void;
  onToggleCategory: (id: string) => void;
}

export default function EnhancedSidebar({
  pages,
  categories,
  globalPageIds,
  activePage,
  settings,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onRenamePage,
  onAddCategory,
  onDeleteCategory,
  onRenameCategory,
  onToggleCategory
}: EnhancedSidebarProps) {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  const startEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const finishEditCategory = (categoryId: string) => {
    if (editingCategoryName.trim()) {
      onRenameCategory(categoryId, editingCategoryName.trim());
    }
    setEditingCategoryId(null);
  };

  const getPageById = (id: string) => pages.find(p => p.id === id);

  return (
    <div className="w-72 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
      {/* Header with Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          {settings.logo ? (
            <img src={settings.logo} alt={settings.name} className="w-8 h-8 rounded-lg object-contain" />
          ) : (
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {settings.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {settings.name}
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onAddPage()}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Page
          </button>
          <button
            onClick={onAddCategory}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            <FolderPlus className="w-4 h-4" />
            Category
          </button>
        </div>
      </div>

      {/* Pages Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {/* Global Pages */}
          {globalPageIds.map(pageId => {
            const page = getPageById(pageId);
            if (!page) return null;
            return (
              <PageItem
                key={page.id}
                page={page}
                isActive={activePage === page.id}
                onSelect={onSelectPage}
                onRename={onRenamePage}
                onDelete={onDeletePage}
              />
            );
          })}

          {/* Categories */}
          {categories.map(category => (
            <div key={category.id} className="mt-2">
              <div className="group flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <button
                  onClick={() => onToggleCategory(category.id)}
                  className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  {category.isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
                <Folder className="w-4 h-4 text-indigo-600 flex-shrink-0" />

                {editingCategoryId === category.id ? (
                  <input
                    type="text"
                    value={editingCategoryName}
                    onChange={e => setEditingCategoryName(e.target.value)}
                    onBlur={() => finishEditCategory(category.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') finishEditCategory(category.id);
                      if (e.key === 'Escape') setEditingCategoryId(null);
                    }}
                    className="flex-1 bg-white dark:bg-gray-800 border border-indigo-500 rounded px-1 py-0.5 text-sm font-medium outline-none"
                    autoFocus
                  />
                ) : (
                  <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {category.name}
                  </span>
                )}

                <button
                  onClick={() => startEditCategory(category)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
                  title="Rename category"
                >
                  <Edit2 className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => onAddPage(category.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 rounded transition-opacity"
                  title="Add page to category"
                >
                  <Plus className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                </button>
                <button
                  onClick={() => onDeleteCategory(category.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-opacity"
                  title="Delete category"
                >
                  <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                </button>
              </div>

              {/* Category Pages */}
              {category.isExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {category.pageIds.map(pageId => {
                    const page = getPageById(pageId);
                    if (!page) return null;
                    return (
                      <PageItem
                        key={page.id}
                        page={page}
                        isActive={activePage === page.id}
                        onSelect={onSelectPage}
                        onRename={onRenamePage}
                        onDelete={onDeletePage}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface PageItemProps {
  page: Page;
  isActive: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

function PageItem({ page, isActive, onSelect, onRename, onDelete }: PageItemProps) {
  return (
    <div
      className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
      }`}
    >
      <FileText className="w-4 h-4 flex-shrink-0" />
      <input
        type="text"
        value={page.title}
        onChange={e => onRename(page.id, e.target.value)}
        onClick={() => onSelect(page.id)}
        className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
      />
      <button
        onClick={e => {
          e.stopPropagation();
          onDelete(page.id);
        }}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-opacity"
        title="Delete page"
      >
        <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
      </button>
    </div>
  );
}

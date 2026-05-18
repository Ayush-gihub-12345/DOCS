import { Plus, Trash2, Folder, ChevronRight, ChevronDown, FolderPlus, Edit2, X, Menu, CheckSquare, Square } from 'lucide-react';
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
  onBulkDelete?: (pageIds: string[]) => void;
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
  onToggleCategory,
  onBulkDelete
}: EnhancedSidebarProps) {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);

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

  const togglePageSelection = (pageId: string) => {
    setSelectedPageIds(prev =>
      prev.includes(pageId)
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    );
  };

  const handleBulkDelete = () => {
    if (selectedPageIds.length > 0 && onBulkDelete) {
      onBulkDelete(selectedPageIds);
      setSelectedPageIds([]);
      setBulkSelectMode(false);
    }
  };

  const selectAll = () => {
    const allPageIds = [...globalPageIds, ...categories.flatMap(cat => cat.pageIds)];
    setSelectedPageIds(allPageIds);
  };

  const deselectAll = () => {
    setSelectedPageIds([]);
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        w-72 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col
        lg:relative fixed inset-y-0 left-0 z-40 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header with Logo */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            {/* Close button for mobile */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <X className="w-5 h-5" />
            </button>

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

          {/* Bulk Select Mode Controls */}
          {bulkSelectMode ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAll}
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Deselect
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedPageIds.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete ({selectedPageIds.length})
                </button>
                <button
                  onClick={() => {
                    setBulkSelectMode(false);
                    setSelectedPageIds([]);
                  }}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
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
              <button
                onClick={() => setBulkSelectMode(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                <CheckSquare className="w-4 h-4" />
                Bulk Select
              </button>
            </div>
          )}
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
                bulkSelectMode={bulkSelectMode}
                isSelected={selectedPageIds.includes(page.id)}
                onToggleSelection={togglePageSelection}
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
                        bulkSelectMode={bulkSelectMode}
                        isSelected={selectedPageIds.includes(page.id)}
                        onToggleSelection={togglePageSelection}
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
    </>
  );
}

interface PageItemProps {
  page: Page;
  isActive: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  bulkSelectMode: boolean;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
}

function PageItem({ page, isActive, onSelect, onRename, onDelete, bulkSelectMode, isSelected, onToggleSelection }: PageItemProps) {
  return (
    <div
      className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        isActive && !bulkSelectMode
          ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
          : isSelected && bulkSelectMode
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
      }`}
      onClick={() => {
        if (bulkSelectMode) {
          onToggleSelection(page.id);
        }
      }}
    >
      {bulkSelectMode ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelection(page.id);
          }}
          className="flex-shrink-0"
        >
          {isSelected ? (
            <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <Square className="w-4 h-4 text-gray-400" />
          )}
        </button>
      ) : (
        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
      )}
      <input
        type="text"
        value={page.title}
        onChange={e => onRename(page.id, e.target.value)}
        onClick={(e) => {
          if (!bulkSelectMode) {
            onSelect(page.id);
          } else {
            e.preventDefault();
          }
        }}
        disabled={bulkSelectMode}
        className="flex-1 bg-transparent border-none outline-none text-sm font-medium disabled:cursor-pointer"
      />
      {!bulkSelectMode && (
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
      )}
    </div>
  );
}

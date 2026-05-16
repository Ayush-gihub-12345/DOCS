import { Plus, Trash2, FileText } from 'lucide-react';

export interface Page {
  id: string;
  title: string;
  content: string;
}

interface SidebarProps {
  pages: Page[];
  activePage: string;
  onSelectPage: (id: string) => void;
  onAddPage: () => void;
  onDeletePage: (id: string) => void;
  onRenamePage: (id: string, title: string) => void;
}

export default function Sidebar({
  pages,
  activePage,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onRenamePage
}: SidebarProps) {
  return (
    <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={onAddPage}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Page
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {pages.map((page) => (
            <div
              key={page.id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activePage === page.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              <input
                type="text"
                value={page.title}
                onChange={(e) => onRenamePage(page.id, e.target.value)}
                onClick={() => onSelectPage(page.id)}
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePage(page.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-opacity"
                aria-label="Delete page"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

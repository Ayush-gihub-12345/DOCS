import { Download, Save, Search, Settings, Trash2 } from 'lucide-react';
import ThemeSelector from './ThemeSelector';

interface NavbarProps {
  onExport: () => void;
  onSearch: () => void;
  onSettings: () => void;
  onTrash: () => void;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  trashCount: number;
}

export default function Navbar({
  onExport,
  onSearch,
  onSettings,
  onTrash,
  saveStatus,
  currentTheme,
  onThemeChange,
  trashCount
}: NavbarProps) {
  const saveStatusText = {
    saved: 'Saved',
    saving: 'Saving...',
    unsaved: 'Unsaved changes'
  };

  return (
    <nav className="h-[60px] border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-50 flex items-center justify-between px-3 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-6">
        <button
          onClick={onSearch}
          className="flex items-center gap-2 px-2 sm:px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
        >
          <Search className="w-4 h-4" />
          <span className="hidden md:inline">Search documentation...</span>
          <span className="md:hidden">Search</span>
          <kbd className="hidden lg:inline-block px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">⌘K</kbd>
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Save className="w-4 h-4" />
          <span>{saveStatusText[saveStatus]}</span>
        </div>

        <button
          onClick={onTrash}
          className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Trash"
        >
          <Trash2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          {trashCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {trashCount}
            </span>
          )}
        </button>

        <button
          onClick={onSettings}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Settings (⌘,)"
        >
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />

        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all text-sm font-medium shadow-lg"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </nav>
  );
}

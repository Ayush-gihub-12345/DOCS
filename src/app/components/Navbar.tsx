import { Moon, Sun, Download, Save, Search, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavbarProps {
  onExport: () => void;
  onSearch: () => void;
  onSettings: () => void;
  saveStatus: 'saved' | 'saving' | 'unsaved';
}

export default function Navbar({ onExport, onSearch, onSettings, saveStatus }: NavbarProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('qubedocs-theme') as 'light' | 'dark' || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('qubedocs-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const saveStatusText = {
    saved: 'Saved',
    saving: 'Saving...',
    unsaved: 'Unsaved changes'
  };

  return (
    <nav className="h-[60px] border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <button
          onClick={onSearch}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
        >
          <Search className="w-4 h-4" />
          <span>Search documentation...</span>
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">⌘K</kbd>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">{saveStatusText[saveStatus]}</span>
        </div>

        <button
          onClick={onSettings}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Settings (⌘,)"
        >
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>

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

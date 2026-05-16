import { Search, FileText, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Page, Category } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: Page[];
  categories: Category[];
  onSelectPage: (pageId: string) => void;
}

export default function SearchModal({
  isOpen,
  onClose,
  pages,
  categories,
  onSelectPage
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Page[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults = pages.filter(page => {
      const searchText = query.toLowerCase();
      return (
        page.title.toLowerCase().includes(searchText) ||
        page.content.toLowerCase().includes(searchText)
      );
    });

    setResults(searchResults.slice(0, 10));
    setSelectedIndex(0);
  }, [query, pages]);

  const getCategoryName = (pageId: string): string => {
    const category = categories.find(cat => cat.pageIds.includes(pageId));
    return category ? category.name : 'Global';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex].id);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (pageId: string) => {
    onSelectPage(pageId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[10vh] z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search documentation... (press Escape to close)"
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 text-lg"
          />
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {query && (
          <div className="max-h-[400px] overflow-y-auto">
            {results.length > 0 ? (
              <div className="p-2">
                {results.map((page, index) => (
                  <button
                    key={page.id}
                    onClick={() => handleSelect(page.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                      index === selectedIndex
                        ? 'bg-indigo-50 dark:bg-indigo-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white mb-1">
                        {page.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {page.content.substring(0, 150)}...
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        in {getCategoryName(page.id)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No results found for "{query}"
              </div>
            )}
          </div>
        )}

        {!query && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Start typing to search documentation</p>
            <p className="text-sm mt-2">Use ↑ ↓ to navigate, Enter to select</p>
          </div>
        )}
      </div>
    </div>
  );
}

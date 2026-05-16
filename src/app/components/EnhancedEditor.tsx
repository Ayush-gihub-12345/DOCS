import { useRef, useState, useEffect } from 'react';
import Toolbar from './Toolbar';
import { Page } from '../types';

interface EnhancedEditorProps {
  title: string;
  content: string;
  pages: Page[];
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onImageUpload: (file: File) => void;
}

export default function EnhancedEditor({
  title,
  content,
  pages,
  onTitleChange,
  onContentChange,
  onImageUpload
}: EnhancedEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Page[]>([]);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [atSymbolPosition, setAtSymbolPosition] = useState(-1);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleInput = () => {
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = content.substring(0, cursorPosition);
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');

      if (lastAtIndex !== -1) {
        const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
        const hasSpace = textAfterAt.includes(' ') || textAfterAt.includes('\n');

        if (!hasSpace) {
          const searchQuery = textAfterAt.toLowerCase();
          const filtered = pages.filter(page =>
            page.title.toLowerCase().includes(searchQuery)
          );

          if (filtered.length > 0) {
            setAtSymbolPosition(lastAtIndex);
            setSuggestions(filtered.slice(0, 5));
            setSelectedSuggestionIndex(0);
            setShowSuggestions(true);

            // Calculate position
            const lines = textBeforeCursor.split('\n');
            const currentLine = lines.length;
            const lineHeight = 24; // Approximate line height
            const top = currentLine * lineHeight + 100;
            setSuggestionPosition({ top, left: 20 });
            return;
          }
        }
      }

      setShowSuggestions(false);
    };

    textarea.addEventListener('input', handleInput);
    return () => textarea.removeEventListener('input', handleInput);
  }, [content, pages]);

  const handleInsert = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + text + content.substring(end);
    onContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSuggestionSelect = (page: Page) => {
    const textarea = textareaRef.current;
    if (!textarea || atSymbolPosition === -1) return;

    const cursorPosition = textarea.selectionStart;
    const beforeAt = content.substring(0, atSymbolPosition);
    const afterCursor = content.substring(cursorPosition);

    const newContent = beforeAt + `[${page.title}](#${page.id})` + afterCursor;
    onContentChange(newContent);
    setShowSuggestions(false);

    setTimeout(() => {
      textarea.focus();
      const newPosition = beforeAt.length + page.title.length + 4 + page.id.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => Math.min(prev + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && suggestions[selectedSuggestionIndex]) {
        e.preventDefault();
        handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 relative">
      <Toolbar onInsert={handleInsert} onImageUpload={handleImageUploadClick} />

      <div className="p-6 flex-1 flex flex-col overflow-hidden">
        <input
          type="text"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="Page Title"
          className="text-3xl font-bold mb-4 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
        />

        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => onContentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          placeholder="Start writing your documentation here...

Tip: Type @ to link to other pages"
          className="flex-1 bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400 resize-none font-mono text-sm leading-relaxed"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Autocomplete Suggestions */}
      {showSuggestions && (
        <div
          className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden"
          style={{ top: suggestionPosition.top, left: suggestionPosition.left, minWidth: '250px' }}
        >
          {suggestions.map((page, index) => (
            <button
              key={page.id}
              onClick={() => handleSuggestionSelect(page)}
              className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                index === selectedSuggestionIndex
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {page.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

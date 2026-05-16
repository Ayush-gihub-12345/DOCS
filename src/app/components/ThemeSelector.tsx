import { Palette, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { themes, Theme } from '../themes';

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
}

export default function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentThemeObj = themes.find(t => t.id === currentTheme) || themes[0];
  const darkThemes = themes.filter(t => t.type === 'dark');
  const lightThemes = themes.filter(t => t.type === 'light');

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title="Change theme"
      >
        <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <span className="text-sm text-gray-700 dark:text-gray-300 hidden lg:inline">
          {currentThemeObj.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Choose Theme
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {/* Dark Themes */}
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 py-1">
                Dark Themes
              </div>
              {darkThemes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => {
                    onThemeChange(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    currentTheme === theme.id
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`
                      }}
                    />
                    <span className="text-sm font-medium">{theme.name}</span>
                  </div>
                  {currentTheme === theme.id && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>

            {/* Light Themes */}
            <div className="p-2 border-t border-gray-200 dark:border-gray-800">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 py-1">
                Light Themes
              </div>
              {lightThemes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => {
                    onThemeChange(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    currentTheme === theme.id
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`
                      }}
                    />
                    <span className="text-sm font-medium">{theme.name}</span>
                  </div>
                  {currentTheme === theme.id && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

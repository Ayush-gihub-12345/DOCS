export interface Theme {
  id: string;
  name: string;
  type: 'light' | 'dark';
  colors: {
    background: string;
    surface: string;
    surfaceHover: string;
    border: string;
    text: string;
    textSecondary: string;
    primary: string;
    primaryHover: string;
    accent: string;
    danger: string;
    success: string;
    warning: string;
    code: string;
  };
}

export const themes: Theme[] = [
  // Dark Themes
  {
    id: 'midnight',
    name: 'Midnight',
    type: 'dark',
    colors: {
      background: '#0f172a',
      surface: '#1e293b',
      surfaceHover: '#334155',
      border: '#475569',
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      primary: '#6366f1',
      primaryHover: '#4f46e5',
      accent: '#8b5cf6',
      danger: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b',
      code: '#1e293b'
    }
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    type: 'dark',
    colors: {
      background: '#0a0e27',
      surface: '#1a1f3a',
      surfaceHover: '#2a2f4a',
      border: '#3a3f5a',
      text: '#00fff9',
      textSecondary: '#a0d8f1',
      primary: '#ff007a',
      primaryHover: '#ff1a8c',
      accent: '#ffcc00',
      danger: '#ff3366',
      success: '#00ff88',
      warning: '#ffaa00',
      code: '#1a1f3a'
    }
  },
  {
    id: 'dracula',
    name: 'Dracula',
    type: 'dark',
    colors: {
      background: '#282a36',
      surface: '#44475a',
      surfaceHover: '#6272a4',
      border: '#6272a4',
      text: '#f8f8f2',
      textSecondary: '#9ca3af',
      primary: '#bd93f9',
      primaryHover: '#9b73d9',
      accent: '#ff79c6',
      danger: '#ff5555',
      success: '#50fa7b',
      warning: '#f1fa8c',
      code: '#44475a'
    }
  },
  // Light Themes
  {
    id: 'modern-light',
    name: 'Modern Light',
    type: 'light',
    colors: {
      background: '#ffffff',
      surface: '#f8fafc',
      surfaceHover: '#f1f5f9',
      border: '#e2e8f0',
      text: '#0f172a',
      textSecondary: '#64748b',
      primary: '#6366f1',
      primaryHover: '#4f46e5',
      accent: '#8b5cf6',
      danger: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b',
      code: '#f1f5f9'
    }
  },
  {
    id: 'warm-light',
    name: 'Warm Light',
    type: 'light',
    colors: {
      background: '#fefcf9',
      surface: '#faf6f1',
      surfaceHover: '#f5efe6',
      border: '#e7dfd5',
      text: '#2d2420',
      textSecondary: '#6b5d56',
      primary: '#d97706',
      primaryHover: '#b45309',
      accent: '#dc2626',
      danger: '#dc2626',
      success: '#059669',
      warning: '#f59e0b',
      code: '#f5efe6'
    }
  },
  {
    id: 'ocean-light',
    name: 'Ocean Light',
    type: 'light',
    colors: {
      background: '#f0f9ff',
      surface: '#e0f2fe',
      surfaceHover: '#bae6fd',
      border: '#7dd3fc',
      text: '#0c4a6e',
      textSecondary: '#0369a1',
      primary: '#0284c7',
      primaryHover: '#0369a1',
      accent: '#06b6d4',
      danger: '#dc2626',
      success: '#059669',
      warning: '#f59e0b',
      code: '#e0f2fe'
    }
  }
];

export const getThemeById = (id: string): Theme => {
  return themes.find(t => t.id === id) || themes[0];
};

export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;

  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });

  // Update dark class
  if (theme.type === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

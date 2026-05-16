export interface Page {
  id: string;
  title: string;
  content: string;
}

export interface Category {
  id: string;
  name: string;
  isExpanded: boolean;
  pageIds: string[];
}

export interface ProjectSettings {
  name: string;
  logo: string;
  socialLinks?: {
    github?: string;
    twitter?: string;
    discord?: string;
    website?: string;
  };
}

export interface DocsData {
  pages: Page[];
  categories: Category[];
  globalPageIds: string[];
  settings: ProjectSettings;
  deletedPages: Page[];
  currentTheme: string;
}

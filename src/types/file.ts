export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: FileNode[];
  parentId?: string | null;
  isOpen?: boolean;
  path?: string;
}

export interface Project {
  id: string;
  name: string;
  files: FileNode[];
  createdAt: Date;
  updatedAt: Date;
}

export type FileLanguage = 
  | 'html' 
  | 'css' 
  | 'javascript' 
  | 'typescript' 
  | 'json' 
  | 'markdown' 
  | 'python' 
  | 'java'
  | 'xml'
  | 'plain';

// AI Model - Using Google Gemini (free tier)
export const AI_MODELS = [
  { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B', provider: 'Google', free: true },
];

// Word Finder type
export interface WordFinderResult {
  fileId: string;
  fileName: string;
  matches: { line: number; content: string }[];
}

export const getLanguageFromExtension = (filename: string): FileLanguage => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html': case 'htm': return 'html';
    case 'css': return 'css';
    case 'js': return 'javascript';
    case 'ts': case 'tsx': return 'typescript';
    case 'json': return 'json';
    case 'md': return 'markdown';
    case 'py': return 'python';
    case 'java': return 'java';
    case 'xml': return 'xml';
    default: return 'plain';
  }
};

export const generateId = () => Math.random().toString(36).substring(2, 15);

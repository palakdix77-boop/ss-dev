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

// AI Models available in OpenRouter
export const AI_MODELS = [
  { id: 'google/gemma-4-26b-a4b-it:free', name: 'Gemma 4', provider: 'Google', free: true },
  { id: 'alibaba/wan-2.6', name: 'Wan 2.6', provider: 'Alibaba', free: true },
  { id: 'minimax/minimax-m2.5:free', name: 'MiniMax M2.5', provider: 'MiniMax', free: true },
  { id: 'liquid/lfm-2.5-1.2b-instruct:free', name: 'LFM 2.5', provider: 'Liquid', free: true },
  { id: 'arcee-ai/trinity-mini:free', name: 'Trinity Mini', provider: 'Arcee AI', free: true },
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

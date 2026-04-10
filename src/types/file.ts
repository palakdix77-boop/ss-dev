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
  { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1', provider: 'Meta', free: true },
  { id: 'microsoft/phi-3.5-mini-instruct:free', name: 'Phi 3.5', provider: 'Microsoft', free: true },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B', provider: 'Mistral', free: true },
  { id: 'qwen/qwen-2.5-7b-instruct:free', name: 'Qwen 2.5', provider: 'Alibaba', free: true },
  { id: 'deepseek/deepseek-coder:free', name: 'DeepSeek Coder', provider: 'DeepSeek', free: true },
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

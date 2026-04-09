import { create } from 'zustand';
import { FileNode, Project, generateId, getLanguageFromExtension } from '@/types/file';
import { AIMessage } from '@/services/aiService';

interface Tab {
  fileId: string;
  isDirty: boolean;
}

interface AppState {
  // Projects
  projects: Project[];
  currentProjectId: string | null;
  
  // Files
  files: FileNode[];
  activeFileId: string | null;
  openTabs: Tab[];
  
  // UI State
  sidebarVisible: boolean;
  aiPanelVisible: boolean;
  activeSidebarTab: 'files' | 'ai' | 'android' | 'settings';
  
  // AI State
  aiMessages: AIMessage[];
  isAILoading: boolean;
  selectedFileForAI: string | null;
  
  // Actions
  createProject: (name: string) => void;
  setCurrentProject: (id: string) => void;
  
  createFile: (name: string, parentId?: string | null, content?: string) => void;
  createFolder: (name: string, parentId?: string | null) => void;
  deleteFile: (id: string) => void;
  renameFile: (id: string, newName: string) => void;
  moveFile: (id: string, newParentId: string | null) => void;
  updateFileContent: (id: string, content: string) => void;
  openFile: (id: string) => void;
  closeTab: (fileId: string) => void;
  setActiveFile: (id: string) => void;
  toggleFolder: (id: string) => void;
  
  toggleSidebar: () => void;
  toggleAIPanel: () => void;
  setActiveSidebarTab: (tab: 'files' | 'ai' | 'android' | 'settings') => void;
  
  addAIMessage: (message: AIMessage) => void;
  clearAIMessages: () => void;
  setIsAILoading: (loading: boolean) => void;
  setSelectedFileForAI: (fileId: string | null) => void;
  
  importFiles: (files: { name: string; content: string }[]) => void;
  getFileById: (id: string) => FileNode | undefined;
  getFileContent: (id: string) => string;
  exportProject: () => { name: string; content: string }[];
}

const defaultFiles: FileNode[] = [
  {
    id: 'root',
    name: 'My Project',
    type: 'folder',
    isOpen: true,
    children: [
      {
        id: 'index-html',
        name: 'index.html',
        type: 'file',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app">
    <h1>Welcome to My App</h1>
    <p>Start editing to build something amazing!</p>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
        parentId: 'root'
      },
      {
        id: 'style-css',
        name: 'style.css',
        type: 'file',
        language: 'css',
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

#app {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 1rem;
}

p {
  color: #666;
}`,
        parentId: 'root'
      },
      {
        id: 'script-js',
        name: 'script.js',
        type: 'file',
        language: 'javascript',
        content: `console.log('Welcome to My App!');

// Your JavaScript code here
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  console.log('App initialized:', app);
});`,
        parentId: 'root'
      }
    ]
  }
];

export const useAppStore = create<AppState>((set, get) => ({
  // Initial State
  projects: [{
    id: 'default',
    name: 'My Project',
    files: defaultFiles,
    createdAt: new Date(),
    updatedAt: new Date()
  }],
  currentProjectId: 'default',
  files: defaultFiles,
  activeFileId: 'index-html',
  openTabs: [{ fileId: 'index-html', isDirty: false }],
  sidebarVisible: true,
  aiPanelVisible: false,
  activeSidebarTab: 'files',
  aiMessages: [],
  isAILoading: false,
  selectedFileForAI: null,

  // Project Actions
  createProject: (name) => {
    const newProject: Project = {
      id: generateId(),
      name,
      files: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    set((state) => ({
      projects: [...state.projects, newProject],
      currentProjectId: newProject.id,
      files: []
    }));
  },

  setCurrentProject: (id) => {
    const project = get().projects.find(p => p.id === id);
    if (project) {
      set({
        currentProjectId: id,
        files: project.files,
        activeFileId: null,
        openTabs: []
      });
    }
  },

  // File Actions
  createFile: (name, parentId = 'root', content = '') => {
    const newFile: FileNode = {
      id: generateId(),
      name,
      type: 'file',
      language: getLanguageFromExtension(name),
      content,
      parentId
    };

    set((state) => {
      const updateFiles = (files: FileNode[]): FileNode[] => {
        return files.map(file => {
          if (file.id === parentId && file.type === 'folder') {
            return {
              ...file,
              children: [...(file.children || []), newFile],
              isOpen: true
            };
          }
          if (file.children) {
            return { ...file, children: updateFiles(file.children) };
          }
          return file;
        });
      };

      return { files: updateFiles(state.files) };
    });

    // Open the new file
    get().openFile(newFile.id);
  },

  createFolder: (name, parentId = 'root') => {
    const newFolder: FileNode = {
      id: generateId(),
      name,
      type: 'folder',
      children: [],
      parentId,
      isOpen: true
    };

    set((state) => {
      const updateFiles = (files: FileNode[]): FileNode[] => {
        return files.map(file => {
          if (file.id === parentId && file.type === 'folder') {
            return {
              ...file,
              children: [...(file.children || []), newFolder]
            };
          }
          if (file.children) {
            return { ...file, children: updateFiles(file.children) };
          }
          return file;
        });
      };

      return { files: updateFiles(state.files) };
    });
  },

  deleteFile: (id) => {
    set((state) => {
      const deleteFromTree = (files: FileNode[]): FileNode[] => {
        return files.filter(file => file.id !== id).map(file => {
          if (file.children) {
            return { ...file, children: deleteFromTree(file.children) };
          }
          return file;
        });
      };

      // Close tab if open
      const newTabs = state.openTabs.filter(tab => tab.fileId !== id);
      const newActiveFile = state.activeFileId === id 
        ? (newTabs[0]?.fileId || null)
        : state.activeFileId;

      return {
        files: deleteFromTree(state.files),
        openTabs: newTabs,
        activeFileId: newActiveFile
      };
    });
  },

  renameFile: (id, newName) => {
    set((state) => {
      const updateFiles = (files: FileNode[]): FileNode[] => {
        return files.map(file => {
          if (file.id === id) {
            return {
              ...file,
              name: newName,
              language: file.type === 'file' ? getLanguageFromExtension(newName) : file.language
            };
          }
          if (file.children) {
            return { ...file, children: updateFiles(file.children) };
          }
          return file;
        });
      };

      return { files: updateFiles(state.files) };
    });
  },

  moveFile: (id, newParentId) => {
    set((state) => {
      let fileToMove: FileNode | null = null;

      const removeFromTree = (files: FileNode[]): FileNode[] => {
        return files.filter(file => {
          if (file.id === id) {
            fileToMove = { ...file, parentId: newParentId };
            return false;
          }
          if (file.children) {
            file.children = removeFromTree(file.children);
          }
          return true;
        });
      };

      const addToTree = (files: FileNode[]): FileNode[] => {
        return files.map(file => {
          if (file.id === newParentId && file.type === 'folder') {
            return {
              ...file,
              children: [...(file.children || []), fileToMove!],
              isOpen: true
            };
          }
          if (file.children) {
            return { ...file, children: addToTree(file.children) };
          }
          return file;
        });
      };

      let newFiles = removeFromTree(state.files);
      if (fileToMove) {
        newFiles = addToTree(newFiles);
      }

      return { files: newFiles };
    });
  },

  updateFileContent: (id, content) => {
    set((state) => {
      const updateFiles = (files: FileNode[]): FileNode[] => {
        return files.map(file => {
          if (file.id === id) {
            return { ...file, content };
          }
          if (file.children) {
            return { ...file, children: updateFiles(file.children) };
          }
          return file;
        });
      };

      const newTabs = state.openTabs.map(tab =>
        tab.fileId === id ? { ...tab, isDirty: true } : tab
      );

      return {
        files: updateFiles(state.files),
        openTabs: newTabs
      };
    });
  },

  openFile: (id) => {
    set((state) => {
      const isAlreadyOpen = state.openTabs.some(tab => tab.fileId === id);
      const newTabs = isAlreadyOpen
        ? state.openTabs
        : [...state.openTabs, { fileId: id, isDirty: false }];
      
      return {
        openTabs: newTabs,
        activeFileId: id
      };
    });
  },

  closeTab: (fileId) => {
    set((state) => {
      const newTabs = state.openTabs.filter(tab => tab.fileId !== fileId);
      const newActiveFile = state.activeFileId === fileId
        ? (newTabs[newTabs.length - 1]?.fileId || null)
        : state.activeFileId;
      
      return {
        openTabs: newTabs,
        activeFileId: newActiveFile
      };
    });
  },

  setActiveFile: (id) => {
    set({ activeFileId: id });
  },

  toggleFolder: (id) => {
    set((state) => {
      const updateFiles = (files: FileNode[]): FileNode[] => {
        return files.map(file => {
          if (file.id === id) {
            return { ...file, isOpen: !file.isOpen };
          }
          if (file.children) {
            return { ...file, children: updateFiles(file.children) };
          }
          return file;
        });
      };

      return { files: updateFiles(state.files) };
    });
  },

  // UI Actions
  toggleSidebar: () => {
    set((state) => ({ sidebarVisible: !state.sidebarVisible }));
  },

  toggleAIPanel: () => {
    set((state) => ({ aiPanelVisible: !state.aiPanelVisible }));
  },

  setActiveSidebarTab: (tab) => {
    set({ activeSidebarTab: tab });
  },

  // AI Actions
  addAIMessage: (message) => {
    set((state) => ({
      aiMessages: [...state.aiMessages, message]
    }));
  },

  clearAIMessages: () => {
    set({ aiMessages: [] });
  },

  setIsAILoading: (loading) => {
    set({ isAILoading: loading });
  },

  setSelectedFileForAI: (fileId) => {
    set({ selectedFileForAI: fileId });
  },

  // Import/Export
  importFiles: (files) => {
    files.forEach(file => {
      get().createFile(file.name, 'root', file.content);
    });
  },

  getFileById: (id) => {
    const findFile = (files: FileNode[]): FileNode | undefined => {
      for (const file of files) {
        if (file.id === id) return file;
        if (file.children) {
          const found = findFile(file.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return findFile(get().files);
  },

  getFileContent: (id) => {
    const file = get().getFileById(id);
    return file?.content || '';
  },

  exportProject: () => {
    const files: { name: string; content: string }[] = [];
    
    const collectFiles = (nodes: FileNode[], path = '') => {
      for (const node of nodes) {
        if (node.type === 'file' && node.content !== undefined) {
          files.push({
            name: path ? `${path}/${node.name}` : node.name,
            content: node.content
          });
        } else if (node.type === 'folder' && node.children) {
          collectFiles(node.children, path ? `${path}/${node.name}` : node.name);
        }
      }
    };

    collectFiles(get().files);
    return files;
  }
}));

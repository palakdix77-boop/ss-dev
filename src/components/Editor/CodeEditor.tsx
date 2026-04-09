"use client";

import { useAppStore } from '@/store/useAppStore';
import Editor from '@monaco-editor/react';
import { X, MoreVertical, FileCode, Wand2, Sparkles, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { aiService } from '@/services/aiService';

interface TabContextMenuProps {
  fileId: string;
  onClose: () => void;
}

function TabContextMenu({ fileId, onClose }: TabContextMenuProps) {
  const { getFileById, getFileContent, addAIMessage, setActiveSidebarTab, toggleAIPanel, setSelectedFileForAI } = useAppStore();
  
  const handleAction = async (action: 'analyze' | 'fix' | 'explain') => {
    const file = getFileById(fileId);
    if (!file) return;

    setSelectedFileForAI(fileId);
    const content = getFileContent(fileId);
    const language = file.language || 'javascript';

    addAIMessage({
      role: 'system',
      content: `${action === 'analyze' ? 'Analyzing' : action === 'fix' ? 'Fixing' : 'Explaining'} ${file.name}...`
    });

    let response;
    switch (action) {
      case 'analyze':
        response = await aiService.analyzeCode(content, language);
        break;
      case 'fix':
        response = await aiService.fixErrors(content, language);
        break;
      case 'explain':
        response = await aiService.explainCode(content, language);
        break;
    }

    if (response.error) {
      addAIMessage({ role: 'assistant', content: `Error: ${response.error}` });
    } else {
      addAIMessage({ role: 'assistant', content: response.content });
    }

    setActiveSidebarTab('ai');
    toggleAIPanel();
    onClose();
  };

  return (
    <div className="absolute z-50 bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg shadow-xl py-1 min-w-[160px]">
      <button
        onClick={() => handleAction('analyze')}
        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#2d2d2d] flex items-center gap-2"
      >
        <Sparkles size={14} className="text-purple-400" /> Analyze
      </button>
      <button
        onClick={() => handleAction('fix')}
        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#2d2d2d] flex items-center gap-2"
      >
        <Wand2 size={14} className="text-green-400" /> Fix Errors
      </button>
      <button
        onClick={() => handleAction('explain')}
        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#2d2d2d] flex items-center gap-2"
      >
        <Lightbulb size={14} className="text-yellow-400" /> Explain
      </button>
    </div>
  );
}

export function CodeEditor() {
  const {
    openTabs,
    activeFileId,
    setActiveFile,
    closeTab,
    updateFileContent,
    getFileById,
    sidebarVisible,
    toggleSidebar
  } = useAppStore();
  
  const [contextMenu, setContextMenu] = useState<{ fileId: string; x: number; y: number } | null>(null);

  const activeFile = activeFileId ? getFileById(activeFileId) : null;

  const handleEditorChange = (value: string | undefined) => {
    if (activeFileId && value !== undefined) {
      updateFileContent(activeFileId, value);
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    let color = 'text-gray-400';
    switch (ext) {
      case 'html': color = 'text-orange-400'; break;
      case 'css': color = 'text-blue-400'; break;
      case 'js': case 'ts': color = 'text-yellow-400'; break;
      case 'json': color = 'text-green-400'; break;
    }
    return <FileCode size={14} className={color} />;
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Tabs */}
      <div className="flex items-center bg-[#252526] overflow-x-auto border-b border-[#3c3c3c]">
        {!sidebarVisible && (
          <button
            onClick={toggleSidebar}
            className="px-3 py-2 text-gray-400 hover:text-white hover:bg-[#3c3c3c]"
          >
            ☰
          </button>
        )}
        
        {openTabs.map((tab) => {
          const file = getFileById(tab.fileId);
          if (!file) return null;
          
          const isActive = tab.fileId === activeFileId;
          
          return (
            <div
              key={tab.fileId}
              className={`
                group flex items-center gap-2 px-3 py-2 min-w-[120px] max-w-[200px] cursor-pointer
                border-r border-[#3c3c3c] select-none
                ${isActive ? 'bg-[#1e1e1e] text-white' : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#3c3c3c]'}
              `}
              onClick={() => setActiveFile(tab.fileId)}
            >
              {getFileIcon(file.name)}
              <span className="flex-1 text-sm truncate">{file.name}</span>
              {tab.isDirty && <span className="text-white">•</span>}
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setContextMenu({ fileId: tab.fileId, x: e.clientX, y: e.clientY });
                  }}
                  className="p-0.5 hover:bg-[#4c4c4c] rounded"
                >
                  <MoreVertical size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.fileId);
                  }}
                  className="p-0.5 hover:bg-[#4c4c4c] rounded"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          );
        })}
        
        {openTabs.length === 0 && (
          <div className="flex-1 px-4 py-2 text-gray-500 text-sm">
            No files open. Create or select a file from the sidebar.
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y, zIndex: 50 }}>
            <TabContextMenu
              fileId={contextMenu.fileId}
              onClose={() => setContextMenu(null)}
            />
          </div>
        </>
      )}

      {/* Editor */}
      <div className="flex-1 min-h-0">
        {activeFile ? (
          <Editor
            height="100%"
            language={activeFile.language || 'plaintext'}
            theme="vs-dark"
            value={activeFile.content || ''}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              renderWhitespace: 'selection',
              bracketPairColorization: { enabled: true },
              guides: {
                bracketPairs: true,
                indentation: true
              }
            }}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <FileCode size={64} className="mb-4 opacity-30" />
            <p className="text-lg">No file selected</p>
            <p className="text-sm">Select a file from the sidebar to start editing</p>
          </div>
        )}
      </div>
    </div>
  );
}

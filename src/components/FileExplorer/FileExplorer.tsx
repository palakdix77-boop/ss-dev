"use client";

import { useState, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { FileNode } from '@/types/file';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  FileImage,
  MoreVertical,
  Plus,
  Trash2,
  Edit3,
  ChevronRight,
  ChevronDown,
  X,
  Check
} from 'lucide-react';

interface FileContextMenuProps {
  file: FileNode;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
  onAnalyze: () => void;
  onFix: () => void;
  onExplain: () => void;
}

function FileContextMenu({ file, onClose, onRename, onDelete, onAnalyze, onFix, onExplain }: FileContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg shadow-xl py-1 min-w-[180px]"
      onClick={(e) => e.stopPropagation()}
    >
      {file.type === 'file' && (
        <>
          <button
            onClick={onAnalyze}
            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#2d2d2d] flex items-center gap-2"
          >
            <span className="text-purple-400">✨</span> Analyze Code
          </button>
          <button
            onClick={onFix}
            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#2d2d2d] flex items-center gap-2"
          >
            <span className="text-green-400">🔧</span> Fix Errors
          </button>
          <button
            onClick={onExplain}
            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#2d2d2d] flex items-center gap-2"
          >
            <span className="text-blue-400">📖</span> Explain Code
          </button>
          <div className="border-t border-[#3c3c3c] my-1" />
        </>
      )}
      <button
        onClick={onRename}
        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#2d2d2d] flex items-center gap-2"
      >
        <Edit3 size={14} /> Rename
      </button>
      <button
        onClick={onDelete}
        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[#2d2d2d] flex items-center gap-2"
      >
        <Trash2 size={14} /> Delete
      </button>
    </div>
  );
}

interface FileTreeItemProps {
  file: FileNode;
  level: number;
}

function FileTreeItem({ file, level }: FileTreeItemProps) {
  const { activeFileId, openFile, toggleFolder, deleteFile, renameFile, setActiveSidebarTab, addAIMessage, setSelectedFileForAI, toggleAIPanel } = useAppStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const isActive = activeFileId === file.id;

  const getFileIcon = () => {
    if (file.type === 'folder') {
      return file.isOpen ? <FolderOpen size={18} className="text-yellow-400" /> : <Folder size={18} className="text-yellow-400" />;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'html': return <FileCode size={18} className="text-orange-400" />;
      case 'css': return <FileCode size={18} className="text-blue-400" />;
      case 'js': case 'ts': case 'jsx': case 'tsx': return <FileCode size={18} className="text-yellow-300" />;
      case 'json': return <FileJson size={18} className="text-green-400" />;
      case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg': return <FileImage size={18} className="text-purple-400" />;
      default: return <FileText size={18} className="text-gray-400" />;
    }
  };

  const handleClick = () => {
    if (file.type === 'folder') {
      toggleFolder(file.id);
    } else {
      openFile(file.id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleRename = () => {
    if (newName.trim() && newName !== file.name) {
      renameFile(file.id, newName.trim());
    }
    setIsRenaming(false);
  };

  const handleAnalyze = () => {
    setSelectedFileForAI(file.id);
    addAIMessage({
      role: 'system',
      content: `Analyzing file: ${file.name}`
    });
    setActiveSidebarTab('ai');
    toggleAIPanel();
    setContextMenu(null);
  };

  const handleFix = () => {
    setSelectedFileForAI(file.id);
    addAIMessage({
      role: 'system',
      content: `Fixing errors in: ${file.name}`
    });
    setActiveSidebarTab('ai');
    toggleAIPanel();
    setContextMenu(null);
  };

  const handleExplain = () => {
    setSelectedFileForAI(file.id);
    addAIMessage({
      role: 'system',
      content: `Explaining code in: ${file.name}`
    });
    setActiveSidebarTab('ai');
    toggleAIPanel();
    setContextMenu(null);
  };

  return (
    <div>
      <div
        className={`
          flex items-center gap-2 px-3 py-1.5 cursor-pointer select-none
          hover:bg-[#2d2d2d] transition-colors group
          ${isActive ? 'bg-[#37373d]' : ''}
        `}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (file.type === 'folder') toggleFolder(file.id);
          }}
          className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-300"
        >
          {file.type === 'folder' && (
            file.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          )}
        </button>

        {getFileIcon()}

        {isRenaming ? (
          <input
            ref={renameInputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setNewName(file.name);
                setIsRenaming(false);
              }
            }}
            className="flex-1 bg-[#1e1e1e] text-gray-300 text-sm px-2 py-0.5 rounded border border-blue-500 outline-none"
            autoFocus
          />
        ) : (
          <span className={`flex-1 text-sm ${isActive ? 'text-white' : 'text-gray-300'}`}>
            {file.name}
          </span>
        )}

        {!isRenaming && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleContextMenu(e);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#3c3c3c] rounded"
          >
            <MoreVertical size={14} className="text-gray-400" />
          </button>
        )}
      </div>

      {contextMenu && (
        <FileContextMenu
          file={file}
          onClose={() => setContextMenu(null)}
          onRename={() => {
            setIsRenaming(true);
            setContextMenu(null);
          }}
          onDelete={() => {
            deleteFile(file.id);
            setContextMenu(null);
          }}
          onAnalyze={handleAnalyze}
          onFix={handleFix}
          onExplain={handleExplain}
        />
      )}

      {file.type === 'folder' && file.isOpen && file.children && (
        <div>
          {file.children.map(child => (
            <FileTreeItem key={child.id} file={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer() {
  const { files, createFile, createFolder, activeSidebarTab, setActiveSidebarTab } = useAppStore();
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const handleCreateFile = () => {
    if (newItemName.trim()) {
      createFile(newItemName.trim());
      setNewItemName('');
      setShowNewFileInput(false);
    }
  };

  const handleCreateFolder = () => {
    if (newItemName.trim()) {
      createFolder(newItemName.trim());
      setNewItemName('');
      setShowNewFolderInput(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#252526] text-gray-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d2d] border-b border-[#3c3c3c]">
        <span className="font-semibold text-sm uppercase tracking-wider">Explorer</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowNewFileInput(true)}
            className="p-1.5 hover:bg-[#3c3c3c] rounded transition-colors"
            title="New File"
          >
            <FileText size={16} />
          </button>
          <button
            onClick={() => setShowNewFolderInput(true)}
            className="p-1.5 hover:bg-[#3c3c3c] rounded transition-colors"
            title="New Folder"
          >
            <Folder size={16} />
          </button>
        </div>
      </div>

      {/* New File/Folder Input */}
      {(showNewFileInput || showNewFolderInput) && (
        <div className="px-4 py-2 border-b border-[#3c3c3c]">
          <div className="flex items-center gap-2">
            {showNewFileInput ? <FileText size={16} className="text-gray-400" /> : <Folder size={16} className="text-yellow-400" />}
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  showNewFileInput ? handleCreateFile() : handleCreateFolder();
                }
                if (e.key === 'Escape') {
                  setShowNewFileInput(false);
                  setShowNewFolderInput(false);
                  setNewItemName('');
                }
              }}
              placeholder={showNewFileInput ? 'File name...' : 'Folder name...'}
              className="flex-1 bg-[#1e1e1e] text-sm px-2 py-1 rounded border border-[#3c3c3c] outline-none focus:border-blue-500"
              autoFocus
            />
            <button
              onClick={() => {
                showNewFileInput ? handleCreateFile() : handleCreateFolder();
              }}
              className="p-1 hover:bg-[#3c3c3c] rounded text-green-400"
            >
              <Check size={14} />
            </button>
            <button
              onClick={() => {
                setShowNewFileInput(false);
                setShowNewFolderInput(false);
                setNewItemName('');
              }}
              className="p-1 hover:bg-[#3c3c3c] rounded text-red-400"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {files.map(file => (
          <FileTreeItem key={file.id} file={file} level={0} />
        ))}
      </div>
    </div>
  );
}

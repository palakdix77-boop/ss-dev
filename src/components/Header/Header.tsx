"use client";

import { useState, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { 
  Menu, 
  Save, 
  Download, 
  Upload, 
  Smartphone, 
  Bot, 
  Folder,
  Settings,
  ChevronDown,
  Image as ImageIcon,
  FileText,
  Code2,
  Plus,
  History,
  Search
} from 'lucide-react';
import JSZip from 'jszip';

export function Header() {
  const { 
    toggleSidebar, 
    sidebarVisible, 
    activeSidebarTab, 
    setActiveSidebarTab,
    exportProject,
    importFiles,
    createProject,
    addToHistory,
    setWordFinderOpen,
    setActiveSidebarTab: setActiveTab,
    projectHistory
  } = useAppStore();
  
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const files = exportProject();
    const zip = new JSZip();
    
    files.forEach(file => {
      zip.file(file.name, file.content);
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'project.zip';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const zip = await JSZip.loadAsync(file);
      const files: { name: string; content: string }[] = [];

      await Promise.all(
        Object.keys(zip.files).map(async (filename) => {
          const zipEntry = zip.files[filename];
          if (!zipEntry.dir) {
            const content = await zipEntry.async('string');
            files.push({ name: filename, content });
          }
        })
      );

      importFiles(files);
      alert(`Imported ${files.length} files successfully!`);
    } catch (error) {
      alert('Error importing ZIP file. Please make sure it\'s a valid ZIP.');
    }
  };

  const handleImageImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        // Create a new file with base64 content
        const fileName = `assets/${file.name}`;
        importFiles([{ name: fileName, content }]);
      };
      reader.readAsDataURL(file);
    });

    alert(`Importing ${files.length} media files...`);
  };

  const navItems = [
    { id: 'files', icon: Folder, label: 'Files' },
    { id: 'ai', icon: Bot, label: 'AI Assistant' },
    { id: 'android', icon: Smartphone, label: 'Android Export' },
    { id: 'history', icon: History, label: 'History' },
  ] as const;

  const handleNewProject = () => {
    const name = prompt('Enter project name:');
    if (name) {
      addToHistory();
      createProject(name);
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-[#3c3c3c]">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-lg transition-colors ${sidebarVisible ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-[#3c3c3c] hover:text-white'}`}
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <Code2 size={24} className="text-blue-500" />
          <span className="font-bold text-lg text-white">SS Dev</span>
        </div>

        {/* Navigation Tabs */}
        <div className="hidden md:flex items-center gap-1 ml-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSidebarTab(item.id);
                if (!sidebarVisible) toggleSidebar();
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                activeSidebarTab === item.id && sidebarVisible
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-[#3c3c3c] hover:text-white'
              }`}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Import Media Button */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handleImageImport}
        />
        <button
          onClick={() => imageInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-[#3c3c3c] rounded-lg transition-colors"
          title="Import Images/Videos"
        >
          <ImageIcon size={16} />
          <span className="hidden sm:inline">Import Media</span>
        </button>

        {/* Import Project Button */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={handleImport}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-[#3c3c3c] rounded-lg transition-colors"
        >
          <Upload size={16} />
          <span className="hidden sm:inline">Import</span>
        </button>

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#2d2d2d] hover:bg-[#3d3d3d] text-gray-300 rounded-lg transition-colors"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Word Finder Button */}
        <button
          onClick={() => setWordFinderOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-[#3c3c3c] rounded-lg transition-colors"
          title="Word Finder"
        >
          <Search size={16} />
          <span className="hidden sm:inline">Find</span>
        </button>

        {/* New Project Button */}
        <button
          onClick={handleNewProject}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          title="New Project"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New</span>
        </button>

        {/* Save Button */}
        <button
          onClick={() => alert('Project saved locally!')}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Save size={16} />
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>
    </header>
  );
}

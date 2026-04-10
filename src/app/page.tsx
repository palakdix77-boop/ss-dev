"use client";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useAppStore } from "@/store/useAppStore";
import { CodeEditor } from "@/components/Editor/CodeEditor";
import { LivePreview } from "@/components/Preview/LivePreview";
import { Header } from "@/components/Header/Header";
import { FileExplorer } from "@/components/FileExplorer/FileExplorer";
import { AIAssistant } from "@/components/AIAssistant/AIAssistant";
import { AndroidExport } from "@/components/AndroidExport/AndroidExport";
import { WordFinder } from "@/components/WordFinder/WordFinder";
import { History } from "lucide-react";
import { useState } from "react";

function ProjectHistory() {
  const { projectHistory, loadFromHistory } = useAppStore();
  
  if (projectHistory.length === 0) {
    return (
      <div className="p-4 text-gray-400 text-center">
        No project history yet.
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <h3 className="text-white font-semibold mb-4">Project History</h3>
      <div className="space-y-2">
        {projectHistory.map((project) => (
          <div
            key={project.id}
            className="p-3 bg-[#2d2d2d] rounded-lg hover:bg-[#3d3d3d] cursor-pointer transition-colors"
            onClick={() => loadFromHistory(project.id)}
          >
            <p className="text-white font-medium">{project.name}</p>
            <p className="text-gray-400 text-sm">
              Last opened: {new Date(project.lastOpened).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { sidebarVisible, activeSidebarTab, wordFinderOpen } = useAppStore();

  const renderSidebar = () => {
    switch (activeSidebarTab) {
      case 'files':
        return <FileExplorer />;
      case 'ai':
        return <AIAssistant />;
      case 'android':
        return <AndroidExport />;
      case 'history':
        return <ProjectHistory />;
      default:
        return <FileExplorer />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#1e1e1e] text-white">
      <Header />
      <WordFinder />
      
      <main className="flex-1 min-h-0">
        <PanelGroup direction="horizontal">
          {/* Sidebar */}
          {sidebarVisible && (
            <>
              <Panel defaultSize={20} minSize={15} maxSize={30}>
                {renderSidebar()}
              </Panel>
              <PanelResizeHandle className="w-1 bg-[#3c3c3c] hover:bg-blue-500 transition-colors" />
            </>
          )}

          {/* Main Editor Area */}
          <Panel defaultSize={sidebarVisible ? 40 : 50} minSize={30}>
            <CodeEditor />
          </Panel>

          {/* Resizer */}
          <PanelResizeHandle className="w-1 bg-[#3c3c3c] hover:bg-blue-500 transition-colors flex flex-col justify-center items-center cursor-col-resize">
            <div className="w-0.5 h-8 bg-gray-500 rounded-full" />
          </PanelResizeHandle>

          {/* Preview Area */}
          <Panel defaultSize={sidebarVisible ? 40 : 50} minSize={20}>
             <LivePreview />
          </Panel>
        </PanelGroup>
      </main>
    </div>
  );
}

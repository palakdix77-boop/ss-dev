"use client";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useAppStore } from "@/store/useAppStore";
import { CodeEditor } from "@/components/Editor/CodeEditor";
import { LivePreview } from "@/components/Preview/LivePreview";
import { Header } from "@/components/Header/Header";
import { FileExplorer } from "@/components/FileExplorer/FileExplorer";
import { AIAssistant } from "@/components/AIAssistant/AIAssistant";
import { AndroidExport } from "@/components/AndroidExport/AndroidExport";

export default function Home() {
  const { sidebarVisible, activeSidebarTab } = useAppStore();

  const renderSidebar = () => {
    switch (activeSidebarTab) {
      case 'files':
        return <FileExplorer />;
      case 'ai':
        return <AIAssistant />;
      case 'android':
        return <AndroidExport />;
      default:
        return <FileExplorer />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#1e1e1e] text-white">
      <Header />
      
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

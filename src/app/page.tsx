"use client";

import { Panel, Group, Separator } from "react-resizable-panels";
import { CodeEditor } from "@/components/Editor/CodeEditor";
import { LivePreview } from "@/components/Preview/LivePreview";
import { Header } from "@/components/Header/Header";

export default function Home() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#1e1e1e] text-white">
      <Header />
      
      <main className="flex-1 min-h-0">
        <Group direction="horizontal">
          {/* Main Editor Area */}
          <Panel defaultSize={50} minSize={20}>
            <Group direction="vertical">
              <Panel defaultSize={100}>
                <CodeEditor />
              </Panel>
            </Group>
          </Panel>

          {/* Resizer */}
          <Separator className="w-2 bg-[#3c3c3c] hover:bg-blue-500 transition-colors flex flex-col justify-center items-center cursor-col-resize">
            <div className="w-0.5 h-8 bg-gray-500 rounded-full" />
          </Separator>

          {/* Preview Area */}
          <Panel defaultSize={50} minSize={20}>
             <LivePreview />
          </Panel>
        </Group>
      </main>
    </div>
  );
}

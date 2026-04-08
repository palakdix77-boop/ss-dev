"use client";

import { useEditorStore } from "@/store/useEditorStore";
import Editor from "@monaco-editor/react";

export function CodeEditor() {
  const { html, css, js, activeTab, setHtml, setCss, setJs } = useEditorStore();

  const getLanguage = () => {
    switch (activeTab) {
      case "html":
        return "html";
      case "css":
        return "css";
      case "js":
        return "javascript";
      default:
        return "html";
    }
  };

  const getValue = () => {
    switch (activeTab) {
      case "html":
        return html;
      case "css":
        return css;
      case "js":
        return js;
      default:
        return "";
    }
  };

  const handleChange = (value: string | undefined) => {
    if (value === undefined) return;
    switch (activeTab) {
      case "html":
        setHtml(value);
        break;
      case "css":
        setCss(value);
        break;
      case "js":
        setJs(value);
        break;
    }
  };

  return (
    <div className="w-full h-full bg-[#1e1e1e] flex flex-col">
      <div className="flex bg-[#252526] text-sm text-[#cccccc] overflow-x-auto border-b border-[#3c3c3c] flex-none">
        <button
          className={`px-4 py-2 ${activeTab === "html" ? "bg-[#1e1e1e] border-t-2 border-blue-500 text-white" : "hover:bg-[#2d2d2d]"}`}
          onClick={() => useEditorStore.getState().setActiveTab("html")}
        >
          index.html
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "css" ? "bg-[#1e1e1e] border-t-2 border-blue-500 text-white" : "hover:bg-[#2d2d2d]"}`}
          onClick={() => useEditorStore.getState().setActiveTab("css")}
        >
          style.css
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "js" ? "bg-[#1e1e1e] border-t-2 border-blue-500 text-white" : "hover:bg-[#2d2d2d]"}`}
          onClick={() => useEditorStore.getState().setActiveTab("js")}
        >
          script.js
        </button>
      </div>
      <div className="flex-1 min-h-0 relative">
        <Editor
          height="100%"
          language={getLanguage()}
          theme="vs-dark"
          value={getValue()}
          onChange={handleChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            padding: { top: 16 },
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
}

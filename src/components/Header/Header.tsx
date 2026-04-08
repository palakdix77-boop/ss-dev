"use client";

import { useEditorStore } from "@/store/useEditorStore";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Download, Save } from "lucide-react";

export function Header() {
  const { html, css, js } = useEditorStore();

  const handleSave = () => {
    // Basic local save simulation or console log for Step 1
    alert("Project saved locally!");
  };

  const handleExport = async () => {
    const zip = new JSZip();
    
    // Add files
    zip.file("index.html", html);
    zip.file("style.css", css);
    zip.file("script.js", js);

    // Generate zip
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "ss-dev-project.zip");
  };

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-[#3c3c3c] text-white">
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg tracking-wide text-blue-500">SS DEV</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#2d2d2d] hover:bg-[#3d3d3d] rounded transition-colors"
        >
          <Save size={16} />
          Save
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        >
          <Download size={16} />
          Export
        </button>
      </div>
    </header>
  );
}

"use client";

import { useEditorStore } from "@/store/useEditorStore";
import { useEffect, useState } from "react";

export function LivePreview() {
  const { getCombinedHtml, html, css, js } = useEditorStore();
  const [srcDoc, setSrcDoc] = useState("");

  useEffect(() => {
    // Add a small delay (debounce) to avoid refreshing the iframe on every single keystroke immediately
    const timeout = setTimeout(() => {
      setSrcDoc(getCombinedHtml());
    }, 250);

    return () => clearTimeout(timeout);
  }, [html, css, js, getCombinedHtml]);

  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="flex bg-[#f3f4f6] text-sm text-[#4b5563] px-4 py-2 border-b border-[#e5e7eb] flex-none font-medium items-center justify-between">
        <span>Preview</span>
      </div>
      <div className="flex-1 min-h-0 relative">
        <iframe
          srcDoc={srcDoc}
          title="Preview"
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-modals allow-same-origin"
        />
      </div>
    </div>
  );
}

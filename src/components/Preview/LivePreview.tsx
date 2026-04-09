"use client";

import { useAppStore } from "@/store/useAppStore";
import { useEffect, useState, useMemo } from "react";

export function LivePreview() {
  const { files, activeFileId } = useAppStore();
  const [srcDoc, setSrcDoc] = useState("");

  // Find HTML, CSS, and JS files from the file tree
  const { htmlContent, cssContent, jsContent } = useMemo(() => {
    let html = '';
    let css = '';
    let js = '';

    const findFiles = (nodes: any[]) => {
      for (const node of nodes) {
        if (node.type === 'file') {
          const ext = node.name.split('.').pop()?.toLowerCase();
          const content = node.content || '';
          
          if (ext === 'html' && !html) html = content;
          else if (ext === 'css') css += content + '\n';
          else if (ext === 'js' && node.name !== 'script.js') js += content + '\n';
        }
        if (node.children) {
          findFiles(node.children);
        }
      }
    };

    findFiles(files);
    return { htmlContent: html, cssContent: css, jsContent: js };
  }, [files]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!htmlContent) {
        setSrcDoc('');
        return;
      }

      // Combine HTML, CSS, and JS
      let combined = htmlContent;
      
      // Inject CSS if present
      if (cssContent) {
        combined = combined.replace(
          '</head>',
          `<style>${cssContent}</style></head>`
        );
      }
      
      // Inject JS if present
      if (jsContent) {
        combined = combined.replace(
          '</body>',
          `<script>${jsContent}</script></body>`
        );
      }

      setSrcDoc(combined);
    }, 250);

    return () => clearTimeout(timeout);
  }, [htmlContent, cssContent, jsContent]);

  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="flex bg-[#f3f4f6] text-sm text-[#4b5563] px-4 py-2 border-b border-[#e5e7eb] flex-none font-medium items-center justify-between">
        <span>Preview</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Live</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="flex-1 min-h-0 relative bg-white">
        {srcDoc ? (
          <iframe
            srcDoc={srcDoc}
            title="Preview"
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-modals allow-same-origin"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p>No HTML file found</p>
              <p className="text-sm mt-2">Create an index.html file to see preview</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

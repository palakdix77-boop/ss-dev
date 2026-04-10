"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Search, X, FileText } from "lucide-react";

export function WordFinder() {
  const { 
    wordFinderOpen, 
    setWordFinderOpen, 
    wordFinderQuery, 
    setWordFinderQuery,
    files,
    openFile
  } = useAppStore();
  
  const [results, setResults] = useState<{ fileName: string; line: number; content: string }[]>([]);
  const [searched, setSearched] = useState(false);

  // Flatten files to search
  const flattenFiles = (nodes: any[], result: { id: string; name: string; content?: string }[] = []) => {
    nodes.forEach(node => {
      if (node.type === 'file' && node.content) {
        result.push({ id: node.id, name: node.name, content: node.content });
      }
      if (node.children) {
        flattenFiles(node.children, result);
      }
    });
    return result;
  };

  const handleSearch = () => {
    if (!wordFinderQuery.trim()) return;
    
    const allFiles = flattenFiles(files);
    const searchResults: { fileName: string; line: number; content: string }[] = [];
    
    allFiles.forEach(file => {
      const lines = file.content?.split('\n') || [];
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(wordFinderQuery.toLowerCase())) {
          searchResults.push({
            fileName: file.name,
            line: index + 1,
            content: line.trim()
          });
        }
      });
    });
    
    setResults(searchResults.slice(0, 50)); // Limit to 50 results
    setSearched(true);
  };

  useEffect(() => {
    if (wordFinderQuery) {
      handleSearch();
    }
  }, [wordFinderQuery]);

  if (!wordFinderOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1e1e1e] rounded-lg w-[600px] max-h-[80vh] overflow-hidden border border-[#3c3c3c]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
          <h3 className="text-white font-semibold">Word Finder</h3>
          <button 
            onClick={() => setWordFinderOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Search Input */}
        <div className="p-4 border-b border-[#3c3c3c]">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search in files..."
                value={wordFinderQuery}
                onChange={(e) => setWordFinderQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-[#2d2d2d] text-white pl-10 pr-4 py-2 rounded border border-[#3c3c3c] focus:border-blue-500 focus:outline-none"
                autoFocus
              />
            </div>
          </div>
        </div>
        
        {/* Results */}
        <div className="overflow-y-auto max-h-[400px] p-2">
          {searched && results.length === 0 && (
            <p className="text-gray-400 text-center py-4">No results found</p>
          )}
          {results.map((result, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-2 hover:bg-[#2d2d2d] rounded cursor-pointer"
              onClick={() => {
                setWordFinderOpen(false);
              }}
            >
              <FileText size={16} className="text-gray-400 mt-1" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">{result.fileName}:{result.line}</p>
                <p className="text-gray-400 text-xs truncate">{result.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
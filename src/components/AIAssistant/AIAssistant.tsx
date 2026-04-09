"use client";

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { aiService } from '@/services/aiService';
import { Send, Bot, User, Sparkles, Code, Wand2, Lightbulb, X, Loader2 } from 'lucide-react';

export function AIAssistant() {
  const {
    aiMessages,
    isAILoading,
    selectedFileForAI,
    addAIMessage,
    setIsAILoading,
    clearAIMessages,
    getFileById,
    getFileContent
  } = useAppStore();
  
  const [input, setInput] = useState('');
  const [activeMode, setActiveMode] = useState<'chat' | 'generate' | 'fix'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);

  const handleSend = async () => {
    if (!input.trim() || isAILoading) return;

    const userMessage = input.trim();
    addAIMessage({ role: 'user', content: userMessage });
    setInput('');
    setIsAILoading(true);

    let response;
    const selectedFile = selectedFileForAI ? getFileById(selectedFileForAI) : null;
    const fileContent = selectedFile ? getFileContent(selectedFile.id) : '';
    const fileLanguage = selectedFile?.language || 'javascript';

    switch (activeMode) {
      case 'generate':
        response = await aiService.generateCode(userMessage, fileLanguage);
        break;
      case 'fix':
        response = await aiService.fixErrors(fileContent, fileLanguage, userMessage);
        break;
      default:
        if (selectedFile) {
          response = await aiService.chat([
            {
              role: 'system',
              content: `You are an expert coding assistant. The user is working on a ${fileLanguage} file named ${selectedFile.name}. Here's the current content:\n\`\`\`${fileLanguage}\n${fileContent}\n\`\`\``
            },
            ...aiMessages,
            { role: 'user', content: userMessage }
          ]);
        } else {
          response = await aiService.chat([
            ...aiMessages,
            { role: 'user', content: userMessage }
          ]);
        }
    }

    if (response.error) {
      addAIMessage({
        role: 'assistant',
        content: `Error: ${response.error}`
      });
    } else {
      addAIMessage({
        role: 'assistant',
        content: response.content
      });
    }

    setIsAILoading(false);
  };

  const handleQuickAction = async (action: 'analyze' | 'fix' | 'explain') => {
    if (!selectedFileForAI) {
      addAIMessage({
        role: 'assistant',
        content: 'Please select a file first by clicking the 3-dot menu on any file.'
      });
      return;
    }

    const file = getFileById(selectedFileForAI);
    if (!file) return;

    const content = getFileContent(selectedFileForAI);
    const language = file.language || 'javascript';

    let actionMessage = '';
    switch (action) {
      case 'analyze':
        actionMessage = `Analyzing ${file.name}...`;
        break;
      case 'fix':
        actionMessage = `Fixing errors in ${file.name}...`;
        break;
      case 'explain':
        actionMessage = `Explaining ${file.name}...`;
        break;
    }

    addAIMessage({ role: 'system', content: actionMessage });
    setIsAILoading(true);

    let response;
    switch (action) {
      case 'analyze':
        response = await aiService.analyzeCode(content, language);
        break;
      case 'fix':
        response = await aiService.fixErrors(content, language);
        break;
      case 'explain':
        response = await aiService.explainCode(content, language);
        break;
    }

    if (response.error) {
      addAIMessage({
        role: 'assistant',
        content: `Error: ${response.error}`
      });
    } else {
      addAIMessage({
        role: 'assistant',
        content: response.content
      });
    }

    setIsAILoading(false);
  };

  const selectedFile = selectedFileForAI ? getFileById(selectedFileForAI) : null;

  return (
    <div className="h-full flex flex-col bg-[#252526] text-gray-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d2d] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-purple-400" />
          <span className="font-semibold text-sm">AI Assistant</span>
        </div>
        <button
          onClick={clearAIMessages}
          className="p-1.5 hover:bg-[#3c3c3c] rounded text-gray-400 hover:text-white transition-colors"
          title="Clear chat"
        >
          <X size={16} />
        </button>
      </div>

      {/* Selected File Info */}
      {selectedFile && (
        <div className="px-4 py-2 bg-[#1e1e1e] border-b border-[#3c3c3c]">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Working on:</span>
            <span className="text-blue-400 font-medium">{selectedFile.name}</span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 py-3 border-b border-[#3c3c3c]">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleQuickAction('analyze')}
            disabled={isAILoading}
            className="flex flex-col items-center gap-1 p-2 bg-[#1e1e1e] hover:bg-[#2d2d2d] rounded-lg transition-colors disabled:opacity-50"
          >
            <Sparkles size={18} className="text-purple-400" />
            <span className="text-xs">Analyze</span>
          </button>
          <button
            onClick={() => handleQuickAction('fix')}
            disabled={isAILoading}
            className="flex flex-col items-center gap-1 p-2 bg-[#1e1e1e] hover:bg-[#2d2d2d] rounded-lg transition-colors disabled:opacity-50"
          >
            <Wand2 size={18} className="text-green-400" />
            <span className="text-xs">Fix</span>
          </button>
          <button
            onClick={() => handleQuickAction('explain')}
            disabled={isAILoading}
            className="flex flex-col items-center gap-1 p-2 bg-[#1e1e1e] hover:bg-[#2d2d2d] rounded-lg transition-colors disabled:opacity-50"
          >
            <Lightbulb size={18} className="text-yellow-400" />
            <span className="text-xs">Explain</span>
          </button>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex border-b border-[#3c3c3c]">
        {(['chat', 'generate', 'fix'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setActiveMode(mode)}
            className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
              activeMode === mode
                ? 'bg-[#37373d] text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white hover:bg-[#2d2d2d]'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {aiMessages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Bot size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm">How can I help you today?</p>
            <div className="mt-4 space-y-2 text-xs">
              <p className="text-gray-600">Try:</p>
              <button
                onClick={() => setInput('Generate a responsive navbar')}
                className="block w-full px-3 py-2 bg-[#1e1e1e] hover:bg-[#2d2d2d] rounded text-left"
              >
                "Generate a responsive navbar"
              </button>
              <button
                onClick={() => setInput('Explain this code')}
                className="block w-full px-3 py-2 bg-[#1e1e1e] hover:bg-[#2d2d2d] rounded text-left"
              >
                "Explain this code"
              </button>
              <button
                onClick={() => setInput('Fix the errors in this code')}
                className="block w-full px-3 py-2 bg-[#1e1e1e] hover:bg-[#2d2d2d] rounded text-left"
              >
                "Fix the errors in this code"
              </button>
            </div>
          </div>
        )}

        {aiMessages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'user'
                ? 'bg-blue-500'
                : message.role === 'system'
                ? 'bg-gray-600'
                : 'bg-purple-500'
            }`}>
              {message.role === 'user' ? (
                <User size={16} className="text-white" />
              ) : message.role === 'system' ? (
                <Code size={16} className="text-white" />
              ) : (
                <Bot size={16} className="text-white" />
              )}
            </div>
            <div className={`flex-1 max-w-[80%] rounded-lg p-3 text-sm ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : message.role === 'system'
                ? 'bg-gray-700 text-gray-300'
                : 'bg-[#1e1e1e] text-gray-300 border border-[#3c3c3c]'
            }`}>
              <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
            </div>
          </div>
        ))}

        {isAILoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
              <Loader2 size={16} className="text-white animate-spin" />
            </div>
            <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg p-3">
              <span className="text-sm text-gray-400">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#3c3c3c]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              activeMode === 'generate'
                ? 'Describe what code to generate...'
                : activeMode === 'fix'
                ? 'Describe the error or leave empty...'
                : 'Ask me anything...'
            }
            className="flex-1 bg-[#1e1e1e] text-gray-300 text-sm px-4 py-2.5 rounded-lg border border-[#3c3c3c] outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isAILoading}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

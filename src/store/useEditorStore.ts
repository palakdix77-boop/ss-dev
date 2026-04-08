import { create } from 'zustand';

interface EditorState {
  html: string;
  css: string;
  js: string;
  activeTab: 'html' | 'css' | 'js';
  setHtml: (val: string) => void;
  setCss: (val: string) => void;
  setJs: (val: string) => void;
  setActiveTab: (tab: 'html' | 'css' | 'js') => void;
  getCombinedHtml: () => string;
}

const defaultHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SS DEV</title>
</head>
<body>
  <h1>Welcome to SS DEV</h1>
  <p>Start editing to see magic happen!</p>
</body>
</html>`;

const defaultCss = `body {
  font-family: system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin: 0;
  background-color: #f0f0f0;
}

h1 {
  color: #333;
}`;

const defaultJs = `console.log("Welcome to SS DEV!");`;

export const useEditorStore = create<EditorState>((set, get) => ({
  html: defaultHtml,
  css: defaultCss,
  js: defaultJs,
  activeTab: 'html',
  setHtml: (html) => set({ html }),
  setCss: (css) => set({ css }),
  setJs: (js) => set({ js }),
  setActiveTab: (activeTab) => set({ activeTab }),
  getCombinedHtml: () => {
    const { html, css, js } = get();
    // A simple injection strategy
    return `
      ${html}
      <style>${css}</style>
      <script>${js}</script>
    `;
  },
}));

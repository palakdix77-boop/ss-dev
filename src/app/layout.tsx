import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SS Dev - Code Editor",
  description: "HopWeb-style online code editor with AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: '极影资料库 - 个人影视数据库与全网资源导航',
  description: '现代化的个人影视资料库与资源导航网站，基于 Next.js 与 PostgreSQL 构建，汇集高分电影、剧集、日漫与多源下载索引。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="min-h-screen flex flex-col bg-cinema-950 text-zinc-100 antialiased selection:bg-brand selection:text-white">
        <ToastProvider>
          <Suspense fallback={<div className="h-16 w-full bg-cinema-950/80 border-b border-white/5" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}

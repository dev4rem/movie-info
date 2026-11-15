'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Film, Search, ShieldCheck, Sparkles, X, Menu } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams?.get('q') || '';
  const currentType = searchParams?.get('type') || '全部';

  const [keyword, setKeyword] = useState(currentQuery);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (trimmed) {
      router.push(`/?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/');
    }
  };

  const navCategories = [
    { label: '全部', type: '全部' },
    { label: '电影', type: '电影' },
    { label: '电视剧', type: '电视剧' },
    { label: '动漫', type: '动漫' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-cinema-950/80 border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo 区域 */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand to-rose-600 flex items-center justify-center shadow-lg shadow-brand/20 group-hover:scale-105 transition-transform duration-300">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg sm:text-xl tracking-wider text-white flex items-center gap-1.5">
              极影<span className="text-red-500">资料库</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            </span>
            <span className="text-[10px] text-zinc-400 tracking-widest uppercase font-mono">
              CineNav DB
            </span>
          </div>
        </Link>

        {/* 桌面端导航分类切换 */}
        <nav className="hidden md:flex items-center gap-1 bg-cinema-900/80 p-1 rounded-xl border border-white/5 text-sm">
          {navCategories.map((cat) => {
            const isActive = currentType === cat.type && !currentQuery;
            return (
              <Link
                key={cat.type}
                href={cat.type === '全部' ? '/' : `/?type=${encodeURIComponent(cat.type)}`}
                className={`px-4 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand text-white shadow-md shadow-brand/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </nav>

        {/* 全局搜索框与后台入口 */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative hidden sm:block w-48 md:w-64 lg:w-72">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索电影、剧集、原名..."
              className="w-full bg-cinema-900 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/50 transition-all"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {keyword && (
              <button
                type="button"
                onClick={() => {
                  setKeyword('');
                  router.push('/');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* 后台管理入口 */}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>管理后台</span>
          </Link>

          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 移动端展开导航与搜索 */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-cinema-950 px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索电影、剧集、原名..."
              className="w-full bg-cinema-900 border border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500/60"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>
          <div className="grid grid-cols-4 gap-2 pt-1">
            {navCategories.map((cat) => (
              <Link
                key={cat.type}
                href={cat.type === '全部' ? '/' : `/?type=${encodeURIComponent(cat.type)}`}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-center rounded-lg text-xs font-medium text-zinc-300 bg-white/5 hover:bg-white/10"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

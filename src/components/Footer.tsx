import React from 'react';
import Link from 'next/link';
import { Film, Database, Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-cinema-950/90 text-zinc-400 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white">
                <Film className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-lg tracking-wider">
                极影资料库与资源导航
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md">
              现代化个人影视数据中枢与多源下载索引平台。聚合高分经典电影、热门剧集及动漫资源，配备一键直达与复制提取码功能，打造私有化数字影音指南。
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-zinc-500 font-mono">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>PostgreSQL + Next.js 驱动</span>
            </div>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">影视分类</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/?type=电影" className="hover:text-white transition-colors">
                  经典高分电影
                </Link>
              </li>
              <li>
                <Link href="/?type=电视剧" className="hover:text-white transition-colors">
                  热播连续剧集
                </Link>
              </li>
              <li>
                <Link href="/?type=动漫" className="hover:text-white transition-colors">
                  热血日漫番剧
                </Link>
              </li>
              <li>
                <Link href="/?sort=rating" className="hover:text-white transition-colors">
                  豆瓣与IMDb高分榜
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">系统管理</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/admin" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>后台控制面板</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  批量添加资源
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  TMDB 元数据导入
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} 极影影视导航 (CineNav). 本站为个人影视收藏及资源整理系统，内容均来自互联网公开索引。</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>for Cinephiles</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

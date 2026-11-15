'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Flame,
  Star,
  Film,
  Sparkles,
  SlidersHorizontal,
  Clock,
  ChevronRight,
  Play,
  RotateCcw,
} from 'lucide-react';
import MediaCard from '@/components/MediaCard';
import { MediaItem } from '@/lib/types';

const GENRE_TAGS = [
  '全部',
  '科幻',
  '悬疑',
  '动作',
  '剧情',
  '冒险',
  '奇幻',
  '犯罪',
  '动漫',
];

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = searchParams?.get('type') || '全部';
  const currentTag = searchParams?.get('tag') || '全部';
  const currentQuery = searchParams?.get('q') || '';
  const currentSort = searchParams?.get('sort') || 'default';

  const [mediaList, setMediaList] = useState<Array<MediaItem & { resource_count?: number }>>([]);
  const [loading, setLoading] = useState(true);

  // 加载数据
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (currentType !== '全部') params.set('type', currentType);
        if (currentTag !== '全部') params.set('tag', currentTag);
        if (currentQuery) params.set('q', currentQuery);

        const res = await fetch(`/api/media?${params.toString()}`);
        const json = await res.json();
        if (json.success) {
          setMediaList(json.data);
        }
      } catch (err) {
        console.error('Fetch media list failed:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [currentType, currentTag, currentQuery]);

  // 处理筛选变动
  const handleTypeChange = (type: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (type === '全部') {
      params.delete('type');
    } else {
      params.set('type', type);
    }
    router.push(`/?${params.toString()}`);
  };

  const handleTagChange = (tag: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (tag === '全部') {
      params.delete('tag');
    } else {
      params.set('tag', tag);
    }
    router.push(`/?${params.toString()}`);
  };

  const handleClearFilters = () => {
    router.push('/');
  };

  // 轮播/特色置顶大图（取评分最高或指定的一部）
  const featuredMedia = useMemo(() => {
    if (mediaList.length === 0) return null;
    return mediaList[0];
  }, [mediaList]);

  // “最新更新”列表（按更新时间排序）
  const latestUpdates = useMemo(() => {
    return [...mediaList].sort(
      (a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
    );
  }, [mediaList]);

  // “高分推荐”列表（按评分降序排序）
  const topRated = useMemo(() => {
    return [...mediaList].sort((a, b) => Number(b.rating) - Number(a.rating));
  }, [mediaList]);

  const isFiltering = currentType !== '全部' || currentTag !== '全部' || !!currentQuery;

  return (
    <div className="space-y-10 pb-12">
      {/* 顶部 Hero 巨幕海报横幅 (仅在无特定过滤时展示) */}
      {!isFiltering && featuredMedia && (
        <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-950">
          <div className="relative h-[340px] sm:h-[420px] md:h-[480px] w-full">
            {/* 背景大图 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featuredMedia.backdrop_url || featuredMedia.poster_url || ''}
              alt={featuredMedia.title}
              className="w-full h-full object-cover object-top opacity-50 filter brightness-75 scale-100 animate-pulse duration-1000"
            />
            {/* 多重深色电影级渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-r from-cinema-950 via-cinema-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-cinema-950/40 to-transparent" />

            {/* 文字内容区 */}
            <div className="absolute inset-0 p-6 sm:p-10 md:p-14 flex flex-col justify-end max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-brand/80 text-white shadow-lg shadow-brand/30">
                  <Flame className="w-3.5 h-3.5 fill-white" />
                  今日精选推荐
                </span>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {Number(featuredMedia.rating).toFixed(1)} 分
                </span>
                <span className="text-xs text-zinc-400 font-medium">
                  {featuredMedia.year} · {featuredMedia.country}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-2 drop-shadow-md">
                {featuredMedia.title}
              </h1>

              {featuredMedia.original_title && (
                <p className="text-sm sm:text-base text-zinc-400 font-mono mb-3">
                  {featuredMedia.original_title}
                </p>
              )}

              <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 sm:line-clamp-3 mb-6 leading-relaxed text-shadow">
                {featuredMedia.overview}
              </p>

              <div className="flex items-center gap-3">
                <Link
                  href={`/media/${featuredMedia.id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand hover:bg-brand-hover text-white font-semibold text-sm shadow-xl shadow-brand/25 transition-all duration-200 hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>查看详情与资源</span>
                </Link>
                <div className="hidden sm:flex items-center gap-1.5">
                  {featuredMedia.tags?.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/10 text-zinc-300 backdrop-blur-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 筛选与标签导航栏 */}
      <div className="space-y-4 bg-cinema-900/60 p-5 rounded-2xl border border-white/5 backdrop-blur-md">
        {/* 类型筛选（电影 / 电视剧 / 动漫） */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mr-2 hidden sm:inline-block">
              类型:
            </span>
            {['全部', '电影', '电视剧', '动漫'].map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  currentType === type
                    ? 'bg-zinc-100 text-zinc-950 font-bold shadow-md'
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* 活跃过滤指示 */}
          {isFiltering && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置所有筛选</span>
            </button>
          )}
        </div>

        {/* 题材分类标签筛选 */}
        <div className="pt-2 border-t border-white/5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
            <span>标签:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {GENRE_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagChange(tag)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  currentTag === tag
                    ? 'bg-red-500/20 border border-red-500/50 text-red-300'
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 搜索过滤状态标题 */}
      {currentQuery && (
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <div>
            搜索关键词: <span className="text-white font-bold">“{currentQuery}”</span>
            <span className="ml-2 text-xs text-zinc-500">（共匹配到 {mediaList.length} 部影视）</span>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-xs text-brand hover:underline"
          >
            返回全部影视
          </button>
        </div>
      )}

      {/* 加载状态 */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-zinc-500 space-y-3">
          <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-xs">正在连接影视数据库...</p>
        </div>
      ) : mediaList.length === 0 ? (
        /* 空状态 */
        <div className="py-20 flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] text-center p-8">
          <Film className="w-16 h-16 text-zinc-600 mb-3 stroke-1" />
          <h3 className="text-base font-semibold text-zinc-200">未找到符合条件的影视作品</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm">
            尝试更换搜索词或清除分类标签筛选，或进入后台面板添加新的影视数据。
          </p>
          <button
            onClick={handleClearFilters}
            className="mt-5 px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-all"
          >
            查看全部影视作品
          </button>
        </div>
      ) : isFiltering ? (
        /* 筛选或搜索时的聚合网格展示 */
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-brand" />
              <span>筛选结果 ({mediaList.length})</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {mediaList.map((item) => (
              <MediaCard key={item.id} media={item} />
            ))}
          </div>
        </section>
      ) : (
        /* 默认首页展示：“最新更新”与“高分推荐”两大核心板块 */
        <div className="space-y-12">
          {/* 最新更新 */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Clock className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-wide">
                  最新更新
                </h2>
                <span className="text-xs text-zinc-500 hidden sm:inline">
                  近期收录与资源更新作品
                </span>
              </div>
              <span className="text-xs text-zinc-400">
                共 {latestUpdates.length} 部
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {latestUpdates.map((item) => (
                <MediaCard key={item.id} media={item} />
              ))}
            </div>
          </section>

          {/* 高分推荐 */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-wide">
                  高分推荐
                </h2>
                <span className="text-xs text-zinc-500 hidden sm:inline">
                  豆瓣与 IMDb 9.0+ 神作排行榜
                </span>
              </div>
              <span className="text-xs text-zinc-400">
                按综合评分排序
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {topRated.map((item) => (
                <MediaCard key={item.id} media={item} />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-zinc-500 text-sm">加载影视中心...</div>}>
      <HomeContent />
    </Suspense>
  );
}

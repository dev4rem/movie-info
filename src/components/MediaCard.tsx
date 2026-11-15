'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Link as LinkIcon, Film, Tv, Sparkles } from 'lucide-react';
import { MediaItem } from '@/lib/types';

interface MediaCardProps {
  media: MediaItem & { resource_count?: number };
}

export default function MediaCard({ media }: MediaCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case '电影':
        return 'bg-blue-600/90 text-blue-100 border-blue-400/30';
      case '电视剧':
        return 'bg-purple-600/90 text-purple-100 border-purple-400/30';
      case '动漫':
        return 'bg-amber-600/90 text-amber-100 border-amber-400/30';
      default:
        return 'bg-zinc-700/90 text-zinc-100 border-zinc-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case '电影':
        return <Film className="w-3 h-3" />;
      case '电视剧':
        return <Tv className="w-3 h-3" />;
      case '动漫':
        return <Sparkles className="w-3 h-3" />;
      default:
        return <Film className="w-3 h-3" />;
    }
  };

  return (
    <Link
      href={`/media/${media.id}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-cinema-900/60 border border-white/5 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-brand/10 hover:-translate-y-1.5"
    >
      {/* 海报容器 */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
        {media.poster_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.poster_url}
            alt={media.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-600 p-4 text-center">
            <Film className="w-12 h-12 mb-2 stroke-1" />
            <span className="text-xs">暂无海报</span>
          </div>
        )}

        {/* 顶部标签：类型 */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold backdrop-blur-md border shadow-sm ${getTypeColor(
              media.type
            )}`}
          >
            {getTypeIcon(media.type)}
            {media.type}
          </span>
        </div>

        {/* 顶部标签：评分 */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-bold shadow-md">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{Number(media.rating).toFixed(1)}</span>
          </div>
        </div>

        {/* 底部渐变阴影与资源数 */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-cinema-950 via-cinema-950/70 to-transparent flex items-end p-3 pointer-events-none">
          {media.resource_count !== undefined && media.resource_count > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-zinc-300 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
              <LinkIcon className="w-3 h-3 text-emerald-400" />
              <span>{media.resource_count} 个可用资源</span>
            </div>
          )}
        </div>
      </div>

      {/* 底部信息 */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-1.5">
        <div>
          <h3 className="font-semibold text-sm sm:text-base text-zinc-100 line-clamp-1 group-hover:text-red-400 transition-colors">
            {media.title}
          </h3>
          {media.original_title && (
            <p className="text-xs text-zinc-500 line-clamp-1 font-mono">
              {media.original_title}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-400 pt-1 border-t border-white/5">
          <span className="font-medium text-zinc-300">{media.year || '未知年份'}</span>
          <span className="truncate max-w-[120px] text-zinc-500 text-right">
            {media.tags && media.tags.length > 0 ? media.tags.slice(0, 2).join(' / ') : media.country || '影视'}
          </span>
        </div>
      </div>
    </Link>
  );
}

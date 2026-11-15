'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  Film,
  Tv,
  Sparkles,
  ArrowLeft,
  Copy,
  ExternalLink,
  HardDrive,
  Magnet,
  PlayCircle,
  Check,
  Calendar,
  Globe,
  Tag,
  Clock,
  Share2,
} from 'lucide-react';
import { MediaDetail, ResourceItem } from '@/lib/types';
import { useToast } from '@/components/Toast';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MediaDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [media, setMedia] = useState<MediaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [resourceFilter, setResourceFilter] = useState<string>('全部');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      try {
        const res = await fetch(`/api/media/${resolvedParams.id}`);
        const json = await res.json();
        if (json.success) {
          setMedia(json.data);
        } else {
          showToast({ message: json.message || '获取影视详情失败', type: 'error' });
        }
      } catch (err) {
        console.error('Fetch detail error:', err);
        showToast({ message: '网络请求错误', type: 'error' });
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [resolvedParams.id, showToast]);

  const handleCopy = async (text: string, label: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(keyId);
      showToast({ message: `已成功复制${label}！`, type: 'success' });
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch {
      showToast({ message: '复制失败，请手动长按复制', type: 'error' });
    }
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case '网盘链接':
        return <HardDrive className="w-4 h-4 text-sky-400" />;
      case '磁力链接':
        return <Magnet className="w-4 h-4 text-rose-400" />;
      case '在线播放':
        return <PlayCircle className="w-4 h-4 text-emerald-400" />;
      default:
        return <Film className="w-4 h-4 text-purple-400" />;
    }
  };

  const getResourceTypeBadge = (type: string) => {
    switch (type) {
      case '网盘链接':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case '磁力链接':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case '在线播放':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-4 text-zinc-500">
        <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">正在加载影视详情与资源...</p>
      </div>
    );
  }

  if (!media) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-zinc-300">未找到该影视作品信息</h2>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm hover:bg-white/15"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回首页</span>
        </Link>
      </div>
    );
  }

  // 资源过滤
  const filteredResources = media.resources.filter((r) => {
    if (resourceFilter === '全部') return true;
    return r.type === resourceFilter;
  });

  const resourceTypesCount = {
    全部: media.resources.length,
    网盘链接: media.resources.filter((r) => r.type === '网盘链接').length,
    磁力链接: media.resources.filter((r) => r.type === '磁力链接').length,
    在线播放: media.resources.filter((r) => r.type === '在线播放').length,
  };

  return (
    <div className="space-y-12 pb-16">
      {/* 沉浸式背景大图 (Backdrop) */}
      <div className="relative -mt-6 -mx-4 sm:-mx-6 lg:-mx-8 h-72 sm:h-96 md:h-[440px] overflow-hidden border-b border-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media.backdrop_url || media.poster_url || ''}
          alt={media.title}
          className="w-full h-full object-cover object-top opacity-35 filter brightness-90 blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-cinema-950/70 to-cinema-950/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-950 via-cinema-950/60 to-transparent" />

        {/* 返回按钮 */}
        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-xs sm:text-sm font-medium text-zinc-300 hover:text-white transition-all shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回上一页</span>
          </button>
        </div>
      </div>

      {/* 核心信息卡片 */}
      <div className="relative -mt-36 sm:-mt-48 z-10 flex flex-col md:flex-row gap-8 items-start">
        {/* 左侧海报图 */}
        <div className="w-48 sm:w-60 md:w-72 shrink-0 mx-auto md:mx-0 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl bg-zinc-950">
          <div className="aspect-[2/3] relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={media.poster_url || ''}
              alt={media.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 右侧文字与详细属性 */}
        <div className="flex-1 space-y-5 text-center md:text-left">
          {/* 分类与评分角标 */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-brand text-white shadow-md shadow-brand/30">
              {media.type}
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/60 border border-amber-500/40 text-amber-300 text-sm font-bold shadow-md">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{Number(media.rating).toFixed(1)} 分</span>
            </div>
            {media.year && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-300">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>{media.year} 年</span>
              </span>
            )}
            {media.country && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-300">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                <span>{media.country}</span>
              </span>
            )}
          </div>

          {/* 标题 */}
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              {media.title}
            </h1>
            {media.original_title && (
              <p className="text-sm sm:text-base text-zinc-400 font-mono mt-1">
                {media.original_title}
              </p>
            )}
          </div>

          {/* 标签 */}
          {media.tags && media.tags.length > 0 && (
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1">
              <Tag className="w-3.5 h-3.5 text-zinc-500 mr-1 hidden sm:inline" />
              {media.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-cinema-900 border border-white/10 text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 剧情简介 */}
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-bold text-zinc-200 tracking-wider flex items-center justify-center md:justify-start gap-1.5">
              <span>剧情简介</span>
            </h3>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed text-justify max-w-3xl">
              {media.overview || '暂无剧情简介'}
            </p>
          </div>

          {/* 附加元数据 */}
          <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>更新时间: {new Date(media.updated_at || media.created_at).toLocaleDateString()}</span>
            </span>
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-zinc-400" />
              <span>已收录资源: {media.resources.length} 条</span>
            </span>
          </div>
        </div>
      </div>

      {/* 资源列表区域 */}
      <section className="space-y-6 pt-6 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand/20 text-brand flex items-center justify-center border border-brand/30">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                影视资源列表
              </h2>
              <p className="text-xs text-zinc-400">
                支持网盘转存、磁力下载与在线免VIP播放
              </p>
            </div>
          </div>

          {/* 资源类型过滤 Pills */}
          <div className="flex items-center gap-1.5 bg-cinema-900 p-1 rounded-xl border border-white/5 text-xs overflow-x-auto">
            {(['全部', '网盘链接', '磁力链接', '在线播放'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setResourceFilter(t)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  resourceFilter === t
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {t} ({resourceTypesCount[t]})
              </button>
            ))}
          </div>
        </div>

        {/* 资源卡片列表 */}
        {filteredResources.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-6 space-y-2">
            <HardDrive className="w-12 h-12 text-zinc-600 mx-auto stroke-1" />
            <h4 className="text-sm font-semibold text-zinc-300">
              {resourceFilter === '全部'
                ? '暂无该影视的下载或播放资源'
                : `暂无“${resourceFilter}”类型的资源`}
            </h4>
            <p className="text-xs text-zinc-500">
              您可以访问管理后台为此影片添加新的网盘或磁力资源。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {filteredResources.map((res) => {
              const copyUrlKey = `url-${res.id}`;
              const copyCodeKey = `code-${res.id}`;
              const isUrlCopied = copiedId === copyUrlKey;
              const isCodeCopied = copiedId === copyCodeKey;

              return (
                <div
                  key={res.id}
                  className="group flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-5 rounded-2xl bg-cinema-900/80 border border-white/5 hover:border-white/20 transition-all duration-200 hover:shadow-xl hover:shadow-black/40 gap-4"
                >
                  {/* 资源详情与备注 */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getResourceTypeBadge(
                          res.type
                        )}`}
                      >
                        {getResourceTypeIcon(res.type)}
                        <span>{res.type}</span>
                      </span>
                      <h4 className="text-sm sm:text-base font-semibold text-zinc-100 group-hover:text-red-400 transition-colors break-all">
                        {res.name}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      {res.code && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 font-mono">
                          <span>提取码 / 备注:</span>
                          <strong className="font-bold select-all text-amber-200">{res.code}</strong>
                          <button
                            type="button"
                            onClick={() => handleCopy(res.code || '', '提取码', copyCodeKey)}
                            className="p-0.5 hover:text-white rounded transition-colors ml-1"
                            title="复制提取码"
                          >
                            {isCodeCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-amber-400" />
                            )}
                          </button>
                        </div>
                      )}

                      <span className="text-zinc-500 truncate max-w-xs sm:max-w-md font-mono">
                        {res.url}
                      </span>
                    </div>
                  </div>

                  {/* 动作按钮区 */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
                    {/* 一键复制链接按钮 */}
                    <button
                      type="button"
                      onClick={() => handleCopy(res.url, '资源链接', copyUrlKey)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                        isUrlCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10'
                      }`}
                    >
                      {isUrlCopied ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>已复制链接</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>复制链接</span>
                        </>
                      )}
                    </button>

                    {/* 直接打开按钮 */}
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-brand hover:bg-brand-hover text-white shadow-md shadow-brand/20 transition-all hover:scale-105"
                    >
                      <span>前往获取</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Film,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Search,
  LogOut,
  HardDrive,
  Database,
  Star,
  Sparkles,
  Tv,
  Layers,
  X,
  Check,
  AlertTriangle,
  DownloadCloud,
  FileText,
  ListPlus,
  Upload,
} from 'lucide-react';
import { MediaItem, ResourceItem } from '@/lib/types';
import { useToast } from '@/components/Toast';

export default function AdminPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [mediaList, setMediaList] = useState<Array<MediaItem & { resource_count?: number }>>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterType, setFilterType] = useState('全部');

  // 模态框状态
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);

  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [currentMediaForResources, setCurrentMediaForResources] = useState<MediaItem | null>(null);
  const [mediaResources, setMediaResources] = useState<ResourceItem[]>([]);
  const [resourceTab, setResourceTab] = useState<'single' | 'batch'>('single');

  const [tmdbModalOpen, setTmdbModalOpen] = useState(false);
  const [tmdbPresets, setTmdbPresets] = useState<any[]>([]);

  // 检查管理员鉴权
  useEffect(() => {
    async function checkAuthAndLoad() {
      try {
        const authRes = await fetch('/api/admin/check');
        const authJson = await authRes.json();
        if (!authJson.authenticated) {
          router.push('/admin/login');
          return;
        }
        await fetchMediaList();
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }
    checkAuthAndLoad();
  }, [router]);

  // 加载影视作品列表
  const fetchMediaList = async () => {
    try {
      const res = await fetch('/api/media?limit=200');
      const json = await res.json();
      if (json.success) {
        setMediaList(json.data);
      }
    } catch (err) {
      console.error('Fetch media list failed:', err);
    }
  };

  // 退出登录
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      showToast({ message: '已安全退出管理后台', type: 'info' });
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  // 删除影视作品
  const handleDeleteMedia = async (id: number, title: string) => {
    if (!window.confirm(`确定要彻底删除《${title}》及其包含的所有资源吗？此操作无法撤销。`)) {
      return;
    }

    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast({ message: `已成功删除《${title}》`, type: 'success' });
        fetchMediaList();
      } else {
        showToast({ message: json.message || '删除失败', type: 'error' });
      }
    } catch (err) {
      console.error('Delete media error:', err);
      showToast({ message: '网络错误，删除失败', type: 'error' });
    }
  };

  // 打开资源管理模态框
  const handleOpenResources = async (media: MediaItem) => {
    setCurrentMediaForResources(media);
    setResourceModalOpen(true);
    setResourceTab('single');
    try {
      const res = await fetch(`/api/media/${media.id}`);
      const json = await res.json();
      if (json.success) {
        setMediaResources(json.data.resources || []);
      }
    } catch (err) {
      console.error('Fetch resources error:', err);
    }
  };

  // 打开 TMDB 导入模态框
  const handleOpenTmdb = async () => {
    setTmdbModalOpen(true);
    try {
      const res = await fetch('/api/tmdb');
      const json = await res.json();
      if (json.success && json.data) {
        setTmdbPresets(json.data);
      }
    } catch (err) {
      console.error('Fetch TMDB error:', err);
    }
  };

  // 过滤后的列表
  const filteredList = useMemo(() => {
    return mediaList.filter((item) => {
      const matchType = filterType === '全部' || item.type === filterType;
      const matchKeyword =
        !searchKeyword ||
        item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.original_title?.toLowerCase().includes(searchKeyword.toLowerCase());
      return matchType && matchKeyword;
    });
  }, [mediaList, filterType, searchKeyword]);

  // 统计指标
  const stats = useMemo(() => {
    const totalMedia = mediaList.length;
    const totalResources = mediaList.reduce((acc, m) => acc + (m.resource_count || 0), 0);
    const moviesCount = mediaList.filter((m) => m.type === '电影').length;
    const tvAndAnimeCount = mediaList.filter((m) => m.type === '电视剧' || m.type === '动漫').length;
    return { totalMedia, totalResources, moviesCount, tvAndAnimeCount };
  }, [mediaList]);

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-4 text-zinc-500">
        <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">正在验证管理员权限...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* 顶部标题与控制动作 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              已授权管理权限
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide mt-1">
            影视资料库后台管理
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            维护影视元数据、海报图片，以及多源下载与播放链接
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* TMDB 导入占位按钮 */}
          <button
            onClick={handleOpenTmdb}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs sm:text-sm font-medium transition-all"
          >
            <DownloadCloud className="w-4 h-4 text-sky-400" />
            <span>从 TMDB 导入</span>
          </button>

          {/* 新增影视按钮 */}
          <button
            onClick={() => {
              setEditingMedia(null);
              setMediaModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold shadow-lg shadow-brand/20 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>新增影视作品</span>
          </button>

          {/* 退出登录 */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 text-xs sm:text-sm transition-all"
            title="退出登录"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">退出</span>
          </button>
        </div>
      </div>

      {/* 统计概览卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-cinema-900/80 border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>总收录影视</span>
            <Film className="w-4 h-4 text-brand" />
          </div>
          <div className="text-2xl font-black text-white">{stats.totalMedia}</div>
          <p className="text-[11px] text-zinc-500">已入库作品总量</p>
        </div>

        <div className="p-4 rounded-2xl bg-cinema-900/80 border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>总关联资源</span>
            <HardDrive className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.totalResources}</div>
          <p className="text-[11px] text-zinc-500">网盘、磁力与直链</p>
        </div>

        <div className="p-4 rounded-2xl bg-cinema-900/80 border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>电影收录</span>
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.moviesCount}</div>
          <p className="text-[11px] text-zinc-500">经典与院线大片</p>
        </div>

        <div className="p-4 rounded-2xl bg-cinema-900/80 border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>剧集与动漫</span>
            <Tv className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.tvAndAnimeCount}</div>
          <p className="text-[11px] text-zinc-500">多季剧集与番剧</p>
        </div>
      </div>

      {/* 搜索与分类过滤 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-cinema-900/60 p-3.5 rounded-2xl border border-white/5">
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto">
          {['全部', '电影', '电视剧', '动漫'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                filterType === t
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜索管理影视..."
            className="w-full bg-cinema-950 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500/60"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* 影视作品列表表格 */}
      <div className="rounded-2xl border border-white/10 overflow-hidden bg-cinema-900/50 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-cinema-950/80 text-zinc-400 border-b border-white/5 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">海报 / 作品信息</th>
                <th className="py-3 px-4 font-semibold">类型</th>
                <th className="py-3 px-4 font-semibold">地区/年份</th>
                <th className="py-3 px-4 font-semibold">评分</th>
                <th className="py-3 px-4 font-semibold">资源数量</th>
                <th className="py-3 px-4 font-semibold text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    未找到相关的影视记录
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* 海报与标题 */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-16 rounded-lg overflow-hidden bg-zinc-950 shrink-0 border border-white/10">
                          {item.poster_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.poster_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-700">
                              <Film className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/media/${item.id}`}
                            target="_blank"
                            className="font-bold text-white hover:text-red-400 transition-colors line-clamp-1 text-sm sm:text-base flex items-center gap-1"
                          >
                            <span>{item.title}</span>
                            <ExternalLink className="w-3 h-3 text-zinc-500" />
                          </Link>
                          {item.original_title && (
                            <p className="text-xs text-zinc-500 truncate font-mono">
                              {item.original_title}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            {item.tags?.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-zinc-400"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 类型 */}
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 border border-white/10 text-zinc-200">
                        {item.type}
                      </span>
                    </td>

                    {/* 地区与年份 */}
                    <td className="py-3 px-4 text-xs text-zinc-400">
                      <div>{item.country || '未标明'}</div>
                      <div className="text-zinc-500">{item.year || '未知年份'}</div>
                    </td>

                    {/* 评分 */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-bold text-amber-400 text-xs sm:text-sm">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{Number(item.rating).toFixed(1)}</span>
                      </div>
                    </td>

                    {/* 资源数 */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleOpenResources(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                      >
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>{item.resource_count || 0} 个资源</span>
                      </button>
                    </td>

                    {/* 操作按钮 */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenResources(item)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                          title="管理该影视下的资源链接"
                        >
                          <HardDrive className="w-4 h-4 text-emerald-400" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingMedia(item);
                            setMediaModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                          title="编辑影视信息"
                        >
                          <Edit className="w-4 h-4 text-sky-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteMedia(item.id, item.title)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                          title="删除影视作品"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 模态框 1: 新增 / 编辑影视信息 */}
      {mediaModalOpen && (
        <MediaFormModal
          initialData={editingMedia}
          onClose={() => setMediaModalOpen(false)}
          onSuccess={() => {
            setMediaModalOpen(false);
            fetchMediaList();
          }}
        />
      )}

      {/* 模态框 2: 影视资源管理 (包含单条添加与批量添加) */}
      {resourceModalOpen && currentMediaForResources && (
        <ResourceManagerModal
          media={currentMediaForResources}
          resources={mediaResources}
          onClose={() => setResourceModalOpen(false)}
          onRefresh={() => {
            handleOpenResources(currentMediaForResources);
            fetchMediaList();
          }}
        />
      )}

      {/* 模态框 3: 从 TMDB 导入占位与模拟 */}
      {tmdbModalOpen && (
        <TmdbImportModal
          presets={tmdbPresets}
          onClose={() => setTmdbModalOpen(false)}
          onImport={(data) => {
            setTmdbModalOpen(false);
            setEditingMedia({
              id: 0,
              ...data,
              tags: Array.isArray(data.tags) ? data.tags : [],
            } as any);
            setMediaModalOpen(true);
          }}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 子组件：新增/编辑影视作品表单弹窗
// -------------------------------------------------------------
interface MediaFormModalProps {
  initialData: MediaItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

function MediaFormModal({ initialData, onClose, onSuccess }: MediaFormModalProps) {
  const { showToast } = useToast();
  const isEditing = !!initialData && initialData.id > 0;

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    original_title: initialData?.original_title || '',
    type: initialData?.type || '电影',
    year: initialData?.year || new Date().getFullYear(),
    country: initialData?.country || '美国',
    overview: initialData?.overview || '',
    poster_url: initialData?.poster_url || '',
    backdrop_url: initialData?.backdrop_url || '',
    rating: initialData?.rating !== undefined ? initialData.rating : 8.5,
    tags: initialData?.tags?.join(', ') || '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast({ message: '影视标题不能为空', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        year: formData.year ? parseInt(String(formData.year), 10) : null,
        rating: parseFloat(String(formData.rating)) || 0,
        tags: formData.tags.split(/[,，\s]+/).filter(Boolean),
      };

      const url = isEditing ? `/api/media/${initialData.id}` : '/api/media';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        showToast({
          message: isEditing ? '影视信息更新成功' : '新增影视作品成功！',
          type: 'success',
        });
        onSuccess();
      } else {
        showToast({ message: json.message || '保存失败', type: 'error' });
      }
    } catch (err) {
      console.error('Save media error:', err);
      showToast({ message: '网络请求错误', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-cinema-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-brand" />
            <h3 className="text-lg font-bold text-white">
              {isEditing ? `编辑影视：《${initialData.title}》` : '新增影视作品'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-300">中文标题 *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="例如：星际穿越"
                className="w-full bg-cinema-950 border border-white/10 rounded-xl px-3.5 py-2 text-zinc-200 focus:outline-none focus:border-red-500/60"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-300">原名 / 英文名</label>
              <input
                type="text"
                value={formData.original_title}
                onChange={(e) => setFormData({ ...formData, original_title: e.target.value })}
                placeholder="例如：Interstellar"
                className="w-full bg-cinema-950 border border-white/10 rounded-xl px-3.5 py-2 text-zinc-200 focus:outline-none focus:border-red-500/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-300">类型</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-cinema-950 border border-white/10 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-red-500/60"
              >
                <option value="电影">电影</option>
                <option value="电视剧">电视剧</option>
                <option value="动漫">动漫</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-300">上映年份</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-cinema-950 border border-white/10 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-red-500/60"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-300">国家 / 地区</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="例如：美国"
                className="w-full bg-cinema-950 border border-white/10 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-red-500/60"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-300">评分 (1-10分)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                className="w-full bg-cinema-950 border border-white/10 rounded-xl px-3 py-2 text-amber-300 font-bold focus:outline-none focus:border-red-500/60"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-zinc-300">
              分类标签 (用逗号或空格分隔)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="例如：科幻, 悬疑, 冒险"
              className="w-full bg-cinema-950 border border-white/10 rounded-xl px-3.5 py-2 text-zinc-200 focus:outline-none focus:border-red-500/60"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-300">海报图片 URL</label>
              <input
                type="text"
                value={formData.poster_url}
                onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                placeholder="https://... 海报链接"
                className="w-full bg-cinema-950 border border-white/10 rounded-xl px-3.5 py-2 text-zinc-200 focus:outline-none focus:border-red-500/60"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-300">剧照背景大图 URL (可选)</label>
              <input
                type="text"
                value={formData.backdrop_url}
                onChange={(e) => setFormData({ ...formData, backdrop_url: e.target.value })}
                placeholder="https://... 剧照背景"
                className="w-full bg-cinema-950 border border-white/10 rounded-xl px-3.5 py-2 text-zinc-200 focus:outline-none focus:border-red-500/60"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-zinc-300">剧情简介</label>
            <textarea
              rows={4}
              value={formData.overview}
              onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
              placeholder="请输入影视作品的详细剧情介绍..."
              className="w-full bg-cinema-950 border border-white/10 rounded-xl p-3 text-zinc-200 focus:outline-none focus:border-red-500/60 leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-semibold shadow-lg shadow-brand/20 disabled:opacity-50"
            >
              {submitting ? '正在保存...' : isEditing ? '保存修改' : '立即创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 子组件：资源链接管理弹窗（包含单条添加与批量添加）
// -------------------------------------------------------------
interface ResourceManagerModalProps {
  media: MediaItem;
  resources: ResourceItem[];
  onClose: () => void;
  onRefresh: () => void;
}

function ResourceManagerModal({
  media,
  resources,
  onClose,
  onRefresh,
}: ResourceManagerModalProps) {
  const { showToast } = useToast();
  const [tab, setTab] = useState<'single' | 'batch'>('single');

  // 单条添加字段
  const [name, setName] = useState('');
  const [type, setType] = useState('网盘链接');
  const [code, setCode] = useState('');
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 批量添加文本
  const [batchText, setBatchText] = useState('');

  // 删除单条资源
  const handleDeleteResource = async (id: number) => {
    if (!window.confirm('确认删除该资源链接吗？')) return;
    try {
      const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast({ message: '资源链接已删除', type: 'success' });
        onRefresh();
      } else {
        showToast({ message: json.message || '删除失败', type: 'error' });
      }
    } catch {
      showToast({ message: '网络错误', type: 'error' });
    }
  };

  // 单条提交
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) {
      showToast({ message: '请填写资源名称和链接地址', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_id: media.id,
          name: name.trim(),
          type,
          code: code.trim(),
          url: url.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast({ message: '资源已成功添加', type: 'success' });
        setName('');
        setCode('');
        setUrl('');
        onRefresh();
      } else {
        showToast({ message: json.message || '添加失败', type: 'error' });
      }
    } catch {
      showToast({ message: '请求失败', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // 批量提交
  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchText.trim()) {
      showToast({ message: '请输入要批量添加的资源内容', type: 'error' });
      return;
    }

    // 解析多行格式：资源名称 | 类型 | 链接地址 | 提取码/备注
    const lines = batchText.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsedList: Array<{ name: string; type: string; url: string; code: string }> = [];

    for (const line of lines) {
      const parts = line.split('|').map((p) => p.trim());
      if (parts.length >= 2) {
        const resName = parts[0];
        let resType = '网盘链接';
        let resUrl = '';
        let resCode = '';

        if (parts.length === 2) {
          // 格式: 名称 | 链接
          resUrl = parts[1];
        } else if (parts.length === 3) {
          // 格式: 名称 | 类型 | 链接
          resType = parts[1];
          resUrl = parts[2];
        } else {
          // 格式: 名称 | 类型 | 链接 | 提取码
          resType = parts[1];
          resUrl = parts[2];
          resCode = parts[3];
        }

        if (resName && resUrl) {
          parsedList.push({ name: resName, type: resType, url: resUrl, code: resCode });
        }
      }
    }

    if (parsedList.length === 0) {
      showToast({ message: '未能识别出有效的资源行，请检查格式', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_id: media.id,
          resources: parsedList,
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast({ message: json.message || `成功添加 ${parsedList.length} 条资源`, type: 'success' });
        setBatchText('');
        onRefresh();
      } else {
        showToast({ message: json.message || '批量添加失败', type: 'error' });
      }
    } catch {
      showToast({ message: '请求失败', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-cinema-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                资源链接管理: 《{media.title}》
              </h3>
              <p className="text-xs text-zinc-400">
                当前已录入 {resources.length} 条资源链接
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 主体区 */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* 1. 现有资源列表 */}
          <div className="space-y-3">
            <h4 className="font-bold text-zinc-300 flex items-center gap-2">
              <span>已关联资源列表</span>
              <span className="text-xs font-normal text-zinc-500">
                ({resources.length} 条)
              </span>
            </h4>

            {resources.length === 0 ? (
              <div className="py-6 text-center text-zinc-500 rounded-xl bg-white/[0.02] border border-white/5">
                该影视下暂未添加任何资源
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {resources.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-cinema-950 border border-white/5 gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white/5 text-zinc-300 border border-white/10">
                          {r.type}
                        </span>
                        <span className="font-semibold text-white truncate">{r.name}</span>
                        {r.code && (
                          <span className="text-[11px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            码: {r.code}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 truncate font-mono mt-0.5">
                        {r.url}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteResource(r.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="删除此资源"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. 添加资源选项卡（单条添加 vs 批量添加） */}
          <div className="border-t border-white/10 pt-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <button
                type="button"
                onClick={() => setTab('single')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tab === 'single'
                    ? 'bg-brand text-white'
                    : 'text-zinc-400 hover:text-white bg-white/5'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>单条添加</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('batch')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tab === 'batch'
                    ? 'bg-brand text-white'
                    : 'text-zinc-400 hover:text-white bg-white/5'
                }`}
              >
                <ListPlus className="w-3.5 h-3.5" />
                <span>批量添加资源</span>
              </button>
            </div>

            {tab === 'single' ? (
              /* 单条添加表单 */
              <form onSubmit={handleSingleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-zinc-400 font-semibold">资源名称 *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="如：4K 蓝光杜比原盘 [60GB]"
                      className="w-full bg-cinema-950 border border-white/10 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-red-500/60"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-semibold">资源类型</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-cinema-950 border border-white/10 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-red-500/60"
                    >
                      <option value="网盘链接">网盘链接</option>
                      <option value="磁力链接">磁力链接</option>
                      <option value="在线播放">在线播放</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-zinc-400 font-semibold">链接地址 (URL) *</label>
                    <input
                      type="text"
                      required
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://pan.quark.cn/... 或 magnet:?xt=..."
                      className="w-full bg-cinema-950 border border-white/10 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-red-500/60"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-semibold">提取码 / 备注</label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="如：8888 或 迅雷可用"
                      className="w-full bg-cinema-950 border border-white/10 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-red-500/60"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-semibold text-xs sm:text-sm shadow-md shadow-brand/20 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>确认添加</span>
                  </button>
                </div>
              </form>
            ) : (
              /* 批量添加文本框 */
              <form onSubmit={handleBatchSubmit} className="space-y-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1 text-xs text-zinc-400">
                  <p className="font-semibold text-zinc-200">批量格式说明（每行一条）：</p>
                  <p className="font-mono text-[11px] text-zinc-400">
                    资源名称 | 资源类型 | 链接地址 | 提取码或备注
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    示例：4K 蓝光重置版 | 网盘链接 | https://pan.quark.cn/s/xxx | 8888
                  </p>
                </div>

                <textarea
                  rows={5}
                  value={batchText}
                  onChange={(e) => setBatchText(e.target.value)}
                  placeholder={`4K 蓝光重置版 | 网盘链接 | https://pan.quark.cn/s/demo1 | 8888\n1080P 中英双字 | 网盘链接 | https://pan.baidu.com/s/demo2 | abcd\n4K.HDR.2160p | 磁力链接 | magnet:?xt=urn:btih:demo3 | 迅雷可用`}
                  className="w-full bg-cinema-950 border border-white/10 rounded-xl p-3 text-zinc-200 font-mono text-xs focus:outline-none focus:border-red-500/60 leading-relaxed"
                />

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-semibold text-xs sm:text-sm shadow-md shadow-brand/20 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>一键批量导入资源</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 子组件：TMDB 导入接口占位与测试导入弹窗
// -------------------------------------------------------------
interface TmdbImportModalProps {
  presets: any[];
  onClose: () => void;
  onImport: (mediaData: any) => void;
}

function TmdbImportModal({ presets, onClose, onImport }: TmdbImportModalProps) {
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState<'this_year' | 'now_playing' | 'trending' | 'top_rated'>('this_year');
  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [customList, setCustomList] = useState<any[]>(presets);

  const fetchCategory = async (cat: 'this_year' | 'now_playing' | 'trending' | 'top_rated') => {
    setActiveCategory(cat);
    setLoading(true);
    setQueryInput('');
    try {
      const res = await fetch(`/api/tmdb?category=${cat}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCustomList(json.data);
      }
    } catch {
      showToast({ message: '榜单获取失败', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) {
      fetchCategory(activeCategory);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/tmdb?q=${encodeURIComponent(queryInput.trim())}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCustomList(json.data);
      }
    } catch {
      showToast({ message: '搜索失败', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-cinema-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <DownloadCloud className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>TMDB 影视探索与智能导入</span>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/30">
                  支持免片名榜单发现
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                可直接点击查看今年热门、本月院线或实时趋势，无需预先知道电影名字
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 主体 */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* 榜单发现快捷切换按钮（无需输片名） */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>榜单探索（无需输入片名，一键直达热门）</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => fetchCategory('this_year')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === 'this_year' && !queryInput
                    ? 'bg-brand text-white shadow-md shadow-brand/25'
                    : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5'
                }`}
              >
                📅 今年热门大片
              </button>
              <button
                type="button"
                onClick={() => fetchCategory('now_playing')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === 'now_playing' && !queryInput
                    ? 'bg-brand text-white shadow-md shadow-brand/25'
                    : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5'
                }`}
              >
                🍿 本月院线热映
              </button>
              <button
                type="button"
                onClick={() => fetchCategory('trending')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === 'trending' && !queryInput
                    ? 'bg-brand text-white shadow-md shadow-brand/25'
                    : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5'
                }`}
              >
                🔥 全球实时热度
              </button>
              <button
                type="button"
                onClick={() => fetchCategory('top_rated')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === 'top_rated' && !queryInput
                    ? 'bg-brand text-white shadow-md shadow-brand/25'
                    : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5'
                }`}
              >
                🏆 影史高分榜单
              </button>
            </div>
          </div>

          {/* 可选关键词搜索栏 */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="可选：输入特定影视名称或英文名精确查找..."
              className="flex-1 bg-cinema-950 border border-white/10 rounded-xl px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-sky-500/60"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-1.5 transition-all"
            >
              <Search className="w-4 h-4" />
              <span>搜索</span>
            </button>
          </form>

          {/* 推荐影视展示列表 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-bold uppercase tracking-wider">
                {queryInput ? `“${queryInput}” 搜索匹配` : '热门发现列表'} ({customList.length} 部)
              </span>
              {loading && <span className="text-sky-400 animate-pulse">正在从云端刷新榜单...</span>}
            </div>

            {loading ? (
              <div className="py-16 text-center text-zinc-500 space-y-2">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs">加载最新热门大片中...</p>
              </div>
            ) : customList.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 rounded-2xl bg-white/[0.02] border border-white/5">
                暂未找到符合条件的影视作品
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 max-h-80 overflow-y-auto pr-1">
                {customList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-cinema-950 border border-white/5 hover:border-white/20 transition-all gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-16 rounded-lg bg-zinc-900 overflow-hidden shrink-0 border border-white/10">
                        {item.poster_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.poster_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm truncate">
                            {item.title}
                          </span>
                          <span className="text-xs text-amber-400 font-bold">
                            ⭐ {item.rating}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 font-mono truncate">
                          {item.original_title} ({item.year || '未知年份'})
                        </p>
                        <p className="text-[11px] text-zinc-400 line-clamp-1">
                          {item.overview}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onImport(item)}
                      className="shrink-0 px-3.5 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-semibold shadow-md shadow-brand/20 transition-all hover:scale-105"
                    >
                      一键导入
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

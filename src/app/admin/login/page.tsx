'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Film, ArrowRight, ShieldAlert, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('请输入管理密码');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const json = await res.json();
      if (json.success) {
        showToast({ message: '登录成功，正在进入管理控制台...', type: 'success' });
        router.push('/admin');
        router.refresh();
      } else {
        setErrorMsg(json.message || '密码验证失败');
        showToast({ message: json.message || '密码不正确', type: 'error' });
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('网络请求异常，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* 卡片背景与毛玻璃效果 */}
        <div className="relative rounded-3xl bg-cinema-900/90 border border-white/10 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          {/* 顶部图标与标题 */}
          <div className="text-center space-y-2 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand to-rose-600 flex items-center justify-center mx-auto shadow-lg shadow-brand/25 mb-4">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide">
              管理员控制台
            </h1>
            <p className="text-xs text-zinc-400">
              请输入后台管理密码以维护影视库与资源链接
            </p>
          </div>

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">
                管理密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="默认密码: admin123"
                  className="w-full bg-cinema-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/50 pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-zinc-500 pt-1">
                提示：可通过项目环境变量 <code className="text-zinc-400 bg-white/5 px-1 py-0.5 rounded">ADMIN_PASSWORD</code> 自定义
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand hover:bg-brand-hover text-white font-semibold text-sm shadow-xl shadow-brand/25 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>安全登录</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 快捷返回首页 */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <Film className="w-3.5 h-3.5" />
              <span>返回前台影视资料库</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

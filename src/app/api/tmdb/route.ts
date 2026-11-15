import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

// 预设的热门影视演示元数据（当未填入真实 TMDB API Key 时提供拟真体验）
const MOCK_TMDB_LIBRARY: Record<string, any> = {
  '872585': {
    tmdb_id: 872585,
    title: '奥本海默',
    original_title: 'Oppenheimer',
    type: '电影',
    year: 2023,
    country: '美国 / 英国',
    overview: '当人类掌握了毁灭自己的钥匙，盗火者的命运将何去何从？影片讲述了物理学家罗伯特·奥本海默领导曼哈顿计划、制造出第一颗原子弹，并在二战后经受政治漩涡与良心谴责的波澜壮阔的一生。',
    poster_url: 'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg',
    rating: 8.9,
    tags: ['剧情', '历史', '传记'],
  },
  '840326': {
    tmdb_id: 840326,
    title: '流浪地球2',
    original_title: 'The Wandering Earth II',
    type: '电影',
    year: 2023,
    country: '中国',
    overview: '太阳即将毁灭，人类在地球表面建造出巨大的推进器，寻找新的家园。然而宇宙之路危机四伏，为了拯救地球，流浪地球时代的年轻人再次挺身而出，展开争分夺秒的生死之战。',
    poster_url: 'https://image.tmdb.org/t/p/w780/qrhj33eFmBf86fQeI192tq0QG90.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/9n2tJBplPbg9v05q9QgR6nK8u3N.jpg',
    rating: 8.5,
    tags: ['科幻', '冒险', '灾难'],
  },
  '1022789': {
    tmdb_id: 1022789,
    title: '头脑特工队2',
    original_title: 'Inside Out 2',
    type: '动漫',
    year: 2024,
    country: '美国',
    overview: '经历青春期的莱莉迎来了全新的情绪伙伴：焦焦、慕慕、丧丧和尬尬。乐乐和其他老情绪必须学会与这些新朋友和谐共处，共同守护莱莉内心的自我认知。',
    poster_url: 'https://image.tmdb.org/t/p/w780/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/stKGOmPaIanq42tW7qfM2WwLMi.jpg',
    rating: 8.3,
    tags: ['动漫', '喜剧', '家庭', '冒险'],
  },
  '693134': {
    tmdb_id: 693134,
    title: '沙丘2',
    original_title: 'Dune: Part Two',
    type: '电影',
    year: 2024,
    country: '美国',
    overview: '保罗·厄崔迪携手契妮和弗雷曼人，向毁灭其家族的阴谋者展开复仇。在面对爱情与宇宙命运的抉择时，他必须竭尽全力阻止一场唯有他能预见的惨烈未来。',
    poster_url: 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s520QIq.jpg',
    rating: 8.8,
    tags: ['科幻', '冒险', '动作'],
  },
};

export async function GET(request: Request) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ success: false, message: '请先登录管理员权限' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';
    const tmdbId = searchParams.get('id')?.trim() || '';
    const apiKey = process.env.TMDB_API_KEY?.trim();

    // 1. 如果配置了真实 TMDB API Key，则尝试通过官方 API 获取
    if (apiKey) {
      try {
        if (tmdbId) {
          const detailRes = await fetch(
            `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&language=zh-CN`
          );
          if (detailRes.ok) {
            const data = await detailRes.json();
            return NextResponse.json({
              success: true,
              mode: 'live_tmdb',
              data: {
                title: data.title || data.name,
                original_title: data.original_title || data.original_name,
                type: '电影',
                year: data.release_date ? parseInt(data.release_date.split('-')[0], 10) : null,
                country: data.production_countries?.map((c: any) => c.name).join(' / ') || '',
                overview: data.overview || '',
                poster_url: data.poster_path ? `https://image.tmdb.org/t/p/w780${data.poster_path}` : '',
                backdrop_url: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : '',
                rating: Number((data.vote_average || 0).toFixed(1)),
                tags: data.genres?.map((g: any) => g.name) || [],
              },
            });
          }
        }
      } catch (tmdbErr) {
        console.warn('Real TMDB request error, falling back to mock presets:', tmdbErr);
      }
    }

    // 2. 模拟/占位数据模式（可直接从演示预设中快速获取，供演示和测试体验）
    if (tmdbId && MOCK_TMDB_LIBRARY[tmdbId]) {
      return NextResponse.json({
        success: true,
        mode: 'mock_preview',
        notice: apiKey ? undefined : '当前使用 TMDB 模拟演示数据。在 .env.local 中配置 TMDB_API_KEY 后可直接连接 TMDB 官方接口。',
        data: MOCK_TMDB_LIBRARY[tmdbId],
      });
    }

    // 搜索模拟列表
    const presets = Object.values(MOCK_TMDB_LIBRARY).filter(
      (m) => !query || m.title.includes(query) || m.original_title.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json({
      success: true,
      mode: 'presets',
      notice: '预留 TMDB 同步接口。支持一键快速填充以下热门推荐，或配置 TMDB_API_KEY 连接官方云端库。',
      data: presets,
    });
  } catch (error) {
    console.error('TMDB endpoint error:', error);
    return NextResponse.json({ success: false, message: 'TMDB 数据接口请求失败' }, { status: 500 });
  }
}

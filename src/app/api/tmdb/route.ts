import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

// TMDB 官方分类 ID 对照表（中文）
const TMDB_GENRES: Record<number, string> = {
  28: '动作',
  12: '冒险',
  16: '动漫',
  35: '喜剧',
  80: '犯罪',
  99: '纪录片',
  18: '剧情',
  10751: '家庭',
  14: '奇幻',
  36: '历史',
  27: '恐怖',
  10402: '音乐',
  9648: '悬疑',
  10749: '爱情',
  878: '科幻',
  10770: '电视电影',
  53: '惊悚',
  10752: '战争',
  37: '西部',
};

// 预设离线/免 Key 模拟热门片库（按类别归类）
const CATEGORIZED_PRESETS: Record<string, any[]> = {
  this_year: [
    {
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
    {
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
    {
      tmdb_id: 533535,
      title: '死侍与金刚',
      original_title: 'Deadpool & Wolverine',
      type: '电影',
      year: 2024,
      country: '美国',
      overview: '时间变异管理局将平静生活的韦德·威尔逊拉回战场。为了拯救他的宇宙，他必须说服桀骜不驯的金刚并肩作战。',
      poster_url: 'https://image.tmdb.org/t/p/w780/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
      backdrop_url: 'https://image.tmdb.org/t/p/w1280/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg',
      rating: 8.2,
      tags: ['动作', '喜剧', '科幻'],
    },
    {
      tmdb_id: 786892,
      title: '疯狂的麦克斯：狂暴女神',
      original_title: 'Furiosa: A Mad Max Saga',
      type: '电影',
      year: 2024,
      country: '澳大利亚 / 美国',
      overview: '随着世界崩溃，年轻的弗瑞奥萨从原本的绿洲家园被掠夺走，落入了克里斯·海姆斯沃斯领导的重型摩托军团手中。',
      poster_url: 'https://image.tmdb.org/t/p/w780/iADOJ8Zymht2JPMoy3R7xUMZ51f.jpg',
      backdrop_url: 'https://image.tmdb.org/t/p/w1280/wNAhuOZ3Zf84jCI5TeTVlYUFbZw.jpg',
      rating: 8.1,
      tags: ['动作', '冒险', '科幻'],
    },
  ],
  now_playing: [
    {
      tmdb_id: 912649,
      title: '毒液：最后一舞',
      original_title: 'Venom: The Last Dance',
      type: '电影',
      year: 2024,
      country: '美国',
      overview: '埃迪和毒液走到了逃亡的绝路，面对来自人类军方与外星共生体母星的双重围剿，他们必须做出艰难的终极决断。',
      poster_url: 'https://image.tmdb.org/t/p/w780/aos8VhOiPNc0x2kL90kQ84f553A.jpg',
      backdrop_url: 'https://image.tmdb.org/t/p/w1280/3V4kLQg0kSqPLctI5ziYWMEAZYF.jpg',
      rating: 7.8,
      tags: ['动作', '科幻', '冒险'],
    },
    {
      tmdb_id: 558449,
      title: '角斗士2',
      original_title: 'Gladiator II',
      type: '电影',
      year: 2024,
      country: '美国 / 英国',
      overview: '故事发生在麦克西姆斯牺牲多年后，卢修斯目睹家园被罗马新皇帝暴虐攻占，他被迫进入角斗场为罗马的荣耀与复仇而战。',
      poster_url: 'https://image.tmdb.org/t/p/w780/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
      backdrop_url: 'https://image.tmdb.org/t/p/w1280/euYIwmwkmz95mnExloguf0MmlDC.jpg',
      rating: 8.0,
      tags: ['动作', '剧情', '历史'],
    },
    {
      tmdb_id: 1184918,
      title: '荒野机器人',
      original_title: 'The Wild Robot',
      type: '动漫',
      year: 2024,
      country: '美国',
      overview: '机器人萝斯遭遇海难漂流到无人荒岛，它学会了如何适应严酷环境，并收养了一只孤苦无依的丑小鸭雏鸟。',
      poster_url: 'https://image.tmdb.org/t/p/w780/wTnV3PCVW5O92JMrFvvrRil3RsH.jpg',
      backdrop_url: 'https://image.tmdb.org/t/p/w1280/mQZJoIhTEkZr3ez0tEFf6mUcx0h.jpg',
      rating: 8.6,
      tags: ['动漫', '家庭', '科幻'],
    },
  ],
  trending: [
    {
      tmdb_id: 872585,
      title: '奥本海默',
      original_title: 'Oppenheimer',
      type: '电影',
      year: 2023,
      country: '美国 / 英国',
      overview: '当人类掌握了毁灭自己的钥匙，盗火者的命运将何去何从？影片讲述了物理学家罗伯特·奥本海默领导曼哈顿计划、制造出第一颗原子弹的波澜壮阔一生。',
      poster_url: 'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      backdrop_url: 'https://image.tmdb.org/t/p/w1280/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg',
      rating: 8.9,
      tags: ['剧情', '历史', '传记'],
    },
    {
      tmdb_id: 840326,
      title: '流浪地球2',
      original_title: 'The Wandering Earth II',
      type: '电影',
      year: 2023,
      country: '中国',
      overview: '太阳即将毁灭，人类在地球表面建造出巨大的推进器寻找新家园。面对太空电梯危机与月球坠落，年轻一代挺身而出展开争分夺秒的生死决战。',
      poster_url: 'https://image.tmdb.org/t/p/w780/qrhj33eFmBf86fQeI192tq0QG90.jpg',
      backdrop_url: 'https://image.tmdb.org/t/p/w1280/9n2tJBplPbg9v05q9QgR6nK8u3N.jpg',
      rating: 8.5,
      tags: ['科幻', '冒险', '灾难'],
    },
  ],
  top_rated: [
    {
      tmdb_id: 278,
      title: '肖申克的救赎',
      original_title: 'The Shawshank Redemption',
      type: '电影',
      year: 1994,
      country: '美国',
      overview: '银行家安迪因涉嫌杀害妻子及情夫而被判无期徒刑，在戒备森严的肖申克监狱中，他用常人难以想象的坚韧毅力，策划了一场惊心动魄的救赎。',
      poster_url: 'https://image.tmdb.org/t/p/w780/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
      backdrop_url: 'https://image.tmdb.org/t/p/w1280/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
      rating: 9.7,
      tags: ['剧情', '犯罪'],
    },
    {
      tmdb_id: 238,
      title: '教父',
      original_title: 'The Godfather',
      type: '电影',
      year: 1972,
      country: '美国',
      overview: '讲述了纽约黑手党柯里昂家族的兴衰历史，老教父维托·柯里昂如何在这片弱肉强食的世界中恪守原则并守护家族。',
      poster_url: 'https://image.tmdb.org/t/p/w780/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
      backdrop_url: 'https://image.tmdb.org/t/p/w1280/tmU7GeKVybMWF9YGLZdv6FF40Vh.jpg',
      rating: 9.4,
      tags: ['剧情', '犯罪'],
    },
  ],
};

function formatTmdbMovie(item: any) {
  const releaseDate = item.release_date || item.first_air_date || '';
  const year = releaseDate ? parseInt(releaseDate.split('-')[0], 10) : null;
  const tags = (item.genre_ids || [])
    .map((gid: number) => TMDB_GENRES[gid])
    .filter(Boolean);

  return {
    tmdb_id: item.id,
    title: item.title || item.name,
    original_title: item.original_title || item.original_name,
    type: item.media_type === 'tv' || item.name ? '电视剧' : '电影',
    year,
    country: item.original_language === 'zh' ? '中国' : item.original_language === 'ja' ? '日本' : '欧美',
    overview: item.overview || '暂无详细剧情介绍',
    poster_url: item.poster_path ? `https://image.tmdb.org/t/p/w780${item.poster_path}` : '',
    backdrop_url: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : '',
    rating: Number((item.vote_average || 0).toFixed(1)),
    tags: tags.length > 0 ? tags : ['精选'],
  };
}

export async function GET(request: Request) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ success: false, message: '请先登录管理员权限' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';
    const tmdbId = searchParams.get('id')?.trim() || '';
    const category = searchParams.get('category')?.trim() || 'this_year';
    const apiKey = process.env.TMDB_API_KEY?.trim();

    // 1. 如果配置了真实 TMDB API Key，则直接通过官方 API 动态探索/搜索
    if (apiKey) {
      try {
        let apiUrl = '';
        const currentYear = new Date().getFullYear();

        if (tmdbId) {
          // 精确获取单部作品详情
          apiUrl = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&language=zh-CN`;
        } else if (query) {
          // 关键词搜索
          apiUrl = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=zh-CN&query=${encodeURIComponent(
            query
          )}&page=1`;
        } else {
          // 免输入名称的“热门榜单发现模式”
          switch (category) {
            case 'this_year': // 今年最热门电影
              apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=zh-CN&sort_by=popularity.desc&primary_release_year=${currentYear}&page=1`;
              break;
            case 'now_playing': // 本月/院线热映
              apiUrl = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=zh-CN&page=1`;
              break;
            case 'trending': // 本周实时热度最高
              apiUrl = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=zh-CN`;
              break;
            case 'top_rated': // 经典高分神作榜
              apiUrl = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=zh-CN&page=1`;
              break;
            default:
              apiUrl = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=zh-CN`;
          }
        }

        const tmdbRes = await fetch(apiUrl);
        if (tmdbRes.ok) {
          const json = await tmdbRes.json();

          if (tmdbId) {
            // 单条详情
            return NextResponse.json({
              success: true,
              mode: 'live_tmdb',
              data: {
                title: json.title || json.name,
                original_title: json.original_title || json.original_name,
                type: '电影',
                year: json.release_date ? parseInt(json.release_date.split('-')[0], 10) : null,
                country: json.production_countries?.map((c: any) => c.name).join(' / ') || '',
                overview: json.overview || '',
                poster_url: json.poster_path ? `https://image.tmdb.org/t/p/w780${json.poster_path}` : '',
                backdrop_url: json.backdrop_path ? `https://image.tmdb.org/t/p/w1280${json.backdrop_path}` : '',
                rating: Number((json.vote_average || 0).toFixed(1)),
                tags: json.genres?.map((g: any) => g.name) || [],
              },
            });
          }

          // 列表结果
          const results = (json.results || [])
            .filter((item: any) => item.poster_path) // 只保留有海报的有效条目
            .slice(0, 15)
            .map(formatTmdbMovie);

          return NextResponse.json({
            success: true,
            mode: 'live_tmdb',
            notice: '已成功从 TMDB 云端获取全球实时热门榜单！',
            data: results,
          });
        }
      } catch (tmdbErr) {
        console.warn('Real TMDB request error, falling back to mock presets:', tmdbErr);
      }
    }

    // 2. 模拟/预置热门数据（未配置 TMDB API Key 时的开箱即用模式）
    const presetPool = CATEGORIZED_PRESETS[category] || CATEGORIZED_PRESETS.this_year;
    let list = presetPool;

    if (query) {
      const allPresets = [
        ...CATEGORIZED_PRESETS.this_year,
        ...CATEGORIZED_PRESETS.now_playing,
        ...CATEGORIZED_PRESETS.trending,
        ...CATEGORIZED_PRESETS.top_rated,
      ];
      list = allPresets.filter(
        (m) =>
          m.title.toLowerCase().includes(query.toLowerCase()) ||
          m.original_title.toLowerCase().includes(query.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      mode: 'presets',
      notice: apiKey
        ? undefined
        : '当前运行于离线预置模式。在环境变量中填入 TMDB_API_KEY 即可实时刷新全球最新院线榜单。',
      data: list,
    });
  } catch (error) {
    console.error('TMDB endpoint error:', error);
    return NextResponse.json({ success: false, message: 'TMDB 数据接口请求失败' }, { status: 500 });
  }
}

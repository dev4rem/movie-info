import { query, execute } from '../src/lib/db';

const sampleMedia = [
  {
    title: '星际穿越',
    original_title: 'Interstellar',
    type: '电影',
    year: 2014,
    country: '美国 / 英国 / 加拿大',
    overview: '近未来地球黄沙遍野，农作物相继因枯萎病灭绝，人类面临生死存亡的严峻绝境。前NASA宇航员库珀受命与一队卓越的科学家踏上穿越未知虫洞的星际之旅，前往遥远深空寻找适宜人类繁衍栖息的新家园。在跨越时空的浩瀚征途中，父女之间的爱成为了突破五维时空的唯一指引。',
    poster_url: 'https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    rating: 9.4,
    tags: ['科幻', '冒险', '剧情'],
    resources: [
      {
        name: '4K IMAX 蓝光杜比视界原盘 [特效中英字幕 65GB]',
        type: '网盘链接',
        code: '8888',
        url: 'https://pan.quark.cn/s/interstellar-4k-imax',
      },
      {
        name: '1080P 高码率收藏版 [国英双语/次世代音轨]',
        type: '网盘链接',
        code: 'abcd',
        url: 'https://pan.baidu.com/s/1interstellar-1080p-collection',
      },
      {
        name: 'Interstellar.2014.2160p.UHD.BluRay.x265.TrueHD.7.1',
        type: '磁力链接',
        code: '种子健康度高 / 推荐迅雷或qBittorrent',
        url: 'magnet:?xt=urn:btih:3fa9128080f76eb1c28c68aa2315b94f1837bc21&dn=Interstellar.2014',
      },
      {
        name: '极速 1080P 蓝光在线点播线路 (超清秒播)',
        type: '在线播放',
        code: '免VIP / 支持投屏与倍速',
        url: 'https://v.example.com/play/interstellar',
      },
    ],
  },
  {
    title: '盗梦空间',
    original_title: 'Inception',
    type: '电影',
    year: 2010,
    country: '美国 / 英国',
    overview: '多姆·柯布是一名经验丰富的神偷，擅长在潜意识最脆弱的睡眠状态潜入他人梦境盗取商业机密。为了洗脱莫须有的罪名并重返故乡与孩子团聚，他接受了一项前所未有的任务：并非盗取思维，而是植入潜意识，俗称“奠基”。他们必须在重重嵌套的梦境深渊中同时间赛跑。',
    poster_url: 'https://image.tmdb.org/t/p/w780/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    rating: 9.3,
    tags: ['科幻', '悬疑', '动作', '冒险'],
    resources: [
      {
        name: '4K 2160p REMUX 蓝光杜比视界 + 全景声音轨',
        type: '网盘链接',
        code: 'incp',
        url: 'https://www.alipan.com/s/inception-remux-4k',
      },
      {
        name: '1080P 简繁英多语特效字幕 [12GB 压制版]',
        type: '网盘链接',
        code: '6666',
        url: 'https://pan.quark.cn/s/inception-1080p',
      },
      {
        name: 'Inception.2010.2160p.UHD.BluRay.x265.DTS-HD.MA.5.1',
        type: '磁力链接',
        code: '高速节点 / 推荐彗星下载',
        url: 'magnet:?xt=urn:btih:c7d424b96791e80931213e843f508ca8860c0f49&dn=Inception.2010',
      },
      {
        name: '高清极速在线播放 (4K蓝光专线)',
        type: '在线播放',
        code: '支持多音轨切换',
        url: 'https://v.example.com/play/inception',
      },
    ],
  },
  {
    title: '肖申克的救赎',
    original_title: 'The Shawshank Redemption',
    type: '电影',
    year: 1994,
    country: '美国',
    overview: '二十世纪四十年代末，年轻有为的银行家安迪因涉嫌杀害妻子及情夫而被判无期徒刑，关押在戒备森严的肖申克州立监狱。在漫长的囚禁岁月中，安迪始终保持对自由的向往与人性尊严，并在黑暗高墙之下用常人难以想象的坚韧毅力，策划了一场惊心动魄的自我救赎。',
    poster_url: 'https://image.tmdb.org/t/p/w780/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    rating: 9.7,
    tags: ['剧情', '犯罪'],
    resources: [
      {
        name: '4K 修复重制终极典藏版 [杜比视界HDR原盘 58GB]',
        type: '网盘链接',
        code: 'hope',
        url: 'https://pan.quark.cn/s/shawshank-4k-collector',
      },
      {
        name: '1080P 国英双语 高清内嵌精校中字 [8GB]',
        type: '网盘链接',
        code: '1234',
        url: 'https://pan.baidu.com/s/1shawshank-1080p',
      },
      {
        name: 'The.Shawshank.Redemption.1994.2160p.BluRay.x265',
        type: '磁力链接',
        code: '经典必看 / 无损音质',
        url: 'magnet:?xt=urn:btih:6c73dfb78e472605809ef0a43058a98a698379ba&dn=The.Shawshank.Redemption',
      },
      {
        name: '影院级在线流媒体通道 (4K纯净)',
        type: '在线播放',
        code: '无水印 / 原画音质',
        url: 'https://v.example.com/play/shawshank',
      },
    ],
  },
  {
    title: '绝命毒师',
    original_title: 'Breaking Bad',
    type: '电视剧',
    year: 2008,
    country: '美国',
    overview: '平凡的高中化学老师沃尔特·怀特在得知自己身患肺癌晚期且家庭陷入绝境后，为了在离世前给怀有身孕的妻子和残障儿子留下充足的生活保障，联手昔日落魄学生杰西·平克曼，凭借超凡的化学天赋走上制毒与犯罪的危险歧途，一步步蜕变为令人闻风丧胆的暗黑毒枭“海森堡”。',
    poster_url: 'https://image.tmdb.org/t/p/w780/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    rating: 9.6,
    tags: ['剧情', '犯罪', '悬疑'],
    resources: [
      {
        name: '全1-5季 4K 蓝光重置完整版 [内封精校双语 180GB]',
        type: '网盘链接',
        code: 'bb4k',
        url: 'https://www.alipan.com/s/breaking-bad-all-4k',
      },
      {
        name: '全季 1080P 衣柜字幕组精校版 [含花絮与纪录片]',
        type: '网盘链接',
        code: '9999',
        url: 'https://pan.quark.cn/s/breaking-bad-1080p',
      },
      {
        name: 'Breaking.Bad.Complete.Series.S01-S05.1080p.BluRay.x265',
        type: '磁力链接',
        code: '全62集整合包 / 附外传电影《续命之徒》',
        url: 'magnet:?xt=urn:btih:4189e2c650897e974e64f7fa8b2513f5664d96a1&dn=Breaking.Bad.Complete',
      },
      {
        name: '全集连续播放专线 (自动选集)',
        type: '在线播放',
        code: '高清原声 / 免等待',
        url: 'https://v.example.com/play/breaking-bad',
      },
    ],
  },
  {
    title: '权力的游戏',
    original_title: 'Game of Thrones',
    type: '电视剧',
    year: 2011,
    country: '美国 / 英国',
    overview: '在虚构的维斯特洛奇幻大陆上，七大王国各大家族围绕象征至高王权的“铁王座”展开勾心斗角、尔虞我诈的残酷角力。宫廷阴谋、战火纷飞、背叛与誓言交织。与此同时，北境绝境长城之外的严寒黑暗深处，沉睡千年的异鬼大军正在悄然复苏，席卷一切的凛冬终将来临。',
    poster_url: 'https://image.tmdb.org/t/p/w780/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg',
    rating: 9.3,
    tags: ['奇幻', '剧情', '冒险', '动作'],
    resources: [
      {
        name: '全八季 4K HDR 杜比全景声 无删减加长原盘 [320GB]',
        type: '网盘链接',
        code: 'got8',
        url: 'https://pan.quark.cn/s/got-all-4k-hdr',
      },
      {
        name: '全1-8季 1080P 衣柜字幕组最终珍藏版 [80GB]',
        type: '网盘链接',
        code: '7777',
        url: 'https://pan.baidu.com/s/1got-1080p-full',
      },
      {
        name: 'Game.of.Thrones.S01-S08.2160p.UHD.BluRay.x265.TrueHD.Atmos',
        type: '磁力链接',
        code: '4K无删减原盘压制 / 超级做种',
        url: 'magnet:?xt=urn:btih:8efca0b1c97fdb57929424756317bc2d04a62117&dn=Game.of.Thrones',
      },
      {
        name: '权游全季在线超清无剪辑线路',
        type: '在线播放',
        code: '支持中英双字与音轨选择',
        url: 'https://v.example.com/play/game-of-thrones',
      },
    ],
  },
  {
    title: '进击的巨人',
    original_title: '進撃の巨人 (Attack on Titan)',
    type: '动漫',
    year: 2013,
    country: '日本',
    overview: '百年前，世界上突然出现了以人类为食的神秘巨人。幸存下来的人类建造了三重巨大的高墙抵御外界威胁，享受了一百年的虚假和平。然而平静在超大型巨人踏破玛利亚之墙的那一天化为乌有。目睹母亲惨死的少年艾伦·耶格尔誓言加入调查兵团，将世界上的巨人赶尽杀绝，探寻墙外的真正自由。',
    poster_url: 'https://image.tmdb.org/t/p/w780/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/yvKry950005m243Vq9P71X0447.jpg',
    rating: 9.6,
    tags: ['动漫', '动作', '奇幻', '悬疑'],
    resources: [
      {
        name: '全季 1-4 季 + 完结篇 1080P BDMV 蓝光无损原盘',
        type: '网盘链接',
        code: 'aot1',
        url: 'https://www.alipan.com/s/attack-on-titan-bd-collection',
      },
      {
        name: '全季 1080P 内嵌诸神&漫游字幕组精校版 [60GB]',
        type: '网盘链接',
        code: '2333',
        url: 'https://pan.quark.cn/s/aot-1080p-full',
      },
      {
        name: 'Shingeki.no.Kyojin.Complete.1080p.BluRay.FLAC.x265',
        type: '磁力链接',
        code: '含全OAD外传 + 剧场版全集',
        url: 'magnet:?xt=urn:btih:08cb4b05615822e8fb7fa4a86f1f4e156477e38c&dn=Shingeki.no.Kyojin',
      },
      {
        name: '动漫专线超清 1080P 60FPS 满血线路',
        type: '在线播放',
        code: '支持弹幕与多语言字幕',
        url: 'https://v.example.com/play/aot',
      },
    ],
  },
];

export async function seed() {
  console.log('🌱 开始初始化测试数据...');

  // 先清空现有数据
  await execute('DELETE FROM resources;');
  await execute('DELETE FROM media;');
  await execute('ALTER SEQUENCE media_id_seq RESTART WITH 1;');
  await execute('ALTER SEQUENCE resources_id_seq RESTART WITH 1;');

  for (const item of sampleMedia) {
    const { resources, ...mediaData } = item;

    const insertedMedia = await query<{ id: number }>(
      `INSERT INTO media (title, original_title, type, year, country, overview, poster_url, backdrop_url, rating, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id;`,
      [
        mediaData.title,
        mediaData.original_title,
        mediaData.type,
        mediaData.year,
        mediaData.country,
        mediaData.overview,
        mediaData.poster_url,
        mediaData.backdrop_url,
        mediaData.rating,
        mediaData.tags,
      ]
    );

    const mediaId = insertedMedia[0].id;

    for (const r of resources) {
      await execute(
        `INSERT INTO resources (media_id, name, type, code, url)
         VALUES ($1, $2, $3, $4, $5);`,
        [mediaId, r.name, r.type, r.code, r.url]
      );
    }

    console.log(`✅ 已写入影视: 《${mediaData.title}》 及其关联的 ${resources.length} 条资源`);
  }

  console.log('🎉 测试数据写入完成！共生成 6 部经典作品与多条优质影视资源。');
}

// 支持直接脚本调用
if (process.argv[1]?.includes('seed.ts')) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ 填充数据失败:', err);
      process.exit(1);
    });
}

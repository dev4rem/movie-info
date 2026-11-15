# 个人影视资料库与资源导航网站 (CineNav DB) - 项目状态与架构文档

本文档全面记录了项目的系统架构、已实现的全部核心功能、数据库设计、安全机制、部署运行指南以及未来演进规划，便于后续团队协作或后续版本无缝迭代。

---

## 一、 项目概览 (Project Overview)

- **项目名称**：极影资料库与资源导航网站 (CineNav DB)
- **定位**：现代化的私有化影视数据库与多源下载/播放资源导航中心。
- **界面语言**：全站纯简体中文。
- **设计风格**：沉浸式暗黑流媒体设计（深黑极夜蓝底色、流媒体红强调色、金星评分徽章、毛玻璃导航与平滑微动效）。
- **当前状态**：核心功能已全部开发完毕，已通过浏览器多端实机渲染验证，测试数据已入库，本地生产环境服务运行于 `http://localhost:3088`，代码已完成首个安全 Git 提交。

---

## 二、 技术选型与技术栈 (Tech Stack)

| 层次 | 选型 | 版本 / 说明 |
| :--- | :--- | :--- |
| **前端框架** | Next.js (App Router) | 15.5+ (支持 React 19、服务端组件与流式渲染) |
| **UI 样式库** | Tailwind CSS | 3.4+ (定制流媒体主题色、毛玻璃微光动效) |
| **图标库** | Lucide React | 丰富现代线性影视图标 (Film, Tv, Star, Copy, HardDrive 等) |
| **数据库** | PostgreSQL 16 | 双模兼容架构（生产直连 PostgreSQL / 本地内嵌 PGlite WASM） |
| **数据驱动** | `pg` + `@electric-sql/pglite` | 原生 PostgreSQL 协议，支持 `$1` 参数化防注入与原生数组操作 |
| **安全加密** | Node.js `crypto` | HMAC-SHA256 动态签名、HttpOnly Cookie、防时序侧信道攻击 |
| **容器编排** | Docker Compose | 预置 PostgreSQL 16 独立容器镜像配置 |
| **包管理** | pnpm | 快速安全的包依赖管理 |

---

## 三、 系统架构与项目目录结构

```text
Movie_Info/
├── scripts/
│   ├── schema.sql              # PostgreSQL DDL 数据表结构、外键与查询索引
│   └── seed.ts                 # 6 部经典佳作及多源资源的自动化数据填充脚本
├── src/
│   ├── app/
│   │   ├── page.tsx            # 前台首页：Hero 巨幕轮播、分类标签过滤、最新更新与高分推荐
│   │   ├── layout.tsx          # 全局布局：统一暗黑色调、Toast 消息通知 Provider、SEO 元数据
│   │   ├── globals.css         # 全局样式：深色极夜滚动条、毛玻璃 glass-panel、光影扫光效果
│   │   ├── media/[id]/page.tsx # 影视详情页：虚化大图 Backdrop、海报、多维标签、资源多源列表与复制
│   │   ├── admin/
│   │   │   ├── page.tsx        # 后台管理主面板：数据统计概览、影视 CRUD、资源管理、批量添加、TMDB 导入
│   │   │   └── login/page.tsx  # 管理员登录页：密码显隐切换、会话验证
│   │   └── api/                # 后端 RESTful API 路由层
│   │       ├── media/          # 影视列表（支持搜索/过滤/排序）及单条创建 (POST)
│   │       ├── media/[id]/     # 影视详情获取 (GET)、更新 (PUT)、级联删除 (DELETE)
│   │       ├── resources/      # 单条及批量添加资源 (POST)
│   │       ├── resources/[id]/ # 删除指定资源 (DELETE)
│   │       ├── admin/login/    # 管理员登录鉴权与 HMAC Cookie 下发
│   │       ├── admin/logout/   # 清除管理凭证 Cookie
│   │       ├── admin/check/    # 当前客户端管理员登录态探针
│   │       └── tmdb/           # TMDB 官方 API 代理拉取与预设热门大片模拟导入
│   ├── components/             # 前端核心复用组件
│   │   ├── Navbar.tsx          # 顶部固定导航栏（Logo、分类快速直达、全局即时搜索、后台入口）
│   │   ├── Footer.tsx          # 底部信息（技术栈徽标、分类直达、版权声明）
│   │   ├── MediaCard.tsx       # 影视海报卡片（悬停微缩放、高分星标、类型角标、可用资源数）
│   │   └── Toast.tsx           # 全局交互提示 Toast（复制成功、错误预警）
│   └── lib/                    # 核心库与工具类
│       ├── db.ts               # 数据库客户端单例（双模智能切换、自动建表、类型规范化）
│       ├── auth.ts             # 认证安全模块（HMAC 签名、安全 Cookie、TimingSafe 比对）
│       └── types.ts            # 全局 TypeScript 接口定义 (MediaItem, ResourceItem, MediaDetail)
├── .env.example                # 生产环境配置模板（无明文敏感信息，安全示范）
├── .env.local                  # 本地环境私有配置（已加入 .gitignore）
├── .gitignore                  # Git 忽略规则（严防敏感凭据泄密）
├── docker-compose.yml          # 本地/服务器一键拉起 PostgreSQL 容器配置
├── next.config.mjs             # Next.js 配置（远程图片白名单、服务端外部包优化）
├── tailwind.config.ts          # Tailwind 影视调色板扩展
├── package.json                # 项目依赖与执行脚本
├── README.md                   # 项目使用与部署说明文档
└── project-status.md           # 本系统状态与技术全景文档（本文档）
```

---

## 四、 数据库设计与持久化 (Database Design)

完整的 SQL 脚本位于 `scripts/schema.sql`：

### 1. 影视作品表 (`media`)
| 字段名 | 类型 | 约束 / 默认值 | 业务说明 |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | 作品唯一自增主键 |
| `title` | VARCHAR(255) | NOT NULL | 中文官方译名 / 展示标题 |
| `original_title` | VARCHAR(255) | NULL | 原名 / 英文名 / 外文名 |
| `type` | VARCHAR(50) | NOT NULL DEFAULT '电影' | 作品类型：电影 / 电视剧 / 动漫 |
| `year` | INTEGER | NULL | 上映或首播年份 |
| `country` | VARCHAR(100) | NULL | 制片国家 / 地区 |
| `overview` | TEXT | NULL | 完整剧情简介 |
| `poster_url` | TEXT | NULL | 竖版高分辨率海报图链接 |
| `backdrop_url` | TEXT | NULL | 横版剧照 / 大图背景链接 |
| `rating` | NUMERIC(3, 1) | DEFAULT 0.0 | 综合评分（1.0 ~ 10.0 分） |
| `tags` | TEXT[] | DEFAULT '{}' | 题材分类标签数组（科幻、悬疑、动作等） |
| `created_at` | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | 创建入库时间 |
| `updated_at` | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | 最后更新时间 |

### 2. 资源链接表 (`resources`)
| 字段名 | 类型 | 约束 / 默认值 | 业务说明 |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | 资源唯一自增主键 |
| `media_id` | INTEGER | NOT NULL REFERENCES media(id) ON DELETE CASCADE | 关联影视作品 ID（级联删除） |
| `name` | VARCHAR(255) | NOT NULL | 资源清晰度/版本名称（如“4K 蓝光杜比原盘”） |
| `type` | VARCHAR(50) | NOT NULL DEFAULT '网盘链接' | 资源形态：网盘链接 / 磁力链接 / 在线播放 |
| `code` | VARCHAR(100) | NULL | 提取码 / 解压密码 / 播放备注 |
| `url` | TEXT | NOT NULL | 资源实际跳转或下载链接 |
| `created_at` | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | 录入时间 |

### 3. 查询索引优化
- `idx_media_type`：加速按作品类型（电影/电视剧/动漫）过滤；
- `idx_media_rating`：加速“高分推荐”榜单降序排序；
- `idx_media_year`：加速按上映年份排序；
- `idx_media_updated_at`：加速“最新更新”排序；
- `idx_resources_media_id`：加速影视详情页关联资源聚合查询。

### 4. 数据库“开箱即用 + 生产扩展”双模机制
- **本地零依赖启动**：若未配置外部 `DATABASE_URL`，系统底层使用 `@electric-sql/pglite`（真正基于 WASM 运行的 PostgreSQL 16 内核），自动在 `./data/pgdata` 建立持久化数据文件。无需本地安装 Postgres 或 Docker 即可正常增删改查。
- **生产无缝直连**：一旦在环境变中填入生产 `DATABASE_URL`（如 Supabase、Neon、阿里云 RDS、自建 PostgreSQL），系统自动切换为 `pg.Pool` 线程池高并发模式，无需变更任何业务代码。

---

## 五、 已实现的页面与交互功能

### 1. 前台首页 (`/`)
- **品牌导航栏**：
  - 发光胶片 Logo、分类快捷切换、全局即时搜索（支持按中文名、原名、简介模糊匹配）、管理后台快捷入口。
- **Hero 巨幕推荐横幅**：
  - 动态置顶呈现推荐大片，带沉浸式暗黑多重渐变遮罩、评分角标与直接直达按钮。
- **多维度筛选控制器**：
  - 一级分类：全部、电影、电视剧、动漫；
  - 题材标签：全部、科幻、悬疑、动作、剧情、冒险、奇幻、犯罪、动漫；
  - 包含“一键重置所有筛选条件”快捷操作。
- **双排卡片网格布局**：
  - **最新更新**：按资源/条目最后修改时间倒序排列；
  - **高分推荐**：按豆瓣/IMDb综合评分倒序排列；
  - 卡片集成海报 Lazyload、类型彩色标签、星级评分角标及已关联资源数提示。

### 2. 影视详情页 (`/media/[id]`)
- **沉浸式头部布局**：
  - 剧照 Backdrop 虚化大图贯穿顶部，左侧为高分辨率海报，右侧为标题、原名、类型、年份、地区、星级评分、标签列表与完整剧情简介。
- **影视资源列表面板**：
  - 支持按“网盘链接”、“磁力链接”、“在线播放”分类筛选与数量统计；
  - 资源卡片带有类型标志图标与色系区分；
  - 针对带有提取码的资源，提供**一键复制提取码**按钮；
  - 针对资源地址，提供**一键复制链接**按钮，点击后平滑变更勾选状态并弹出右上角全局 Toast；
  - 提供“前往获取 / 立即播放”直达外部新标签页跳转。

### 3. 后台管理系统 (`/admin` & `/admin/login`)
- **安全密码防护**：
  - 未登录态访问 `/admin` 自动重定向至登录页；
  - 默认管理密码为 `admin123`（可通过环境变量 `ADMIN_PASSWORD` 动态修改）；
  - 密码输入支持明文/密文切换。
- **统计总览看板**：
  - 顶部动态卡片展示：总收录影视数、总关联资源数、电影收录数、剧集与动漫数。
- **影视信息全功能维护**：
  - 表格列出所有影视的海报缩略图、中英文标题、类型、年份、评分、资源统计数；
  - **新增影视**：支持模态框录入标题、原名、类型、年份、地区、评分、标签、海报及剧照 URL、简介；
  - **编辑影视**：模态框回显全部已有字段并支持更新；
  - **删除影视**：带二次确认弹窗，删除影视时自动级联清除其下所有关联资源。
- **资源链接管理（特色：单条 + 批量导入）**：
  - 查看当前影片名下的所有可用资源，支持单条删除；
  - 支持单条添加资源；
  - **批量导入模式**：支持多行文本快速粘贴录入（格式：`资源名称 | 类型 | 链接地址 | 提取码/备注`），后台自动解析并批量落库，极大降低运营录入成本。
- **从 TMDB 导入接口（支持免片名榜单发现与搜索）**：
  - 模态框内置 4 大无感探索榜单切换：**📅 今年热门大片**、**🍿 本月院线热映**、**🔥 全球实时热度**、**🏆 影史高分榜单**；
  - 用户**完全无需预先知道或输入任何电影名称**，直接点击榜单即可一览最新热播电影列表、高清海报、评分与剧情简介；
  - 支持一键将榜单中的任意电影导入本地/云端数据库并自动填入所有字段；
  - 配备可选搜索栏，仍可输入特定名称精确查找；
  - 代码内部已打通 TMDB 官方 Discover/Trending 接口驱动，配置 `TMDB_API_KEY` 即可直连官方全球动态榜单。

---

## 六、 预置测试数据 (Seeded Datasets)

已通过自动化脚本 `scripts/seed.ts` 生成 6 部极具代表性的高分佳作（共 24 条多源可用资源）：

1. **《星际穿越》(Interstellar)**
   - 电影 / 2014 / 评分 9.4 / 标签：科幻、冒险、剧情
   - 资源：夸克 4K IMAX 盘、百度 1080P 双语盘、4K 磁力、极速蓝光在线点播线路
2. **《盗梦空间》(Inception)**
   - 电影 / 2010 / 评分 9.3 / 标签：科幻、悬疑、动作、冒险
   - 资源：阿里 4K REMUX 盘、夸克 1080P 特效盘、4K 磁力、影院在线专线
3. **《肖申克的救赎》(The Shawshank Redemption)**
   - 电影 / 1994 / 评分 9.7 / 标签：剧情、犯罪
   - 资源：夸克 4K 修复原盘、百度 1080P 国英双语盘、2160p 磁力、纯净在线流媒体
4. **《绝命毒师》(Breaking Bad)**
   - 电视剧 / 2008 / 评分 9.6 / 标签：剧情、犯罪、悬疑
   - 资源：阿里 1-5 季 4K HDR 盘、夸克全季 1080P 盘、全62集磁力整合包、在线连续播放
5. **《权力的游戏》(Game of Thrones)**
   - 电视剧 / 2011 / 评分 9.3 / 标签：奇幻、剧情、冒险、动作
   - 资源：夸克全八季 4K 杜比原盘、百度全季 1080P 盘、4K 无损做种磁力、全季在线无剪辑
6. **《进击的巨人》(Attack on Titan)**
   - 动漫 / 2013 / 评分 9.6 / 标签：动漫、动作、奇幻、悬疑
   - 资源：阿里 1-4 季 + 完结篇 BDMV 盘、夸克全季精校盘、含外传剧场版磁力、60FPS 在线专线

---

## 七、 安全防线与凭证防泄露保障 (Security Posture)

为确保项目部署到公网或开源到 GitHub 时敏感凭证（密码、数据库链接、API Key）绝对不泄露，项目构建了以下防护：

1. **严格的 Git 忽略规则 ([`.gitignore`](file:///Volumes/Jie_4T/Workspace/Movie_Info/.gitignore))**：
   - 包含真实密码的 `.env`、`.env.local`、`.env*.local` 已全部被 Git 屏蔽；
   - 本地数据库目录 `data/` 已被完全忽略；
   - 仓库仅包含无真实凭证的配置范本 [`.env.example`](file:///Volumes/Jie_4T/Workspace/Movie_Info/.env.example)。
2. **Next.js 服务端隔离原则**：
   - `ADMIN_PASSWORD`、`DATABASE_URL`、`TMDB_API_KEY` 均未添加 `NEXT_PUBLIC_` 前缀；
   - Next.js 构建器在打包前端代码时，自动剔除全部非 `NEXT_PUBLIC_` 变量，**浏览器端源码绝对不会包含任何机密信息**。
3. **HMAC 密码学动态 Cookie 签名 ([`src/lib/auth.ts`](file:///Volumes/Jie_4T/Workspace/Movie_Info/src/lib/auth.ts))**：
   - Cookie 不存放明文标志，而是存放基于 `ADMIN_PASSWORD` 与盐值动态计算的 SHA-256 HMAC 摘要；
   - 即使黑客获知前端代码逻辑，在未知晓服务端密码的情况下，**在数学上无法伪造合法的登录态**；
   - 配置 `httpOnly: true`（杜绝浏览器 JS 脚本读取，免疫 XSS 攻击）；
   - 配置 `secure: process.env.NODE_ENV === 'production'`（仅允许在 HTTPS 加密链路上发送 Cookie）；
   - 密码与 Token 比对均使用 `crypto.timingSafeEqual`（防范时序侧信道攻击）。

---

## 八、 本地运维与生产部署指南 (Run & Deploy Guide)

### 1. 本地日常运行命令
```bash
# 1. 安装项目依赖
pnpm install

# 2. 填充 / 重置初始测试数据
pnpm seed

# 3. 启动本地开发服务（热重载，默认端口 3000）
pnpm dev

# 4. 构建生产包与启动（推荐在固定端口测试）
pnpm build
pnpm start -p 3088
```

### 2. 本地拉起独立 PostgreSQL 数据库 (可选)
如果希望本地使用标准的 Docker PostgreSQL 而非内嵌引擎：
```bash
# 后台启动 PostgreSQL 16 容器
docker compose up -d

# 在 .env.local 中配置连接串：
# DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/movie_info"

# 重新导入测试数据到 Docker 数据库
pnpm seed
```

### 3. 公网云平台部署（Vercel / Railway / Zeabur / 独立 VPS）
1. **推送代码到 GitHub**：
   ```bash
   git remote add origin https://github.com/YOUR_ACCOUNT/movie-info.git
   git push -u origin main
   ```
2. **在云平台后台配置环境变量 (Environment Variables)**：
   - `ADMIN_PASSWORD`：设置生产管理员专属强密码（16 位以上混合字符）；
   - `DATABASE_URL`：填写云端 PostgreSQL 连接串（建议附带 `?sslmode=require` 开启 TLS 加密）；
   - `TMDB_API_KEY`：（可选）填入从 themoviedb.org 申请的 API Key；
   - `SESSION_SECRET`：（可选）填入随机生成的安全盐值字符串。
3. **完成一键构建上线**：云平台会自动执行 `pnpm build` 并分配 HTTPS 生产域名。

---

## 九、 当前系统状态检查记录

- **代码版本**：Git 主分支 (`main`)，提交哈希 `cca8329`，工作区干净无脏文件。
- **本地服务运行状态**：正在运行中（Next.js Production Server，监听端口 `3088`）。
- **实机测试结果**：已通过自动化浏览器测试，首页卡片渲染、电影详情加载、一键复制链接/提取码 Toast 动效、后台管理 CRUD 均通过验证。

---

## 十、 后续演进建议与待办规划 (Roadmap)

如果后续继续对项目进行功能拓展，建议优先考虑以下演进路线：

1. **TMDB 全量云端打通**：
   在 `src/app/api/tmdb/route.ts` 中扩展支持按演员、导演搜索，支持批量同步当年院线热播榜单。
2. **资源可用性巡检机器人 (Health Checker)**：
   在后台增加一个“检测资源有效性”按钮，通过 Headless 请求检测网盘是否失效（404/链接已被取消）。
3. **前台用户端互动拓展**：
   - 本地收藏夹功能（基于 `localStorage`，无需登录即可让访客收藏“想看的影片”）；
   - 影视求片/报错留言板组件。
4. **数据备份与导出功能**：
   在后台面板支持一键导出当前影视与资源的 JSON / Excel 备份文件，便于迁移与异地冷备。

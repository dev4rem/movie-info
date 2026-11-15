# 极影资料库与资源导航网站 (CineNav DB)

基于 **Next.js (App Router)**、**PostgreSQL** 和 **Tailwind CSS** 构建的现代化暗黑流媒体风格个人影视资料库与多源资源导航系统。

---

## 🌟 项目亮点与特性

1. **暗黑流媒体风格设计 (Dark Mode)**：
   - 深度定制的流媒体暗黑调色（深黑、极夜蓝底色与经典红、琥珀金评分点缀）。
   - 沉浸式 Hero 巨幕推荐横幅、毛玻璃质感导航栏与平滑悬停微动效。

2. **数据库设计 (PostgreSQL)**：
   - **影视作品表 (`media`)**：支持自增 ID、中文标题、原名/外文名、类型（电影/电视剧/动漫）、上映年份、国家/地区、剧情简介、海报 URL、背景大图 URL、评分（1-10分）、分类标签数组（`TEXT[]`）、创建/更新时间戳。
   - **资源链接表 (`resources`)**：支持自增 ID、关联影视 ID（外键级联删除）、资源名称、资源类型（网盘链接/磁力链接/在线播放）、提取码/备注、链接地址、添加时间。
   - **双模兼容运行**：
     - 若配置了 `DATABASE_URL`，自动通过 `pg.Pool` 直连您的 PostgreSQL 实例；
     - 若未配置或本地未启动 PostgreSQL 服务，系统会自动启用内嵌 PostgreSQL 16 引擎（持久化于 `./data/pgdata`），实现真正的开箱即用。
     - 同时提供 `docker-compose.yml`，支持一键拉起独立 PostgreSQL 16 容器。

3. **前台展示与交互**：
   - **首页 (`/`)**：
     - 顶部导航栏与全局即时搜索框（支持搜索标题、原名与简介）。
     - 类型快速过滤（全部 / 电影 / 电视剧 / 动漫）与分类标签过滤（科幻、悬疑、动作、剧情、冒险、奇幻、犯罪等）。
     - “最新更新”与“高分推荐”两大网格版块。
   - **影视详情页 (`/media/[id]`)**：
     - 沉浸式虚化 Backdrop 大图、竖版高清海报、多维元数据徽章、完整剧情简介。
     - 影视资源列表：分类筛选（网盘 / 磁力 / 在线）、一键复制链接、一键复制提取码（带平滑 Toast 提示）与直接前往播放/下载。

4. **后台管理面板 (`/admin`)**：
   - **密码权限保护**：默认密码为 `admin123`（可通过环境变量 `ADMIN_PASSWORD` 灵活修改），未授权访问自动拦截。
   - **数据统计总览**：实时统计总收录影视、关联资源总数、电影数及剧集/动漫数。
   - **影视作品维护**：手动新增、编辑、删除作品信息，支持海报与背景图实时录入。
   - **资源链接管理**：单部影视下管理已有资源、单条添加，以及**多行文本批量导入资源**（格式：`资源名称 | 类型 | 链接地址 | 提取码`）。
   - **从 TMDB 导入占位与模拟**：已预留完整的 TMDB API 请求驱动与数据字段映射。提供热门大片模拟预设支持一键导入，配置 `TMDB_API_KEY` 即可连接官方云端库。

5. **预置测试数据**：
   - 已内置 6 部经典佳作数据：
     1. 《星际穿越》(Interstellar) - 评分 9.4
     2. 《盗梦空间》(Inception) - 评分 9.3
     3. 《肖申克的救赎》(The Shawshank Redemption) - 评分 9.7
     4. 《绝命毒师》(Breaking Bad) - 评分 9.6
     5. 《权力的游戏》(Game of Thrones) - 评分 9.3
     6. 《进击的巨人》(Attack on Titan) - 评分 9.6
   - 涵盖夸克网盘、百度网盘、阿里云盘、4K 磁力链接与在线秒播线路。

---

## 🚀 快速启动指南

### 1. 安装依赖
```bash
pnpm install
# 或者 npm install
```

### 2. 环境变量配置 (可选)
复制配置模板：
```bash
cp .env.example .env.local
```
在 `.env.local` 中可自定义配置：
- `ADMIN_PASSWORD`：后台管理密码（默认 `admin123`）
- `DATABASE_URL`：外部 PostgreSQL 数据库连接串（例如：`postgresql://postgres:postgrespassword@localhost:5432/movie_info`）
- `TMDB_API_KEY`：TMDB API Key（可选，用于自动同步影视元数据）

### 3. 初始化测试数据
```bash
pnpm seed
```

### 4. 启动开发或生产服务
```bash
# 开发模式
pnpm dev

# 或编译生产模式
pnpm build
pnpm start -p 3088
```

访问 `http://localhost:3088` 即可开始体验！

---

## 🛠️ 项目目录结构

```text
├── scripts/
│   ├── schema.sql         # 完整的 PostgreSQL DDL 建表与索引脚本
│   └── seed.ts            # 6 部经典影视及多源资源的初始化导入脚本
├── src/
│   ├── app/
│   │   ├── page.tsx       # 首页（Hero巨幕、分类过滤、最新更新、高分推荐）
│   │   ├── layout.tsx     # 全局布局与 Toast Provider
│   │   ├── globals.css    # 流媒体暗黑模式与毛玻璃样式
│   │   ├── media/[id]/    # 影视详情页（大图海报、剧情、资源列表与一键复制）
│   │   ├── admin/         # 后台管理主面板（影视维护、批量加资源、TMDB导入）
│   │   │   └── login/     # 后台密码验证登录页
│   │   └── api/           # 后端 RESTful API 路由
│   │       ├── media/     # 影视 CRUD 与过滤搜索接口
│   │       ├── resources/ # 资源链接增删与批量导入接口
│   │       ├── admin/     # 管理员鉴权与 Session Cookie 接口
│   │       └── tmdb/      # TMDB 元数据抓取与预留同步接口
│   ├── components/        # 核心复用组件（Navbar、Footer、MediaCard、Toast）
│   └── lib/               # 基础库（db 数据库驱动单例、auth 鉴权、types 类型定义）
├── docker-compose.yml     # PostgreSQL 16 容器化编排文件
├── tailwind.config.ts     # 影视流媒体调色板与主题扩展配置
└── package.json
```

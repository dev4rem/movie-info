export type MediaType = '电影' | '电视剧' | '动漫' | string;
export type ResourceType = '网盘链接' | '磁力链接' | '在线播放' | string;

export interface MediaItem {
  id: number;
  title: string;
  original_title: string | null;
  type: MediaType;
  year: number | null;
  country: string | null;
  overview: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  rating: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ResourceItem {
  id: number;
  media_id: number;
  name: string;
  type: ResourceType;
  code: string | null;
  url: string;
  created_at: string;
}

export interface MediaDetail extends MediaItem {
  resources: ResourceItem[];
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export type Audience = 'all' | 'students' | 'teachers' | 'public';

// Announcement interfaces
export interface Announcement {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  pinned: boolean;
  audience: Audience;
  publishedAt: string;
  visibleUntil?: string | null;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  pinned: boolean;
  audience: Audience;
  publishedAt?: string;
  visibleUntil?: string | null;
}

export interface UpdateAnnouncementRequest extends Partial<CreateAnnouncementRequest> {}

export interface AnnouncementDTO {
  id: number;
  title: string;
  content: string;
  audience: Audience;
  pinned: boolean;
  publishedByUserId: number;
  publishedAt: string;
  visibleUntil?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function mapAnnouncement(dto: AnnouncementDTO): Announcement {
  return {
    id: dto.id,
    title: dto.title,
    content: dto.content,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    authorId: dto.publishedByUserId,
    pinned: dto.pinned,
    audience: dto.audience,
    publishedAt: dto.publishedAt,
    visibleUntil: dto.visibleUntil,
  };
}
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Announcement interfaces
export interface Announcement {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  isPublished: boolean;
  isSlide: boolean;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  isPublished: boolean;
  isSlide: boolean;
}

export interface UpdateAnnouncementRequest extends Partial<CreateAnnouncementRequest> {}


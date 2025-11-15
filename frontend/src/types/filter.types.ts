export type DateRange = {
  startDate: string | null;
  endDate: string | null;
};

export interface AnnouncementFilters {
  keyword?: string;
  dateRange?: DateRange | null;
  pinned?: boolean | null;
  audience?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}
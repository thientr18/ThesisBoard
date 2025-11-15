import { useState } from 'react';
import type { DateRange } from '../types/filter.types';

export const useAnnouncementFilters = () => {
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [isPinned, setIsPinned] = useState<boolean>(false);

  const handleDateRangeChange = (range: DateRange | null) => {
    setDateRange(range);
  };

  const handlePinnedChange = (pinned: boolean) => {
    setIsPinned(pinned);
  };

  return {
    dateRange,
    isPinned,
    handleDateRangeChange,
    handlePinnedChange,
  };
};
import { useState } from 'react';
import { SearchOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';
import TextInput from '../common/inputs/TextInput';
import SelectInput from '../common/inputs/SelectInput';
import DatePicker from '../common/inputs/DatePicker';
import dayjs from 'dayjs';
import PrimaryButton from '../common/buttons/PrimaryButton';
import SecondaryButton from '../common/buttons/SecondaryButton';
import Card from '../common/display/Card';

type Props = {
  onFilterChange: (filters: {
    keyword?: string;
    startDate?: string;
    endDate?: string;
    pinned?: string;
  }) => void;
  initialFilters?: {
    keyword?: string;
    startDate?: string;
    endDate?: string;
    pinned?: string;
  };
};

export default function AnnouncementFilterBar({ onFilterChange, initialFilters = {} }: Props) {
  const [keyword, setKeyword] = useState(initialFilters.keyword || '');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    initialFilters.startDate ? dayjs(initialFilters.startDate) : null,
    initialFilters.endDate ? dayjs(initialFilters.endDate) : null,
  ]);
  const [pinnedFilter, setPinnedFilter] = useState(initialFilters.pinned || '');
  const [showFilters, setShowFilters] = useState(false);

  const handleApplyFilters = () => {
    onFilterChange({
      keyword: keyword.trim() || undefined,
      startDate: dateRange[0]?.format('YYYY-MM-DD') || undefined,
      endDate: dateRange[1]?.format('YYYY-MM-DD') || undefined,
      pinned: pinnedFilter || undefined,
    });
  };

  const handleClearFilters = () => {
    setKeyword('');
    setDateRange([null, null]);
    setPinnedFilter('');
    onFilterChange({});
  };

  const hasActiveFilters = keyword || dateRange[0] || dateRange[1] || pinnedFilter;

  return (
    <Card className="mb-6" bordered={false}>
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="flex-1">
            <TextInput
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search announcements by title or content..."
              className="rounded-lg "
            />
          </div>
          <SecondaryButton
            label={showFilters ? 'Hide Filters' : 'Show Filters'}
            icon={<FilterOutlined />}
            onClick={() => setShowFilters(!showFilters)}
            size="large"
            className={showFilters ? 'bg-[#189ad6]/10! border-[#189ad6]!' : ''}
          />
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-['Open_Sans'] font-semibold text-gray-700 mb-2">
                  Date Range
                </label>
                <DatePicker
                  value={dateRange[0] ?? undefined}
                  onChange={(date) => setDateRange([date, dateRange[1]])}
                  placeholder="Start date"
                  className="w-1/2"
                />
                <DatePicker
                  value={dateRange[1] ?? undefined}
                  onChange={(date) => setDateRange([dateRange[0], date])}
                  placeholder="End date"
                  className="w-1/2"
                />
              </div>

              {/* Pinned Status */}
              <div>
                <div>
                  <SelectInput
                    label="Pinned Status"
                    options={[
                      { label: "All Announcements", value: "" },
                      { label: "Pinned Only", value: "true" },
                      { label: "Non-Pinned Only", value: "false" },
                    ]}
                    value={pinnedFilter}
                    onChange={val => setPinnedFilter(String(val))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Empty column for alignment */}
              <div />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              {hasActiveFilters && (
                <PrimaryButton
                  label="Clear All"
                  icon={<ClearOutlined />}
                  onClick={handleClearFilters}
                />
              )}
              <PrimaryButton
                label="Apply Filters"
                icon={<SearchOutlined />}
                onClick={handleApplyFilters}
                className="bg-[#189ad6]! hover:bg-[#2f398f]!"
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
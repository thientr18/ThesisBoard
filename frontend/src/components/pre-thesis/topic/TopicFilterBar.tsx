import React from "react";
import { Input, Select } from "antd";

interface TopicFilterBarProps {
  keyword: string;
  status: string;
  onKeywordChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

const TopicFilterBar: React.FC<TopicFilterBarProps> = ({
  keyword,
  status,
  onKeywordChange,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <Input.Search
        placeholder="Search by title or description"
        value={keyword}
        onChange={e => onKeywordChange(e.target.value)}
        style={{ width: 240 }}
        allowClear
      />
      <Select
        value={status}
        onChange={onStatusChange}
        style={{ width: 160 }}
      >
        <Select.Option value="all">All Status</Select.Option>
        <Select.Option value="open">Open</Select.Option>
        <Select.Option value="closed">Closed</Select.Option>
      </Select>
    </div>
  );
};

export default TopicFilterBar;
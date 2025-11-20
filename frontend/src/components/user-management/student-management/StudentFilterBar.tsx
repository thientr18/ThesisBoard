import React, { useState, useEffect } from "react";
import { Input, Select } from "antd";

export interface StudentFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: string | null;
  onStatusChange: (val: string | null) => void;
}

const statusOptions = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Graduated", value: "graduated" },
];

const StudentFilterBar: React.FC<StudentFilterBarProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
}) => {
  const [searchValue, setSearchValue] = useState(search);

  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(searchValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchValue, onSearchChange]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl shadow-sm">
      <Input
        className="w-full sm:w-64"
        placeholder="Search by name or student ID"
        value={searchValue}
        onChange={e => setSearchValue(e.target.value)}
        allowClear
      />
      <Select
        className="w-full sm:w-48"
        options={statusOptions}
        value={status || ""}
        onChange={val => onStatusChange(val || null)}
        placeholder="Status"
        allowClear
      />
    </div>
  );
};

export default StudentFilterBar;
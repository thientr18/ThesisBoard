import React, { useState, useEffect } from "react";
import { Input } from "antd";

export interface AdministratorFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  onStatusChange: (val: string | null) => void;
}

const AdministratorFilterBar: React.FC<AdministratorFilterBarProps> = ({
  search,
  onSearchChange,
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
        placeholder="Search by name"
        value={searchValue}
        onChange={e => setSearchValue(e.target.value)}
        allowClear
      />
    </div>
  );
};

export default AdministratorFilterBar;
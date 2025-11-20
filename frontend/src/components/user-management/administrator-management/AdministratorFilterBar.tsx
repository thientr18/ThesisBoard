import React, { useState, useEffect } from "react";
import { Input } from "antd";

export interface AdministratorFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  onStatusChange: (val: string | null) => void;
  administratorCode?: string;
  onAdministratorCodeChange?: (val: string) => void;
}

const AdministratorFilterBar: React.FC<AdministratorFilterBarProps> = ({
  search,
  onSearchChange,
  administratorCode,
  onAdministratorCodeChange,
}) => {
  const [searchValue, setSearchValue] = useState(search);
  const [codeValue, setCodeValue] = useState(administratorCode ?? "");

  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(searchValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchValue, onSearchChange]);

  useEffect(() => {
    setCodeValue(administratorCode ?? "");
  }, [administratorCode]);

  useEffect(() => {
    if (onAdministratorCodeChange) {
      const handler = setTimeout(() => {
        onAdministratorCodeChange(codeValue);
      }, 300);
      return () => clearTimeout(handler);
    }
  }, [codeValue, onAdministratorCodeChange]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl shadow-sm">
      <Input
        className="w-full sm:w-64"
        placeholder="Search by name"
        value={searchValue}
        onChange={e => setSearchValue(e.target.value)}
        allowClear
      />
      <Input
        className="w-full sm:w-48"
        placeholder="Administrator Code"
        value={codeValue}
        onChange={e => setCodeValue(e.target.value)}
        allowClear
      />
    </div>
  );
};

export default AdministratorFilterBar;
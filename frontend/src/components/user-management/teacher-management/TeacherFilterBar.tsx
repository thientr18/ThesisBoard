import React, { useState, useEffect } from "react";
import { Input } from "antd";

export interface TeacherFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: string | null;
  onStatusChange: (val: string | null) => void;
  teacherCode?: string;
  onTeacherCodeChange?: (val: string) => void;
}

const TeacherFilterBar: React.FC<TeacherFilterBarProps> = ({
  search,
  onSearchChange,
  teacherCode,
  onTeacherCodeChange,
}) => {
  const [searchValue, setSearchValue] = useState(search);
  const [codeValue, setCodeValue] = useState(teacherCode ?? "");

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
    setCodeValue(teacherCode ?? "");
  }, [teacherCode]);

  useEffect(() => {
    if (onTeacherCodeChange) {
      const handler = setTimeout(() => {
        onTeacherCodeChange(codeValue);
      }, 300);
      return () => clearTimeout(handler);
    }
  }, [codeValue, onTeacherCodeChange]);

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
        placeholder="Teacher Code"
        value={codeValue}
        onChange={e => setCodeValue(e.target.value)}
        allowClear
      />
    </div>
  );
};

export default TeacherFilterBar;
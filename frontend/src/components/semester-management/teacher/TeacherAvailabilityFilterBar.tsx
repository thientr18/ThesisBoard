import React, { useState, useEffect } from "react";
import TextInput from "../../common/inputs/TextInput";

export interface TeacherAvailabilityFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
}

const TeacherAvailabilityFilterBar: React.FC<TeacherAvailabilityFilterBarProps> = ({
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
      <TextInput
        label="Search by teacher name"
        value={searchValue}
        onChange={e => setSearchValue(e.target.value)}
        placeholder="Enter teacher name"
        className="w-full sm:w-64"
      />
    </div>
  );
};

export default TeacherAvailabilityFilterBar;
import React, { useState, useEffect } from "react";
import TextInput from "../../common/inputs/TextInput";
import SelectInput from "../../common/inputs/SelectInput";

export interface StudentSemesterFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  type?: string;
  onTypeChange: (val: string | null) => void;
  status?: string;
  onStatusChange: (val: string | null) => void;
  studentCode?: string;
  onStudentCodeChange?: (val: string) => void;
}

const StudentSemesterFilterBar: React.FC<StudentSemesterFilterBarProps> = ({
  search,
  onSearchChange,
  type,
  onTypeChange,
  status,
  onStatusChange,
  studentCode,
  onStudentCodeChange,
}) => {
  const [searchValue, setSearchValue] = useState(search);
  const [codeValue, setCodeValue] = useState(studentCode ?? "");
  const [typeValue, setTypeValue] = useState<string | null>(type ?? null);
  const [statusValue, setStatusValue] = useState<string | null>(status ?? null);

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
    setCodeValue(studentCode ?? "");
  }, [studentCode]);

  useEffect(() => {
    if (onStudentCodeChange) {
      const handler = setTimeout(() => {
        onStudentCodeChange(codeValue);
      }, 300);
      return () => clearTimeout(handler);
    }
  }, [codeValue, onStudentCodeChange]);

  useEffect(() => {
    onTypeChange(typeValue);
  }, [typeValue, onTypeChange]);

  useEffect(() => {
    onStatusChange(statusValue);
  }, [statusValue, onStatusChange]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl shadow-sm">
      <TextInput
        label="Search by student name"
        value={searchValue}
        onChange={e => setSearchValue(e.target.value)}
        placeholder="Enter student name"
        className="w-full sm:w-64"
      />
      <TextInput
        label="Student Code"
        value={codeValue}
        onChange={e => setCodeValue(e.target.value)}
        placeholder="Enter student code"
        className="w-full sm:w-48"
      />
      <SelectInput
        label="Type"
        options={[
          { label: "All", value: "all" },
          { label: "Pre-thesis", value: "pre-thesis" },
          { label: "Thesis", value: "thesis" },
          { label: "Not registered", value: "not-registered" },
        ]}
        value={typeValue ?? undefined}
        onChange={val => setTypeValue(val as string)}
        placeholder="Type"
        className="w-full sm:w-40"
      />
      <SelectInput
        label="Status"
        options={[
          { label: "All", value: "all" },
          { label: "Enrolled", value: "enrolled" },
          { label: "Suspended", value: "suspended" },
          { label: "Completed", value: "completed" },
        ]}
        value={statusValue ?? undefined}
        onChange={val => setStatusValue(val as string)}
        placeholder="Status"
        className="w-full sm:w-40"
      />
    </div>
  );
};

export default StudentSemesterFilterBar;
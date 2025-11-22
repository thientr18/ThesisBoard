import React, { useState, useEffect } from "react";
import SelectInput from "../../common/inputs/SelectInput";

export interface SemesterFilterBarProps {
  status?: string;
  onStatusChange: (val: string | null) => void;
}

const SemesterFilterBar: React.FC<SemesterFilterBarProps> = ({
  status,
  onStatusChange,
}) => {
  const [statusValue, setStatusValue] = useState<string | null>(status ?? null);

  useEffect(() => {
    setStatusValue(status ?? null);
  }, [status]);

  useEffect(() => {
    onStatusChange(statusValue);
  }, [statusValue, onStatusChange]);

  return (
    <div className="flex flex-row gap-4 items-center bg-white p-4 rounded-xl shadow-sm">
      <SelectInput
        label="Status"
        options={[
          { label: "All", value: "all" },
          { label: "Current", value: "current" },
          { label: "Active", value: "active" },
        ]}
        value={statusValue ?? undefined}
        onChange={val => setStatusValue(val as string)}
        placeholder="Status"
        className="w-full sm:w-40"
      />
    </div>
  );
};

export default SemesterFilterBar;
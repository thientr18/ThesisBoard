import React, { useEffect, useState } from "react";
import Modal from "../../common/layout/Modal";
import TextInput from "../../common/inputs/TextInput";
import DatePicker from "../../common/inputs/DatePicker";
import ToggleInput from "../../common/inputs/ToggleInput";
import PrimaryButton from "../../common/buttons/PrimaryButton";
import SecondaryButton from "../../common/buttons/SecondaryButton";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

export interface SemesterPayload {
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCurrent: boolean;
}

export interface SemesterFormProps {
  open: boolean;
  loading?: boolean;
  mode: "create" | "edit";
  initialData?: Partial<SemesterPayload>;
  onSubmit: (payload: SemesterPayload) => void;
  onCancel: () => void;
}

const SemesterForm: React.FC<SemesterFormProps> = ({
  open,
  loading,
  mode,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<SemesterPayload>({
    name: "",
    code: "",
    startDate: "",
    endDate: "",
    isActive: true,
    isCurrent: false,
    ...initialData,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        code: "",
        startDate: "",
        endDate: "",
        isActive: true,
        isCurrent: false,
        ...initialData,
      });
    }
  }, [open, initialData]);

  const handleChange = (field: keyof SemesterPayload, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.code.trim() !== "" &&
    formData.startDate.trim() !== "" &&
    formData.endDate.trim() !== "";

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isFormValid) return;
    onSubmit({ ...formData });
  };

  return (
    <Modal
      open={open}
      title={mode === "create" ? "Add Semester" : "Edit Semester"}
      onClose={onCancel}
      width={480}
      footer={null}
      maskClosable
    >
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Semester Name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Enter semester name"
          required
        />
        <TextInput
          label="Semester Code"
          value={formData.code}
          onChange={(e) => handleChange("code", e.target.value)}
          placeholder="Enter semester code"
          required
        />
        <DatePicker
          label="Start Date"
          value={formData.startDate ? dayjs(formData.startDate) : undefined}
          onChange={(date: Dayjs | null) => handleChange("startDate", date ? date.format("YYYY-MM-DD") : "")}
          required
        />
        <DatePicker
          label="End Date"
          value={formData.endDate ? dayjs(formData.endDate) : undefined}
          onChange={(date: Dayjs | null) => handleChange("endDate", date ? date.format("YYYY-MM-DD") : "")}
          required
        />
        <ToggleInput
          label="Active"
          value={formData.isActive}
          onChange={(checked: boolean) => handleChange("isActive", checked)}
          checkedLabel="Active"
          uncheckedLabel="Inactive"
        />
        <ToggleInput
          label="Current Semester"
          value={formData.isCurrent}
          onChange={(checked: boolean) => handleChange("isCurrent", checked)}
          checkedLabel="Current"
          uncheckedLabel="Not Current"
        />
        <div className="flex justify-end gap-2 mt-6">
          <SecondaryButton label="Cancel" onClick={onCancel} />
          <PrimaryButton
            label="Save"
            htmlType="submit"
            loading={loading}
            type="primary"
            disabled={!isFormValid}
          />
        </div>
      </form>
    </Modal>
  );
};

export default SemesterForm;
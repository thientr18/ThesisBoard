import React, { useEffect, useState } from "react";
import Modal from "../../common/layout/Modal";
import SelectInput from "../../common/inputs/SelectInput";
import TextInput from "../../common/inputs/TextInput";
import PrimaryButton from "../../common/buttons/PrimaryButton";
import SecondaryButton from "../../common/buttons/SecondaryButton";
import { useUserApi } from "../../../api/endpoints/user.api";
import { Alert } from "../../common/feedback/Alert";

export interface TeacherAvailabilityPayload {
  teacherId: number;
  maxPreThesis: number;
  maxThesis: number;
  isOpen: boolean;
  note?: string | null;
}

export interface TeacherAvailabilityFormProps {
  open: boolean;
  loading?: boolean;
  mode: "create" | "edit";
  initialData?: Partial<TeacherAvailabilityPayload>;
  onSubmit: (payload: TeacherAvailabilityPayload) => void;
  onCancel: () => void;
  error?: string | null;
  excludedTeacherIds?: number[];
}

const isOpenOptions = [
  { label: "Open", value: "true" },
  { label: "Closed", value: "false" },
];

const TeacherAvailabilityForm: React.FC<TeacherAvailabilityFormProps> = ({
  open,
  loading,
  mode,
  initialData,
  onSubmit,
  onCancel,
  error,
  excludedTeacherIds = [],
}) => {
  const [formData, setFormData] = useState<TeacherAvailabilityPayload>({
    teacherId: 0,
    maxPreThesis: 0,
    maxThesis: 0,
    isOpen: true,
    note: "",
    ...initialData,
  });

  const [teachers, setTeachers] = useState<any[]>([]);
  const userApi = useUserApi();

  useEffect(() => {
    if (open) {
      setFormData({
        teacherId: 0,
        maxPreThesis: 0,
        maxThesis: 0,
        isOpen: true,
        note: "",
        ...initialData,
      });
      userApi
        .getAllTeachers?.()
        .then((res: any) => {
          setTeachers(res?.data || []);
        })
    }
  }, [open, initialData, userApi]);

  const handleChange = (field: keyof TeacherAvailabilityPayload, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid =
    !!formData.teacherId &&
    formData.maxPreThesis >= 0 &&
    formData.maxThesis >= 0;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isFormValid) return;
    onSubmit({ ...formData });
  };

  // Filter teachers for selection
  const availableTeachers = mode === "create"
    ? teachers.filter(t => !excludedTeacherIds.includes(t.id))
    : teachers;

  return (
    <Modal
      open={open}
      title={mode === "create" ? "Add Teacher Availability" : "Edit Teacher Availability"}
      onClose={onCancel}
      width={480}
      footer={null}
      maskClosable
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} showIcon />
          </div>
        )}
        <SelectInput
          label="Teacher"
          options={availableTeachers.map((t) => ({
            label: `${t.fullName} (${t.teacherCode})`,
            value: t.id,
          }))}
          value={formData.teacherId}
          onChange={(val) => handleChange("teacherId", val as number)}
          placeholder="Select teacher"
          disabled={mode === "edit"}
        />
        <TextInput
          label="Max PreThesis"
          type="number"
          min={0}
          value={formData.maxPreThesis !== undefined ? String(formData.maxPreThesis) : ""}
          onChange={e => handleChange("maxPreThesis", e.target.value === "" ? 0 : parseInt(e.target.value))}
          placeholder="Enter max pre-thesis"
        />
        <TextInput
          label="Max Thesis"
          type="number"
          min={0}
          value={formData.maxThesis !== undefined ? String(formData.maxThesis) : ""}
          onChange={e => handleChange("maxThesis", e.target.value === "" ? 0 : parseInt(e.target.value))}
          placeholder="Enter max thesis"
        />
        <SelectInput
          label="Status"
          options={isOpenOptions}
          value={formData.isOpen ? "true" : "false"}
          onChange={val => handleChange("isOpen", val === "true")}
        />
        <TextInput
          label="Note"
          value={formData.note ?? ""}
          onChange={e => handleChange("note", e.target.value)}
          placeholder="Enter note (optional)"
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

export default TeacherAvailabilityForm;
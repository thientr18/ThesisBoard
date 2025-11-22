import React, { useEffect, useState } from "react";
import Modal from "../../common/layout/Modal";
import SelectInput from "../../common/inputs/SelectInput";
import TextInput from "../../common/inputs/TextInput";
import PrimaryButton from "../../common/buttons/PrimaryButton";
import SecondaryButton from "../../common/buttons/SecondaryButton";
import { useUserApi } from "../../../api/endpoints/user.api";

export interface StudentSemesterPayload {
  studentId: number;
  gpa?: number | null;
  credits?: number | null;
  type: "pre-thesis" | "thesis" | "not-registered";
  status: "enrolled" | "suspended" | "completed";
}

export interface StudentSemesterFormProps {
  open: boolean;
  loading?: boolean;
  mode: "create" | "edit";
  initialData?: Partial<StudentSemesterPayload>;
  onSubmit: (payload: StudentSemesterPayload) => void;
  onCancel: () => void;
}

const typeOptions = [
  { label: "Pre-thesis", value: "pre-thesis" },
  { label: "Thesis", value: "thesis" },
  { label: "Not registered", value: "not-registered" },
];

const statusOptions = [
  { label: "Enrolled", value: "enrolled" },
  { label: "Suspended", value: "suspended" },
  { label: "Completed", value: "completed" },
];

const StudentSemesterForm: React.FC<StudentSemesterFormProps> = ({
  open,
  loading,
  mode,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<StudentSemesterPayload>({
    studentId: 0,
    gpa: null,
    credits: null,
    type: "pre-thesis",
    status: "enrolled",
    ...initialData,
  });

  const [students, setStudents] = useState<any[]>([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const userApi = useUserApi();

  useEffect(() => {
    if (open) {
      setFormData({
        studentId: 0,
        gpa: null,
        credits: null,
        type: "pre-thesis",
        status: "enrolled",
        ...initialData,
      });
      setStudentLoading(true);
      userApi
        .getAllStudents?.()
        .then((res: any) => {
          setStudents(
            (res?.data || []).filter((s: any) => s.status === "active")
          );
        })
        .finally(() => setStudentLoading(false));
    }
  }, [open, initialData, userApi]);

  const handleChange = (field: keyof StudentSemesterPayload, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid =
    !!formData.studentId &&
    formData.type &&
    formData.status &&
    (formData.gpa === undefined || formData.gpa === null || (formData.gpa >= 0 && formData.gpa <= 4)) &&
    (formData.credits === undefined || formData.credits === null || formData.credits >= 0);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isFormValid) return;
    onSubmit({ ...formData });
  };

  return (
    <Modal
      open={open}
      title={mode === "create" ? "Add Student to Semester" : "Edit Student Semester"}
      onClose={onCancel}
      width={480}
      footer={null}
      maskClosable
    >
      <form onSubmit={handleSubmit}>
        <SelectInput
          label="Student"
          options={students.map((s) => ({
            label: `${s.user?.fullName || ""} (${s.studentIdCode})`,
            value: s.id,
          }))}
          value={formData.studentId}
          onChange={(val) => handleChange("studentId", val as number)}
          placeholder="Select student"
          disabled={mode === "edit"}
        />
        <TextInput
          label="GPA"
          type="number"
          min={0}
          max={4}
          step={0.01}
          value={formData.gpa !== null && formData.gpa !== undefined ? String(formData.gpa) : ""}
          onChange={e => handleChange("gpa", e.target.value === "" ? null : parseFloat(e.target.value))}
          placeholder="Enter GPA (0.00 - 4.00)"
        />
        <TextInput
          label="Credits"
          type="number"
          min={0}
          value={formData.credits !== null && formData.credits !== undefined ? String(formData.credits) : ""}
          onChange={e => handleChange("credits", e.target.value === "" ? null : parseInt(e.target.value))}
          placeholder="Enter credits"
        />
        <SelectInput
          label="Type"
          options={typeOptions}
          value={formData.type}
          onChange={val => handleChange("type", val as StudentSemesterPayload["type"])}
        />
        <SelectInput
          label="Status"
          options={statusOptions}
          value={formData.status}
          onChange={val => handleChange("status", val as StudentSemesterPayload["status"])}
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

export default StudentSemesterForm;
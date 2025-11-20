import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import Modal from "../../common/layout/Modal";
import TextInput from "../../common/inputs/TextInput";
import SelectInput from "../../common/inputs/SelectInput";
import DatePicker from "../../common/inputs/DatePicker";
import PrimaryButton from "../../common/buttons/PrimaryButton";
import SecondaryButton from "../../common/buttons/SecondaryButton";
import { useSemesterApi } from "../../../api/endpoints/semester.api";

export interface StudentPayload {
  email: string;
  fullName: string;
  password: string;
  studentIdCode: string;
  cohortYear?: number | null;
  className?: string | null;
  phone?: string | null;
  dob?: string | dayjs.Dayjs | null;
  gender?: "male" | "female" | "other" | null;
  status: "active" | "inactive" | "graduated";
  semesterId: number | null;
  gpa?: number | null;
  credits?: number | null;
  type?: "pre-thesis" | "thesis" | "not-registered";
  role: "student";
}

export interface StudentFormProps {
  open: boolean;
  loading?: boolean;
  mode: "create" | "edit";
  initialData?: Partial<StudentPayload>;
  onSubmit: (payload: StudentPayload) => void;
  onCancel: () => void;
}

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Graduated", value: "graduated" },
];

const typeOptions = [
  { label: "Pre-thesis", value: "pre-thesis" },
  { label: "Thesis", value: "thesis" },
  { label: "Not registered", value: "not-registered" },
];

const StudentForm: React.FC<StudentFormProps> = ({
  open,
  loading,
  mode,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const { getAll } = useSemesterApi();
  const [semesters, setSemesters] = useState<{ id: number; name: string }[]>([]);
  const [formData, setFormData] = useState<StudentPayload>({
    email: "",
    fullName: "",
    password: "",
    studentIdCode: "",
    cohortYear: null,
    className: "",
    phone: "",
    dob: null,
    gender: null,
    status: "active",
    semesterId: null,
    gpa: null,
    credits: null,
    type: undefined,
    role: "student",
    ...initialData,
  });

  useEffect(() => {
    if (open) {
      getAll().then((res) => {
        if (res.data && res.data.length > 0) {
          setSemesters(res.data);
          setFormData((prev) => ({
            ...prev,
            semesterId: initialData?.semesterId ?? res.data![0].id,
          }));
        } else {
          setSemesters([]);
        }
      });
      setFormData({
        email: "",
        fullName: "",
        password: "",
        studentIdCode: "",
        cohortYear: null,
        className: "",
        phone: "",
        dob: initialData?.dob ? dayjs(initialData.dob) : null,
        gender: null,
        status: "active",
        semesterId: null,
        gpa: null,
        credits: null,
        type: undefined,
        role: "student",
        ...initialData,
      });
    }
  }, [open, initialData, getAll]);

  const handleChange = (field: keyof StudentPayload, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid =
    (mode === "create"
      ? formData.password.trim() !== ""
      : true) &&
    formData.email.trim() !== "" &&
    formData.fullName.trim() !== "" &&
    formData.studentIdCode.trim() !== "" &&
    formData.status !== undefined &&
    formData.semesterId !== null;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isFormValid) return;

    onSubmit({
      ...formData,
      dob: formData.dob ? dayjs(formData.dob).format("YYYY-MM-DD") : null,
      phone: formData.phone && formData.phone.trim() !== "" ? formData.phone : null,
    });
  };

  return (
    <Modal
      open={open}
      title={mode === "create" ? "Add Student" : "Edit Student"}
      onClose={onCancel}
      width={480}
      footer={null}
      maskClosable
    >
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Full Name"
          value={formData.fullName}
          onChange={(e) => handleChange("fullName", e.target.value)}
          placeholder="Enter full name"
          required
        />
        <TextInput
          label="Email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="Enter email"
          required
          type="email"
        />
        <TextInput
          label="Student ID"
          value={formData.studentIdCode}
          onChange={(e) => handleChange("studentIdCode", e.target.value)}
          placeholder="Enter student ID"
          required
        />
        {mode === "create" && (
          <>
            <TextInput
              label="Password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="Enter password"
              required
              type="password"
            />
          </>
        )}
        <TextInput
          label="Cohort Year"
          value={formData.cohortYear?.toString() ?? ""}
          onChange={(e) => handleChange("cohortYear", Number(e.target.value))}
          placeholder="Enter cohort year"
          type="number"
        />
        <TextInput
          label="Class Name"
          value={formData.className ?? ""}
          onChange={(e) => handleChange("className", e.target.value)}
          placeholder="Enter class name"
        />
        <TextInput
          label="Phone"
          value={formData.phone ?? ""}
          onChange={(e) => handleChange("phone", e.target.value)}
          placeholder="Enter phone number"
        />
        <DatePicker
          label="Date of Birth"
          value={formData.dob as any}
          onChange={(date) => handleChange("dob", date)}
          placeholder="YYYY-MM-DD"
        />
        <SelectInput
          label="Gender"
          options={genderOptions}
          value={formData.gender ?? undefined}
          onChange={(val) => handleChange("gender", val)}
          placeholder="Select gender"
        />
        <SelectInput
          label="Status"
          options={statusOptions}
          value={formData.status}
          onChange={(val) => handleChange("status", val)}
          placeholder="Select status"
        />
        <SelectInput
          label="Semester"
          options={semesters.map((s) => ({
            label: s.name,
            value: s.id,
          }))}
          value={formData.semesterId ?? undefined}
          onChange={(val) => handleChange("semesterId", val)}
          placeholder="Select semester"
        />
        <TextInput
          label="GPA"
          value={formData.gpa?.toString() ?? ""}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val >= 0 && val <= 4) {
              handleChange("gpa", val);
            } else if (e.target.value === "") {
              handleChange("gpa", null);
            }
          }}
          placeholder="Enter GPA (0 - 4.0)"
          type="number"
          min={0}
          max={4}
          step={0.01}
        />
        <TextInput
          label="Credits"
          value={formData.credits?.toString() ?? ""}
          onChange={(e) => handleChange("credits", Number(e.target.value))}
          placeholder="Enter credits"
          type="number"
          min={0}
          step={1}
        />
        <SelectInput
          label="Type"
          options={typeOptions}
          value={formData.type ?? undefined}
          onChange={(val) => handleChange("type", val)}
          placeholder="Select type"
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

export default StudentForm;
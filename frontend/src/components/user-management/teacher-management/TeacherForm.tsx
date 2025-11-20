import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import Modal from "../../common/layout/Modal";
import TextInput from "../../common/inputs/TextInput";
import SelectInput from "../../common/inputs/SelectInput";
import DatePicker from "../../common/inputs/DatePicker";
import PrimaryButton from "../../common/buttons/PrimaryButton";
import SecondaryButton from "../../common/buttons/SecondaryButton";

export interface TeacherPayload {
  email: string;
  fullName: string;
  password: string;
  teacherCode: string;
  title?: string | null;
  office?: string | null;
  phone?: string | null;
  dob?: string | dayjs.Dayjs | null;
  gender?: "male" | "female" | "other" | null;
  status: "active" | "inactive";
  role: "teacher";
}

export interface TeacherFormProps {
  open: boolean;
  loading?: boolean;
  mode: "create" | "edit";
  initialData?: Partial<TeacherPayload>;
  onSubmit: (payload: TeacherPayload) => void;
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
];

const titleOptions = [
  { label: "Professor", value: "Professor" },
  { label: "Associate Professor", value: "Associate Professor" },
  { label: "Lecturer", value: "Lecturer" },
  { label: "Assistant", value: "Assistant" },
];

const TeacherForm: React.FC<TeacherFormProps> = ({
  open,
  loading,
  mode,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<TeacherPayload>({
    email: "",
    fullName: "",
    password: "",
    teacherCode: "",
    title: "",
    office: "",
    phone: "",
    dob: null,
    gender: null,
    status: "active",
    role: "teacher",
    ...initialData,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        email: "",
        fullName: "",
        password: "",
        teacherCode: "",
        title: "",
        office: "",
        phone: "",
        dob: initialData?.dob ? dayjs(initialData.dob) : null,
        gender: null,
        status: "active",
        role: "teacher",
        ...initialData,
      });
    }
  }, [open, initialData]);

  const handleChange = (field: keyof TeacherPayload, value: any) => {
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
    formData.teacherCode.trim() !== "" &&
    formData.status !== undefined;

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
      title={mode === "create" ? "Add Teacher" : "Edit Teacher"}
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
          label="Teacher Code"
          value={formData.teacherCode}
          onChange={(e) => handleChange("teacherCode", e.target.value)}
          placeholder="Enter teacher code"
          required
        />
        {mode === "create" && (
          <TextInput
            label="Password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="Enter password"
            required
            type="password"
          />
        )}
        <SelectInput
          label="Title"
          options={titleOptions}
          value={formData.title ?? undefined}
          onChange={(val) => handleChange("title", val)}
          placeholder="Select title"
        />
        <TextInput
          label="Office"
          value={formData.office ?? ""}
          onChange={(e) => handleChange("office", e.target.value)}
          placeholder="Enter office"
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

export default TeacherForm;
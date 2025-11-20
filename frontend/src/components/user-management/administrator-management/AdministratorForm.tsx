import React, { useEffect, useState } from "react";
import Modal from "../../common/layout/Modal";
import TextInput from "../../common/inputs/TextInput";
import SelectInput from "../../common/inputs/SelectInput";
import ToggleInput from "../../common/inputs/ToggleInput";
import PrimaryButton from "../../common/buttons/PrimaryButton";
import SecondaryButton from "../../common/buttons/SecondaryButton";

export interface AdministratorPayload {
  email: string;
  fullName: string;
  password: string;
  role: "admin" | "moderator" | "";
}

export interface AdministratorFormProps {
  open: boolean;
  loading?: boolean;
  mode: "create" | "edit";
  initialData?: Partial<AdministratorPayload>;
  onSubmit: (payload: AdministratorPayload) => void;
  onCancel: () => void;
}

const AdministratorForm: React.FC<AdministratorFormProps> = ({
  open,
  loading,
  mode,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<AdministratorPayload>({
    email: "",
    fullName: "",
    password: "",
    role: "",
    ...initialData,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        email: "",
        fullName: "",
        password: "",
        role: "",
        ...initialData,
      });
    }
  }, [open, initialData]);

  const handleChange = (field: keyof AdministratorPayload, value: any) => {
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
    (mode === "create"
      ? (formData.role === "admin" || formData.role === "moderator")
      : true
    )

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isFormValid) return;

    if (mode === "edit") {
      onSubmit({
        email: formData.email,
        fullName: formData.fullName,
      } as AdministratorPayload);
    } else {
      onSubmit({
        ...formData,
      });
    }
  };

  return (
    <Modal
      open={open}
      title={mode === "create" ? "Add Administrator" : "Edit Administrator"}
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
            <ToggleInput
              label="Role"
              value={formData.role === "moderator"}
              onChange={(checked) => handleChange("role", checked ? "moderator" : "admin")}
              checkedLabel="Moderator"
              uncheckedLabel="Admin"
            />
          </>
        )}
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

export default AdministratorForm;
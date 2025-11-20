import React from "react";
import { Modal, Descriptions, Tag } from "antd";
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import PrimaryButton from "../../common/buttons/PrimaryButton";
import SecondaryButton from "../../common/buttons/SecondaryButton";
import type { Student } from "../../../types/user.types";

export interface StudentDetailProps {
  open: boolean;
  student: Student | null;
  onClose: () => void;
  onEdit?: (student: Student) => void;
  onDelete?: (studentId: number) => void;
  canManage?: boolean;
}

const statusColor: Record<string, string> = {
  active: "green",
  inactive: "orange",
  graduated: "blue",
};

const StudentDetail: React.FC<StudentDetailProps> = ({
  open,
  student,
  onClose,
  onEdit,
  onDelete,
  canManage = false,
}) => {
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  if (!student) return null;

  const handleEdit = () => {
    onEdit?.(student);
  };

  const handleDelete = () => {
    setConfirmVisible(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.(student.id);
    setConfirmVisible(false);
  };

  const handleCancelDelete = () => {
    setConfirmVisible(false);
  };

  return (
    <>
      <Modal
        open={open}
        title="Student Details"
        onCancel={onClose}
        footer={null}
        centered
        width={500}
      >
        <Descriptions column={1} bordered size="middle">
          <Descriptions.Item label="Student ID">{student.studentIdCode}</Descriptions.Item>
          <Descriptions.Item label="Full Name">{student.fullName || "Unknown"}</Descriptions.Item>
          <Descriptions.Item label="Gender">{student.gender || "-"}</Descriptions.Item>
          <Descriptions.Item label="Date of Birth">{student.dob ? String(student.dob) : "-"}</Descriptions.Item>
          <Descriptions.Item label="Phone">{student.phone || "-"}</Descriptions.Item>
          <Descriptions.Item label="Class">{student.className || "-"}</Descriptions.Item>
          <Descriptions.Item label="Cohort Year">{student.cohortYear || "-"}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={statusColor[student.status]}>{student.status}</Tag>
          </Descriptions.Item>
        </Descriptions>
        {canManage && (
          <div className="flex justify-end gap-2 mt-6">
            <PrimaryButton
              label="Edit"
              icon={<EditOutlined />}
              onClick={handleEdit}
              className="bg-[#189ad6]! text-white! hover:bg-[#189ad6]/90!"
            />
            <SecondaryButton
              label="Delete"
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              className="bg-red-500! text-white! hover:bg-red-600! border-red-500!"
            />
          </div>
        )}
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        open={confirmVisible}
        onCancel={handleCancelDelete}
        title={
          <span className="flex items-center gap-2 text-red-600">
            <ExclamationCircleOutlined />
            Delete Student
          </span>
        }
        footer={
          <div className="flex justify-end gap-2">
            <SecondaryButton label="Cancel" onClick={handleCancelDelete} />
            <PrimaryButton
              label="Delete"
              onClick={handleConfirmDelete}
              className="bg-red-500! text-white! hover:bg-red-600!"
            />
          </div>
        }
        width={400}
        closeIcon={null}
      >
        <div className="text-gray-700 text-base">
          Are you sure you want to delete this student? This action cannot be undone.
        </div>
      </Modal>
    </>
  );
};

export default StudentDetail;
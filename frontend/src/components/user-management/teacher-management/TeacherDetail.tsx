import React from "react";
import { Modal, Descriptions, Tag } from "antd";
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import PrimaryButton from "../../common/buttons/PrimaryButton";
import SecondaryButton from "../../common/buttons/SecondaryButton";
import type { Teacher } from "../../../types/user.types";

export interface TeacherDetailProps {
  open: boolean;
  teacher: Teacher | null;
  onClose: () => void;
  onEdit?: (teacher: Teacher) => void;
  onDelete?: (teacherId: number) => void;
  canManage?: boolean;
}

const statusColor: Record<string, string> = {
  active: "green",
  inactive: "orange",
};

const TeacherDetail: React.FC<TeacherDetailProps> = ({
  open,
  teacher,
  onClose,
  onEdit,
  onDelete,
  canManage = false,
}) => {
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  if (!teacher) return null;

  const handleEdit = () => {
    onEdit?.(teacher);
  };

  const handleDelete = () => {
    setConfirmVisible(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.(teacher.id);
    setConfirmVisible(false);
  };

  const handleCancelDelete = () => {
    setConfirmVisible(false);
  };

  return (
    <>
      <Modal
        open={open}
        title="Teacher Details"
        onCancel={onClose}
        footer={null}
        centered
        width={500}
      >
        <Descriptions column={1} bordered size="middle">
          <Descriptions.Item label="Teacher Code">{teacher.teacherCode || "-"}</Descriptions.Item>
          <Descriptions.Item label="Full Name">{teacher.fullName || "Unknown"}</Descriptions.Item>
          <Descriptions.Item label="Title">{teacher.title || "-"}</Descriptions.Item>
          <Descriptions.Item label="Office">{teacher.office || "-"}</Descriptions.Item>
          <Descriptions.Item label="Phone">{teacher.phone || "-"}</Descriptions.Item>
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
            Delete Teacher
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
          Are you sure you want to delete this teacher? This action cannot be undone.
        </div>
      </Modal>
    </>
  );
};

export default TeacherDetail;
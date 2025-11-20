import React from "react";
import { Modal, Descriptions, Tag } from "antd";
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import PrimaryButton from "../../common/buttons/PrimaryButton";
import SecondaryButton from "../../common/buttons/SecondaryButton";
import type { UserWithRoles } from "../../../types/user.types";

export interface AdministratorDetailProps {
  open: boolean;
  administrator: UserWithRoles | null;
  onClose: () => void;
  onEdit?: (administrator: UserWithRoles) => void;
  onDelete?: (administratorId: number) => void;
  canManage?: boolean;
}
const AdministratorDetail: React.FC<AdministratorDetailProps> = ({
  open,
  administrator,
  onClose,
  onEdit,
  onDelete,
  canManage = false,
}) => {
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  if (!administrator) return null;

  const handleEdit = () => {
    onEdit?.(administrator);
  };

  const handleDelete = () => {
    setConfirmVisible(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.(administrator.id);
    setConfirmVisible(false);
  };

  const handleCancelDelete = () => {
    setConfirmVisible(false);
  };

  return (
    <>
      <Modal
        open={open}
        title="Administrator Details"
        onCancel={onClose}
        footer={null}
        centered
        width={500}
      >
        <Descriptions column={1} bordered size="middle">
          <Descriptions.Item label="Administrator Email">{administrator.email || "-"}</Descriptions.Item>
          <Descriptions.Item label="Full Name">{administrator.fullName || "Unknown"}</Descriptions.Item>
          <Descriptions.Item label="Role">
            {administrator.roles && administrator.roles.length > 0
              ? administrator.roles.map(role => (
                  <Tag color="blue" key={role.name}>{role.name}</Tag>
                ))
              : "-"}
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
            Delete Administrator
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
          Are you sure you want to delete this administrator? This action cannot be undone.
        </div>
      </Modal>
    </>
  );
};

export default AdministratorDetail;
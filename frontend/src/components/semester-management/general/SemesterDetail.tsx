import React from "react";
import Modal from "../../common/layout/Modal";
import Tag from "../../common/display/Tag";
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import PrimaryButton from "../../common/buttons/PrimaryButton";
import SecondaryButton from "../../common/buttons/SecondaryButton";

export interface Semester {
  id: number;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCurrent: boolean;
};

export interface SemesterDetailProps {
  open: boolean;
  semester: Semester | null;
  onClose: () => void;
  onEdit?: (semester: Semester) => void;
  onDelete?: (semesterId: number) => void;
  canManage?: boolean;
}

const SemesterDetail: React.FC<SemesterDetailProps> = ({
  open,
  semester,
  onClose,
  onEdit,
  onDelete,
  canManage = false,
}) => {
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  if (!semester) return null;

  const handleEdit = () => {
    onEdit?.(semester);
  };

  const handleDelete = () => {
    setConfirmVisible(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.(semester.id);
    setConfirmVisible(false);
  };

  const handleCancelDelete = () => {
    setConfirmVisible(false);
  };

  // Hiển thị cả hai trạng thái nếu đều true
  const renderStatusTags = (semester: Semester) => {
    const tags = [];
    if (semester.isActive) {
      tags.push(<Tag key="active" type="success" label="Active" />);
    }
    if (semester.isCurrent) {
      tags.push(<Tag key="current" type="info" label="Current" />);
    }
    if (!semester.isActive && !semester.isCurrent) {
      tags.push(<Tag key="inactive" type="default" label="Inactive" />);
    }
    return <div className="flex gap-2">{tags}</div>;
  };

  return (
    <>
      <Modal
        open={open}
        title="Semester Details"
        onClose={onClose}
        footer={null}
        width={500}
      >
        <div className="mb-6">
          <div className="font-semibold text-lg mb-2">Semester Name: {semester.name || "-"}</div>
          <div className="text-gray-700 mb-2">Code: {semester.code || "-"}</div>
          <div className="text-gray-700 mb-2">Start Date: {semester.startDate || "-"}</div>
          <div className="text-gray-700 mb-2">End Date: {semester.endDate || "-"}</div>
          <div className="text-gray-700 mb-2 flex items-center gap-2">
            Status: {renderStatusTags(semester)}
          </div>
        </div>
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
        onClose={handleCancelDelete}
        title={
          <span className="flex items-center gap-2 text-red-600">
            <ExclamationCircleOutlined />
            Delete Semester
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
          Are you sure you want to delete this semester? This action cannot be undone.
        </div>
      </Modal>
    </>
  );
};

export default SemesterDetail;
import React, { useState } from "react";
import Modal from "../../common/layout/Modal";
import Tag from "../../common/display/Tag";
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined, UserOutlined } from "@ant-design/icons";
import PrimaryButton from "../../common/buttons/PrimaryButton";
import SecondaryButton from "../../common/buttons/SecondaryButton";
import { Alert } from "../../common/feedback/Alert";

export interface TeacherAvailabilityDetailData {
  id: number;
  teacher: {
    user: {
      fullName: string;
      email?: string;
    };
    teacherIdCode?: string;
  };
  maxPreThesis: number;
  maxThesis: number;
  isOpen: boolean;
  note?: string | null;
}

export interface TeacherAvailabilityDetailProps {
  open: boolean;
  teacher: TeacherAvailabilityDetailData | null;
  onClose: () => void;
  onEdit?: (teacher: TeacherAvailabilityDetailData) => void;
  onDelete?: (teacherId: number) => void;
  canManage?: boolean;
  deleteError?: string | null;
}

const renderStatusTag = (isOpen: boolean) => {
  return isOpen
    ? <Tag type="success" label="Open" />
    : <Tag type="default" label="Closed" />;
};

const TeacherAvailabilityDetail: React.FC<TeacherAvailabilityDetailProps> = ({
  open,
  teacher,
  onClose,
  onEdit,
  onDelete,
  canManage = false,
  deleteError,
}) => {
  const [confirmVisible, setConfirmVisible] = useState(false);
  if (!teacher) return null;

  const handleEdit = () => {
    onEdit?.(teacher);
  };

  const handleDelete = () => {
    setConfirmVisible(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.(teacher.id);
  };

  const handleCancelDelete = () => {
    setConfirmVisible(false);
  };

  return (
    <>
      <Modal
        open={open}
        title="Teacher Availability Details"
        onClose={onClose}
        footer={null}
        width={500}
      >
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl text-gray-400">
              <UserOutlined />
            </div>
            <div>
              <div className="font-semibold text-lg">{teacher.teacher.user.fullName}</div>
              {teacher.teacher.teacherIdCode && (
                <div className="text-gray-700 text-sm">{teacher.teacher.teacherIdCode}</div>
              )}
            </div>
          </div>
          <div className="text-gray-700 mb-2">Email: {teacher.teacher.user.email || "-"}</div>
          <div className="text-gray-700 mb-2 flex items-center gap-2">
            Status: {renderStatusTag(teacher.isOpen)}
          </div>
          <div className="text-gray-700 mb-2">
            Max PreThesis: <b>{teacher.maxPreThesis}</b>
          </div>
          <div className="text-gray-700 mb-2">
            Max Thesis: <b>{teacher.maxThesis}</b>
          </div>
          {teacher.note && (
            <div className="text-gray-700 mb-2">
              <span className="font-medium">Note:</span> <span className="italic">{teacher.note}</span>
            </div>
          )}
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
            Delete Teacher Availability
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
        {deleteError && (
          <div className="mb-2">
            <Alert type="error" message={deleteError} showIcon />
          </div>
        )}
        <div className="text-gray-700 text-base">
          Are you sure you want to delete this teacher's availability for the semester? This action cannot be undone.
        </div>
      </Modal>
    </>
  );
};

export default TeacherAvailabilityDetail;
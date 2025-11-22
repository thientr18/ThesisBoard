import React, { useState } from "react";
import Modal from "../../common/layout/Modal";
import Tag from "../../common/display/Tag";
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined, UserOutlined } from "@ant-design/icons";
import PrimaryButton from "../../common/buttons/PrimaryButton";
import SecondaryButton from "../../common/buttons/SecondaryButton";

export interface StudentSemesterDetailData {
  id: number;
  studentId: number;
  fullName: string;
  studentCode: string;
  email: string;
  status: string;
  gpa?: number | null;
  credits?: number | null;
  type?: string | null;
}

export interface StudentSemesterDetailProps {
  open: boolean;
  student: StudentSemesterDetailData | null;
  onClose: () => void;
  onEdit?: (student: StudentSemesterDetailData) => void;
  onDelete?: (studentId: number) => void;
  canManage?: boolean;
}

const renderStatusTag = (status?: string) => {
  switch (status) {
    case "active":
      return <Tag type="success" label="Active" />;
    case "completed":
      return <Tag type="info" label="Completed" />;
    case "inactive":
      return <Tag type="default" label="Inactive" />;
    default:
      return null;
  }
};

const StudentSemesterDetail: React.FC<StudentSemesterDetailProps> = ({
  open,
  student,
  onClose,
  onEdit,
  onDelete,
  canManage = false,
}) => {
  const [confirmVisible, setConfirmVisible] = useState(false);
  if (!student) return null;

  const handleEdit = () => {
    onEdit?.(student);
  };

  const handleDelete = () => {
    setConfirmVisible(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.(student.studentId);
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
              <div className="font-semibold text-lg">{student.fullName}</div>
              <div className="text-gray-700 text-sm">{student.studentCode}</div>
            </div>
          </div>
          <div className="text-gray-700 mb-2">Email: {student.email || "-"}</div>
          <div className="text-gray-700 mb-2 flex items-center gap-2">
            Status: {renderStatusTag(student.status)}
          </div>
          {/* Semester Data */}
          <div className="text-gray-700 mb-2">
            GPA: {student.gpa !== undefined && student.gpa !== null ? student.gpa : "N/A"}
          </div>
          <div className="text-gray-700 mb-2">
            Credits: {student.credits !== undefined && student.credits !== null ? student.credits : "N/A"}
          </div>
          <div className="text-gray-700 mb-2">Type: {student.type ? student.type.charAt(0).toUpperCase() + student.type.slice(1) : "-"}</div>
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
          Are you sure you want to delete this student from the semester? This action cannot be undone.
        </div>
      </Modal>
    </>
  );
};

export default StudentSemesterDetail;
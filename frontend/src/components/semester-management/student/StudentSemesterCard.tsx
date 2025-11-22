import React from "react";
import Card from "../../common/display/Card";
import Tag from "../../common/display/Tag";
import { UserOutlined } from "@ant-design/icons";

export interface StudentSemester {
  id: number;
  studentId: number;
  fullName: string;
  studentCode: string;
  email?: string;
  status?: string; // e.g. "active", "inactive", "completed"
}

export interface StudentSemesterCardProps {
  student: StudentSemester;
  onClick: (student: StudentSemester) => void;
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

const StudentSemesterCard: React.FC<StudentSemesterCardProps> = ({
  student,
  onClick,
}) => {
  return (
    <Card
      hoverable
      onClick={() => onClick(student)}
      className="shadow rounded-xl border border-gray-100 transition-all"
      bordered={true}
    >
      <div className="flex items-center gap-4">
        <div className="shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl text-gray-400">
          <UserOutlined />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg text-gray-800">{student.fullName}</span>
            <span className="ml-2 text-xs px-2 py-1 rounded bg-gray-200 text-gray-600">{student.studentCode}</span>
          </div>
          <div className="text-gray-700 font-medium">
            {student.email}
          </div>
          <div className="mt-1">
            {renderStatusTag(student.status)}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StudentSemesterCard;
import React from "react";
import { UserOutlined } from "@ant-design/icons";
import Card from "../../common/display/Card";
import Tag from "../../common/display/Tag";
import type { Student } from "../../../types/user.types";

export interface StudentCardProps {
  student: Student;
  onClick: (student: Student) => void;
  canManage: boolean;
}

const statusTypeMap: Record<string, "success" | "warning" | "info" | "default"> = {
  active: "success",
  inactive: "warning",
  graduated: "info",
};

const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onClick,
}) => {
  const handleCardClick = () => {
    onClick(student);
  };

  return (
    <Card
      hoverable
      onClick={handleCardClick}
      className="shadow-md rounded-xl transition-all border border-gray-100"
      bordered={true}
    >
      <div className="flex items-center gap-4">
        <div className="shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl text-gray-400">
          <UserOutlined />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg text-gray-800">{student.studentIdCode}</span>
            <Tag type={statusTypeMap[student.status] || "default"} label={student.status} />
          </div>
          <div className="text-gray-700 font-medium">
            {student.fullName || "Unknown Name"}
          </div>
          <div className="text-gray-500 text-sm">
            {student.className ? `Class: ${student.className}` : ""}
            {student.cohortYear ? ` • Cohort: ${student.cohortYear}` : ""}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StudentCard;
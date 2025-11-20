import React from "react";
import { UserOutlined } from "@ant-design/icons";
import Card from "../../common/display/Card";
import type { Teacher } from "../../../types/user.types";

export interface TeacherCardProps {
  teacher: Teacher;
  onClick: (teacher: Teacher) => void;
  canManage: boolean;
}

const statusTypeMap: Record<string, "success" | "warning" | "default"> = {
  active: "success",
  inactive: "warning",
};

const TeacherCard: React.FC<TeacherCardProps> = ({
  teacher,
  onClick,
}) => {
  const handleCardClick = () => {
    onClick(teacher);
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
            <span className="font-semibold text-lg text-gray-800">{teacher.teacherCode || "-"}</span>
          </div>
          <div className="text-gray-700 font-medium">
            {teacher.fullName || "Unknown Name"}
          </div>
          <div className="text-gray-500 text-sm">
            {teacher.title ? `Title: ${teacher.title}` : ""}
            {teacher.office ? ` • Office: ${teacher.office}` : ""}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TeacherCard;
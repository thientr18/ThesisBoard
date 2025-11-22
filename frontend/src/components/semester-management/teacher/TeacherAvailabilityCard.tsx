import React from "react";
import Card from "../../common/display/Card";
import Tag from "../../common/display/Tag";
import { UserOutlined } from "@ant-design/icons";

export interface TeacherAvailability {
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

export interface TeacherAvailabilityCardProps {
  teacher: TeacherAvailability;
  onClick: (teacher: TeacherAvailability) => void;
  canManage?: boolean;
}

const renderStatusTag = (isOpen: boolean) => {
  return isOpen
    ? <Tag type="success" label="Open" />
    : <Tag type="default" label="Closed" />;
};

const TeacherAvailabilityCard: React.FC<TeacherAvailabilityCardProps> = ({
  teacher,
  onClick,
}) => {
  return (
    <Card
      hoverable
      onClick={() => onClick(teacher)}
      className="shadow rounded-xl border border-gray-100 transition-all"
      bordered={true}
    >
      <div className="flex items-center gap-4">
        <div className="shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl text-gray-400">
          <UserOutlined />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg text-gray-800">{teacher.teacher.user.fullName}</span>
            {teacher.teacher.teacherIdCode && (
              <span className="ml-2 text-xs px-2 py-1 rounded bg-gray-200 text-gray-600">
                {teacher.teacher.teacherIdCode}
              </span>
            )}
          </div>
          <div className="text-gray-700 font-medium">
            {teacher.teacher.user.email}
          </div>
          <div className="mt-1 flex gap-2 items-center">
            {renderStatusTag(teacher.isOpen)}
            <span className="text-xs text-gray-500">
              PreThesis: <b>{teacher.maxPreThesis}</b> | Thesis: <b>{teacher.maxThesis}</b>
            </span>
          </div>
          {teacher.note && (
            <div className="mt-1 text-xs text-gray-400 italic truncate">
              {teacher.note}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TeacherAvailabilityCard;
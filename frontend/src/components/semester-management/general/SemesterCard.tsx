import React from "react";
import { CalendarOutlined } from "@ant-design/icons";
import Card from "../../common/display/Card";
import Tag from "../../common/display/Tag";

export interface Semester {
  id: number;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCurrent: boolean;
};

export interface SemesterCardProps {
  semester: Semester;
  onClick: (semester: Semester) => void;
  canManage?: boolean;
}

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

const SemesterCard: React.FC<SemesterCardProps> = ({
  semester,
  onClick,
}) => {
  const handleCardClick = () => {
    onClick(semester);
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
          <CalendarOutlined />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg text-gray-800">{semester.name || "-"}</span>
            <span className="ml-2 text-xs px-2 py-1 rounded bg-gray-200 text-gray-600">{semester.code}</span>
          </div>
          <div className="text-gray-700 font-medium">
            Status: {renderStatusTags(semester)}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SemesterCard;
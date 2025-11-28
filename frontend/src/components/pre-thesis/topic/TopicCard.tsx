import React from "react";
import { Card, Tag } from "antd";

interface TopicCardProps {
  topic: any;
  onClick?: (topic: any) => void;
}

const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  onClick,
}) => {
  return (
    <Card
      hoverable
      className="shadow rounded-xl border border-gray-100 transition-all"
      onClick={() => onClick && onClick(topic)}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg text-gray-800">{topic.title}</span>
          {topic.status === "open" ? (
            <Tag color="green">Open</Tag>
          ) : (
            <Tag color="default">Closed</Tag>
          )}
        </div>
        <div className="text-gray-700 text-sm line-clamp-2 mb-1">
          {topic.description}
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {Array.isArray(topic.tags) && topic.tags.map((tag: string) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Max Slots: {topic.maxSlots ?? "N/A"} &nbsp;|&nbsp; Slots Left: <b>{topic.slotsLeft ?? "?"}</b>
        </div>
        {/* Đã xóa nút Apply và Full ở đây */}
      </div>
    </Card>
  );
};

export default TopicCard;
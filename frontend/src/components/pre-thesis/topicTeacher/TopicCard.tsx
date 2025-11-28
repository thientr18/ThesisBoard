import React from "react";
import Card from "../../common/display/Card";
import Tag from "../../common/display/Tag";
import { BookOutlined } from "@ant-design/icons";

export interface Topic {
  id: number;
  title: string;
  description?: string;
  tags?: string[];
  status?: "open" | "closed";
  teacherId?: number;
  maxSlots?: number | null;
}

export interface TopicCardProps {
  topic: Topic;
  onClick: (topic: Topic) => void;
}

const renderStatusTag = (status?: string) => {
  switch (status) {
    case "open":
      return <Tag type="success" label="Open" />;
    case "closed":
      return <Tag type="default" label="Closed" />;
    default:
      return null;
  }
};

const TopicCard: React.FC<TopicCardProps> = ({ topic, onClick }) => {
  return (
    <Card
      hoverable
      onClick={() => onClick(topic)}
      className="shadow rounded-xl border border-gray-100 transition-all"
      bordered={true}
    >
      <div className="flex items-center gap-4">
        <div className="shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl text-gray-400">
          <BookOutlined />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg text-gray-800">{topic.title}</span>
            {renderStatusTag(topic.status)}
          </div>
          <div className="text-gray-700 text-sm line-clamp-2 mb-1">
            {topic.description}
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {Array.isArray(topic.tags) && topic.tags.length > 0
              ? topic.tags.map((tag: string) => (
                  <Tag key={tag} type="info" label={tag} />
                ))
              : null}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Max Slots: {topic.maxSlots ?? "N/A"}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TopicCard;
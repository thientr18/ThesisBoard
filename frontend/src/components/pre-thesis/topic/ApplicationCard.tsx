import React from "react";
import { Card, Tag, Button } from "antd";

interface ApplicationCardProps {
  application: {
    id: number;
    topic: {
      title: string;
      description?: string;
      tags?: string[];
    };
    proposalTitle: string;
    proposalAbstract: string;
    status: "pending" | "accepted" | "rejected" | "cancelled";
    decidedAt?: string | null;
    note?: string | null;
  };
  onCancel?: (id: number) => void;
  onEdit?: (application: any) => void;
  loading?: boolean;
}

const statusColor: Record<string, string> = {
  pending: "blue",
  accepted: "green",
  rejected: "red",
  cancelled: "default",
};

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onCancel,
  onEdit,
  loading,
}) => {
  return (
    <Card
      className="mb-4 shadow rounded-xl border border-gray-100"
      onClick={() => onEdit && onEdit(application)}
      hoverable
      style={{ cursor: "pointer" }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-base text-gray-800">
            {application.topic?.title}
          </span>
          <Tag color={statusColor[application.status]}>{application.status.toUpperCase()}</Tag>
        </div>
        <div className="text-gray-700 text-sm">
          <b>Proposal Title:</b> {application.proposalTitle}
        </div>
        <div className="text-gray-700 text-sm">
          <b>Abstract:</b> {application.proposalAbstract}
        </div>
        {Array.isArray(application.topic?.tags) && application.topic.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {application.topic.tags.map((tag: string) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        )}
        {application.note && (
          <div className="text-xs text-gray-500">
            <b>Note:</b> {application.note}
          </div>
        )}
        {application.decidedAt && (
          <div className="text-xs text-gray-400">
            <b>Decided At:</b> {new Date(application.decidedAt).toLocaleString()}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ApplicationCard;
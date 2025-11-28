import React from "react";
import { Modal, Tag, Button } from "antd";

interface ApplicationDetailProps {
  open: boolean;
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
  } | null;
  onClose: () => void;
  onEdit?: (application: any) => void;
  onCancel?: (id: number) => void;
  loading?: boolean;
}

const statusColor: Record<string, string> = {
  pending: "blue",
  accepted: "green",
  rejected: "red",
  cancelled: "default",
};

const ApplicationDetail: React.FC<ApplicationDetailProps> = ({
  open,
  application,
  onClose,
  onEdit,
  onCancel,
  loading,
}) => {
  if (!application) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <div className="flex items-center gap-2">
          <span className="font-semibold">{application.topic?.title}</span>
          <Tag color={statusColor[application.status]}>
            {application.status.toUpperCase()}
          </Tag>
        </div>
      }
      width={500}
    >
      <div className="mb-2">
        <div className="mb-2">
          <b>Proposal Title:</b> {application.proposalTitle}
        </div>
        <div className="mb-2">
          <b>Abstract:</b> {application.proposalAbstract}
        </div>
        <div className="mb-2">
          <b>Topic Description:</b> {application.topic?.description || "N/A"}
        </div>
        {Array.isArray(application.topic?.tags) && application.topic.tags.length > 0 && (
          <div className="mb-2">
            <b>Tags:</b>{" "}
            {application.topic.tags.map((tag: string) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        )}
        {application.note && (
          <div className="mb-2">
            <b>Note:</b> {application.note}
          </div>
        )}
        {application.decidedAt && (
          <div className="mb-2 text-xs text-gray-400">
            <b>Decided At:</b> {new Date(application.decidedAt).toLocaleString()}
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-4">
        {application.status === "pending" && onEdit && (
          <Button size="small" onClick={onEdit}>
            Edit
          </Button>
        )}
        {application.status === "pending" && onCancel && (
          <Button
            size="small"
            danger
            loading={loading}
            onClick={() => onCancel(application.id)}
          >
            Cancel
          </Button>
        )}
        <Button size="small" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default ApplicationDetail;
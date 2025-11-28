import React from "react";
import { Modal, Tag, Button, message } from "antd";
import { Title, Text } from "../../common/display/Typography";
import { usePreThesisApi } from "../../../api/endpoints/pre-thesis.api";

interface TopicDetailProps {
  open: boolean;
  topic: any | null;
  onClose: () => void;
  user?: any;
  reloadTopics?: () => void;
  applications?: any[];
  onApply?: (topic: any) => void;
}

const TopicDetail: React.FC<TopicDetailProps> = ({
  open,
  topic,
  onClose,
  user,
  applications = [],
  onApply,
}) => {
  const { applyToTopic } = usePreThesisApi();
  const [loading, setLoading] = React.useState(false);

  if (!topic) return null;

  const isStudent = Array.isArray(user?.roles) && user.roles.some((r: any) => r.name === "student");
  const canApply =
  isStudent &&
  topic.status === "open" &&
  (
    topic.maxSlots == null
      ? true
      : (topic.slotsLeft ?? 0) > 0
  );
  const hasApplied = isStudent && applications.some(
    app => app.topic?.id === topic.id && app.status !== "cancelled" && app.status !== "rejected"
  );

  const handleApply = async () => {
    setLoading(true);
    const res = await applyToTopic(topic.id, { proposalTitle: "", proposalAbstract: "" });
    setLoading(false);
    if (res.error) {
      message.error(res.error);
    } else {
      message.success("Applied successfully!");
      window.location.reload();
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={<Title level={4}>{topic.title}</Title>}
      width={500}
    >
      <div className="mb-2">
        <Text className="block text-gray-600 mb-2">{topic.description}</Text>
        <div className="mb-2">
          <span className="font-semibold">Requirements: </span>
          <span>{topic.requirements || "None"}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Tags: </span>
          {Array.isArray(topic.tags) && topic.tags.length > 0
            ? topic.tags.map((tag: string) => (
                <Tag key={tag}>{tag}</Tag>
              ))
            : <span>None</span>}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Max Slots: </span>
          <span>{topic.maxSlots ?? "N/A"}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Slots Left: </span>
          <span>{topic.slotsLeft ?? "?"}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Status: </span>
          {topic.status === "open" ? (
            <Tag color="green">Open</Tag>
          ) : (
            <Tag color="default">Closed</Tag>
          )}
        </div>
      </div>
      {canApply && !hasApplied && (
        <Button
          type="primary"
          block
          onClick={() => onApply && onApply(topic)}
        >
          Apply
        </Button>
      )}
      {isStudent && topic.status === "open" && topic.maxSlots != null && (topic.slotsLeft ?? 0) === 0 && (
        <Button type="default" disabled block>
          Full
        </Button>
      )}
    </Modal>
  );
};

export default TopicDetail;
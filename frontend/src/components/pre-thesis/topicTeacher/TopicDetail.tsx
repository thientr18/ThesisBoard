import React, { useState } from "react";
import Modal from "../../common/layout/Modal";
import Tag from "../../common/display/Tag";
import { Title, Text } from "../../common/display/Typography";
import { CloseOutlined } from "@ant-design/icons";
import { usePreThesisApi } from "../../../api/endpoints/pre-thesis.api";
import { Alert, Button, Popconfirm, message } from "antd";
import TopicForm from "./TopicForm";

interface TopicDetailProps {
  open: boolean;
  topic: any | null;
  onClose: () => void;
  onUpdate?: () => void;
  onDelete?: () => void;
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

const TopicDetail: React.FC<TopicDetailProps> = ({
  open,
  topic,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const { deleteTopic, updateTopic } = usePreThesisApi();
  const [editMode, setEditMode] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!topic) return;
    const res = await deleteTopic(topic.id);
    if (res.error) {
      message.error(res.error);
    } else {
      message.success("Deleted successfully!");
      onClose();
      onDelete?.();
    }
  };

  const handleUpdate = async (values: any) => {
    const payload = { ...values,
      teacherId: topic.teacherId,
      semesterId: topic.semesterId
     };
    const res = await updateTopic(topic.id, payload);
    if (res.error) {
     setFormError(res.error);
    } else {
      message.success("Updated successfully!");
      setFormError(null);
      setEditMode(false);
      onUpdate?.();
      onClose();
    }
  };

  if (!topic) return null;

  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center gap-2">
          {renderStatusTag(topic.status)}
        </div>
      }
      onClose={onClose}
      width={600}
      footer={
        editMode
          ? null
          : [
              <Button key="edit" type="primary" onClick={() => setEditMode(true)}>
                Edit
              </Button>,
              <Popconfirm
                key="delete"
                title="Are you sure to delete this topic?"
                onConfirm={handleDelete}
                okText="Yes"
                cancelText="No"
              >
                <Button danger type="primary">
                  Delete
                </Button>
              </Popconfirm>,
              <Button key="close" onClick={onClose}>
                Close
              </Button>,
            ]
      }
      closeIcon={<CloseOutlined />}
    >
      {editMode ? (
        <>
          {formError && (
            <Alert
              type="error"
              message="Cannot update topic"
              description={formError}
              showIcon
              className="mb-4"
              closable
              onClose={() => setFormError(null)}
            />
          )}
          <TopicForm
            onSuccess={() => {
              setEditMode(false);
              setFormError(null);
              onUpdate?.();
              onClose();
            }}
            onError={setFormError}
            semesterId={topic.semesterId}
            initialValues={topic}
            isEdit
            onFinish={handleUpdate}
          />
        </>
      ) : (
        <div className="mb-4">
          <Title level={4}>{topic.title}</Title>
          <Text className="block text-gray-600 mb-2">{topic.description}</Text>
          <div className="mb-2">
            <span className="font-semibold">Requirements: </span>
            <span>{topic.requirements || "None"}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Tags: </span>
            {Array.isArray(topic.tags) && topic.tags.length > 0
              ? topic.tags.map((tag: string) => (
                  <Tag key={tag} type="info" label={tag} className="mr-1" />
                ))
              : <span>None</span>}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Max Slots: </span>
            <span>{topic.maxSlots ?? "N/A"}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Status: </span>
            {renderStatusTag(topic.status)}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TopicDetail;
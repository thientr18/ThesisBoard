import React, { useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { usePreThesisApi } from "../../../api/endpoints/pre-thesis.api";

const TopicForm: React.FC<{
  onSuccess?: () => void;
  onError?: (error: string) => void;
  semesterId?: number | string;
  initialValues?: any;
  isEdit?: boolean;
  onFinish?: (values: any) => void;
}> = ({ onSuccess, onError, semesterId, initialValues, isEdit, onFinish }) => {
  const { createTopic } = usePreThesisApi();
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const handleFinish = async (values: any) => {
    let tagsArr: string[] = [];
    if (Array.isArray(values.tags)) {
      tagsArr = values.tags;
    } else if (typeof values.tags === "string") {
      tagsArr = values.tags.split(",").map((t: string) => t.trim()).filter(Boolean);
    }
    const submitValues = {
      ...values,
      tags: tagsArr,
      maxSlots: values.maxSlots ? Number(values.maxSlots) : undefined,
      semesterId,
    };
    if (isEdit && onFinish) {
      await onFinish(submitValues);
    } else {
      const res = await createTopic(submitValues);
      if (res.error) {
        if (onError) onError(res.error);
        else message.error(res.error);
      } else {
        message.success("Topic created successfully!");
        form.resetFields();
        onSuccess?.();
      }
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      autoComplete="off"
      initialValues={initialValues || { semesterId }}
      style={{ maxWidth: 500, margin: "0 auto" }}
    >
      <Form.Item
        label="Topic Title"
        name="title"
        rules={[{ required: true, message: "Please enter the topic title" }]}
        style={{ marginBottom: 12 }}
      >
        <Input placeholder="Enter topic title" />
      </Form.Item>
      <Form.Item label="Description" name="description" style={{ marginBottom: 12 }}>
        <Input.TextArea rows={2} placeholder="Enter topic description" />
      </Form.Item>
      <Form.Item label="Requirements" name="requirements" style={{ marginBottom: 12 }}>
        <Input.TextArea rows={1} placeholder="Enter requirements for students" />
      </Form.Item>
      <div style={{ display: "flex", gap: 16 }}>
        <Form.Item label="Tags" name="tags" style={{ flex: 1, marginBottom: 12 }}>
          <Input placeholder="Tags, separated by commas" />
        </Form.Item>
        <Form.Item label="Max Slots" name="maxSlots" style={{ width: 120, marginBottom: 12 }}>
          <Input type="number" placeholder="Max" min={1} />
        </Form.Item>
      </div>
      <Form.Item name="semesterId" initialValue={semesterId} hidden>
        <Input type="hidden" />
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }}>
        <Button type="primary" htmlType="submit" block>
          {isEdit ? "Update Topic" : "Create Topic"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default TopicForm;
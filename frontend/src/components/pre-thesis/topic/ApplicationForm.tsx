import React from "react";
import { Form, Input, Button } from "antd";

interface ApplicationFormProps {
  loading?: boolean;
  onSubmit: (values: { proposalTitle: string; proposalAbstract: string }) => void;
  initialValues?: { proposalTitle: string; proposalAbstract: string };
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ loading, onSubmit, initialValues }) => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    onSubmit(values);
    form.resetFields();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      autoComplete="off"
      initialValues={initialValues}
    >
      <Form.Item
        label="Proposal Title"
        name="proposalTitle"
        rules={[{ required: true, message: "Please enter your proposal title" }]}
      >
        <Input placeholder="Enter your proposal title" />
      </Form.Item>
      <Form.Item
        label="Proposal Abstract"
        name="proposalAbstract"
        rules={[{ required: true, message: "Please enter your proposal abstract" }]}
      >
        <Input.TextArea rows={4} placeholder="Enter your proposal abstract" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Apply
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ApplicationForm;
import React, { useEffect } from 'react';
import { Form, DatePicker, message, Modal as AntModal } from 'antd';
import { SaveOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Modal from '../common/layout/Modal';
import TextInput from '../common/inputs/TextInput';
import TextArea from '../common/inputs/TextArea';
import Switch from '../common/display/Switch';
import PrimaryButton from '../common/buttons/PrimaryButton';
import type { Announcement, CreateAnnouncementRequest, UpdateAnnouncementRequest } from '../../types/announcement.types';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: CreateAnnouncementRequest | UpdateAnnouncementRequest) => Promise<void>;
  announcement?: Announcement | null; // If provided, form is in edit mode
  mode?: 'create' | 'edit';
};

export default function AnnouncementForm({ 
  visible, 
  onClose, 
  onSubmit,
  announcement,
  mode: propMode 
}: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  // Determine mode based on announcement prop or explicit mode prop
  const mode = propMode || (announcement ? 'edit' : 'create');
  const isEditMode = mode === 'edit';

  // Populate form when announcement changes (edit mode)
  useEffect(() => {
    if (visible && announcement && isEditMode) {
      form.setFieldsValue({
        title: announcement.title,
        content: announcement.content,
        audience: announcement.audience,
        pinned: announcement.pinned,
        publishedAt: announcement.publishedAt ? dayjs(announcement.publishedAt) : null,
        visibleUntil: announcement.visibleUntil ? dayjs(announcement.visibleUntil) : null,
      });
    } else if (visible && !isEditMode) {
      form.resetFields();
    }
  }, [visible, announcement, isEditMode, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const formattedValues: CreateAnnouncementRequest | UpdateAnnouncementRequest = {
        title: values.title,
        content: values.content,
        pinned: values.pinned || false,
        audience: values.audience || 'all',
        publishedAt: values.publishedAt ? values.publishedAt.toISOString() : undefined,
        visibleUntil: values.visibleUntil ? values.visibleUntil.toISOString() : null,
      };
      
      await onSubmit(formattedValues);
      form.resetFields();
      message.success(isEditMode ? 'Announcement updated successfully!' : 'Announcement created successfully!');
    } catch (error) {
      console.error('Form submission error:', error);
      message.error(isEditMode ? 'Failed to update announcement' : 'Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center justify-between">
          <span className="text-2xl font-['Montserrat'] text-[#2f398f]">
            {isEditMode ? 'Edit Announcement' : 'Create Announcement'}
          </span>
        </div>
      }
      open={visible}
      onClose={onClose}
      width={700}
      className="announcement-form-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-6"
        initialValues={{
          audience: 'all',
          pinned: false,
        }}
      >
        {/* Title - Required */}
        <Form.Item
          name="title"
          rules={[
            { required: true, message: 'Please enter a title' },
            { min: 1, message: 'Title must be at least 1 character' },
            { max: 255, message: 'Title cannot exceed 255 characters' }
          ]}
        >
          <TextInput
            label="Title"
            placeholder="Enter announcement title"
            required
          />
        </Form.Item>

        {/* Content - Required */}
        <Form.Item
          name="content"
          rules={[
            { required: true, message: 'Please enter content' },
            { min: 10, message: 'Content must be at least 10 characters' },
            { max: 20000, message: 'Content cannot exceed 20,000 characters' }
          ]}
        >
          <TextArea
            label="Content"
            rows={6}
            placeholder="Write your announcement here..."
            required
            showCount
            maxLength={20000}
          />
        </Form.Item>

        {/* Audience - Required */}
        <Form.Item
          name="audience"
          label={
            <span className="font-['Open_Sans'] font-semibold text-gray-700">
              Audience <span className="text-red-500">*</span>
            </span>
          }
          rules={[{ required: true, message: 'Please select an audience' }]}
        >
          <select 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189ad6] focus:border-transparent"
          >
            <option value="all">All Users</option>
            <option value="students">Students Only</option>
            <option value="teachers">Teachers Only</option>
            <option value="public">Public</option>
          </select>
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          {/* Published At - Optional */}
          <Form.Item
            name="publishedAt"
            label={
              <span className="font-['Open_Sans'] font-semibold text-gray-700">
                Publish Date (Optional)
              </span>
            }
            help="Leave empty to publish immediately"
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              placeholder="Select publish date"
              className="w-full"
            />
          </Form.Item>

          {/* Visible Until - Optional */}
          <Form.Item
            name="visibleUntil"
            label={
              <span className="font-['Open_Sans'] font-semibold text-gray-700">
                Visible Until (Optional)
              </span>
            }
            help="Leave empty for permanent visibility"
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              placeholder="Select end date"
              className="w-full"
              disabledDate={(current) => {
                const publishedAt = form.getFieldValue('publishedAt');
                return current && publishedAt && current < publishedAt;
              }}
            />
          </Form.Item>
        </div>

        {/* Pinned - Important Field */}
        <Form.Item
          name="pinned"
          valuePropName="checked"
        >
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Form.Item name="pinned" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
            <div className="flex-1">
              <label className="font-['Open_Sans'] font-semibold text-gray-900 text-base block">
                Pin to Dashboard
              </label>
              <span className="text-sm text-gray-600">
                Pinned announcements appear at the top and are highlighted
              </span>
            </div>
          </div>
        </Form.Item>

        {/* Action Buttons */}
        <Form.Item className="mb-0! mt-6">
          <div className="flex justify-end gap-3">
            <PrimaryButton
              htmlType="submit"
              label={isEditMode ? 'Save Changes' : 'Create Announcement'}
              loading={loading}
              icon={<SaveOutlined />}
              className="bg-[#189ad6]! hover:bg-[#2f398f]!"
              disabled={loading}
            />
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
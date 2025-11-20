import { useState } from 'react';
import { ClockCircleOutlined, UserOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, CloseOutlined } from '@ant-design/icons';
import Modal from '../common/layout/Modal';
import Tag from '../common/display/Tag';
import { Paragraph, Title } from '../common/display/Typography';
import PrimaryButton from '../common/buttons/PrimaryButton';
import SecondaryButton from '../common/buttons/SecondaryButton';
import type { Announcement } from '../../types/announcement.types';

type Props = {
  announcement: Announcement | null;
  visible: boolean;
  onClose: () => void;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (announcementId: number) => void;
  showActions?: boolean;
};

export default function AnnouncementDetail({ 
  announcement, 
  visible, 
  onClose, 
  onEdit,
  onDelete,
  showActions = false 
}: Props) {
  const [confirmVisible, setConfirmVisible] = useState(false);
  if (!announcement) return null;

  const date = new Date(announcement.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleEdit = () => {
    onEdit?.(announcement);
  };

  const handleDelete = () => {
    setConfirmVisible(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.(announcement.id);
    setConfirmVisible(false);
  };

  const handleCancelDelete = () => {
    setConfirmVisible(false);
  };

  return (
    <>
      <Modal
        open={visible}
        onClose={onClose}
        width={800}
        className="announcement-detail-modal"
        closeIcon={
          <CloseOutlined className="text-white hover:text-white/80 text-lg" />
        }
      >
        {/* Header with gradient */}
        <div className="bg-linear-to-r from-[#189ad6] to-[#2f398f] px-8 pt-8 pb-6 -mt-6 -mx-6 rounded-t-lg relative">
          <div className="flex items-start justify-between gap-4 mb-3">
            <Title level={2} className="text-white! mb-0! font-['Montserrat']! flex-1 pr-20">
              {announcement.title}
            </Title>
            {showActions && (
              <div className="flex items-center gap-2 shrink-0 mr-8">
                <PrimaryButton
                  label="Edit"
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                  className="bg-white! text-[#2f398f]! hover:bg-white/90!"
                />
                <SecondaryButton
                  label="Delete"
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                  className="bg-red-500! text-white! hover:bg-red-600! border-red-500!"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <Tag
              label={date}
              icon={<ClockCircleOutlined />}
              color="rgba(255, 255, 255, 0.2)"
              className="text-white! px-4! py-1.5!"
              bordered={false}
            />
            <Tag
              label={announcement.audience.toUpperCase()}
              icon={<UserOutlined />}
              color="rgba(255, 255, 255, 0.2)"
              className="text-white! px-4! py-1.5!"
              bordered={false}
            />
            {announcement.pinned && (
              <Tag
                label="PINNED"
                color="rgba(255, 215, 0, 0.3)"
                className="text-white! px-4! py-1.5! font-semibold!"
                bordered={false}
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 bg-white">
          <Paragraph
            className="text-gray-700! text-base! leading-loose! mb-6! whitespace-pre-wrap"
            style={{ fontFamily: "'Open Sans', sans-serif" }}
          >
            {announcement.content}
          </Paragraph>

          {/* Metadata */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-['Open_Sans'] font-semibold text-gray-700">Published:</span>
                <span className="font-['Open_Sans'] text-gray-600 ml-2">
                  {new Date(announcement.publishedAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </span>
              </div>
              {announcement.visibleUntil && (
                <div>
                  <span className="font-['Open_Sans'] font-semibold text-gray-700">Visible Until:</span>
                  <span className="font-['Open_Sans'] text-gray-600 ml-2">
                    {new Date(announcement.visibleUntil).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Custom confirm modal */}
      <Modal
        open={confirmVisible}
        onClose={handleCancelDelete}
        title={
          <span className="flex items-center gap-2 text-red-600">
            <ExclamationCircleOutlined />
            Delete Announcement
          </span>
        }
        footer={
          <div className="flex justify-end gap-2">
            <SecondaryButton label="Cancel" onClick={handleCancelDelete} />
            <PrimaryButton
              label="Delete"
              onClick={handleConfirmDelete}
              className="bg-red-500! text-white! hover:bg-red-600!"
            />
          </div>
        }
        width={400}
        className="announcement-confirm-modal"
        closeIcon={null}
      >
        <div className="text-gray-700 text-base">
          Are you sure you want to delete this announcement? This action cannot be undone.
        </div>
      </Modal>

      <style>{`
        .announcement-detail-modal .ant-modal-close {
          top: 24px;
          right: 24px;
          color: white;
        }
        
        .announcement-detail-modal .ant-modal-close:hover {
          color: rgba(255, 255, 255, 0.8);
          background-color: transparent;
        }
        
        .announcement-detail-modal .ant-modal-close-x {
          width: 32px;
          height: 32px;
          line-height: 32px;
        }
      `}</style>
    </>
  );
}
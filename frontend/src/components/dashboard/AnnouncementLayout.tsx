import { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { message } from 'antd';
import AnnouncementDetail from '../announcement/AnnouncementDetail';
import AnnouncementForm from '../announcement/AnnouncementForm';
import { Title, Text } from '../common/display/Typography';
import PrimaryButton from '../common/buttons/PrimaryButton';
import { useAnnouncementApi } from '../../api/endpoints/announcement.api';
import type { UserWithRoles } from '../../types/user.types';
import type { Announcement, CreateAnnouncementRequest, UpdateAnnouncementRequest } from '../../types/announcement.types';
import AnnouncementLatestList from '../announcement/AnnouncementLatestList';
import AnnouncementPinnedSlider from '../announcement/AnnouncementPinnedSlider';
import AnnouncementStatistics from '../announcement/AnnouncementStatistics';
import { Link } from 'react-router-dom';

type Props = {
  user: UserWithRoles | null;
};

export default function AnnouncementLayout({ user }: Props) {
  const { getById, create, update, deleteOne, getPinned } = useAnnouncementApi();
  
  // Modal states
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasPinnedAnnouncements, setHasPinnedAnnouncements] = useState(false);

  // Check if user has admin or moderator role
  const isAdminOrModerator = user?.roles?.some(
    (role) => role.name.toLowerCase() === 'admin' || role.name.toLowerCase() === 'moderator'
  ) ?? false;

  // Check for pinned announcements
  useEffect(() => {
    const checkPinnedAnnouncements = async () => {
      try {
        const { data, error } = await getPinned();
        setHasPinnedAnnouncements(!error && data !== null && data.length > 0);
      } catch (err) {
        setHasPinnedAnnouncements(false);
      }
    };

    checkPinnedAnnouncements();
  }, [getPinned, refreshKey]);

  // Handle announcement click
  const handleAnnouncementClick = async (announcement: Announcement) => {
    setDetailVisible(true);
    
    try {
      const { data, error } = await getById(announcement.id);
      
      if (error) {
        console.error('Failed to load announcement:', error);
        message.error('Failed to load announcement details');
        setSelectedAnnouncement(announcement);
      } else {
        setSelectedAnnouncement(data ?? announcement);
      }
    } catch (err) {
      console.error('Error loading announcement:', err);
      message.error('An error occurred while loading the announcement');
      setSelectedAnnouncement(announcement);
    }
  };

  const handleCloseDetail = () => {
    setDetailVisible(false);
    setSelectedAnnouncement(null);
  };

  // Open form for creating new announcement
  const handleOpenCreateForm = () => {
    setFormMode('create');
    setEditingAnnouncement(null);
    setFormVisible(true);
  };

  // Open form for editing announcement
  const handleOpenEditForm = (announcement: Announcement) => {
    setFormMode('edit');
    setEditingAnnouncement(announcement);
    setFormVisible(true);
    setDetailVisible(false); // Close detail modal
  };

  // Handle delete announcement
  const handleDeleteAnnouncement = async (announcementId: number) => {
    try {
      const { error } = await deleteOne(announcementId);
      if (error) {
        message.error(error);
        return;
      }
      
      message.success('Announcement deleted successfully!');
      setDetailVisible(false);
      setSelectedAnnouncement(null);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Error deleting announcement:', err);
      message.error('An error occurred while deleting the announcement');
    }
  };

  const handleFormSubmit = async (values: CreateAnnouncementRequest | UpdateAnnouncementRequest) => {
    try {
      if (formMode === 'create') {
        const { data, error } = await create(values as CreateAnnouncementRequest);
        
        if (error) {
          message.error(error);
          throw new Error(error);
        }
        
        if (data) {
          message.success('Announcement created successfully!');
          setFormVisible(false);
          setRefreshKey(prev => prev + 1);
        }
      } else {
        // Edit mode
        if (!editingAnnouncement) return;
        
        const { data, error } = await update(editingAnnouncement.id, values as UpdateAnnouncementRequest);
        
        if (error) {
          message.error(error);
          throw new Error(error);
        }
        
        if (data) {
          message.success('Announcement updated successfully!');
          setFormVisible(false);
          setEditingAnnouncement(null);
          setRefreshKey(prev => prev + 1);
        }
      }
    } catch (err) {
      console.error('Error submitting announcement:', err);
      throw err;
    }
  };

  return (
    <>
      {/* Hero Section - Only for admin/moderator */}
      {isAdminOrModerator && (
        <div className="mb-8 bg-linear-to-r from-[#189ad6] to-[#2f398f] rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <Title level={2} className="text-white! mb-2! font-['Montserrat']!">
                Announcements
              </Title>
              <Text className="text-white/90! text-base! font-['Open_Sans']">
                Stay updated with the latest news and information
              </Text>
            </div>
            <PrimaryButton
              label="New Announcement"
              icon={<PlusOutlined />}
              onClick={handleOpenCreateForm}
              className="bg-white! text-[#2f398f]! hover:bg-white/90! shadow-md!"
            />
          </div>
        </div>
      )}

      {/* Statistics Section - Only for admin/moderator */}
      {isAdminOrModerator && (
        <section className="mb-12">
          <AnnouncementStatistics refreshKey={refreshKey} />
        </section>
      )}

      {/* Pinned Announcements Grid */}
      {hasPinnedAnnouncements && (
        <section className="mb-12">
          <div className="mb-6">
            <Title level={3} className="mb-1! font-['Montserrat']! text-[#2f398f]!">
              Important Announcements
            </Title>
            <Text className="text-gray-500 font-['Open_Sans']">
              Important announcements you shouldn't miss
            </Text>
          </div>
          <AnnouncementPinnedSlider 
            autoPlayInterval={5000}
            onSelect={handleAnnouncementClick}
            refreshKey={refreshKey}
          />
        </section>
      )}

      {/* Latest Announcements Grid */}
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Title level={3} className="mb-1! font-['Montserrat']! text-[#2f398f]!">
              Latest Updates
            </Title>
            <Text className="text-gray-500 font-['Open_Sans']">
              Browse through recent announcements and updates
            </Text>
          </div>
          <Link 
            to="/announcements" 
            className={`font-['Open_Sans'] font-semibold transition-colors ${
              isAdminOrModerator 
                ? 'text-[#2f398f] hover:text-[#189ad6]' 
                : 'text-[#189ad6] hover:text-[#2f398f]'
            }`}
          >
            View all →
          </Link>
        </div>
        <AnnouncementLatestList 
          key={refreshKey} 
          slidesOnly 
          limit={6} 
          onSelect={handleAnnouncementClick} 
        />
      </section>

      {/* Announcement Detail Modal */}
      <AnnouncementDetail
        announcement={selectedAnnouncement}
        visible={detailVisible}
        onClose={handleCloseDetail}
        onEdit={isAdminOrModerator ? handleOpenEditForm : undefined}
        onDelete={isAdminOrModerator ? handleDeleteAnnouncement : undefined}
        showActions={isAdminOrModerator}
      />

      {/* Announcement Form Modal - Only for admin/moderator */}
      {isAdminOrModerator && (
        <AnnouncementForm
          visible={formVisible}
          onClose={() => {
            setFormVisible(false);
            setEditingAnnouncement(null);
          }}
          onSubmit={handleFormSubmit}
          announcement={editingAnnouncement}
          mode={formMode}
        />
      )}
    </>
  );
}
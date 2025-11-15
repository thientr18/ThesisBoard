import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { message, Spin } from 'antd';
import { Title, Text } from '../components/common/display/Typography';
import PrimaryButton from '../components/common/buttons/PrimaryButton';
import AnnouncementCard from '../components/announcement/AnnouncementCard';
import AnnouncementDetail from '../components/announcement/AnnouncementDetail';
import AnnouncementForm from '../components/announcement/AnnouncementForm';
import AnnouncementFilterBar from '../components/announcement/AnnouncementFilterBar';
import { useAnnouncementApi } from '../api/endpoints/announcement.api';
import { useUserApi } from '../api/endpoints/user.api';
import type { Announcement, CreateAnnouncementRequest, UpdateAnnouncementRequest } from '../types/announcement.types';
import { useAuth0 } from '@auth0/auth0-react';
import type { UserWithRoles } from '../types/user.types';
import Navbar from '../components/common/navigation/Navbar';

export default function Announcements() {
  const { logout, isAuthenticated, isLoading: authLoading, getAccessTokenSilently } = useAuth0();
  const { getMe } = useUserApi();

  const [user, setUser] = useState<UserWithRoles | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const { getAll, getById, create, update, deleteOne } = useAnnouncementApi();

  // State
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);

  // Check permissions
  const isAdminOrModerator = user?.roles?.some(
    (role: { name: string }) => role.name.toLowerCase() === 'admin' || role.name.toLowerCase() === 'moderator'
  ) ?? false;

  const loadUser = useCallback(async () => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!isAuthenticated) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await getAccessTokenSilently();
      const { data, error } = await getMe();
      if (error) {
        setError(error);
        setUser(null);
      } else {
        setUser(data as UserWithRoles ?? null);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, getAccessTokenSilently, getMe]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Load announcements
  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getAll();
      if (error) {
        message.error(error);
        setAnnouncements([]);
      } else {
        setAnnouncements(data || []);
      }
    } catch (err) {
      console.error('Error loading announcements:', err);
      message.error('Failed to load announcements');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, [getAll]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  // Filter announcements based on search params
  useEffect(() => {
    const keyword = searchParams.get('keyword')?.toLowerCase() || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const pinnedFilter = searchParams.get('pinned');

    let filtered = [...announcements];

    // Keyword search
    if (keyword) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(keyword) ||
          a.content.toLowerCase().includes(keyword)
      );
    }

    // Date range filter
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((a) => new Date(a.createdAt) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((a) => new Date(a.createdAt) <= end);
    }

    // Pinned filter
    if (pinnedFilter === 'true') {
      filtered = filtered.filter((a) => a.pinned);
    } else if (pinnedFilter === 'false') {
      filtered = filtered.filter((a) => !a.pinned);
    }

    // Sort: pinned first, then by date
    filtered.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredAnnouncements(filtered);
    setCurrentPage(1);
  }, [announcements, searchParams]);

  // Handle filter changes
  const handleFilterChange = (filters: {
    keyword?: string;
    startDate?: string;
    endDate?: string;
    pinned?: string;
  }) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    setSearchParams(newParams);
  };

  // Handle announcement click to view details
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
      loadAnnouncements();
    } catch (err) {
      console.error('Error deleting announcement:', err);
      message.error('An error occurred while deleting the announcement');
    }
  };

  const handleCreateAnnouncement = async (values: CreateAnnouncementRequest) => {
    try {
      const { data, error } = await create(values);
      
      if (error) {
        message.error(error);
        throw new Error(error);
      }
      
      if (data) {
        setFormVisible(false);
        loadAnnouncements();
      }
    } catch (err) {
      console.error('Error creating announcement:', err);
      throw err;
    }
  };

  const handleUpdateAnnouncement = async (values: UpdateAnnouncementRequest) => {
    if (!editingAnnouncement) return;
    
    try {
      const { data, error } = await update(editingAnnouncement.id, values);
      
      if (error) {
        message.error(error);
        throw new Error(error);
      }
      
      if (data) {
        setFormVisible(false);
        setEditingAnnouncement(null);
        loadAnnouncements();
      }
    } catch (err) {
      console.error('Error updating announcement:', err);
      throw err;
    }
  };

  const handleFormSubmit = async (values: CreateAnnouncementRequest | UpdateAnnouncementRequest) => {
    if (formMode === 'create') {
      await handleCreateAnnouncement(values as CreateAnnouncementRequest);
    } else {
      await handleUpdateAnnouncement(values as UpdateAnnouncementRequest);
    }
  };

  // Pagination
  const totalItems = filteredAnnouncements.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentAnnouncements = filteredAnnouncements.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar
          userName={user?.fullName}
          onLogout={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        />
        <div className="flex-grow flex flex-col justify-center items-center px-4">
          <Title level={2} className="text-red-600! mb-4! font-['Montserrat']!">
            Error
          </Title>
          <Text className="text-gray-700 font-['Open_Sans'] text-center">
            {error}
          </Text>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar
        userName={user?.fullName}
        onLogout={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 bg-linear-to-r from-[#189ad6] to-[#2f398f] rounded-2xl p-8 text-white shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <Title level={1} className="text-white! mb-2! font-['Montserrat']!">
                  All Announcements
                </Title>
                <Text className="text-white/90! text-base! font-['Open_Sans']">
                  Browse and search through all announcements
                </Text>
              </div>
              {isAdminOrModerator && (
                <PrimaryButton
                  label="New Announcement"
                  icon={<PlusOutlined />}
                  onClick={handleOpenCreateForm}
                  className="bg-white! text-[#2f398f]! hover:bg-white/90! shadow-md!"
                />
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mb-6">
            <AnnouncementFilterBar
              onFilterChange={handleFilterChange}
              initialFilters={{
                keyword: searchParams.get('keyword') || '',
                startDate: searchParams.get('startDate') || '',
                endDate: searchParams.get('endDate') || '',
                pinned: searchParams.get('pinned') || '',
              }}
            />
          </div>

          {/* Results Summary */}
          <div className="mb-4 flex items-center justify-between">
            <Text className="text-gray-600 font-['Open_Sans'] text-sm">
              Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} announcements
            </Text>
          </div>

          {/* Announcements List */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : currentAnnouncements.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📢</div>
              <Title level={3} className="text-gray-400! mb-2! font-['Montserrat']!">
                No Announcements Found
              </Title>
              <Text className="text-gray-500 font-['Open_Sans']">
                {searchParams.toString() 
                  ? 'Try adjusting your filters or search terms'
                  : 'No announcements have been posted yet'}
              </Text>
            </div>
          ) : (
            <>
              {/* Compact List View */}
              <div className="space-y-3 mb-8">
                {currentAnnouncements.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    onClick={handleAnnouncementClick}
                    onEdit={isAdminOrModerator ? handleOpenEditForm : undefined}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              currentPage === page
                                ? 'bg-[#189ad6] text-white'
                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="px-2 py-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* Modals */}
          <AnnouncementDetail
            announcement={selectedAnnouncement}
            visible={detailVisible}
            onClose={handleCloseDetail}
            onEdit={isAdminOrModerator ? handleOpenEditForm : undefined}
            onDelete={isAdminOrModerator ? handleDeleteAnnouncement : undefined}
            showActions={isAdminOrModerator}
          />

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
        </div>
      </div>
    </>
  );
}
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { message, Spin } from "antd";
import { Title, Text } from "../../../components/common/display/Typography";
import PrimaryButton from "../../../components/common/buttons/PrimaryButton";
import { PlusOutlined } from "@ant-design/icons";
import Sidebar from "../../../components/common/navigation/Sidebar";
import Navbar from "../../../components/common/navigation/Navbar";
import { LayoutProvider, useLayoutContext, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../../../contexts/LayoutContext";
import Alert from "antd/es/alert/Alert";
import { useUserApi } from "../../../api/endpoints/user.api";
import type { UserWithRoles } from "../../../types/user.types";

// Placeholder imports (implement these components separately)
import AdministratorCard from "./AdministratorCard";
import AdministratorDetail from "./AdministratorDetail";
import AdministratorForm from "./AdministratorForm";
import AdministratorFilterBar from "./AdministratorFilterBar";

function AdministratorManagementContent({
  user,
  error,
  loading,
  currentAdministrators,
  selectedAdministrator,
  detailVisible,
  formVisible,
  formMode,
  editingAdministrator,
  isAdminOrModerator,
  searchParams,
  handleOpenCreateForm,
  handleAdministratorClick,
  handleCloseDetail,
  handleFormSubmit,
  handleFilterChange,
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  handlePageChange,
  setFormVisible,
  setEditingAdministrator,
  handleOpenEditForm,
  handleDeleteAdministrator,
}: any) {
  const { collapsed } = useLayoutContext();
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <>
      <Sidebar user={user} />
      <div
        className="flex-1 flex flex-col"
        style={{
          marginLeft: sidebarWidth,
          transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
          minHeight: "100vh",
        }}
      >
        <Navbar user={user} pageName="Administrator Management" />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Error State */}
            {error ? (
              <Alert type="error" message="Failed to load adminstrators" description={error} showIcon />
            ) : (
              <>
                {/* Header */}
                <div className="mb-8 bg-linear-to-r from-[#189ad6] to-[#2f398f] rounded-2xl p-8 text-white shadow-lg">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <Title level={1} className="text-white! mb-2! font-['Montserrat']!">
                        All Administrators
                      </Title>
                      <Text className="text-white/90! text-base! font-['Open_Sans']">
                        Browse and search through all adminstrators
                      </Text>
                    </div>
                    {isAdminOrModerator && (
                      <PrimaryButton
                        label="New Administrator"
                        icon={<PlusOutlined />}
                        onClick={handleOpenCreateForm}
                        className="bg-white! text-[#2f398f]! hover:bg-white/90! shadow-md!"
                      />
                    )}
                  </div>
                </div>

                {/* Filter Bar */}
                <div className="mb-6">
                  <AdministratorFilterBar
                    search={searchParams.get("keyword") || ""}
                    onSearchChange={val => handleFilterChange({ keyword: val })}
                    onStatusChange={val => handleFilterChange({ status: val })}
                  />
                </div>

                {/* Results Summary */}
                <div className="mb-4 flex items-center justify-between">
                  <Text className="text-gray-600 font-['Open_Sans'] text-sm">
                    Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} administrators
                  </Text>
                </div>

                {/* Administrators List */}
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <Spin size="large" />
                  </div>
                ) : currentAdministrators.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">🎓</div>
                    <Title level={3} className="text-gray-400! mb-2! font-['Montserrat']!">
                      No Administrators Found
                    </Title>
                    <Text className="text-gray-500 font-['Open_Sans']">
                      {searchParams.toString()
                        ? "Try adjusting your filters or search terms"
                        : "No adminstrators have been added yet"}
                    </Text>
                  </div>
                  ) : (
                    <>
                      <div className="space-y-3 mb-8">
                        {currentAdministrators.map((administrator: UserWithRoles) => (
                          <AdministratorCard
                            key={administrator.id}
                            administrator={administrator}
                            onClick={handleAdministratorClick}
                            canManage={isAdminOrModerator}
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
                                      ? "bg-[#189ad6] text-white"
                                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            } else if (page === currentPage - 2 || page === currentPage + 2) {
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
                <AdministratorDetail
                  open={detailVisible}
                  administrator={selectedAdministrator}
                  onClose={handleCloseDetail}
                  onEdit={handleOpenEditForm}
                  onDelete={handleDeleteAdministrator}
                  canManage={isAdminOrModerator}
                />

                {isAdminOrModerator && (
                  <AdministratorForm
                    open={formVisible}
                    loading={loading}
                    mode={formMode}
                    initialData={editingAdministrator}
                    onSubmit={handleFormSubmit}
                    onCancel={() => {
                      setFormVisible(false);
                      setEditingAdministrator(null);
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdministratorManagement() {
  const { getMe, getAdministratorById, getAllAdministrators, createAdministrator, updateAdministrator, deleteAdministrator } = useUserApi();

  const [user, setUser] = useState<UserWithRoles | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [administrators, setAdministrators] = useState<UserWithRoles[]>([]);
  const [filteredAdministrators, setFilteredAdministrators] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdministrator, setSelectedAdministrator] = useState<UserWithRoles | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingAdministrator, setEditingAdministrator] = useState<UserWithRoles | null>(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);

  // Check permissions
  const isAdminOrModerator =
    user?.roles?.some(
      (role: { name: string }) =>
        role.name.toLowerCase() === "admin" || role.name.toLowerCase() === "moderator"
    ) ?? false;

  // Load user
  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
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
  }, [getMe]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Load adminstrators
  const loadAdministrators = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getAllAdministrators();
      if (error) {
        message.error(error);
        setAdministrators([]);
      } else {
        setAdministrators((data as unknown as UserWithRoles[]) || []);
      }
    } catch (err) {
      console.error("Error loading adminstrators:", err);
      message.error("Failed to load adminstrators");
      setAdministrators([]);
    } finally {
      setLoading(false);
    }
  }, [getAllAdministrators]);

  useEffect(() => {
    loadAdministrators();
  }, [loadAdministrators]);

  useEffect(() => {
  const keyword = searchParams.get("keyword")?.toLowerCase() || "";
  const administratorCode = searchParams.get("administratorCode")?.toLowerCase() || "";
  const status = searchParams.get("status")?.toLowerCase() || "";

  let filtered = [...administrators];

  if (keyword) {
    filtered = filtered.filter(
      admin =>
        admin.fullName?.toLowerCase().includes(keyword) ||
        admin.email?.toLowerCase().includes(keyword)
    );
  }
  if (administratorCode) {
    filtered = filtered.filter(
      admin => admin.email?.toLowerCase().includes(administratorCode)
    );
  }
  if (status) {
    filtered = filtered.filter(
      admin => admin.status?.toLowerCase() === status
    );
  }

  setFilteredAdministrators(filtered);
  setCurrentPage(1);
}, [administrators, searchParams]);

  // Handle filter changes
  const handleFilterChange = (filters: {
    keyword?: string;
    administratorCode?: string;
    status?: string;
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

  // Handle administrator click to view details
  const handleAdministratorClick = async (administrator: UserWithRoles) => {
    setDetailVisible(true);
    try {
      const { data, error } = await getAdministratorById(administrator.id);
      if (error) {
        message.error("Failed to load administrator details");
        setSelectedAdministrator(administrator);
      } else {
        setSelectedAdministrator(data ?? administrator);
      }
    } catch (err) {
      message.error("An error occurred while loading the administrator");
      setSelectedAdministrator(administrator);
    }
  };

  const handleCloseDetail = () => {
    setDetailVisible(false);
    setSelectedAdministrator(null);
  };

  // Open form for creating new administrator
  const handleOpenCreateForm = () => {
    setFormMode("create");
    setEditingAdministrator(null);
    setFormVisible(true);
  };

  // Open form for editing administrator
  const handleOpenEditForm = (administrator: UserWithRoles) => {
    setFormMode("edit");
    setEditingAdministrator(administrator);
    setFormVisible(true);
    setDetailVisible(false);
  };

  const handleDeleteAdministrator = async (adminstratorId: number) => {
    try {
      const { error } = await deleteAdministrator(adminstratorId);
      if (error) {
        message.error(error);
        return;
      }
      message.success("Administrator deleted successfully!");
      setDetailVisible(false);
      setSelectedAdministrator(null);
      loadAdministrators();
    } catch (err) {
      message.error("An error occurred while deleting the administrator");
    }
  };

  const handleCreateAdministrator = async (values: Partial<UserWithRoles>) => {
    try {
      const { data, error } = await createAdministrator(values as any);
      if (error) {
        message.error(error);
        throw new Error(error);
      }
      if (data) {
        setFormVisible(false);
        loadAdministrators();
      }
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateAdministrator = async (values: Partial<UserWithRoles>) => {
    if (!editingAdministrator) return;
    try {
      const { data, error } = await updateAdministrator(editingAdministrator.id, values as any);
      if (error) {
        message.error(error);
        throw new Error(error);
      }
      if (data) {
        setFormVisible(false);
        setEditingAdministrator(null);
        loadAdministrators();
      }
    } catch (err) {
      throw err;
    }
  };

  const handleFormSubmit = async (values: Partial<UserWithRoles>) => {
    if (formMode === "create") {
        await handleCreateAdministrator(values);
    } else {
        await handleUpdateAdministrator(values);
        setFormVisible(false);
        setEditingAdministrator(null);
        await loadAdministrators();
    }
  };

  // Pagination
  const totalItems = filteredAdministrators.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentAdministrators = filteredAdministrators.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <LayoutProvider>
      <AdministratorManagementContent
        user={user}
        error={error}
        loading={loading}
        administrators={administrators}
        filteredAdministrators={filteredAdministrators}
        currentAdministrators={currentAdministrators}
        selectedAdministrator={selectedAdministrator}
        detailVisible={detailVisible}
        formVisible={formVisible}
        formMode={formMode}
        editingAdministrator={editingAdministrator}
        isAdminOrModerator={isAdminOrModerator}
        searchParams={searchParams}
        handleOpenCreateForm={handleOpenCreateForm}
        handleOpenEditForm={handleOpenEditForm}
        handleAdministratorClick={handleAdministratorClick}
        handleCloseDetail={handleCloseDetail}
        handleDeleteAdministrator={handleDeleteAdministrator}
        handleFormSubmit={handleFormSubmit}
        handleFilterChange={handleFilterChange}
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={totalItems}
        handlePageChange={handlePageChange}
        setFormVisible={setFormVisible}
        setEditingAdministrator={setEditingAdministrator}
      />
    </LayoutProvider>
  );
}
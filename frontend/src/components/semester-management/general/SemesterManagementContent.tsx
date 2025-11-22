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
import { useSemesterApi } from "../../../api/endpoints/semester.api";
import { useUserApi } from "../../../api/endpoints/user.api";
import type { Semester } from "../../../types/semester.types";

// Placeholder imports (implement these components separately)
import SemesterCard from "./SemesterCard";
import SemesterDetail from "./SemesterDetail";
import SemesterForm from "./SemesterForm";
import SemesterFilterBar from "./SemesterFilterBar";
import type { UserWithRoles } from "../../../types/user.types";

function SemesterManagementContent({
  user,
  error,
  loading,
  currentSemesters,
  selectedSemester,
  detailVisible,
  formVisible,
  formMode,
  editingSemester,
  isAdminOrModerator,
  searchParams,
  handleOpenCreateForm,
  handleSemesterClick,
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
  setEditingSemester,
  handleOpenEditForm,
  handleDeleteSemester,
  loadingForm,
}: any) {
  const { collapsed } = useLayoutContext();
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  const onStatusChange = useCallback(
    (val: string | null) => handleFilterChange({ status: val ?? "" }),
    [handleFilterChange]
  );

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
        <Navbar user={user} pageName="Semester Management" />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Error State */}
            {error ? (
              <Alert type="error" message="Failed to load semesters" description={error} showIcon />
            ) : (
              <>
                {/* Header */}
                <div className="mb-8 bg-linear-to-r from-[#189ad6] to-[#2f398f] rounded-2xl p-8 text-white shadow-lg">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <Title level={1} className="text-white! mb-2! font-['Montserrat']!">
                        All Semesters
                      </Title>
                      <Text className="text-white/90! text-base! font-['Open_Sans']">
                        Browse and manage all semesters
                      </Text>
                    </div>
                    {isAdminOrModerator && (
                      <PrimaryButton
                        label="New Semester"
                        icon={<PlusOutlined />}
                        onClick={handleOpenCreateForm}
                        className="bg-white! text-[#2f398f]! hover:bg-white/90! shadow-md!"
                      />
                    )}
                  </div>
                </div>

                {/* Filter Bar */}
                <div className="mb-6">
                  <SemesterFilterBar
                    status={searchParams.get("status") || ""}
                    onStatusChange={onStatusChange}
                  />
                </div>

                {/* Results Summary */}
                <div className="mb-4 flex items-center justify-between">
                  <Text className="text-gray-600 font-['Open_Sans'] text-sm">
                    Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} semesters
                  </Text>
                </div>

                {/* Semesters List */}
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <Spin size="large" />
                  </div>
                ) : currentSemesters.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">📅</div>
                    <Title level={3} className="text-gray-400! mb-2! font-['Montserrat']!">
                      No Semesters Found
                    </Title>
                    <Text className="text-gray-500 font-['Open_Sans']">
                      {searchParams.toString()
                        ? "Try adjusting your filters or search terms"
                        : "No semesters have been added yet"}
                    </Text>
                  </div>
                  ) : (
                    <>
                      <div className="space-y-3 mb-8">
                        {currentSemesters.map((semester: Semester) => (
                          <SemesterCard
                            key={semester.id}
                            semester={semester}
                            onClick={handleSemesterClick}
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
                <SemesterDetail
                  open={detailVisible}
                  semester={selectedSemester}
                  onClose={handleCloseDetail}
                  onEdit={handleOpenEditForm}
                  onDelete={handleDeleteSemester}
                  canManage={isAdminOrModerator}
                />

                {isAdminOrModerator && (
                  <SemesterForm
                    open={formVisible}
                    loading={loadingForm}
                    mode={formMode}
                    initialData={editingSemester}
                    onSubmit={handleFormSubmit}
                    onCancel={() => {
                      setFormVisible(false);
                      setEditingSemester(null);
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

export default function SemesterManagement() {
  const {
    getAll: getAllSemesters,
    getById: getSemesterById,
    create: createSemester,
    update: updateSemester,
    delete: deleteSemester,
  } = useSemesterApi();
  const { getMe } = useUserApi();

  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [filteredSemesters, setFilteredSemesters] = useState<Semester[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingSemesters, setLoadingSemesters] = useState(true);
  const [loadingForm, setLoadingForm] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);

  // Check permissions
  const isAdminOrModerator = Array.isArray(user?.roles) && user.roles.some((role: any) => role.name === "admin" || role.name === "moderator");

  // Load user
  const loadUser = useCallback(async () => {
    setLoadingUser(true);
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
      setLoadingUser(false);
    }
  }, [getMe]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);
  
  // Load semesters
  const loadSemesters = useCallback(async () => {
    setLoadingSemesters(true);
    try {
      const { data, error } = await getAllSemesters();
      if (error) {
        setError(error);
        setSemesters([]);
      } else {
        setSemesters(data ?? []);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSemesters([]);
    } finally {
      setLoadingSemesters(false);
    }
  }, [getAllSemesters]);

  useEffect(() => {
    loadSemesters();
  }, [loadSemesters]);

  // Filtering
  useEffect(() => {
    const keyword = searchParams.get("keyword")?.toLowerCase() || "";
    const semesterCode = searchParams.get("semesterCode")?.toLowerCase() || "";
    const status = searchParams.get("status")?.toLowerCase() || "";

    let filtered = [...semesters];

    if (keyword) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(keyword)
      );
    }
    if (semesterCode) {
      filtered = filtered.filter(s =>
        s.code.toLowerCase().includes(semesterCode)
      );
    }
    if (status) {
      if (status === "active") {
        filtered = filtered.filter(s => s.isActive);
      } else if (status === "inactive") {
        filtered = filtered.filter(s => !s.isActive);
      }
    }

    setFilteredSemesters(filtered);
    setCurrentPage(1);
  }, [semesters, searchParams]);

  // Handle filter changes
  const handleFilterChange = useCallback((filters: {
    keyword?: string;
    semesterCode?: string;
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
  }, [searchParams, setSearchParams]);

  // Handle semester click to view details
  const handleSemesterClick = useCallback(async (semester: Semester) => {
    setDetailVisible(true);
    try {
      const { data, error } = await getSemesterById(semester.id);
      if (error) {
        message.error("Failed to load semester details");
        setSelectedSemester(semester);
      } else {
        setSelectedSemester(data ?? semester);
      }
    } catch (err) {
      message.error("Failed to load semester details");
      setSelectedSemester(semester);
    }
  }, [getSemesterById]);

  const handleCloseDetail = useCallback(() => {
    setDetailVisible(false);
    setSelectedSemester(null);
  }, []);

  const handleOpenCreateForm = useCallback(() => {
    setFormMode("create");
    setEditingSemester(null);
    setFormVisible(true);
  }, []);

  const handleOpenEditForm = useCallback((semester: Semester) => {
    setFormMode("edit");
    setEditingSemester(semester);
    setFormVisible(true);
    setDetailVisible(false);
  }, []);

  const handleDeleteSemester = useCallback(async (semesterId: number) => {
    setLoadingForm(true);
    try {
      const { error } = await deleteSemester(semesterId);
      if (error) {
        message.error("Failed to delete semester");
      } else {
        message.success("Semester deleted");
        loadSemesters();
        setDetailVisible(false);
      }
    } catch (err) {
      message.error("Failed to delete semester");
    } finally {
      setLoadingForm(false);
    }
  }, [deleteSemester, loadSemesters]);

  const handleCreateSemester = async (values: Semester) => {
    setLoadingForm(true);
    try {
      const { error } = await createSemester(values);
      if (error) {
        message.error("Failed to create semester");
      } else {
        message.success("Semester created");
        loadSemesters();
        setFormVisible(false);
      }
    } catch (err) {
      message.error("Failed to create semester");
    } finally {
      setLoadingForm(false);
    }
  };

  const handleUpdateSemester = async (values: Semester) => {
    if (!editingSemester) return;
    setLoadingForm(true);
    try {
      const { error } = await updateSemester(editingSemester.id, values);
      if (error) {
        message.error("Failed to update semester");
      } else {
        message.success("Semester updated");
        loadSemesters();
        setFormVisible(false);
      }
    } catch (err) {
      message.error("Failed to update semester");
    } finally {
      setLoadingForm(false);
    }
  };

  const handleFormSubmit = useCallback(async (values: Semester) => {
    if (formMode === "create") {
      await handleCreateSemester(values);
    } else {
      await handleUpdateSemester(values);
    }
  }, [formMode, handleCreateSemester, handleUpdateSemester]);

  // Pagination
  const totalItems = filteredSemesters.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentSemesters = filteredSemesters.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageLoading = loadingUser || loadingSemesters;

  return (
    <LayoutProvider>
      <SemesterManagementContent
        user={user}
        error={error}
        loading={pageLoading}
        semesters={semesters}
        filteredSemesters={filteredSemesters}
        currentSemesters={currentSemesters}
        selectedSemester={selectedSemester}
        detailVisible={detailVisible}
        formVisible={formVisible}
        formMode={formMode}
        editingSemester={editingSemester}
        isAdminOrModerator={isAdminOrModerator}
        searchParams={searchParams}
        handleOpenCreateForm={handleOpenCreateForm}
        handleOpenEditForm={handleOpenEditForm}
        handleSemesterClick={handleSemesterClick}
        handleCloseDetail={handleCloseDetail}
        handleDeleteSemester={handleDeleteSemester}
        handleFormSubmit={handleFormSubmit}
        handleFilterChange={handleFilterChange}
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={totalItems}
        handlePageChange={handlePageChange}
        setFormVisible={setFormVisible}
        setEditingSemester={setEditingSemester}
        loadingForm={loadingForm}
      />
    </LayoutProvider>
  );
}
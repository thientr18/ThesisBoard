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
import type { Teacher, UserWithRoles } from "../../../types/user.types";

// Placeholder imports (implement these components separately)
import TeacherCard from "./TeacherCard";
import TeacherDetail from "./TeacherDetail";
import TeacherForm from "./TeacherForm";
import TeacherFilterBar from "./TeacherFilterBar";

function TeacherManagementContent({
  user,
  error,
  loading,
  currentTeachers,
  selectedTeacher,
  detailVisible,
  formVisible,
  formMode,
  editingTeacher,
  isAdminOrModerator,
  searchParams,
  handleOpenCreateForm,
  handleTeacherClick,
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
  setEditingTeacher,
  handleOpenEditForm,
  handleDeleteTeacher,
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
        <Navbar user={user} pageName="Teacher Management" />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Error State */}
            {error ? (
              <Alert type="error" message="Failed to load teachers" description={error} showIcon />
            ) : (
              <>
                {/* Header */}
                <div className="mb-8 bg-linear-to-r from-[#189ad6] to-[#2f398f] rounded-2xl p-8 text-white shadow-lg">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <Title level={1} className="text-white! mb-2! font-['Montserrat']!">
                        All Teachers
                      </Title>
                      <Text className="text-white/90! text-base! font-['Open_Sans']">
                        Browse and search through all teachers
                      </Text>
                    </div>
                    {isAdminOrModerator && (
                      <PrimaryButton
                        label="New Teacher"
                        icon={<PlusOutlined />}
                        onClick={handleOpenCreateForm}
                        className="bg-white! text-[#2f398f]! hover:bg-white/90! shadow-md!"
                      />
                    )}
                  </div>
                </div>

                {/* Filter Bar */}
                <div className="mb-6">
                  <TeacherFilterBar
                    search={searchParams.get("keyword") || ""}
                    onSearchChange={val => handleFilterChange({ keyword: val })}
                    status={searchParams.get("status") || ""}
                    onStatusChange={val => handleFilterChange({ status: val })}
                  />
                </div>

                {/* Results Summary */}
                <div className="mb-4 flex items-center justify-between">
                  <Text className="text-gray-600 font-['Open_Sans'] text-sm">
                    Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} teachers
                  </Text>
                </div>

                {/* Teachers List */}
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <Spin size="large" />
                  </div>
                ) : currentTeachers.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">🎓</div>
                    <Title level={3} className="text-gray-400! mb-2! font-['Montserrat']!">
                      No Teachers Found
                    </Title>
                    <Text className="text-gray-500 font-['Open_Sans']">
                      {searchParams.toString()
                        ? "Try adjusting your filters or search terms"
                        : "No teachers have been added yet"}
                    </Text>
                  </div>
                  ) : (
                    <>
                      <div className="space-y-3 mb-8">
                        {currentTeachers.map((teacher: Teacher) => (
                          <TeacherCard
                            key={teacher.id}
                            teacher={teacher}
                            onClick={handleTeacherClick}
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
                <TeacherDetail
                  open={detailVisible}
                  teacher={selectedTeacher}
                  onClose={handleCloseDetail}
                  onEdit={handleOpenEditForm}
                  onDelete={handleDeleteTeacher}
                  canManage={isAdminOrModerator}
                />

                {isAdminOrModerator && (
                  <TeacherForm
                    open={formVisible}
                    loading={loading}
                    mode={formMode}
                    initialData={editingTeacher}
                    onSubmit={handleFormSubmit}
                    onCancel={() => {
                      setFormVisible(false);
                      setEditingTeacher(null);
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

export default function TeacherManagement() {
  const { getMe, getTeacherById, getAllTeachers, createTeacher, updateTeacher, deleteTeacher } = useUserApi();

  const [user, setUser] = useState<UserWithRoles | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
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

  // Load teachers
  const loadTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getAllTeachers();
      if (error) {
        message.error(error);
        setTeachers([]);
      } else {
        setTeachers((data as unknown as Teacher[]) || []);
      }
    } catch (err) {
      console.error("Error loading teachers:", err);
      message.error("Failed to load teachers");
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, [getAllTeachers]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  // Filter teachers based on search params
  useEffect(() => {
    const keyword = searchParams.get("keyword")?.toLowerCase() || "";
    const teacherId = searchParams.get("teacherId")?.toLowerCase() || "";

    let filtered = [...teachers];

    // Keyword search
    if (keyword) {
      filtered = filtered.filter(
        (s) =>
          s.fullName?.toLowerCase().includes(keyword) ||
          s.teacherCode?.toLowerCase().includes(keyword)
      );
    }

    // Teacher ID filter
    if (teacherId) {
      filtered = filtered.filter((s) => s.teacherCode?.toLowerCase().includes(teacherId));
    }

    // Sort by cohortYear desc, then name
    filtered.sort((a, b) => {
      return (a.teacherCode ?? "").localeCompare(b.teacherCode ?? "");
    });

    setFilteredTeachers(filtered);
    setCurrentPage(1);
  }, [teachers, searchParams]);

  // Handle filter changes
  const handleFilterChange = (filters: {
    keyword?: string;
    teacherCode?: string;
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

  // Handle teacher click to view details
  const handleTeacherClick = async (teacher: Teacher) => {
    setDetailVisible(true);
    try {
      const { data, error } = await getTeacherById(teacher.id);
      if (error) {
        message.error("Failed to load teacher details");
        setSelectedTeacher(teacher);
      } else {
        setSelectedTeacher(data ?? teacher);
      }
    } catch (err) {
      message.error("An error occurred while loading the teacher");
      setSelectedTeacher(teacher);
    }
  };

  const handleCloseDetail = () => {
    setDetailVisible(false);
    setSelectedTeacher(null);
  };

  // Open form for creating new teacher
  const handleOpenCreateForm = () => {
    setFormMode("create");
    setEditingTeacher(null);
    setFormVisible(true);
  };

  // Open form for editing teacher
  const handleOpenEditForm = (teacher: Teacher) => {
    setFormMode("edit");
    setEditingTeacher(teacher);
    setFormVisible(true);
    setDetailVisible(false);
  };

  const handleDeleteTeacher = async (teacherId: number) => {
    try {
      const { error } = await deleteTeacher(teacherId);
      if (error) {
        message.error(error);
        return;
      }
      message.success("Teacher deleted successfully!");
      setDetailVisible(false);
      setSelectedTeacher(null);
      loadTeachers();
    } catch (err) {
      message.error("An error occurred while deleting the teacher");
    }
  };

  const handleCreateTeacher = async (values: Partial<Teacher>) => {
    try {
      const { data, error } = await createTeacher(values as any);
      if (error) {
        message.error(error);
        throw new Error(error);
      }
      if (data) {
        setFormVisible(false);
        loadTeachers();
      }
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateTeacher = async (values: Partial<Teacher>) => {
    if (!editingTeacher) return;
    try {
      const { data, error } = await updateTeacher(editingTeacher.id, values as any);
      if (error) {
        message.error(error);
        throw new Error(error);
      }
      if (data) {
        setFormVisible(false);
        setEditingTeacher(null);
        loadTeachers();
      }
    } catch (err) {
      throw err;
    }
  };

  const handleFormSubmit = async (values: Partial<Teacher>) => {
    if (formMode === "create") {
        await handleCreateTeacher(values);
    } else {
        await handleUpdateTeacher(values);
        setFormVisible(false);
        setEditingTeacher(null);
        await loadTeachers();
    }
  };

  // Pagination
  const totalItems = filteredTeachers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentTeachers = filteredTeachers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <LayoutProvider>
      <TeacherManagementContent
        user={user}
        error={error}
        loading={loading}
        teachers={teachers}
        filteredTeachers={filteredTeachers}
        currentTeachers={currentTeachers}
        selectedTeacher={selectedTeacher}
        detailVisible={detailVisible}
        formVisible={formVisible}
        formMode={formMode}
        editingTeacher={editingTeacher}
        isAdminOrModerator={isAdminOrModerator}
        searchParams={searchParams}
        handleOpenCreateForm={handleOpenCreateForm}
        handleOpenEditForm={handleOpenEditForm}
        handleTeacherClick={handleTeacherClick}
        handleCloseDetail={handleCloseDetail}
        handleDeleteTeacher={handleDeleteTeacher}
        handleFormSubmit={handleFormSubmit}
        handleFilterChange={handleFilterChange}
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={totalItems}
        handlePageChange={handlePageChange}
        setFormVisible={setFormVisible}
        setEditingTeacher={setEditingTeacher}
      />
    </LayoutProvider>
  );
}
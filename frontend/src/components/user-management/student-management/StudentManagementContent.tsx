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
import type { Student, UserWithRoles } from "../../../types/user.types";

// Placeholder imports (implement these components separately)
import StudentCard from "./StudentCard";
import StudentDetail from "./StudentDetail";
import StudentForm from "./StudentForm";
import StudentFilterBar from "./StudentFilterBar";

function StudentManagementContent({
  user,
  error,
  loading,
  currentStudents,
  selectedStudent,
  detailVisible,
  formVisible,
  formMode,
  editingStudent,
  isAdminOrModerator,
  searchParams,
  handleOpenCreateForm,
  handleStudentClick,
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
  setEditingStudent,
  handleOpenEditForm,
  handleDeleteStudent,
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
        <Navbar user={user} pageName="Student Management" />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Error State */}
            {error ? (
              <Alert type="error" message="Failed to load students" description={error} showIcon />
            ) : (
              <>
                {/* Header */}
                <div className="mb-8 bg-linear-to-r from-[#189ad6] to-[#2f398f] rounded-2xl p-8 text-white shadow-lg">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <Title level={1} className="text-white! mb-2! font-['Montserrat']!">
                        All Students
                      </Title>
                      <Text className="text-white/90! text-base! font-['Open_Sans']">
                        Browse and search through all students
                      </Text>
                    </div>
                    {isAdminOrModerator && (
                      <PrimaryButton
                        label="New Student"
                        icon={<PlusOutlined />}
                        onClick={handleOpenCreateForm}
                        className="bg-white! text-[#2f398f]! hover:bg-white/90! shadow-md!"
                      />
                    )}
                  </div>
                </div>

                {/* Filter Bar */}
                <div className="mb-6">
                  <StudentFilterBar
                    search={searchParams.get("keyword") || ""}
                    onSearchChange={val => handleFilterChange({ keyword: val })}
                    status={searchParams.get("status") || ""}
                    onStatusChange={val => handleFilterChange({ status: val })}
                  />
                </div>

                {/* Results Summary */}
                <div className="mb-4 flex items-center justify-between">
                  <Text className="text-gray-600 font-['Open_Sans'] text-sm">
                    Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} students
                  </Text>
                </div>

                {/* Students List */}
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <Spin size="large" />
                  </div>
                ) : currentStudents.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">🎓</div>
                    <Title level={3} className="text-gray-400! mb-2! font-['Montserrat']!">
                      No Students Found
                    </Title>
                    <Text className="text-gray-500 font-['Open_Sans']">
                      {searchParams.toString()
                        ? "Try adjusting your filters or search terms"
                        : "No students have been added yet"}
                    </Text>
                  </div>
                  ) : (
                    <>
                      <div className="space-y-3 mb-8">
                        {currentStudents.map((student: Student) => (
                          <StudentCard
                            key={student.id}
                            student={student}
                            onClick={handleStudentClick}
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
                <StudentDetail
                  open={detailVisible}
                  student={selectedStudent}
                  onClose={handleCloseDetail}
                  onEdit={handleOpenEditForm}
                  onDelete={handleDeleteStudent}
                  canManage={isAdminOrModerator}
                />

                {isAdminOrModerator && (
                  <StudentForm
                    open={formVisible}
                    loading={loading}
                    mode={formMode}
                    initialData={editingStudent}
                    onSubmit={handleFormSubmit}
                    onCancel={() => {
                      setFormVisible(false);
                      setEditingStudent(null);
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

export default function StudentManagement() {
  const { getMe, getStudentById, getAllStudents, createStudent, updateStudent, deleteStudent } = useUserApi();

  const [user, setUser] = useState<UserWithRoles | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
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

  // Load students
  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getAllStudents();
      if (error) {
        message.error(error);
        setStudents([]);
      } else {
        setStudents((data as unknown as Student[]) || []);
      }
    } catch (err) {
      console.error("Error loading students:", err);
      message.error("Failed to load students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [getAllStudents]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Filter students based on search params
  useEffect(() => {
    const keyword = searchParams.get("keyword")?.toLowerCase() || "";
    const studentIdCode = searchParams.get("studentIdCode")?.toLowerCase() || "";
    const cohortYear = searchParams.get("cohortYear");
    const className = searchParams.get("className")?.toLowerCase() || "";
    const status = searchParams.get("status");

    let filtered = [...students];

    // Keyword search (name)
    if (keyword) {
      filtered = filtered.filter(
        (s) =>
          s.studentIdCode?.toLowerCase().includes(keyword) ||
          s.className?.toLowerCase().includes(keyword) ||
          s.phone?.toLowerCase().includes(keyword)
      );
    }

    // Student ID filter
    if (studentIdCode) {
      filtered = filtered.filter((s) => s.studentIdCode?.toLowerCase().includes(studentIdCode));
    }

    // Cohort year filter
    if (cohortYear) {
      filtered = filtered.filter((s) => String(s.cohortYear) === cohortYear);
    }

    // Class name filter
    if (className) {
      filtered = filtered.filter((s) => s.className?.toLowerCase().includes(className));
    }

    // Status filter
    if (status) {
      filtered = filtered.filter((s) => s.status === status);
    }

    // Sort by cohortYear desc, then name
    filtered.sort((a, b) => {
      if ((b.cohortYear ?? 0) !== (a.cohortYear ?? 0)) {
        return (b.cohortYear ?? 0) - (a.cohortYear ?? 0);
      }
      return (a.studentIdCode ?? "").localeCompare(b.studentIdCode ?? "");
    });

    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [students, searchParams]);

  // Handle filter changes
  const handleFilterChange = (filters: {
    keyword?: string;
    studentIdCode?: string;
    cohortYear?: string;
    className?: string;
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

  // Handle student click to view details
  const handleStudentClick = async (student: Student) => {
    setDetailVisible(true);
    try {
      const { data, error } = await getStudentById(student.id);
      if (error) {
        message.error("Failed to load student details");
        setSelectedStudent(student);
      } else {
        setSelectedStudent(data ?? student);
      }
    } catch (err) {
      message.error("An error occurred while loading the student");
      setSelectedStudent(student);
    }
  };

  const handleCloseDetail = () => {
    setDetailVisible(false);
    setSelectedStudent(null);
  };

  // Open form for creating new student
  const handleOpenCreateForm = () => {
    setFormMode("create");
    setEditingStudent(null);
    setFormVisible(true);
  };

  // Open form for editing student
  const handleOpenEditForm = (student: Student) => {
    setFormMode("edit");
    setEditingStudent(student);
    setFormVisible(true);
    setDetailVisible(false);
  };

  const handleDeleteStudent = async (studentIdCode: number) => {
    try {
      const { error } = await deleteStudent(studentIdCode);
      if (error) {
        message.error(error);
        return;
      }
      message.success("Student deleted successfully!");
      setDetailVisible(false);
      setSelectedStudent(null);
      loadStudents();
    } catch (err) {
      message.error("An error occurred while deleting the student");
    }
  };

  const handleCreateStudent = async (values: Partial<Student>) => {
    try {
      const { data, error } = await createStudent(values as any);
      if (error) {
        message.error(error);
        throw new Error(error);
      }
      if (data) {
        setFormVisible(false);
        loadStudents();
      }
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateStudent = async (values: Partial<Student>) => {
    if (!editingStudent) return;
    try {
      const { data, error } = await updateStudent(editingStudent.id, values as any);
      if (error) {
        message.error(error);
        throw new Error(error);
      }
      if (data) {
        setFormVisible(false);
        setEditingStudent(null);
        loadStudents();
      }
    } catch (err) {
      throw err;
    }
  };

  const handleFormSubmit = async (values: Partial<Student>) => {
    if (formMode === "create") {
      await handleCreateStudent(values);
    } else {
      await handleUpdateStudent(values);
    }
  };

  // Pagination
  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <LayoutProvider>
      <StudentManagementContent
        user={user}
        error={error}
        loading={loading}
        students={students}
        filteredStudents={filteredStudents}
        currentStudents={currentStudents}
        selectedStudent={selectedStudent}
        detailVisible={detailVisible}
        formVisible={formVisible}
        formMode={formMode}
        editingStudent={editingStudent}
        isAdminOrModerator={isAdminOrModerator}
        searchParams={searchParams}
        handleOpenCreateForm={handleOpenCreateForm}
        handleOpenEditForm={handleOpenEditForm}
        handleStudentClick={handleStudentClick}
        handleCloseDetail={handleCloseDetail}
        handleDeleteStudent={handleDeleteStudent}
        handleFormSubmit={handleFormSubmit}
        handleFilterChange={handleFilterChange}
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={totalItems}
        handlePageChange={handlePageChange}
        setFormVisible={setFormVisible}
        setEditingStudent={setEditingStudent}
      />
    </LayoutProvider>
  );
}
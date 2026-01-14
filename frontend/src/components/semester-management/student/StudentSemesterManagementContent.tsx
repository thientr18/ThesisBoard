import { useState, useEffect, useCallback } from "react";
import { Spin } from "antd";
import Pagination from "../../common/display/Pagination";
import { Title, Text } from "../../common/display/Typography";
import SelectInput from "../../common/inputs/SelectInput";
import PrimaryButton from "../../common/buttons/PrimaryButton";
import { PlusOutlined } from "@ant-design/icons";
import Sidebar from "../../common/navigation/Sidebar";
import Navbar from "../../common/navigation/Navbar";
import { LayoutProvider, useLayoutContext, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../../../contexts/LayoutContext";
import Alert from "antd/es/alert/Alert";
import { useSemesterApi } from "../../../api/endpoints/semester.api";
import { useUserApi } from "../../../api/endpoints/user.api";

// Import your components
import StudentSemesterCard from "./StudentSemesterCard";
import StudentSemesterDetail from "./StudentSemesterDetail";
import StudentSemesterForm from "./StudentSemesterForm";
import StudentSemesterFilterBar from "./StudentSemesterFilterBar";

function StudentSemesterManagementContent({
  user,
  error,
  semesters,
  semesterId,
  setSemesterId,
  search,
  setSearch,
  status,
  setStatus,
  type,
  setType,
  studentCode,
  setStudentCode,
  currentStudents,
  startIndex,
  endIndex,
  totalItems,
  loadingSemesters,
  loadingStudents,
  isAdminOrModerator,
  handleOpenCreateForm,
  handleStudentClick,
  detailVisible,
  editingStudent,
  handleCloseDetail,
  handleOpenEditForm,
  handleSubmitStudentSemester,
  handleDeleteStudentSemester,
  formVisible,
  setFormVisible,
  currentPage,
  setCurrentPage,
  pageSize,
}: any) {
  const { collapsed } = useLayoutContext();
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  const pageLoading = loadingSemesters || (semesterId && loadingStudents);
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
        <Navbar user={user} pageName="Student Semester Management" />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {error && (
              <Alert type="error" message="Failed to load data" description={error} showIcon className="mb-4" />
            )}
            {/* Filter Bar with Semester Dropdown */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl shadow-sm">
                <SelectInput
                  label="Semester"
                  options={semesters.map((s: any) => ({
                    label: s.name,
                    value: s.id,
                  }))}
                  value={semesterId ?? undefined}
                  onChange={val => setSemesterId(val as number)}
                  placeholder="Select semester"
                  className="w-full sm:w-64"
                />
                <StudentSemesterFilterBar
                  search={search}
                  onSearchChange={setSearch}
                  type={type ?? undefined}
                  onTypeChange={val => setType(val ?? null)}
                  status={status ?? undefined}
                  onStatusChange={val => setStatus(val ?? null)}
                  studentCode={studentCode}
                  onStudentCodeChange={setStudentCode}
                />
              </div>
              {semesters.length === 0 && !loadingSemesters && (
                <Alert
                  type="info"
                  message="No semester data found. Please add a semester first."
                  showIcon
                  className="mt-4"
                />
              )}
            </div>

            {/* Results Summary */}
            <div className="mb-4 flex items-center justify-between">
              <Text className="text-gray-600 text-sm">
                Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} students
              </Text>
              {isAdminOrModerator && semesterId && (
                <PrimaryButton
                  label="Add Student"
                  icon={<PlusOutlined />}
                  onClick={handleOpenCreateForm}
                  className="bg-[#189ad6]! text-white! hover:bg-[#189ad6]/90! shadow-md!"
                />
              )}
            </div>

            {/* Students List */}
            {pageLoading ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" />
              </div>
            ) : currentStudents.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">👨‍🎓</div>
                <Title level={3} className="text-gray-400! mb-2!">
                  No Students Found
                </Title>
                <Text className="text-gray-500">
                  No students have been added to this semester yet.
                </Text>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-8">
                  {currentStudents.map((student: any) => {
                    const mappedStudent = {
                      id: student.id,
                      studentId: student.studentId,
                      fullName: student.student?.user?.fullName ?? "",
                      studentCode: student.student?.studentIdCode ?? "",
                      email: student.student?.user?.email ?? "",
                      status: student.status,
                      gpa: student.gpa,
                      credits: student.credits,
                      type: student.type,
                    };
                    return (
                      <StudentSemesterCard
                        key={student.id}
                        student={mappedStudent}
                        onClick={handleStudentClick}
                        canManage={isAdminOrModerator}
                      />
                    );
                  })}
                </div>
                {/* Pagination */}
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalItems}
                  onChange={(page,) => {
                    setCurrentPage(page);
                  }}
                  showSizeChanger={false}
                />
              </>
            )}

            {/* Modals */}
            <StudentSemesterDetail
              open={detailVisible}
              student={editingStudent}
              onClose={handleCloseDetail}
              onEdit={handleOpenEditForm}
              canManage={isAdminOrModerator}
              onDelete={handleDeleteStudentSemester}
            />

            {isAdminOrModerator && (
              <StudentSemesterForm
                open={formVisible}
                mode={editingStudent ? "edit" : "create"}
                initialData={editingStudent}
                onSubmit={handleSubmitStudentSemester}
                onCancel={() => setFormVisible(false)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function StudentSemesterManagement() {
  const { getAll: getAllSemesters,
    getStudentsInSemester,
    createStudentInSemester,
    updateStudentInSemester,
    deleteStudentFromSemester
  } = useSemesterApi();
  const { getMe } = useUserApi();

  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Semester selection
  const [semesters, setSemesters] = useState<any[]>([]);

  // Students in selected semester
  const [students, setStudents] = useState<any[]>([]);
  const [type, setType] = useState<string | null>(null);
  const [loadingSemesters, setLoadingSemesters] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Modal states
  const [detailVisible, setDetailVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);

  // Add filter states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [studentCode, setStudentCode] = useState("");
  const [semesterId, setSemesterId] = useState<number | null>(null);

  // Pagination
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);

  // Permissions
  const isAdminOrModerator = Array.isArray(user?.roles) && user.roles.some((role: any) => role.name === "admin" || role.name === "moderator");

  // Load user
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await getMe();
        if (error) setError(error);
        setUser(data ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    })();
  }, [getMe]);

  // Load semesters
  useEffect(() => {
    (async () => {
      setLoadingSemesters(true);
      try {
        const { data, error } = await getAllSemesters();
        if (error) setError(error);
        setSemesters(data ?? []);
          const semestersArr = data ?? [];
          if (semestersArr.length > 0) {
            const sorted = [...semestersArr].sort((a, b) => {
              if (a.startDate && b.startDate) {
                return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
              }
              return b.id - a.id;
            });
            setSemesterId(sorted[0].id);
          }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoadingSemesters(false);
      }
    })();
  }, [getAllSemesters]);

  // Load students when semesterId changes
  useEffect(() => {
    if (!semesterId) {
      setStudents([]);
      return;
    }
    setLoadingStudents(true);
    (async () => {
      try {
        const { data, error } = await getStudentsInSemester(
          semesterId,
          currentPage,
          pageSize,
          search,
          studentCode,
          status ?? undefined,
          type ?? undefined
        );
        if (error) setError(error);
        setStudents(data?.students ?? []);
        setTotalItems(data?.total ?? 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    })();
  }, [
    semesterId,
    semesters,
    getStudentsInSemester,
    currentPage,
    pageSize,
    search,
    studentCode,
    status,
    type
  ]);

  // Filtering students
  useEffect(() => {
    let filtered = students;
    if (search.trim()) {
      filtered = filtered.filter((s: any) =>
        s.fullName?.toLowerCase().includes(search.trim().toLowerCase())
      );
    }
    if (studentCode.trim()) {
      filtered = filtered.filter((s: any) =>
        s.studentCode?.toLowerCase().includes(studentCode.trim().toLowerCase())
      );
    }
    if (status && status !== "all") {
      filtered = filtered.filter((s: any) => s.status === status);
    }
  }, [students, search, status, studentCode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, studentCode]);

  // Pagination
  const currentStudents = students;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + students.length;

  // Handlers
  const handleOpenCreateForm = useCallback(() => {
    setFormVisible(true);
    setEditingStudent(null);
  }, []);

  const handleStudentClick = useCallback((student: any) => {
    setEditingStudent(student);
    setDetailVisible(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailVisible(false);
    setEditingStudent(null);
  }, []);

  const handleOpenEditForm = useCallback((student: any) => {
    setFormVisible(true);
    setEditingStudent(student);
    setDetailVisible(false);
  }, []);

  const handleSubmitStudentSemester = async (payload: any) => {
    if (!semesterId) return;
    try {
      if (editingStudent) {
        // Update the student
        const { data, error } = await updateStudentInSemester(editingStudent.studentId, semesterId, payload);
        if (error) {
          setError(error);
          return;
        }
        
        // Update the local state without reloading
        setStudents(prevStudents => 
          prevStudents.map(s => 
            s.studentId === editingStudent.studentId 
              ? { ...s, ...payload } 
              : s
          )
        );
        setEditingStudent(null);
        setDetailVisible(false);
      } else {
        // Create new student
        const { data, error } = await createStudentInSemester(semesterId, payload);
        if (error) {
          setError(error);
          return;
        }
        
        // Reload the list to get the new student with full data
        const studentsResponse = await getStudentsInSemester(
          semesterId,
          currentPage,
          pageSize,
          search,
          studentCode,
          status ?? undefined,
          type ?? undefined
        );
        setStudents(studentsResponse.data?.students ?? []);
        setTotalItems(studentsResponse.data?.total ?? 0);
      }
      setFormVisible(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDeleteStudentSemester = async (studentId: number) => {
    if (!semesterId) return;
    try {
      const { error } = await deleteStudentFromSemester(studentId, semesterId);
      if (error) {
        setError(error);
        return;
      }
      
      setStudents(prevStudents => prevStudents.filter(s => s.studentId !== studentId));
      setTotalItems(prev => prev - 1);
      setDetailVisible(false);
      setEditingStudent(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <LayoutProvider>
      <StudentSemesterManagementContent
        user={user}
        error={error}
        semesters={semesters}
        semesterId={semesterId}
        setSemesterId={setSemesterId}
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        type={type}
        setType={setType}
        studentCode={studentCode}
        setStudentCode={setStudentCode}
        currentStudents={currentStudents}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={totalItems}
        loadingSemesters={loadingSemesters}
        loadingStudents={loadingStudents}
        isAdminOrModerator={isAdminOrModerator}
        handleOpenCreateForm={handleOpenCreateForm}
        handleStudentClick={handleStudentClick}
        handleSubmitStudentSemester={handleSubmitStudentSemester}
        handleDeleteStudentSemester={handleDeleteStudentSemester}
        detailVisible={detailVisible}
        editingStudent={editingStudent}
        handleCloseDetail={handleCloseDetail}
        handleOpenEditForm={handleOpenEditForm}
        formVisible={formVisible}
        setFormVisible={setFormVisible}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageSize={pageSize}
      />
    </LayoutProvider>
  );
}
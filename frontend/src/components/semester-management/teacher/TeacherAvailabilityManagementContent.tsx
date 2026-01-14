import { useState, useEffect, useCallback } from "react";
import { Spin, Alert } from "antd";
import Pagination from "../../common/display/Pagination";
import { Title, Text } from "../../common/display/Typography";
import SelectInput from "../../common/inputs/SelectInput";
import PrimaryButton from "../../common/buttons/PrimaryButton";
import { PlusOutlined } from "@ant-design/icons";
import Sidebar from "../../common/navigation/Sidebar";
import Navbar from "../../common/navigation/Navbar";
import { LayoutProvider, useLayoutContext, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../../../contexts/LayoutContext";
import { useSemesterApi } from "../../../api/endpoints/semester.api";
import { useUserApi } from "../../../api/endpoints/user.api";
import TeacherAvailabilityCard from "./TeacherAvailabilityCard";
import TeacherAvailabilityDetail from "./TeacherAvailabilityDetail";
import TeacherAvailabilityForm from "./TeacherAvailabilityForm";
import TeacherAvailabilityFilterBar from "./TeacherAvailabilityFilterBar";

function TeacherAvailabilityManagementContent({
  user,
  error,
  semesters,
  semesterId,
  setSemesterId,
  search,
  setSearch,
  currentTeachers,
  startIndex,
  endIndex,
  totalItems,
  loadingSemesters,
  loadingTeachers,
  isAdminOrModerator,
  handleOpenCreateForm,
  handleTeacherClick,
  detailVisible,
  editingTeacher,
  handleCloseDetail,
  handleOpenEditForm,
  handleSubmitTeacherAvailability,
  handleDeleteTeacherAvailability,
  formVisible,
  setFormVisible,
  currentPage,
  setCurrentPage,
  pageSize,
  formError,
  setFormError,
  deleteError,
  setDeleteError,
  teachers,
}: any) {
  const { collapsed } = useLayoutContext();
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  const pageLoading = loadingSemesters || (semesterId && loadingTeachers);

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
        <Navbar user={user} pageName="Teacher Availability Management" />
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
                <div className="flex-1 w-full">
                  <TeacherAvailabilityFilterBar
                    search={search}
                    onSearchChange={setSearch}
                  />
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mb-4 flex items-center justify-between">
              <Text className="text-gray-600 text-sm">
                Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} teachers
              </Text>
              {isAdminOrModerator && semesterId && (
                <PrimaryButton
                  label="Add Teacher"
                  icon={<PlusOutlined />}
                  onClick={handleOpenCreateForm}
                  className="bg-[#189ad6]! text-white! hover:bg-[#189ad6]/90! shadow-md!"
                />
              )}
            </div>

            {/* Teachers List */}
            {pageLoading ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" />
              </div>
            ) : currentTeachers.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">👨‍🏫</div>
                <Title level={3} className="text-gray-400! mb-2!">
                  No Teachers Found
                </Title>
                <Text className="text-gray-500">
                  No teachers have been added to this semester yet.
                </Text>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-8">
                  {currentTeachers.map((teacher: any) => (
                    <TeacherAvailabilityCard
                      key={teacher.id}
                      teacher={teacher}
                      onClick={handleTeacherClick}
                      canManage={isAdminOrModerator}
                    />
                  ))}
                </div>
                {/* Pagination */}
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalItems}
                  onChange={page => setCurrentPage(page)}
                  showSizeChanger={false}
                />
              </>
            )}

            {/* Modals */}
            <TeacherAvailabilityDetail
              open={detailVisible}
              teacher={editingTeacher}
              onClose={handleCloseDetail}
              onEdit={handleOpenEditForm}
              canManage={isAdminOrModerator}
              onDelete={() => handleDeleteTeacherAvailability(editingTeacher)}
              deleteError={deleteError}
            />

            {isAdminOrModerator && (
              <TeacherAvailabilityForm
                open={formVisible}
                mode={editingTeacher ? "edit" : "create"}
                initialData={editingTeacher}
                onSubmit={handleSubmitTeacherAvailability}
                onCancel={() => setFormVisible(false)}
                error={formError}
                excludedTeacherIds={teachers.map((t: any) => t.teacher?.id)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function TeacherAvailabilityManagement() {
  const { getAll: getAllSemesters, getTeachersInSemester, createTeacherInSemester, updateTeacherInSemester, deleteTeacherFromSemester } = useSemesterApi();
  const { getMe } = useUserApi();

  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Semester selection
  const [semesters, setSemesters] = useState<any[]>([]);
  const [semesterId, setSemesterId] = useState<number | null>(null);

  // Teachers in selected semester
  const [teachers, setTeachers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loadingSemesters, setLoadingSemesters] = useState(true);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // Modal states
  const [detailVisible, setDetailVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null);

  // Pagination
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);

  // Permissions
  const isAdminOrModerator = Array.isArray(user?.roles) && user.roles.some((role: any) => role.name === "admin" || role.name === "moderator");

  // Error submit
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  // Load teachers when semesterId changes
  useEffect(() => {
    if (!semesterId) {
      setTeachers([]);
      return;
    }
    setLoadingTeachers(true);
    (async () => {
      try {
        const { data, error } = await getTeachersInSemester(semesterId);
        if (error) setError(error);
        setTeachers(data ?? []);
        setTotalItems((data ?? []).length);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setTeachers([]);
      } finally {
        setLoadingTeachers(false);
      }
    })();
  }, [semesterId, getTeachersInSemester]);

  // Filtering teachers
  const filteredTeachers = teachers.filter((t: any) => {
    if (!search.trim()) return true;
    const name = t.teacher?.user?.fullName?.toLowerCase() || "";
    const code = t.teacher?.teacherIdCode?.toLowerCase() || "";
    return name.includes(search.trim().toLowerCase()) || code.includes(search.trim().toLowerCase());
  });

  // Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + filteredTeachers.length;
  const currentTeachers = filteredTeachers.slice(startIndex, startIndex + pageSize);

  // Handlers
  const handleOpenCreateForm = useCallback(() => {
    setFormVisible(true);
    setEditingTeacher(null);
  }, []);

  const handleTeacherClick = useCallback((teacher: any) => {
    setEditingTeacher(teacher);
    setDetailVisible(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailVisible(false);
    setEditingTeacher(null);
  }, []);

  const handleOpenEditForm = useCallback((teacher: any) => {
    setFormVisible(true);
    setEditingTeacher(teacher);
    setDetailVisible(false);
  }, []);

  const handleSubmitTeacherAvailability = async (payload: any) => {
    if (!semesterId) return;
    setFormError(null);
    try {
      if (editingTeacher) {
        await updateTeacherInSemester(semesterId, editingTeacher.teacherId, payload);
        setEditingTeacher(null);
      } else {
        await createTeacherInSemester(semesterId, payload);
      }
      setFormVisible(false);
      const { data } = await getTeachersInSemester(semesterId);
      setTeachers(data ?? []);
      setTotalItems((data ?? []).length);
    } catch (err: any) {
      let message = "Failed to save teacher availability.";
      if (err?.response?.data?.message) message = err.response.data.message;
      else if (err?.message) message = err.message;
      setFormError(message);
    }
  };

  const handleDeleteTeacherAvailability = async (teacherAvailability: any) => {
    if (!semesterId) return;
    setDeleteError(null);
    try {
      await deleteTeacherFromSemester(semesterId, teacherAvailability.teacherId);
      const { data } = await getTeachersInSemester(semesterId);
      setTeachers(data ?? []);
      setTotalItems((data ?? []).length);
    } catch (err: any) {
      let message = "Failed to delete teacher from semester.";
      if (err?.response?.data?.message) message = err.response.data.message;
      else if (err?.message) message = err.message;
      setDeleteError(message);
    }
  };

  return (
    <LayoutProvider>
      <TeacherAvailabilityManagementContent
        user={user}
        error={error}
        semesters={semesters}
        semesterId={semesterId}
        setSemesterId={setSemesterId}
        search={search}
        setSearch={setSearch}
        currentTeachers={currentTeachers}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={totalItems}
        loadingSemesters={loadingSemesters}
        loadingTeachers={loadingTeachers}
        isAdminOrModerator={isAdminOrModerator}
        handleOpenCreateForm={handleOpenCreateForm}
        handleTeacherClick={handleTeacherClick}
        handleSubmitTeacherAvailability={handleSubmitTeacherAvailability}
        handleDeleteTeacherAvailability={handleDeleteTeacherAvailability}
        detailVisible={detailVisible}
        editingTeacher={editingTeacher}
        handleCloseDetail={handleCloseDetail}
        handleOpenEditForm={handleOpenEditForm}
        formVisible={formVisible}
        setFormVisible={setFormVisible}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageSize={pageSize}
        formError={formError}
        setFormError={setFormError}
        deleteError={deleteError}
        setDeleteError={setDeleteError}
        teachers={teachers}
      />
    </LayoutProvider>
  );
}
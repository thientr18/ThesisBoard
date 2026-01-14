import React, { useState, useEffect } from 'react';
import AllTeacherTheses from '../../components/thesis/project/AllTeacherTheses';
import AllAdministratorTheses from '../../components/thesis/project/AllAdministratorTheses';
import { useUserApi } from '../../api/endpoints/user.api';
import { useSemesterApi } from '../../api/endpoints/semester.api';
import { Select, Spin, Alert } from 'antd';
import { LayoutProvider, useLayoutContext, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../../contexts/LayoutContext";
import Sidebar from "../../components/common/navigation/Sidebar";
import Navbar from "../../components/common/navigation/Navbar";

const ThesisProjectsListPage: React.FC = () => {
  const [user, setUser] = useState<any | null>(null);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { collapsed } = useLayoutContext();
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  const { getMe } = useUserApi();
  const { getAll: getSemesters } = useSemesterApi();

  // Fetch user
  useEffect(() => {
    (async () => {
      try {
        const { data: userData } = await getMe();
        setUser(userData || null);
      } catch {
        setError('Failed to fetch user');
      }
    })();
  }, [getMe]);

  // Fetch semesters
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: semestersData } = await getSemesters();
        setSemesters(semestersData || []);
        if (semestersData && semestersData.length > 0) {
          setSelectedSemester(semestersData[0]);
        }
      } catch {
        setError('Failed to fetch semesters');
      }
      setLoading(false);
    })();
  }, [getSemesters]);

  const handleSemesterChange = (value: string) => {
    const semester = semesters.find((s) => String(s.id) === value);
    setSelectedSemester(semester || null);
  };

  return (
    <>
      <Sidebar user={user} />
      <div
        className="flex-1 flex flex-col bg-gray-50 min-h-screen"
        style={{
          marginLeft: sidebarWidth,
          transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <Navbar user={user} pageName="Thesis Projects" />
        <main className="flex-1 p-6">
          <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
            <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
              <label htmlFor="semester-select" className="font-medium min-w-max">
                Select Semester:
              </label>
              <Select
                id="semester-select"
                className="w-full sm:w-64"
                value={selectedSemester ? String(selectedSemester.id) : undefined}
                onChange={handleSemesterChange}
                placeholder="Select Semester"
                loading={loading}
              >
                {semesters.map((semester) => (
                  <Select.Option key={semester.id} value={String(semester.id)}>
                    {semester.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
            {error && <Alert message={error} type="error" showIcon className="mb-4" />}
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Spin size="large" />
              </div>
            ) : (
              <>
                {user && Array.isArray(user.roles) ? (
                  user.roles.some((r: any) => r.name === 'admin' || r.name === 'moderator') ? (
                    <AllAdministratorTheses user={user} semester={selectedSemester} />
                  ) : user.roles.some((r: any) => r.name === 'teacher') ? (
                    <AllTeacherTheses user={user} semester={selectedSemester} />
                  ) : (
                    <Alert
                      message="Access Denied"
                      type="warning"
                      showIcon
                      className="mb-4"
                    />
                  )
                ) : (
                  <Alert
                    message="Access Denied"
                    type="warning"
                    showIcon
                    className="mb-4"
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default function ThesisProjectsListPageWrapper() {
  return (
    <LayoutProvider>
      <ThesisProjectsListPage />
    </LayoutProvider>
  )
}
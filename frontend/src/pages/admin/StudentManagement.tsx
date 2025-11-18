import React from 'react';
import { LayoutProvider, useLayoutContext, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../../contexts/LayoutContext';
import Sidebar from '../../components/common/navigation/Sidebar';
import Navbar from '../../components/common/navigation/Navbar';

const StudentManagementContent: React.FC = () => {
  const { collapsed } = useLayoutContext();
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <>
      <Sidebar />
      <div
        className="flex-1 flex flex-col"
        style={{
          marginLeft: sidebarWidth,
          transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
          minHeight: "100vh",
        }}
      >
        <Navbar pageName="Student Management" />
        <main className="px-6 py-8 max-w-7xl mx-auto flex-1">
          Student Management
        </main>
      </div>
    </>
  );
};

const StudentManagement: React.FC = () => {
  return (
    <LayoutProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <StudentManagementContent />
      </div>
    </LayoutProvider>
  );
};

export default StudentManagement;
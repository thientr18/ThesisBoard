import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import ProtectedRoute from './routes/ProtectedRoute';
import Callback from './pages/Callback';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import ChangePassword from './pages/ChangePassword';
import Announcements from './pages/Announcements';

// User management pages
import TeacherManagement from './pages/admin/TeacherManagement';
import StudentManagement from './pages/admin/StudentManagement';
import AdministratorManagement from './pages/admin/AdministratorManagement';

// Semester management pages
import SemesterGeneral from './pages/semester/SemesterGeneral';
import StudentSemesterPage from './pages/semester/StudentSemester';
import TeacherAvailabilityPage from './pages/semester/TeacherAvailability';

function App() {
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();
  const location = useLocation();

  useEffect(() => {
    // Only attempt login if not authenticated, not loading, and not already on special paths
    const shouldRedirect = 
      !isLoading && 
      !isAuthenticated && 
      location.pathname !== '/callback' && 
      !location.pathname.includes('/login');
    
    if (shouldRedirect) {
      loginWithRedirect({
        appState: { 
          returnTo: location.pathname === '/' ? '/dashboard' : location.pathname 
        }
      });
    }
  }, [isAuthenticated, isLoading, loginWithRedirect, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/callback" element={<Callback />} />
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : 
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Please log in...</h2>
          </div>
        </div>
      } />
      <Route path="/me" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/change-password" element={
        <ProtectedRoute>
          <ChangePassword />
        </ProtectedRoute>
      } />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/announcements" 
        element={
          <ProtectedRoute>
            <Announcements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-management"
        element={
          <ProtectedRoute>
            <StudentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher-management"
        element={
          <ProtectedRoute>
            <TeacherManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/administrator-management"
        element={
          <ProtectedRoute>
            <AdministratorManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/semester-management/general"
        element={
          <ProtectedRoute>
            <SemesterGeneral />
          </ProtectedRoute>
        }
        />
        <Route
          path="/semester-management/student"
          element={
            <ProtectedRoute>
              <StudentSemesterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/semester-management/teacher"
          element={
            <ProtectedRoute>
              <TeacherAvailabilityPage />
            </ProtectedRoute>
          }
        />

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      {/* Catch-all route for any other paths */}
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
}

export default App;
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';

// Pages & Components (We will create these next)
import Login from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminLeaves from './pages/admin/AdminLeaves';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import Scanner from './pages/teacher/Scanner';
import LeaveApprovals from './pages/teacher/LeaveApprovals';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentLeaves from './pages/student/StudentLeaves';
import AttendanceLogs from './pages/shared/AttendanceLogs';
import Holidays from './pages/shared/Holidays';
import Reports from './pages/shared/Reports';
import Profile from './pages/shared/Profile';
import { Layout } from './components/Layout';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route element={<Layout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/attendance" element={<AttendanceLogs role="Admin" />} />
                <Route path="/admin/leaves" element={<AdminLeaves />} />
                <Route path="/admin/holidays" element={<Holidays />} />
                <Route path="/admin/reports" element={<Reports />} />
                <Route path="/admin/profile" element={<Profile />} />
              </Route>
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['Teacher']} />}>
              <Route element={<Layout />}>
                <Route path="/teacher" element={<TeacherDashboard />} />
                <Route path="/teacher/scan" element={<Scanner />} />
                <Route path="/teacher/attendance" element={<AttendanceLogs role="Teacher" />} />
                <Route path="/teacher/leaves" element={<LeaveApprovals />} />
                <Route path="/teacher/holidays" element={<Holidays />} />
                <Route path="/teacher/reports" element={<Reports />} />
                <Route path="/teacher/profile" element={<Profile />} />
              </Route>
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
              <Route element={<Layout />}>
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/student/attendance" element={<AttendanceLogs role="Student" />} />
                <Route path="/student/leaves" element={<StudentLeaves />} />
                <Route path="/student/holidays" element={<Holidays />} />
                <Route path="/student/profile" element={<Profile />} />
              </Route>
            </Route>
            
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<div className="min-h-screen flex items-center justify-center">404 Not Found</div>} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

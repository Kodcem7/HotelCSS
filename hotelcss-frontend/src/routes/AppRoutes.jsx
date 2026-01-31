import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/Login';
import AdminDashboard from '../pages/AdminDashboard';
import ReceptionDashboard from '../pages/ReceptionDashboard';
import ManagerDashboard from '../pages/ManagerDashboard';
import StaffDashboard from '../pages/StaffDashboard';
import RoomDashboard from '../pages/RoomDashboard';
import RequestsPage from '../pages/RequestsPage';
import RoomsPage from '../pages/RoomsPage';
import StaffManagementPage from '../pages/StaffManagementPage';
import DepartmentsPage from '../pages/DepartmentsPage';
import ServiceItemsPage from '../pages/ServiceItemsPage';
import CreateRequestPage from '../pages/CreateRequestPage';
import RoomCreationPage from '../pages/RoomCreationPage';
import RequestHistoryPage from '../pages/RequestHistoryPage';

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to={`/${user?.role?.toLowerCase()}`} replace />
            ) : (
              <Login />
            )
          } 
        />

        {/* Protected Routes - Role-based access */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles="Manager">
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reception"
          element={
            <ProtectedRoute allowedRoles="Reception">
              <ReceptionDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reception/requests"
          element={
            <ProtectedRoute allowedRoles="Reception">
              <RequestsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reception/rooms"
          element={
            <ProtectedRoute allowedRoles="Reception">
              <RoomsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/requests"
          element={
            <ProtectedRoute allowedRoles="Admin">
              <RequestsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/rooms"
          element={
            <ProtectedRoute allowedRoles="Admin">
              <RoomsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/rooms/create"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
              <RoomCreationPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute allowedRoles="Admin">
              <StaffManagementPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute allowedRoles="Admin">
              <DepartmentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/service-items"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
              <ServiceItemsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['Staff', 'Housekeeping', 'Restaurant']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/requests"
          element={
            <ProtectedRoute allowedRoles={['Staff', 'Housekeeping', 'Restaurant']}>
              <RequestsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/room"
          element={
            <ProtectedRoute allowedRoles="Room">
              <RoomDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/room/create-request"
          element={
            <ProtectedRoute allowedRoles="Room">
              <CreateRequestPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/room/history"
          element={
            <ProtectedRoute allowedRoles="Room">
              <RequestHistoryPage />
            </ProtectedRoute>
          }
        />

        {/* Default route - redirect based on role */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={`/${user?.role?.toLowerCase()}`} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

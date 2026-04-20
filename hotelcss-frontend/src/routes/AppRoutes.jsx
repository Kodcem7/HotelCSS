import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardPathForRole } from '../utils/dashboardPath';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/Layout'; // Import your Layout here!

// Import all your pages...
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
import ReportIssuePage from '../pages/ReportIssuePage';
import RoomReceptionRequestPage from '../pages/RoomReceptionRequestPage';
import ReceptionServicesPage from '../pages/ReceptionServicesPage';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import ChangePassword from '../pages/ChangePassword';
import Profile from '../pages/Profile';
import Register from '../pages/Register';
import RoomLogin from '../pages/RoomLogin';
import HotelEventsManagementPage from '../pages/HotelEventsManagementPage';
import HotelEventsPage from '../pages/HotelEventsPage';
import RoomCampaignDashboardPage from '../pages/RoomCampaignDashboardPage';
import RoomRewardsPage from '../pages/RoomRewardsPage';
import ReceptionRewardVouchersPage from '../pages/ReceptionRewardVouchersPage';
import RewardVouchersPage from '../pages/RewardVouchersPage';
import RoomVouchersPage from '../pages/RoomVouchersPage';
import PointShopPage from '../pages/PointShopPage';
import AdminSurveyPage from '../pages/AdminSurveyPage';
import AdminSurveyResultsPage from '../pages/AdminSurveyResultsPage';
import SettingsPage from '../pages/SettingsPage';
import GlobalTranslator from '../components/GlobalTranslator';
import MissingTranslationReporter from '../components/MissingTranslationReporter';

const AppRoutes = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <BrowserRouter>
            <GlobalTranslator />
            <MissingTranslationReporter />
            <Routes>
                {/* --- PUBLIC ROUTES --- */}
                <Route path="/login" element={isAuthenticated ? <Navigate to={getDashboardPathForRole(user?.role)} replace /> : <Login />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to={getDashboardPathForRole(user?.role)} replace /> : <Register />} />
                <Route path="/room-login" element={isAuthenticated ? <Navigate to={getDashboardPathForRole(user?.role)} replace /> : <RoomLogin />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* --- 🔑 THE PERSISTENT LAYOUT WRAPPER 🔑 --- */}
                {/* Every route inside this block will SHARE the same Layout instance. Points will NOT reset! */}
                <Route element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Reception', 'Staff', 'Housekeeping', 'Restaurant', 'Kitchen', 'Technic', 'Room']}><Layout><Outlet /></Layout></ProtectedRoute>}>

                    {/* Admin/Manager Routes */}
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/staff" element={<StaffManagementPage />} />
                    <Route path="/admin/departments" element={<DepartmentsPage />} />
                    <Route path="/admin/requests" element={<RequestsPage />} />
                    <Route path="/admin/rooms" element={<RoomsPage />} />
                    <Route path="/admin/rooms/create" element={<RoomCreationPage />} />
                    <Route path="/admin/service-items" element={<ServiceItemsPage />} />
                    <Route path="/admin/events" element={<HotelEventsManagementPage />} />
                    <Route path="/admin/vouchers" element={<RewardVouchersPage />} />
                    <Route path="/admin/surveys" element={<AdminSurveyPage />} />
                    <Route path="/admin/surveys/results" element={<AdminSurveyResultsPage />} />
                    <Route path="/admin/reception/services" element={<ReceptionServicesPage />} />

                    {/* Manager Specific */}
                    <Route path="/manager" element={<ManagerDashboard />} />
                    <Route path="/manager/reception/services" element={<ReceptionServicesPage />} />

                    {/* Reception Routes */}
                    <Route path="/reception" element={<ReceptionDashboard />} />
                    <Route path="/reception/requests" element={<RequestsPage />} />
                    <Route path="/reception/services" element={<ReceptionServicesPage />} />
                    <Route path="/reception/rooms" element={<RoomsPage />} />
                    <Route path="/reception/rewards" element={<ReceptionRewardVouchersPage />} />

                    {/* Staff Routes */}
                    <Route path="/staff" element={<StaffDashboard />} />
                    <Route path="/staff/requests" element={<RequestsPage />} />

                    {/* Room Dashboard Routes */}
                    <Route path="/room" element={<RoomDashboard />} />
                    <Route path="/room/create-request" element={<CreateRequestPage />} />
                    <Route path="/room/report-issue" element={<ReportIssuePage />} />
                    <Route path="/room/reception-request" element={<RoomReceptionRequestPage />} />
                    <Route path="/room/history" element={<RequestHistoryPage />} />
                    <Route path="/room/events" element={<HotelEventsPage />} />
                    <Route path="/room/campaigns" element={<RoomCampaignDashboardPage />} />
                    <Route path="/room/point-shop" element={<PointShopPage />} />
                    <Route path="/room/vouchers" element={<RoomVouchersPage />} />
                    <Route path="/room/rewards" element={<Navigate to="/room/point-shop" replace />} />

                    {/* Shared Account Routes */}
                    <Route path="/account/profile" element={<Profile />} />
                    <Route path="/account/password" element={<ChangePassword />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Route>

                {/* Default route */}
                <Route path="/" element={isAuthenticated ? <Navigate to={getDashboardPathForRole(user?.role)} replace /> : <Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to={isAuthenticated ? getDashboardPathForRole(user?.role) : '/login'} replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
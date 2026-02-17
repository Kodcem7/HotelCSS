import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getRooms } from '../api/rooms';
import { getRequests } from '../api/requests';
import { getReceptionServices } from '../api/receptionService';

const ReceptionDashboard = () => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    totalRequests: 0,
    pendingRequests: 0,
    wakeUpCount: 0,
    upcomingWakeUps: 0,
    pickupCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');

        const [roomsRes, requestsRes, receptionRes] = await Promise.all([
          getRooms(),
          getRequests(),
          getReceptionServices(),
        ]);

        const rooms = roomsRes?.data || [];
        const requests = Array.isArray(requestsRes) ? requestsRes : [];
        const reception = Array.isArray(receptionRes) ? receptionRes : receptionRes?.data ?? [];

        const wakeUps = reception.filter((r) => r.requestType === 'Wake-Up Service');
        const pickups = reception.filter((r) => r.requestType === 'Pick-Up');
        const now = new Date();
        const upcomingWakeUps = wakeUps.filter((r) => {
          if (!r.scheduledTime) return false;
          const d = new Date(r.scheduledTime);
          return d >= now;
        });

        setStats({
          totalRooms: rooms.length,
          availableRooms: rooms.filter((r) => r.status === 'Available').length,
          totalRequests: requests.length,
          pendingRequests: requests.filter((r) => r.status === 'Pending').length,
          wakeUpCount: wakeUps.length,
          upcomingWakeUps: upcomingWakeUps.length,
          pickupCount: pickups.length,
        });
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading dashboard..." />
      </Layout>
    );
  }

  return (
    <Layout>
      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rooms</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalRooms}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Rooms</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.availableRooms}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalRequests}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pendingRequests}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Wake-up Services</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">
                {stats.wakeUpCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.upcomingWakeUps} upcoming
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <svg
                className="h-8 w-8 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pick-up Infos</p>
              <p className="text-3xl font-bold text-teal-600 mt-2">
                {stats.pickupCount}
              </p>
            </div>
            <div className="p-3 bg-teal-100 rounded-full">
              <svg
                className="h-8 w-8 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7h18M3 12h18M3 17h18"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/reception/rooms"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Room Management</h3>
          <p className="text-sm text-gray-600 mb-4">View and update room status</p>
          <span className="text-blue-600 font-medium text-sm">Manage Rooms →</span>
        </Link>

        <Link
          to="/reception/requests"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Guest Requests</h3>
          <p className="text-sm text-gray-600 mb-4">View and manage guest service requests</p>
          <span className="text-blue-600 font-medium text-sm">View Requests →</span>
        </Link>

        <Link
          to="/reception/services"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Reception Services</h3>
          <p className="text-sm text-gray-600 mb-4">
            Manage wake-up services and pick-up times for guests.
          </p>
          <span className="text-blue-600 font-medium text-sm">Manage Reception →</span>
        </Link>
      </div>
    </Layout>
  );
};

export default ReceptionDashboard;

import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const RoomDashboard = () => {
  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Room Dashboard</h2>
        <p className="text-gray-600 mt-1">Manage your room service requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/room/create-request"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Create Service Request</h3>
              <p className="text-sm text-gray-600">Request room service or amenities</p>
            </div>
          </div>
        </Link>

        <Link
          to="/room/history"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">My Requests</h3>
              <p className="text-sm text-gray-600">View your service request history</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Room Information</h3>
        <p className="text-gray-600">
          This dashboard is for room-based access. Guests can scan QR codes to access room-specific features.
        </p>
      </div>
    </Layout>
  );
};

export default RoomDashboard;

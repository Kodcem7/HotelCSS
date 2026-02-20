import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { getRoom } from '../api/rooms';

const RoomDashboard = () => {
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

    useEffect(() => {
        const fetchRoomStatus = async () => {
            try {
                setLoading(true);
                setError('');

                // 2. Önce oda numarasýný bul
                const username = user?.username || '';
                const roomNumber = parseInt(username.replace('Room', ''), 10);

                // 3. SADECE bu odanýn bilgilerini çek! (Tüm oteli deðil)
                const res = await getRoom(roomNumber);

                // 4. Gelen datayý state'e kaydet
                setRoom(res?.data || null);

            } catch (err) {
                setError('Failed to load room information');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'Room') {
            fetchRoomStatus();
        } else {
            setLoading(false);
        }
    }, [user?.role, user?.username]);


  const isRoomAvailable = room && room.status === 'Available';

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading room dashboard..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Room Dashboard</h2>
        <p className="text-gray-600 mt-1">
          Manage your room service requests, reception requests and report issues
        </p>
        {room && (
          <p className="mt-2 text-sm">
            <span className="font-semibold text-gray-800">Room:</span>{' '}
            <span className="font-semibold">#{room.roomNumber}</span>{' '}
            <span
              className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                room.status === 'Occupied'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {room.status}
            </span>
          </p>
        )}
        {isRoomAvailable && (
          <p className="mt-2 text-sm text-red-600">
            This room is currently empty. Creating new requests is disabled.
          </p>
        )}
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isRoomAvailable ? (
          <div className="bg-white rounded-lg shadow p-6 opacity-60 cursor-not-allowed">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Create Service Request</h3>
                <p className="text-sm text-gray-600">
                  Not available while the room status is Available.
                </p>
              </div>
            </div>
          </div>
        ) : (
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
        )}

        {isRoomAvailable ? (
          <div className="bg-white rounded-lg shadow p-6 opacity-60 cursor-not-allowed">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 rounded-full">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a1 1 0 00.86 1.5h18.64a1 1 0 00.86-1.5L13.71 3.86a1 1 0 00-1.72 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Report an Issue</h3>
                <p className="text-sm text-gray-600">
                  Not available while the room status is Available.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Link
            to="/room/report-issue"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 rounded-full">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a1 1 0 00.86 1.5h18.64a1 1 0 00.86-1.5L13.71 3.86a1 1 0 00-1.72 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Report an Issue</h3>
                <p className="text-sm text-gray-600">Report problems in your room with photo</p>
              </div>
            </div>
          </Link>
        )}

        {isRoomAvailable ? (
          <div className="bg-white rounded-lg shadow p-6 opacity-60 cursor-not-allowed">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg
                  className="h-8 w-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1010 10A10 10 0 0012 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Reception Request</h3>
                <p className="text-sm text-gray-600">
                  Not available while the room status is Available.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Link
            to="/room/reception-request"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg
                  className="h-8 w-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1010 10A10 10 0 0012 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Reception Request</h3>
                <p className="text-sm text-gray-600">
                  Request wake-up calls or other reception services
                </p>
              </div>
            </div>
          </Link>
        )}

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

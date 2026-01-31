import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getRequests } from '../api/requests';

const StaffDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'InProcess':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading dashboard..." />
      </Layout>
    );
  }

  const myRequests = requests.filter((r) => r.status !== 'Completed' && r.status !== 'Cancelled');

  return (
    <Layout>
      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
        <p className="text-gray-600 mt-1">Service requests assigned to your department</p>
      </div>

      {myRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No pending requests</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {request.serviceItem?.name || 'Service Request'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Room {request.roomNumber}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    request.status
                  )}`}
                >
                  {request.status}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Quantity:</span> {request.quantity}
                </p>
                {request.note && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Note:</span> {request.note}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {new Date(request.requestDate).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Link
          to="/staff/requests"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          View All Requests →
        </Link>
      </div>
    </Layout>
  );
};

export default StaffDashboard;

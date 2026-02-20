import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getRequests } from '../api/requests';
import { getReceptionServices, getPickUpTime } from '../api/receptionService';
import { getBackendOrigin } from '../api/axios';

const RequestHistoryPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const getImageUrl = (path) => {
    if (!path) return null;
    const normalized = path.replace(/\\/g, '/');
    return `${getBackendOrigin()}${normalized}`;
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');

      const [requestsRes, receptionRes, pickupRes] = await Promise.all([
        getRequests(),
        // Wake-up services for this room user
        getReceptionServices().catch((err) => {
          console.error('Failed to load reception services', err);
          return [];
        }),
        // Pick-up time infos for this room user
        getPickUpTime().catch((err) => {
          console.error('Failed to load pick-up infos', err);
          return [];
        }),
      ]);

      const baseRequests = Array.isArray(requestsRes) ? requestsRes : [];
      const wakeUps = Array.isArray(receptionRes) ? receptionRes : receptionRes?.data ?? [];
      const pickups = Array.isArray(pickupRes) ? pickupRes : pickupRes?.data ?? [];

      const mappedReception = [...wakeUps, ...pickups].map((service) => {
        const isWakeUp = service.requestType === 'Wake-Up Service';
        const dateSource =
          (isWakeUp ? service.scheduledTime : service.pickUpTime) ||
          service.scheduledTime ||
          service.createdAt;

        return {
          id: `reception-${service.id}`,
          roomNumber: service.roomNumber,
          quantity: 1,
          status: service.status || 'Pending',
          type: 'Reception',
          requestDate: dateSource,
          note: service.notes,
          serviceItem: {
            name: service.requestType || 'Reception Service',
          },
        };
      });

      setRequests([...baseRequests, ...mappedReception]);
    } catch (err) {
      setError('Failed to load request history');
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
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesStatus = filterStatus === 'All' || request.status === filterStatus;
    const matchesType = filterType === 'All' || request.type === filterType;
    const matchesSearch =
      searchTerm === '' ||
      request.roomNumber?.toString().includes(searchTerm) ||
      request.serviceItem?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading request history..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Request History</h2>

        {/* Type tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { label: 'All', value: 'All' },
            { label: 'Technic', value: 'Technic' },
            { label: 'Reception', value: 'Reception' },
            { label: 'Room', value: 'Room' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilterType(tab.value)}
              className={`px-4 py-2 text-sm font-medium rounded-full border ${
                filterType === tab.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by room number or service item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="InProcess">In Process</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'All'
              ? 'No requests match your filters'
              : 'No requests found'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.serviceItem?.name || 'Service Request'}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Room:</span>{' '}
                      <span className="font-medium">#{request.roomNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Quantity:</span>{' '}
                      <span className="font-medium">{request.quantity}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>{' '}
                      <span className="font-medium">
                        {new Date(request.requestDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Time:</span>{' '}
                      <span className="font-medium">
                        {new Date(request.requestDate).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  {request.photoPath && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => setPreviewImage(getImageUrl(request.photoPath))}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        View Photo
                      </button>
                    </div>
                  )}
                  {request.note && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Note:</span> {request.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredRequests.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Showing {filteredRequests.length} of {requests.length} requests
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={() => setPreviewImage('')}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] mx-4 bg-black rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage('')}
              className="absolute top-3 right-3 z-10 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white hover:bg-black/80"
            >
              Close
            </button>
            <img
              src={previewImage}
              alt="Request"
              className="block max-h-[90vh] max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default RequestHistoryPage;

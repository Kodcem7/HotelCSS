import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import SearchBar from '../components/SearchBar';
import { getRequests, updateRequestStatus, deleteRequest } from '../api/requests';
import { getBackendOrigin } from '../api/axios';

const RequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewImage, setPreviewImage] = useState('');

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

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setError('');
      setSuccess('');
      await updateRequestStatus(id, newStatus);
      setSuccess('Request status updated successfully');
      await fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update request status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await deleteRequest(id);
      setSuccess('Request deleted successfully');
      await fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete request');
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

  const getImageUrl = (path) => {
    if (!path) return null;
    const normalized = path.replace(/\\/g, '/');
    return `${getBackendOrigin()}${normalized}`;
  };

  const filteredRequests = requests.filter((request) => {
    const matchesStatus = filterStatus === 'All' || request.status === filterStatus;
    const matchesType = filterType === 'All' || request.type === filterType;
    const matchesSearch =
      searchTerm === '' ||
      request.roomNumber?.toString().includes(searchTerm) ||
      request.serviceItem?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id?.toString().includes(searchTerm);
    return matchesStatus && matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading requests..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Guest Requests</h2>
          <div className="flex flex-wrap gap-3">
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
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Types</option>
              <option value="Technic">Technic</option>
              <option value="Reception">Reception</option>
              <option value="Room">Room</option>
            </select>
          </div>
        </div>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by room number, service item, or request ID..."
        />
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
      {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No requests found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Photo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{request.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Room {request.roomNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.type || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.serviceItem?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.photoPath ? (
                        <button
                          type="button"
                          onClick={() => setPreviewImage(getImageUrl(request.photoPath))}
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">No photo</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.requestDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {request.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(request.id, 'InProcess')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Start
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(request.id, 'Completed')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Complete
                          </button>
                        </>
                      )}
                      {request.status === 'InProcess' && (
                        <button
                          onClick={() => handleStatusUpdate(request.id, 'Completed')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(request.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

export default RequestsPage;

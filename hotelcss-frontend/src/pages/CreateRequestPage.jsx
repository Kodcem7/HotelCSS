import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { createRequest } from '../api/requests';
import { getServiceItems } from '../api/serviceItems';
import { getRooms } from '../api/rooms';
import { getBackendOrigin } from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CreateRequestPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [serviceItems, setServiceItems] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    RoomNumber: '',
    ServiceItemId: '',
    Quantity: 1,
    Note: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      // Room users only need service items; other roles also load rooms
      const itemsRes = await getServiceItems();
      setServiceItems(itemsRes?.data || []);

      if (user?.role !== 'Room') {
        const roomsRes = await getRooms();
        setRooms(roomsRes?.data || []);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const requestData = {
        ServiceItemId: parseInt(formData.ServiceItemId),
        Quantity: parseInt(formData.Quantity),
        Note: formData.Note || '',
      };

      await createRequest(requestData);
      setSuccess('Request created successfully!');
      
      // Reset form
      setFormData({
        RoomNumber: '',
        ServiceItemId: '',
        Quantity: 1,
        Note: '',
      });

      // Optionally redirect after a delay
      setTimeout(() => {
        navigate('/room');
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create request';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    return `${getBackendOrigin()}${imageUrl}`;
  };

  const selectedServiceItem = serviceItems.find(
    (item) => item.id === parseInt(formData.ServiceItemId)
  );

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Service Request</h2>

        {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
        {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {user?.role === 'Room' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Number
              </label>
              <p className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-800">
                {user?.username}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Requests will be created for this room.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Number *
              </label>
              <select
                value={formData.RoomNumber}
                onChange={(e) => setFormData({ ...formData, RoomNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Room</option>
                {rooms
                  .filter((room) => room.status === 'Occupied')
                  .map((room) => (
                    <option key={room.roomNumber} value={room.roomNumber}>
                      Room {room.roomNumber}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Item *
            </label>
            <select
              value={formData.ServiceItemId}
              onChange={(e) => setFormData({ ...formData, ServiceItemId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Service Item</option>
              {serviceItems
                .filter((item) => item.isAvailable)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} {item.price ? `- $${parseFloat(item.price).toFixed(2)}` : ''}
                  </option>
                ))}
            </select>
          </div>

          {selectedServiceItem && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-4">
                {selectedServiceItem.imageUrl && (
                  <img
                    src={getImageUrl(selectedServiceItem.imageUrl)}
                    alt={selectedServiceItem.name}
                    className="w-24 h-24 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{selectedServiceItem.name}</h3>
                  {selectedServiceItem.description && (
                    <p className="text-sm text-gray-600 mt-1">{selectedServiceItem.description}</p>
                  )}
                  {selectedServiceItem.price && (
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      ${parseFloat(selectedServiceItem.price).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity * (1-5)
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={formData.Quantity}
              onChange={(e) => setFormData({ ...formData, Quantity: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">You can order between 1 and 5 items</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Notes (Optional)
            </label>
            <textarea
              value={formData.Note}
              onChange={(e) => setFormData({ ...formData, Note: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
              placeholder="Any special instructions or requests..."
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/room')}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateRequestPage;

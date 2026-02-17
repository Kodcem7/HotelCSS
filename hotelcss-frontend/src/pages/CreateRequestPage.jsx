import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { createRequest, getRequestDepartments, getServicesByDepartment } from '../api/requests';
import { getServiceItems } from '../api/serviceItems';
import { getRooms } from '../api/rooms';
import { getBackendOrigin } from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CreateRequestPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [serviceItems, setServiceItems] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  /** For Room user: selected department (null = show department picker, number = show service form) */
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [selectedDepartmentName, setSelectedDepartmentName] = useState('');
  const [formData, setFormData] = useState({
    RoomNumber: '',
    ServiceItemId: '',
    Quantity: 1,
    Note: '',
  });

  const isRoomUser = user?.role === 'Room';

  useEffect(() => {
    fetchData();
  }, [user?.role]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      if (isRoomUser) {
        const deptsRes = await getRequestDepartments();
        setDepartments(Array.isArray(deptsRes) ? deptsRes : deptsRes?.data ?? []);
        setServiceItems([]);
      } else {
        const itemsRes = await getServiceItems();
        setServiceItems(itemsRes?.data || []);
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

  const handleSelectDepartment = async (dept) => {
    setSelectedDepartmentId(dept.id);
    setSelectedDepartmentName(dept.departmentName || dept.DepartmentName || '');
    setError('');
    try {
      setLoadingServices(true);
      const items = await getServicesByDepartment(dept.id);
      setServiceItems(Array.isArray(items) ? items : items?.data ?? []);
      setFormData((prev) => ({ ...prev, ServiceItemId: '' }));
    } catch (err) {
      setError('Failed to load services for this department');
      setServiceItems([]);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleChangeDepartment = () => {
    setSelectedDepartmentId(null);
    setSelectedDepartmentName('');
    setServiceItems([]);
    setFormData((prev) => ({ ...prev, ServiceItemId: '' }));
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

  /** Room user: show department picker first (no department selected yet) */
  const showDepartmentPicker = isRoomUser && selectedDepartmentId == null;

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

        {/* Room user: step 1 – choose department (with photos) */}
        {showDepartmentPicker && (
          <div className="mb-8">
            <p className="text-gray-600 mb-4">Choose a department to see available services.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {departments.map((dept) => {
                const name = dept.departmentName ?? dept.DepartmentName ?? 'Department';
                const imgUrl = dept.imageUrl ?? dept.ImageUrl;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => handleSelectDepartment(dept)}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden text-left border border-gray-100 hover:border-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <div className="aspect-video bg-gray-100 relative">
                      {imgUrl ? (
                        <img
                          src={getImageUrl(imgUrl)}
                          alt={name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">📋</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900">{name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">Tap to select services</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {departments.length === 0 && !loading && (
              <p className="text-gray-500">No departments available for requests.</p>
            )}
          </div>
        )}

        {/* Room user: step 2 – request form (after department selected) */}
        {isRoomUser && selectedDepartmentId != null && (
          <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
            <p className="text-gray-600">
              Department: <span className="font-semibold text-gray-900">{selectedDepartmentName}</span>
            </p>
            <button
              type="button"
              onClick={handleChangeDepartment}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Change department
            </button>
          </div>
        )}

        {loadingServices && (
          <div className="mb-6">
            <LoadingSpinner text="Loading services..." />
          </div>
        )}

        {!showDepartmentPicker && !loadingServices && isRoomUser && serviceItems.length === 0 && selectedDepartmentId != null && (
          <p className="text-gray-500 bg-gray-50 rounded-lg p-4">No services available for this department. Use &quot;Change department&quot; above to pick another.</p>
        )}

        {!showDepartmentPicker && (!isRoomUser || serviceItems.length > 0) && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {isRoomUser ? (
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
                  {selectedServiceItem.requiredOptions && (
                    <p className="text-xs text-gray-500 mt-2">
                      Required options: {selectedServiceItem.requiredOptions}
                    </p>
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
        )}
      </div>
    </Layout>
  );
};

export default CreateRequestPage;

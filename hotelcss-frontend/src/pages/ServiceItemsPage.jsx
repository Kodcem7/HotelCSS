import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { getServiceItems, createServiceItem, updateServiceItem, deleteServiceItem } from '../api/serviceItems';
import { getDepartments } from '../api/departments';
import { getBackendOrigin } from '../api/axios';

const ServiceItemsPage = () => {
  const [serviceItems, setServiceItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    Name: '',
    Description: '',
    Price: '',
    DepartmentId: '',
    IsAvailable: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [filterDept, setFilterDept] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [itemsRes, deptRes] = await Promise.all([
        getServiceItems(),
        getDepartments(),
      ]);
      setServiceItems(itemsRes?.data || []);
      setDepartments(Array.isArray(deptRes) ? deptRes : []);
    } catch (err) {
      setError('Failed to load service items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        Name: item.name || '',
        Description: item.description || '',
        Price: item.price || '',
        DepartmentId: item.departmentId || '',
        IsAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      });
      setImagePreview(item.imageUrl ? `${getBackendOrigin()}${item.imageUrl}` : null);
    } else {
      setEditingItem(null);
      setFormData({
        Name: '',
        Description: '',
        Price: '',
        DepartmentId: '',
        IsAvailable: true,
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      Name: '',
      Description: '',
      Price: '',
      DepartmentId: '',
      IsAvailable: true,
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      const formDataToSend = new FormData();
      formDataToSend.append('Name', formData.Name);
      formDataToSend.append('Description', formData.Description || '');
      formDataToSend.append('Price', formData.Price || '0');
      formDataToSend.append('DepartmentId', formData.DepartmentId);
      formDataToSend.append('IsAvailable', formData.IsAvailable);
      if (imageFile) {
        formDataToSend.append('file', imageFile);
      }

      if (editingItem) {
        await updateServiceItem(editingItem.id, formDataToSend);
        setSuccess('Service item updated successfully');
      } else {
        await createServiceItem(formDataToSend);
        setSuccess('Service item created successfully');
      }

      handleCloseModal();
      await fetchData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Operation failed';
      setError(errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service item?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await deleteServiceItem(id);
      setSuccess('Service item deleted successfully');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete service item');
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    return `${getBackendOrigin()}${imageUrl}`;
  };

  const getDepartmentName = (departmentId) => {
    const dept = departments.find((d) => d.id === departmentId);
    return dept?.departmentName || 'Unknown';
  };

  const filteredItems =
    filterDept === 'All'
      ? serviceItems
      : serviceItems.filter((item) => item.departmentId === parseInt(filterDept));

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading service items..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Service Items Management</h2>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Add Service Item
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="All">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.departmentName}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
      {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No service items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
              {item.imageUrl && (
                <img
                  src={getImageUrl(item.imageUrl)}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      item.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{getDepartmentName(item.departmentId)}</p>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                )}
                {item.price && (
                  <p className="text-lg font-bold text-gray-900 mb-4">
                    ${parseFloat(item.price).toFixed(2)}
                  </p>
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingItem ? 'Edit Service Item' : 'Add Service Item'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  value={formData.DepartmentId}
                  onChange={(e) => setFormData({ ...formData, DepartmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.departmentName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.Description}
                  onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.Price}
                  onChange={(e) => setFormData({ ...formData, Price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.IsAvailable}
                    onChange={(e) => setFormData({ ...formData, IsAvailable: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Available</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2 w-full h-48 object-cover rounded-lg"
                  />
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ServiceItemsPage;

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
    RequiredOptions: '',
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
        RequiredOptions: item.requiredOptions || '',
      });
      setImagePreview(item.imageUrl ? getImageUrl(item.imageUrl) : null);
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
      RequiredOptions: '',
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
      formDataToSend.append('RequiredOptions', formData.RequiredOptions || '');
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
    const normalized = imageUrl.replace(/\\/g, '/');
    return `${getBackendOrigin()}${normalized}`;
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
      <div className="p-10 space-y-8 max-w-7xl mx-auto">
        <section className="text-center max-w-3xl mx-auto">
          <h2 className="font-headline text-[52px] text-[#4A3728] mb-2 font-bold leading-tight">
            Service Items
          </h2>
          <p className="text-[14px] text-[#5D534A] leading-relaxed">
            Create and manage service items by department.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-[12px] uppercase tracking-widest bg-[#4A3728] text-white hover:bg-[#3a2b20] transition shadow-sm"
            >
              Add Service Item <span className="material-symbols-outlined text-sm">add</span>
            </button>
          </div>
        </section>

        <div className="max-w-5xl mx-auto w-full space-y-4">
          {/* Filter */}
          <div className="flex justify-center">
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E] text-sm"
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
        </div>

      {filteredItems.length === 0 ? (
        <div className="max-w-5xl mx-auto bg-[#FDFBF7] p-10 rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] text-center text-[#5D534A]">
          No service items found
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#FDFBF7] rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] overflow-hidden"
            >
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
              <div className="p-6 text-center">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-headline text-2xl font-bold text-[#4A3728] text-left">
                    {item.name}
                  </h3>
                  <span
                    className={`px-3 py-1 text-[11px] font-bold rounded-full ${
                      item.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <p className="text-sm text-[#8E735B] mb-2">
                  {getDepartmentName(item.departmentId)}
                </p>
                {item.requiredOptions && (
                  <p className="text-xs text-[#5D534A] mb-2">
                    <span className="font-semibold">Required options:</span> {item.requiredOptions}
                  </p>
                )}
                {item.description && (
                  <p className="text-sm text-[#5D534A] mb-3">{item.description}</p>
                )}
                {item.price && (
                  <p className="text-lg font-extrabold text-[#4A3728] mb-5">
                    ${parseFloat(item.price).toFixed(2)}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenModal(item)}
                    className="flex-1 px-4 py-3 bg-[#D35400] text-white rounded-2xl hover:bg-[#b94702] transition text-xs font-bold uppercase tracking-widest"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 px-4 py-3 bg-[#F2EBE1] text-[#4A3728] rounded-2xl hover:bg-[#E8DFD1] transition text-xs font-bold uppercase tracking-widest border border-[#E3DCD2]/40"
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
          <div className="bg-[#FDFBF7] rounded-[28px] border border-[#E3DCD2]/40 shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-headline text-2xl font-bold text-[#4A3728] mb-4">
              {editingItem ? 'Edit Service Item' : 'Add Service Item'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#4A3728] mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#4A3728] mb-1">
                  Department *
                </label>
                <select
                  value={formData.DepartmentId}
                  onChange={(e) => setFormData({ ...formData, DepartmentId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
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
                <label className="block text-sm font-semibold text-[#4A3728] mb-1">
                  Description
                </label>
                <textarea
                  value={formData.Description}
                  onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#4A3728] mb-1">
                  Required Options (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.RequiredOptions}
                  onChange={(e) =>
                    setFormData({ ...formData, RequiredOptions: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
                  placeholder="e.g. Ice, Lemon"
                />
                <p className="text-xs text-[#8E735B] mt-1">
                  These options will be used by the chatbot to ask for missing details.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#4A3728] mb-1">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.Price}
                  onChange={(e) => setFormData({ ...formData, Price: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
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
                  <span className="text-sm font-semibold text-[#4A3728]">Available</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#4A3728] mb-1">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2 w-full h-48 object-cover rounded-2xl border border-[#E3DCD2]/40"
                  />
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#4A3728] text-white py-3 px-4 rounded-2xl hover:bg-[#3a2b20] transition font-semibold"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-[#F2EBE1] text-[#4A3728] py-3 px-4 rounded-2xl hover:bg-[#E8DFD1] transition font-semibold border border-[#E3DCD2]/40"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
};

export default ServiceItemsPage;

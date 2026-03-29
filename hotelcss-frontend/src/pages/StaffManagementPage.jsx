import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { getStaffList, createUser, updateUser, deleteUser } from '../api/users';
import { getDepartments } from '../api/departments';

const StaffManagementPage = () => {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    UserName: '',
    Password: '',
    Name: '',
    Email: '',
    DepartmentId: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [staffRes, deptRes] = await Promise.all([
        getStaffList(),
        getDepartments(),
      ]);
      setStaff(staffRes?.data || []);
      setDepartments(Array.isArray(deptRes) ? deptRes : []);
    } catch (err) {
      setError('Failed to load staff data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (staffMember = null) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({
        Id: staffMember.id,
        UserName: staffMember.userName || '',
        Password: '', // Don't pre-fill password
        Name: staffMember.name || '',
        Email: staffMember.email || '',
        DepartmentId: staffMember.departmentId || 0,
      });
    } else {
      setEditingStaff(null);
      setFormData({
        UserName: '',
        Password: '',
        Name: '',
        Email: '',
        DepartmentId: 0,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStaff(null);
    setFormData({
      UserName: '',
      Password: '',
      Name: '',
      Email: '',
      DepartmentId: 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      if (editingStaff) {
        // Update existing staff
        await updateUser(editingStaff.id, formData);
        setSuccess('Staff member updated successfully');
      } else {
        // Create new staff
        if (!formData.Password) {
          setError('Password is required for new staff members');
          return;
        }
        await createUser(formData);
        setSuccess('Staff member created successfully');
      }

      handleCloseModal();
      await fetchData();
    } catch (err) {
      let errorMsg = err.response?.data?.message;
      if (!errorMsg && err.response?.data) {
        const data = err.response.data;
        if (Array.isArray(data)) {
          // Identity validation errors: [{ code, description }] or [{ Code, Description }]
          errorMsg = data.map((e) => e.description || e.Description || e.code || e.Code || String(e)).join('. ');
        } else if (typeof data === 'object' && data !== null && data.errors) {
          // ASP.NET Core validation: { title, status, errors: { "Field": ["msg1", "msg2"] } }
          const parts = Object.entries(data.errors).flatMap(([field, messages]) =>
            (Array.isArray(messages) ? messages : [messages]).map((m) =>
              field ? `${field}: ${m}` : m
            )
          );
          errorMsg = parts.length ? parts.join(' ') : data.title || null;
        } else if (typeof data === 'object' && data !== null && !data.message) {
          // Other object: use title or flatten (skip type/status to avoid [object Object])
          const skipKeys = ['type', 'status', 'traceId', 'errors'];
          const parts = Object.entries(data)
            .filter(([k]) => !skipKeys.includes(k))
            .flatMap(([, v]) => (Array.isArray(v) ? v : [v]))
            .filter((x) => typeof x === 'string' || (typeof x === 'object' && x !== null && (x.description || x.Description)))
            .map((x) => (typeof x === 'string' ? x : x.description || x.Description));
          errorMsg = parts.length ? parts.join('. ') : data.title || null;
        }
      }
      setError(errorMsg || err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await deleteUser(id);
      setSuccess('Staff member deleted successfully');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete staff member');
    }
  };

  const getDepartmentName = (departmentId) => {
    if (!departmentId || departmentId === 0) return 'Admin';
    const dept = departments.find((d) => d.id === departmentId);
    return dept?.departmentName || 'Unknown';
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading staff..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-10 space-y-8 max-w-7xl mx-auto">
        <section className="text-center max-w-3xl mx-auto">
          <h2 className="font-headline text-[52px] text-[#4A3728] mb-2 font-bold leading-tight">
            Staff Management
          </h2>
          <p className="text-[14px] text-[#5D534A] leading-relaxed">
            View, create, and manage staff members.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-[12px] uppercase tracking-widest bg-[#4A3728] text-white hover:bg-[#3a2b20] transition shadow-sm"
            >
              Add Staff Member <span className="material-symbols-outlined text-sm">add</span>
            </button>
          </div>
        </section>

        <div className="max-w-5xl mx-auto w-full">
          {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
          {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}
        </div>

        {staff.length === 0 ? (
          <div className="max-w-5xl mx-auto bg-[#FDFBF7] p-10 rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] text-center text-[#5D534A]">
            No staff members found
          </div>
        ) : (
          <div className="max-w-5xl mx-auto bg-[#FDFBF7] rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E3DCD2]/50">
                <thead className="bg-[#F2EBE1]/55">
                <tr>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-[#8E735B] uppercase tracking-widest">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-[#8E735B] uppercase tracking-widest">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-[#8E735B] uppercase tracking-widest">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-[#8E735B] uppercase tracking-widest">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-[#8E735B] uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCD2]/40">
                {staff.map((member) => (
                  <tr key={member.id} className="hover:bg-[#F2EBE1]/35">
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] font-semibold text-[#4A3728]">
                      {member.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-[#2C241E]">
                      {member.userName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-[#2C241E]">
                      {member.email || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-[#2C241E]">
                      {getDepartmentName(member.departmentId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] font-semibold space-x-3">
                      <button
                        onClick={() => handleOpenModal(member)}
                        className="text-[#D35400] hover:text-[#4A3728] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="text-[#B22222] hover:text-[#4A3728] transition-colors"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#FDFBF7] rounded-[28px] border border-[#E3DCD2]/40 shadow-2xl max-w-md w-full p-6">
            <h3 className="font-headline text-2xl font-bold text-[#4A3728] mb-4">
              {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#4A3728] mb-1">
                  Full Name *
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
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.UserName}
                  onChange={(e) => setFormData({ ...formData, UserName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#4A3728] mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.Email}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#4A3728] mb-1">
                  Password {editingStaff ? '(leave blank to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.Password}
                  onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
                  required={!editingStaff}
                  minLength={6}
                />
                {editingStaff && (
                  <p className="text-xs text-[#8E735B] mt-1">
                    Minimum 6 characters, must include uppercase, lowercase, digit, and special character
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#4A3728] mb-1">
                  Department
                </label>
                <select
                  value={formData.DepartmentId}
                  onChange={(e) => setFormData({ ...formData, DepartmentId: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
                >
                  <option value={0}>Admin (No Department)</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.departmentName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#4A3728] text-white py-3 px-4 rounded-2xl hover:bg-[#3a2b20] transition font-semibold"
                >
                  {editingStaff ? 'Update' : 'Create'}
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

export default StaffManagementPage;

import { useState, useEffect } from 'react';
// import Layout from '../components/Layout'; // ❌ REMOVED
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../api/departments';
import { getBackendOrigin } from '../api/axios';

const DepartmentsPage = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [formData, setFormData] = useState({
        DepartmentName: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getDepartments();
            setDepartments(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to load departments');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (dept = null) => {
        if (dept) {
            setEditingDept(dept);
            setFormData({ DepartmentName: dept.departmentName || '' });
            setImagePreview(dept.imageUrl ? `${getBackendOrigin()}${dept.imageUrl}` : null);
        } else {
            setEditingDept(null);
            setFormData({ DepartmentName: '' });
            setImagePreview(null);
        }
        setImageFile(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingDept(null);
        setFormData({ DepartmentName: '' });
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
            formDataToSend.append('DepartmentName', formData.DepartmentName);
            if (imageFile) {
                formDataToSend.append('Image', imageFile);
            }

            if (editingDept) {
                await updateDepartment(editingDept.id, formDataToSend);
                setSuccess('Department updated successfully');
            } else {
                await createDepartment(formDataToSend);
                setSuccess('Department created successfully');
            }

            handleCloseModal();
            await fetchDepartments();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Operation failed';
            setError(errorMsg);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this department?')) {
            return;
        }

        try {
            setError('');
            setSuccess('');
            await deleteDepartment(id);
            setSuccess('Department deleted successfully');
            await fetchDepartments();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete department');
        }
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        return `${getBackendOrigin()}${imageUrl}`;
    };

    if (loading) {
        // ✅ No Layout here
        return <LoadingSpinner text="Loading departments..." />;
    }

    return (
        <> {/* ✅ Replaced <Layout> with Fragment */}
            <div className="p-4 sm:p-10 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
                <section className="text-center max-w-3xl mx-auto">
                    <h2 className="font-headline text-[clamp(30px,6vw,52px)] text-[#4A3728] mb-2 font-bold leading-tight">
                        Department Management
                    </h2>
                    <p className="text-[14px] text-[#5D534A] leading-relaxed">
                        Create departments and manage their images.
                    </p>
                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={() => handleOpenModal()}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-[12px] uppercase tracking-widest bg-[#4A3728] text-white hover:bg-[#3a2b20] transition shadow-sm"
                        >
                            Add Department <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                    </div>
                </section>

                <div className="max-w-5xl mx-auto w-full">
                    {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
                    {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}
                </div>

                {departments.length === 0 ? (
                    <div className="max-w-5xl mx-auto bg-[#FDFBF7] p-6 sm:p-10 rounded-[22px] sm:rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] text-center text-[#5D534A]">
                        No departments found
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {departments.map((dept) => (
                            <div
                                key={dept.id}
                                className="bg-[#FDFBF7] rounded-[22px] sm:rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] overflow-hidden"
                            >
                                {dept.imageUrl && (
                                    <img
                                        src={getImageUrl(dept.imageUrl)}
                                        alt={dept.departmentName}
                                        className="w-full h-48 object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                )}
                                <div className="p-6 text-center">
                                    <h3 className="font-headline text-2xl font-bold text-[#4A3728] mb-1">
                                        {dept.departmentName}
                                    </h3>
                                    <p className="text-xs text-[#8E735B]">
                                        ID: {dept.id}
                                    </p>
                                    <div className="flex gap-2 mt-5">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenModal(dept)}
                                            className="flex-1 px-4 py-3 bg-[#D35400] text-white rounded-2xl hover:bg-[#b94702] transition text-xs font-bold uppercase tracking-widest"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(dept.id)}
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
                                {editingDept ? 'Edit Department' : 'Add Department'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-[#4A3728] mb-1">
                                        Department Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.DepartmentName}
                                        onChange={(e) => setFormData({ ...formData, DepartmentName: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#4A3728] mb-1">
                                        Department Image
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
                                        {editingDept ? 'Update' : 'Create'}
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
        </>
    );
};

export default DepartmentsPage;
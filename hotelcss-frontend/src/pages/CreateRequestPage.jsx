import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import Layout from '../components/Layout'; // ❌ REMOVED
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { createRequest, getServicesByDepartment } from '../api/requests';
import { getServiceItems } from '../api/serviceItems';
import { getRooms } from '../api/rooms';
import { getDepartments } from '../api/departments';
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
    const isAllowedRequestDepartment = (dept) => {
        const rawName = dept?.departmentName ?? dept?.DepartmentName ?? '';
        const normalizedName = rawName.toLowerCase();
        return !(
            normalizedName.includes('admin') ||
            normalizedName.includes('manager') ||
            normalizedName.includes('administration') ||
            normalizedName.includes('room') ||
            normalizedName.includes('technic')
        );
    };

    useEffect(() => {
        fetchData();
    }, [user?.role]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            if (isRoomUser) {
                const deptsRes = await getDepartments();
                const allDepartments = Array.isArray(deptsRes) ? deptsRes : deptsRes?.data ?? [];
                setDepartments(allDepartments.filter(isAllowedRequestDepartment));
                setServiceItems([]);
            } else {
                const [itemsRes, roomsRes, deptsRes] = await Promise.all([
                    getServiceItems(),
                    getRooms(),
                    getDepartments(),
                ]);
                setServiceItems(itemsRes?.data || []);
                setRooms(roomsRes?.data || []);
                setDepartments(Array.isArray(deptsRes) ? deptsRes : deptsRes?.data ?? []);
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

    const getRequestType = () => {
        if (isRoomUser && selectedDepartmentName) {
            const deptName = selectedDepartmentName.toLowerCase();
            if (deptName.includes('technic')) return 'Technic';
            if (deptName.includes('reception')) return 'Reception';
            return 'Room';
        }

        if (selectedServiceItem && departments.length > 0) {
            const department = departments.find(
                (dept) => dept.id === selectedServiceItem.departmentId
            );
            if (department) {
                const deptName = (department.departmentName || department.DepartmentName || '').toLowerCase();
                if (deptName.includes('technic')) return 'Technic';
                if (deptName.includes('reception')) return 'Reception';
            }
        }

        return 'Room';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError('');
            setSuccess('');

            const requestType = getRequestType();

            const requestData = {
                ServiceItemId: parseInt(formData.ServiceItemId),
                Quantity: parseInt(formData.Quantity),
                Note: formData.Note || '',
                Type: requestType,
            };

            await createRequest(requestData);
            setSuccess('Request created successfully!');

            setFormData({
                RoomNumber: '',
                ServiceItemId: '',
                Quantity: 1,
                Note: '',
            });

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
        const normalized = imageUrl.replace(/\\/g, '/');
        return `${getBackendOrigin()}${normalized}`;
    };

    const selectedServiceItem = serviceItems.find(
        (item) => item.id === parseInt(formData.ServiceItemId)
    );

    const showDepartmentPicker = isRoomUser && selectedDepartmentId == null;

    if (loading) {
        // ✅ Replaced Layout wrapper
        return <LoadingSpinner text="Loading..." />;
    }

    return (
        <> {/* ✅ Replaced <Layout> with Fragment */}
            <div className="p-10 space-y-10 max-w-7xl mx-auto">
                <section>
                    <h2 className="font-headline text-[52px] text-[#4A3728] mb-2 font-bold leading-tight">
                        Create Service Request
                    </h2>
                    <p className="text-[14px] text-[#5D534A] leading-relaxed">
                        Choose a department, then pick a service and submit your request.
                    </p>
                </section>

                <div className="max-w-3xl mx-auto w-full">
                    {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
                    {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}
                </div>

                {showDepartmentPicker && (
                    <section className="space-y-4">
                        <p className="text-[#5D534A]">Choose a department to see available services.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {departments.map((dept) => {
                                const name = dept.departmentName ?? dept.DepartmentName ?? 'Department';
                                const imgUrl = dept.imageUrl ?? dept.ImageUrl;
                                return (
                                    <button
                                        key={dept.id}
                                        type="button"
                                        onClick={() => handleSelectDepartment(dept)}
                                        className="bg-[#F2EBE1] rounded-[28px] hover:bg-white transition overflow-hidden text-left border border-[#E3DCD2]/20 hover:border-[#E3DCD2]/40 shadow-none hover:shadow-[0_25px_55px_rgba(15,28,44,0.08)] focus:outline-none"
                                    >
                                        <div className="aspect-video bg-[#FDFBF7] relative">
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
                                                <div className="w-full h-full flex items-center justify-center text-[#8E735B]">
                                                    <span className="material-symbols-outlined text-5xl">apartment</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-headline text-xl text-[#4A3728] font-bold leading-tight">{name}</h3>
                                            <p className="text-[13px] text-[#5D534A] mt-1">Tap to select services</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {departments.length === 0 && !loading && (
                            <p className="text-[#8E735B]">No departments available for requests.</p>
                        )}
                    </section>
                )}

                {isRoomUser && selectedDepartmentId != null && (
                    <div className="flex items-center justify-between flex-wrap gap-3 max-w-3xl mx-auto">
                        <p className="text-[#5D534A]">
                            Department: <span className="font-semibold text-[#4A3728]">{selectedDepartmentName}</span>
                        </p>
                        <button
                            type="button"
                            onClick={handleChangeDepartment}
                            className="text-[11px] font-bold uppercase tracking-widest text-[#D35400] hover:text-[#4A3728] transition-colors"
                        >
                            Change department
                        </button>
                    </div>
                )}

                {loadingServices && (
                    <LoadingSpinner text="Loading services..." />
                )}

                {!showDepartmentPicker && !loadingServices && isRoomUser && serviceItems.length === 0 && selectedDepartmentId != null && (
                    <div className="bg-[#FDFBF7] p-6 rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] max-w-3xl mx-auto">
                        <p className="text-[#5D534A]">
                            No services available for this department. Use <span className="font-semibold text-[#4A3728]">Change department</span> above to pick another.
                        </p>
                    </div>
                )}

                {!showDepartmentPicker && (!isRoomUser || serviceItems.length > 0) && (
                    <form onSubmit={handleSubmit} className="bg-[#FDFBF7] rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] p-8 space-y-6 max-w-3xl mx-auto">
                        {isRoomUser ? (
                            <div>
                                <label className="block text-sm font-semibold text-[#4A3728] mb-1">
                                    Room Number
                                </label>
                                <p className="px-4 py-3 border border-[#E3DCD2]/50 rounded-2xl bg-[#F2EBE1]/55 text-[#2C241E] font-semibold">
                                    {user?.username}
                                </p>
                                <p className="text-xs text-[#8E735B] mt-1">
                                    Requests will be created for this room.
                                </p>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-semibold text-[#4A3728] mb-2">
                                    Room Number *
                                </label>
                                <select
                                    value={formData.RoomNumber}
                                    onChange={(e) => setFormData({ ...formData, RoomNumber: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
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
                            <label className="block text-sm font-semibold text-[#4A3728] mb-2">
                                Service Item *
                            </label>
                            <select
                                value={formData.ServiceItemId}
                                onChange={(e) => setFormData({ ...formData, ServiceItemId: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
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
                            <div className="bg-[#F2EBE1]/55 rounded-[28px] border border-[#E3DCD2]/30 p-6">
                                <div className="flex items-start space-x-4">
                                    {selectedServiceItem.imageUrl && (
                                        <img
                                            src={getImageUrl(selectedServiceItem.imageUrl)}
                                            alt={selectedServiceItem.name}
                                            className="w-24 h-24 object-cover rounded-2xl border border-[#E3DCD2]/40"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-headline text-xl text-[#4A3728] font-bold leading-tight">{selectedServiceItem.name}</h3>
                                        {selectedServiceItem.description && (
                                            <p className="text-[14px] text-[#5D534A] mt-2 leading-relaxed">{selectedServiceItem.description}</p>
                                        )}
                                        {selectedServiceItem.requiredOptions && (
                                            <p className="text-xs text-[#8E735B] mt-2">
                                                Required options: {selectedServiceItem.requiredOptions}
                                            </p>
                                        )}
                                        {selectedServiceItem.price && (
                                            <p className="text-lg font-bold text-[#4A3728] mt-3">
                                                ${parseFloat(selectedServiceItem.price).toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-[#4A3728] mb-2">
                                Quantity * (1-5)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={formData.Quantity}
                                onChange={(e) => setFormData({ ...formData, Quantity: parseInt(e.target.value) || 1 })}
                                className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
                                required
                            />
                            <p className="text-xs text-[#8E735B] mt-1">You can order between 1 and 5 items</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#4A3728] mb-2">
                                Special Notes (Optional)
                            </label>
                            <textarea
                                value={formData.Note}
                                onChange={(e) => setFormData({ ...formData, Note: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
                                rows="4"
                                placeholder="Any special instructions or requests..."
                            />
                        </div>

                        <div className="flex space-x-4 pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-[#4A3728] text-white py-3 px-4 rounded-2xl hover:bg-[#3a2b20] transition disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
                            >
                                {submitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/room')}
                                className="flex-1 bg-[#F2EBE1] text-[#4A3728] py-3 px-4 rounded-2xl hover:bg-[#E8DFD1] transition font-semibold border border-[#E3DCD2]/40"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
};

export default CreateRequestPage;
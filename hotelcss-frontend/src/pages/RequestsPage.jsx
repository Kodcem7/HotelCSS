import { useState, useEffect } from 'react';
// import Layout from '../components/Layout'; // ❌ REMOVED
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
    const [sortConfig, setSortConfig] = useState({ key: 'requestDate', direction: 'desc' });

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
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'InProcess': return 'bg-blue-100 text-blue-800';
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
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

    const sortedRequests = [...filteredRequests].sort((a, b) => {
        if (!sortConfig?.key) return 0;

        const { key, direction } = sortConfig;
        const dir = direction === 'asc' ? 1 : -1;

        let aVal = a[key];
        let bVal = b[key];

        if (key.includes('.')) {
            const [root, child] = key.split('.');
            aVal = a[root]?.[child];
            bVal = b[root]?.[child];
        }

        if (key === 'requestDate') {
            const aTime = new Date(a.requestDate).getTime();
            const bTime = new Date(b.requestDate).getTime();
            return (aTime - bTime) * dir;
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return (aVal - bVal) * dir;
        }

        const aStr = (aVal ?? '').toString().toLowerCase();
        const bStr = (bVal ?? '').toString().toLowerCase();
        if (aStr < bStr) return -1 * dir;
        if (aStr > bStr) return 1 * dir;
        return 0;
    });

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return '↕';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    if (loading) {
        // ✅ Layout removed from loading state
        return <LoadingSpinner text="Loading requests..." />;
    }

    return (
        <> {/* ✅ Replaced <Layout> with Fragment */}
            <div className="p-10 space-y-8 max-w-7xl mx-auto">
                <section className="text-center max-w-3xl mx-auto">
                    <h2 className="font-headline text-[52px] text-[#4A3728] mb-2 font-bold leading-tight">
                        Guest Requests
                    </h2>
                    <p className="text-[14px] text-[#5D534A] leading-relaxed">
                        Filter, review, and update guest requests.
                    </p>
                </section>

                <div className="max-w-5xl mx-auto w-full space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                        <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E] text-sm"
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
                                className="px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E] text-sm"
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

                <div className="max-w-5xl mx-auto w-full">
                    {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
                    {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}
                </div>

                {filteredRequests.length === 0 ? (
                    <div className="max-w-5xl mx-auto bg-[#FDFBF7] p-10 rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] text-center text-[#5D534A]">
                        No requests found
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto bg-[#FDFBF7] rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E3DCD2]/50">
                                <thead className="bg-[#F2EBE1]/55">
                                    <tr>
                                        <th
                                            className="px-6 py-3 text-left text-[11px] font-bold text-[#8E735B] uppercase tracking-widest cursor-pointer select-none"
                                            onClick={() => handleSort('id')}
                                        >
                                            ID <span className="text-[#8E735B]/60">{getSortIcon('id')}</span>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-[11px] font-bold text-[#8E735B] uppercase tracking-widest cursor-pointer select-none"
                                            onClick={() => handleSort('roomNumber')}
                                        >
                                            Room <span className="text-[#8E735B]/60">{getSortIcon('roomNumber')}</span>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-[11px] font-bold text-[#8E735B] uppercase tracking-widest cursor-pointer select-none"
                                            onClick={() => handleSort('type')}
                                        >
                                            Type <span className="text-[#8E735B]/60">{getSortIcon('type')}</span>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-[11px] font-bold text-[#8E735B] uppercase tracking-widest cursor-pointer select-none"
                                            onClick={() => handleSort('serviceItem.name')}
                                        >
                                            Service Item{' '}
                                            <span className="text-[#8E735B]/60">{getSortIcon('serviceItem.name')}</span>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-[11px] font-bold text-[#8E735B] uppercase tracking-widest cursor-pointer select-none"
                                            onClick={() => handleSort('quantity')}
                                        >
                                            Quantity <span className="text-[#8E735B]/60">{getSortIcon('quantity')}</span>
                                        </th>
                                        <th className="px-6 py-3 text-left text-[11px] font-bold text-[#8E735B] uppercase tracking-widest">
                                            Photo
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-[11px] font-bold text-[#8E735B] uppercase tracking-widest cursor-pointer select-none"
                                            onClick={() => handleSort('status')}
                                        >
                                            Status <span className="text-[#8E735B]/60">{getSortIcon('status')}</span>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-[11px] font-bold text-[#8E735B] uppercase tracking-widest cursor-pointer select-none"
                                            onClick={() => handleSort('requestDate')}
                                        >
                                            Date <span className="text-[#8E735B]/60">{getSortIcon('requestDate')}</span>
                                        </th>
                                        <th className="px-6 py-3 text-left text-[11px] font-bold text-[#8E735B] uppercase tracking-widest">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E3DCD2]/40">
                                    {sortedRequests.map((request) => (
                                        <tr key={request.id} className="hover:bg-[#F2EBE1]/35">
                                            <td className="px-6 py-4 whitespace-nowrap text-[13px] font-semibold text-[#4A3728]">
                                                #{request.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-[13px] text-[#2C241E]">
                                                Room {request.roomNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-[13px] text-[#2C241E]">
                                                {request.type || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-[13px] text-[#2C241E]">
                                                {request.serviceItem?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-[13px] text-[#2C241E]">
                                                {request.quantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-[13px] text-[#2C241E]">
                                                {request.photoPath ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewImage(getImageUrl(request.photoPath))}
                                                        className="text-[#D35400] hover:text-[#4A3728] transition-colors font-semibold"
                                                    >
                                                        View
                                                    </button>
                                                ) : (
                                                    <span className="text-[#8E735B] text-xs">No photo</span>
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
                                            <td className="px-6 py-4 whitespace-nowrap text-[13px] text-[#5D534A]">
                                                {new Date(request.requestDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-[13px] font-semibold space-x-3">
                                                {request.status === 'Pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(request.id, 'InProcess')}
                                                            className="text-[#D35400] hover:text-[#4A3728] transition-colors"
                                                        >
                                                            Start
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(request.id, 'Completed')}
                                                            className="text-[#1B7F4B] hover:text-[#4A3728] transition-colors"
                                                        >
                                                            Complete
                                                        </button>
                                                    </>
                                                )}
                                                {request.status === 'InProcess' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(request.id, 'Completed')}
                                                        className="text-[#1B7F4B] hover:text-[#4A3728] transition-colors"
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(request.id)}
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
            </div>
        </>
    );
};

export default RequestsPage;
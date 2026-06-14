import { useState, useEffect, useCallback } from 'react';
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
    const [, setTick] = useState(0);
    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelSubmitting, setCancelSubmitting] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    // Re-render every 60 s so "X min waiting" badges stay current
    useEffect(() => {
        const id = setInterval(() => setTick((t) => t + 1), 60_000);
        return () => clearInterval(id);
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

    const submitCancel = async () => {
        if (!cancelTarget) return;
        try {
            setCancelSubmitting(true);
            setError('');
            setSuccess('');
            await updateRequestStatus(cancelTarget.id, 'Cancelled', cancelReason.trim());
            setSuccess(`Request #${cancelTarget.id} cancelled`);
            setCancelTarget(null);
            setCancelReason('');
            await fetchRequests();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cancel request');
        } finally {
            setCancelSubmitting(false);
        }
    };

    const getWaitMinutes = (requestDate) => {
        const ms = Date.now() - new Date(requestDate).getTime();
        return Math.max(0, Math.floor(ms / 60_000));
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
        return <LoadingSpinner text="Loading requests..." />;
    }

    return (
        <>
            <div className="p-4 sm:p-10 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
                <section className="text-center max-w-3xl mx-auto">
                    <h2 className="font-headline text-[clamp(22px,6vw,52px)] text-[#4A3728] mb-2 font-bold leading-tight">
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
                    <div className="max-w-5xl mx-auto bg-[#FDFBF7] p-6 sm:p-10 rounded-[22px] sm:rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] text-center text-[#5D534A]">
                        No requests found
                    </div>
                ) : (
                    <>
                    {/* Mobile: card list (table is unreadable on small screens) */}
                    <div className="md:hidden max-w-2xl mx-auto w-full space-y-3">
                        {sortedRequests.map((request) => (
                            <div key={request.id} className="bg-[#FDFBF7] rounded-2xl border border-[#E3DCD2]/40 shadow-[0_10px_30px_rgba(15,28,44,0.04)] p-4">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-headline text-[#4A3728] font-bold text-base">Room {request.roomNumber}</span>
                                            <span className="text-[11px] text-[#8E735B] font-semibold">#{request.id}</span>
                                        </div>
                                        <div className="text-[12px] text-[#8E735B] mt-0.5">
                                            {request.type || 'N/A'} · {new Date(request.requestDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                        <span className={`px-2 inline-flex text-[11px] leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                                            {request.status}
                                        </span>
                                        {(request.status === 'Pending' || request.status === 'InProcess') && (
                                            <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                                                getWaitMinutes(request.requestDate) >= 15
                                                    ? 'bg-red-100 text-red-700'
                                                    : getWaitMinutes(request.requestDate) >= 5
                                                        ? 'bg-orange-100 text-orange-700'
                                                        : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                <span className="material-symbols-outlined text-[10px]">schedule</span>
                                                {getWaitMinutes(request.requestDate)}m
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    {request.photoPath && (
                                        <div
                                            onClick={() => setPreviewImage(getImageUrl(request.photoPath))}
                                            className="w-14 h-14 rounded-lg border border-[#E3DCD2]/80 overflow-hidden cursor-pointer flex-shrink-0"
                                        >
                                            <img src={getImageUrl(request.photoPath)} alt="Attached" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[13px] text-[#2C241E] font-semibold">
                                            {request.serviceItem?.name || 'N/A'}
                                            {request.quantity > 1 && <span className="text-[#8E735B] font-normal"> ×{request.quantity}</span>}
                                        </div>
                                        {(request.note || request.description) && (
                                            <div className="text-[12px] text-[#5D534A] mt-1 break-words">{request.note || request.description}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#E3DCD2]/40 text-[13px] font-semibold">
                                    {request.status === 'Pending' && (
                                        <>
                                            <button onClick={() => handleStatusUpdate(request.id, 'InProcess')} className="text-[#D35400]">Start</button>
                                            <button onClick={() => handleStatusUpdate(request.id, 'Completed')} className="text-[#1B7F4B]">Complete</button>
                                        </>
                                    )}
                                    {request.status === 'InProcess' && (
                                        <button onClick={() => handleStatusUpdate(request.id, 'Completed')} className="text-[#1B7F4B]">Complete</button>
                                    )}
                                    {(request.status === 'Pending' || request.status === 'InProcess') && (
                                        <button onClick={() => { setCancelReason(''); setCancelTarget(request); }} className="text-[#C2410C]">Cancel</button>
                                    )}
                                    <button onClick={() => handleDelete(request.id)} className="text-[#B22222] ml-auto">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop: full table */}
                    <div className="hidden md:block max-w-[1400px] mx-auto bg-[#FDFBF7] rounded-[22px] sm:rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] overflow-hidden">
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
                                            Qty <span className="text-[#8E735B]/60">{getSortIcon('quantity')}</span>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-[11px] font-bold text-[#8E735B] uppercase tracking-widest cursor-pointer select-none"
                                            onClick={() => handleSort('note')}
                                        >
                                            Note <span className="text-[#8E735B]/60">{getSortIcon('note')}</span>
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

                                            <td className="px-6 py-4 text-[13px] text-[#2C241E] max-w-[200px] break-words">
                                                {request.note || request.description || '-'}
                                            </td>

                                            {/* 👇 THE NEW THUMBNAIL IMPLEMENTATION */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {request.photoPath ? (
                                                    <div
                                                        onClick={() => setPreviewImage(getImageUrl(request.photoPath))}
                                                        className="w-12 h-12 rounded-lg border border-[#E3DCD2]/80 overflow-hidden cursor-pointer hover:opacity-80 hover:shadow-md transition-all"
                                                        title="Click to view full image"
                                                    >
                                                        <img
                                                            src={getImageUrl(request.photoPath)}
                                                            alt="Attached photo"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-[#F2EBE1]/60 flex items-center justify-center border border-[#E3DCD2]/40" title="No photo attached">
                                                        <span className="material-symbols-outlined text-[#8E735B]/40 text-[20px]">
                                                            image_not_supported
                                                        </span>
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                                            request.status
                                                        )}`}
                                                    >
                                                        {request.status}
                                                    </span>
                                                    {(request.status === 'Pending' || request.status === 'InProcess') && (
                                                        <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                                                            getWaitMinutes(request.requestDate) >= 15
                                                                ? 'bg-red-100 text-red-700'
                                                                : getWaitMinutes(request.requestDate) >= 5
                                                                    ? 'bg-orange-100 text-orange-700'
                                                                    : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                            <span className="material-symbols-outlined text-[10px]">schedule</span>
                                                            {getWaitMinutes(request.requestDate)}m
                                                        </span>
                                                    )}
                                                </div>
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
                                                {(request.status === 'Pending' || request.status === 'InProcess') && (
                                                    <button
                                                        onClick={() => { setCancelReason(''); setCancelTarget(request); }}
                                                        className="text-[#C2410C] hover:text-[#4A3728] transition-colors"
                                                    >
                                                        Cancel
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
                    </>
                )}
                {cancelTarget && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => !cancelSubmitting && setCancelTarget(null)}
                    >
                        <div
                            className="w-full max-w-md bg-[#FDFBF7] rounded-[24px] border border-[#E3DCD2]/40 shadow-2xl p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-[#B22222] text-[22px]">cancel</span>
                                </div>
                                <h3 className="font-headline text-xl text-[#4A3728] font-bold">Cancel Request</h3>
                            </div>
                            <p className="text-[13px] text-[#5D534A] mb-4">
                                Cancelling <span className="font-semibold text-[#4A3728]">#{cancelTarget.id}</span>
                                {cancelTarget.serviceItem?.name ? ` — ${cancelTarget.serviceItem.name}` : ''} for Room {cancelTarget.roomNumber}.
                                The reason below will be shown to the guest.
                            </p>
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8E735B] mb-1.5">
                                Cancellation reason
                            </label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={3}
                                autoFocus
                                placeholder="e.g. Item out of stock, kitchen closed…"
                                className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E] text-sm resize-none"
                            />
                            <div className="flex gap-3 mt-5">
                                <button
                                    type="button"
                                    onClick={() => setCancelTarget(null)}
                                    disabled={cancelSubmitting}
                                    className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-2xl bg-[#F2EBE1] text-[#4A3728] hover:bg-[#E8DFD1] transition disabled:opacity-50"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={submitCancel}
                                    disabled={cancelSubmitting}
                                    className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-2xl bg-[#B22222] text-white hover:bg-[#8f1b1b] transition disabled:opacity-50"
                                >
                                    {cancelSubmitting ? 'Cancelling…' : 'Confirm Cancel'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {previewImage && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
                        onClick={() => setPreviewImage('')}
                    >
                        <div
                            className="relative max-w-4xl max-h-[90vh] mx-4 bg-[#FDFBF7] rounded-[24px] overflow-hidden shadow-2xl border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={() => setPreviewImage('')}
                                className="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 text-white hover:bg-[#D35400] transition-colors backdrop-blur-md"
                                title="Close"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                            <img
                                src={previewImage}
                                alt="Request"
                                className="block max-h-[85vh] max-w-full object-contain p-2"
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default RequestsPage;
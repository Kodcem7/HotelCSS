import { useState, useEffect } from 'react';
// import Layout from '../components/Layout'; // ❌ REMOVED
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getRequests } from '../api/requests';
import { getReceptionServices, getPickUpTime } from '../api/receptionService';
import { getBackendOrigin } from '../api/axios';

const RequestHistoryPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [previewImage, setPreviewImage] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const getImageUrl = (path) => {
        if (!path) return null;
        const normalized = path.replace(/\\/g, '/');
        return `${getBackendOrigin()}${normalized}`;
    };

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError('');

            const [requestsRes, receptionRes, pickupRes] = await Promise.all([
                getRequests(),
                getReceptionServices().catch((err) => {
                    console.error('Failed to load reception services', err);
                    return [];
                }),
                getPickUpTime().catch((err) => {
                    console.error('Failed to load pick-up infos', err);
                    return [];
                }),
            ]);

            const baseRequests = Array.isArray(requestsRes) ? requestsRes : [];
            const wakeUps = Array.isArray(receptionRes) ? receptionRes : receptionRes?.data ?? [];
            const pickups = Array.isArray(pickupRes) ? pickupRes : pickupRes?.data ?? [];

            const mappedReception = [...wakeUps, ...pickups].map((service) => {
                const isWakeUp = service.requestType === 'Wake-Up Service';
                const dateSource =
                    (isWakeUp ? service.scheduledTime : service.pickUpTime) ||
                    service.scheduledTime ||
                    service.createdAt;

                return {
                    id: `reception-${service.id}`,
                    roomNumber: service.roomNumber,
                    quantity: 1,
                    status: service.status || 'Pending',
                    type: 'Reception',
                    requestDate: dateSource,
                    note: service.notes,
                    serviceItem: {
                        name: service.requestType || 'Reception Service',
                    },
                };
            });

            setRequests([...baseRequests, ...mappedReception]);
        } catch (err) {
            setError('Failed to load request history');
            console.error(err);
        } finally {
            setLoading(false);
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

    const filteredRequests = requests.filter((request) => {
        const matchesStatus = filterStatus === 'All' || request.status === filterStatus;
        const matchesType = filterType === 'All' || request.type === filterType;
        const matchesSearch =
            searchTerm === '' ||
            request.roomNumber?.toString().includes(searchTerm) ||
            request.serviceItem?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesType && matchesSearch;
    });

    if (loading) {
        // ✅ Layout removed from loading state
        return <LoadingSpinner text="Loading request history..." />;
    }

    return (
        <> {/* ✅ Replaced <Layout> with Fragment */}
            <div className="p-4 sm:p-10 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
                <section>
                    <h2 className="font-headline text-[clamp(30px,6vw,52px)] text-[#4A3728] mb-2 font-bold leading-tight">
                        My Request History
                    </h2>
                    <p className="text-[14px] text-[#5D534A] leading-relaxed">
                        Track your service and reception requests.
                    </p>
                </section>

                {/* Type tabs */}
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: 'All', value: 'All' },
                        { label: 'Technic', value: 'Technic' },
                        { label: 'Reception', value: 'Reception' },
                        { label: 'Room', value: 'Room' },
                    ].map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => setFilterType(tab.value)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full border transition ${filterType === tab.value
                                    ? 'bg-[#4A3728] text-white border-[#4A3728]'
                                    : 'bg-[#F2EBE1] text-[#4A3728] border-[#E3DCD2]/50 hover:bg-[#E8DFD1]'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search by room number or service item..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E] placeholder:text-[#8E735B]"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="InProcess">In Process</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>

                {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

                {filteredRequests.length === 0 ? (
                    <div className="bg-[#FDFBF7] p-6 sm:p-8 rounded-[22px] sm:rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] text-center">
                        <p className="text-[#5D534A]">
                            {searchTerm || filterStatus !== 'All'
                                ? 'No requests match your filters'
                                : 'No requests found'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredRequests.map((request) => (
                            <div key={request.id} className="bg-[#FDFBF7] p-5 sm:p-8 rounded-[22px] sm:rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)]">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-4 mb-2">
                                            <h3 className="font-headline text-xl text-[#4A3728] font-bold">
                                                {request.serviceItem?.name || 'Service Request'}
                                            </h3>
                                            <span
                                                className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${getStatusColor(
                                                    request.status
                                                )}`}
                                            >
                                                {request.status}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[13px]">
                                            <div>
                                                <span className="text-[#8E735B]">Room:</span>{' '}
                                                <span className="font-semibold text-[#4A3728]">#{request.roomNumber}</span>
                                            </div>
                                            <div>
                                                <span className="text-[#8E735B]">Quantity:</span>{' '}
                                                <span className="font-semibold text-[#4A3728]">{request.quantity}</span>
                                            </div>
                                            <div>
                                                <span className="text-[#8E735B]">Date:</span>{' '}
                                                <span className="font-semibold text-[#4A3728]">
                                                    {new Date(request.requestDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[#8E735B]">Time:</span>{' '}
                                                <span className="font-semibold text-[#4A3728]">
                                                    {new Date(request.requestDate).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </div>
                                        {request.photoPath && (
                                            <div className="mt-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewImage(getImageUrl(request.photoPath))}
                                                    className="text-[11px] font-bold uppercase tracking-widest text-[#D35400] hover:text-[#4A3728] transition-colors"
                                                >
                                                    View Photo
                                                </button>
                                            </div>
                                        )}
                                        {request.note && (
                                            <div className="mt-4 p-4 bg-[#F2EBE1]/55 rounded-[22px] border border-[#E3DCD2]/30">
                                                <p className="text-[13px] text-[#5D534A]">
                                                    <span className="font-semibold text-[#4A3728]">Note:</span> {request.note}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {filteredRequests.length > 0 && (
                    <div className="text-center text-[13px] text-[#5D534A]">
                        Showing {filteredRequests.length} of {requests.length} requests
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

export default RequestHistoryPage;
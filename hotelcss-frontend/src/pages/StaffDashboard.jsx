import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import Layout from '../components/Layout'; // ❌ REMOVED
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getRequests } from '../api/requests';

const StaffDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'InProcess':
                return 'bg-blue-100 text-blue-800';
            case 'Completed':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        // ✅ Removed Layout from loading state
        return <LoadingSpinner text="Loading dashboard..." />;
    }

    const myRequests = requests.filter((r) => r.status !== 'Completed' && r.status !== 'Cancelled');

    return (
        <> {/* ✅ Replaced <Layout> with Fragment */}
            {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

            <div className="p-10 space-y-10 max-w-7xl mx-auto">
                <section>
                    <h2 className="font-headline text-[52px] text-[#4A3728] mb-2 font-bold leading-tight">
                        My Tasks
                    </h2>
                    <p className="text-[14px] text-[#5D534A] leading-relaxed">
                        Service requests assigned to your department.
                    </p>
                </section>

                {myRequests.length === 0 ? (
                    <div className="bg-[#FDFBF7] p-8 rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] text-center">
                        <p className="text-[#5D534A]">No pending requests.</p>
                    </div>
                ) : (
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {myRequests.map((request) => (
                            <div
                                key={request.id}
                                className="bg-[#FDFBF7] p-8 rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] hover:shadow-[0_25px_55px_rgba(15,28,44,0.07)] transition-shadow duration-300"
                            >
                                <div className="flex justify-between items-start mb-4 gap-3">
                                    <div>
                                        <h3 className="font-headline text-xl text-[#4A3728] font-bold leading-tight">
                                            {request.serviceItem?.name || 'Service Request'}
                                        </h3>
                                        <p className="text-[13px] text-[#5D534A] mt-1">Room {request.roomNumber}</p>
                                    </div>

                                    <span
                                        className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${getStatusColor(
                                            request.status
                                        )}`}
                                    >
                                        {request.status}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[13px] text-[#5D534A]">
                                        <span className="font-semibold text-[#4A3728]">Quantity:</span> {request.quantity}
                                    </p>
                                    {request.note && (
                                        <p className="text-[13px] text-[#5D534A]">
                                            <span className="font-semibold text-[#4A3728]">Note:</span> {request.note}
                                        </p>
                                    )}
                                    <p className="text-[11px] text-[#8E735B]">
                                        {new Date(request.requestDate).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                <div>
                    <Link
                        to="/staff/requests"
                        className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#D35400] hover:gap-4 transition-all"
                    >
                        View All Requests <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                </div>
            </div>
        </>
    );
};

export default StaffDashboard;
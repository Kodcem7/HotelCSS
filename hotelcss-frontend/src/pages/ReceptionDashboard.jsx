import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import Layout from '../components/Layout'; // ❌ REMOVED
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getRooms } from '../api/rooms';
import { getRequests } from '../api/requests';
import { getReceptionServices } from '../api/receptionService';

const ReceptionDashboard = () => {
    const [stats, setStats] = useState({
        totalRooms: 0,
        availableRooms: 0,
        totalRequests: 0,
        pendingRequests: 0,
        wakeUpCount: 0,
        upcomingWakeUps: 0,
        pickupCount: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError('');

                const [roomsRes, requestsRes, receptionRes] = await Promise.all([
                    getRooms(),
                    getRequests(),
                    getReceptionServices(),
                ]);

                const rooms = roomsRes?.data || [];
                const requests = Array.isArray(requestsRes) ? requestsRes : [];
                const reception = Array.isArray(receptionRes) ? receptionRes : receptionRes?.data ?? [];

                const wakeUps = reception.filter((r) => r.requestType === 'Wake-Up Service');
                const pickups = reception.filter((r) => r.requestType === 'Pick-Up');
                const now = new Date();
                const upcomingWakeUps = wakeUps.filter((r) => {
                    if (!r.scheduledTime) return false;
                    const d = new Date(r.scheduledTime);
                    return d >= now;
                });

                setStats({
                    totalRooms: rooms.length,
                    availableRooms: rooms.filter((r) => r.status === 'Available').length,
                    totalRequests: requests.length,
                    pendingRequests: requests.filter((r) => r.status === 'Pending').length,
                    wakeUpCount: wakeUps.length,
                    upcomingWakeUps: upcomingWakeUps.length,
                    pickupCount: pickups.length,
                });
            } catch (err) {
                setError('Failed to load dashboard statistics');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        // ✅ No Layout here
        return <LoadingSpinner text="Loading dashboard..." />;
    }

    return (
        <> {/* ✅ Replaced <Layout> with Fragment */}
            {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

            <div className="p-4 sm:p-10 space-y-8 sm:space-y-12 max-w-7xl mx-auto">
                {/* Hero Header */}
                <section>
                    <h2 className="font-headline text-[clamp(30px,6vw,52px)] text-[#4A3728] mb-2 font-bold leading-tight">
                        Reception Overview
                    </h2>
                </section>

                {/* Stats Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-[#FDFBF7] p-5 sm:p-8 rounded-[22px] sm:rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] group hover:shadow-[0_25px_55px_rgba(15,28,44,0.07)] transition-shadow duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#F2EBE1] border border-[#E3DCD2]/30 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#D35400]">bed</span>
                            </div>
                            <span className="text-[10px] font-label uppercase tracking-widest text-[#8E735B] font-bold">
                                Live
                            </span>
                        </div>
                        <p className="text-[clamp(28px,5vw,44px)] font-headline text-[#4A3728] mb-1 leading-none">{stats.totalRooms}</p>
                        <p className="font-label text-[11px] uppercase tracking-widest text-[#8E735B] font-bold">
                            Total Rooms
                        </p>
                    </div>

                    <div className="bg-[#FDFBF7] p-5 sm:p-8 rounded-[22px] sm:rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] group hover:shadow-[0_25px_55px_rgba(15,28,44,0.07)] transition-shadow duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#F2EBE1] border border-[#E3DCD2]/30 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#D35400]">check_circle</span>
                            </div>
                            <span className="text-[10px] font-label uppercase tracking-widest text-[#8E735B] font-bold">
                                Available
                            </span>
                        </div>
                        <p className="text-[clamp(28px,5vw,44px)] font-headline text-[#4A3728] mb-1 leading-none">{stats.availableRooms}</p>
                        <p className="font-label text-[11px] uppercase tracking-widest text-[#8E735B] font-bold">
                            Available Rooms
                        </p>
                    </div>

                    <div className="bg-[#FDFBF7] p-5 sm:p-8 rounded-[22px] sm:rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] group hover:shadow-[0_25px_55px_rgba(15,28,44,0.07)] transition-shadow duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#F2EBE1] border border-[#E3DCD2]/30 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#D35400]">receipt_long</span>
                            </div>
                            <span className="text-[10px] font-label uppercase tracking-widest text-[#8E735B] font-bold">
                                Today
                            </span>
                        </div>
                        <p className="text-[clamp(28px,5vw,44px)] font-headline text-[#4A3728] mb-1 leading-none">{stats.totalRequests}</p>
                        <p className="font-label text-[11px] uppercase tracking-widest text-[#8E735B] font-bold">
                            Total Requests
                        </p>
                    </div>

                    <div className="bg-[#4A3728] text-white p-5 sm:p-8 rounded-[22px] sm:rounded-[28px] shadow-[0_30px_60px_rgba(14,28,43,0.20)] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white">notifications</span>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-[#D35400] text-white px-3 py-1 rounded-full shadow-sm">
                                    Urgent
                                </span>
                            </div>
                            <p className="text-[clamp(28px,5vw,44px)] font-headline mb-1 leading-none">{stats.pendingRequests}</p>
                            <p className="font-label text-[11px] uppercase tracking-widest text-white/80 font-bold">
                                Pending Requests
                            </p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
                    </div>
                </section>

                {/* Quick Actions Section */}
                <section className="space-y-8">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h3 className="font-headline text-[clamp(20px,3.2vw,30px)] text-[#4A3728] font-bold leading-tight">
                                Reception Actions
                            </h3>
                            <p className="text-[14px] text-[#5D534A] leading-relaxed">
                                Jump into core reception modules.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
                        <Link
                            to="/reception/rooms"
                            className="bg-[#F2EBE1] p-5 sm:p-8 rounded-[22px] sm:rounded-[28px] flex flex-col justify-between hover:bg-white transition-all group border border-[#E3DCD2]/20 hover:border-[#E3DCD2]/40 shadow-none hover:shadow-[0_25px_55px_rgba(15,28,44,0.08)]"
                        >
                            <div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FDFBF7] border border-[#E3DCD2]/30 flex items-center justify-center mb-5 sm:mb-6">
                                    <span className="material-symbols-outlined text-[#D35400] text-3xl">bed</span>
                                </div>
                                <h4 className="font-headline text-xl text-[#4A3728] font-bold mb-2">Rooms</h4>
                                <p className="text-[14px] text-[#5D534A] leading-relaxed mb-6">
                                    View and update room status.
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#D35400] group-hover:gap-4 transition-all">
                                Manage Rooms <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </span>
                        </Link>

                        <Link
                            to="/reception/requests"
                            className="bg-[#F2EBE1] p-5 sm:p-8 rounded-[22px] sm:rounded-[28px] flex flex-col justify-between hover:bg-white transition-all group border border-[#E3DCD2]/20 hover:border-[#E3DCD2]/40 shadow-none hover:shadow-[0_25px_55px_rgba(15,28,44,0.08)]"
                        >
                            <div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FDFBF7] border border-[#E3DCD2]/30 flex items-center justify-center mb-5 sm:mb-6">
                                    <span className="material-symbols-outlined text-[#D35400] text-3xl">notification_important</span>
                                </div>
                                <h4 className="font-headline text-xl text-[#4A3728] font-bold mb-2">Requests</h4>
                                <p className="text-[14px] text-[#5D534A] leading-relaxed mb-6">
                                    View and manage guest service requests.
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#D35400] group-hover:gap-4 transition-all">
                                View Requests <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </span>
                        </Link>

                        <Link
                            to="/reception/services"
                            className="bg-[#F2EBE1] p-5 sm:p-8 rounded-[22px] sm:rounded-[28px] flex flex-col justify-between hover:bg-white transition-all group border border-[#E3DCD2]/20 hover:border-[#E3DCD2]/40 shadow-none hover:shadow-[0_25px_55px_rgba(15,28,44,0.08)]"
                        >
                            <div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FDFBF7] border border-[#E3DCD2]/30 flex items-center justify-center mb-5 sm:mb-6">
                                    <span className="material-symbols-outlined text-[#D35400] text-3xl">concierge</span>
                                </div>
                                <h4 className="font-headline text-xl text-[#4A3728] font-bold mb-2">Reception Services</h4>
                                <p className="text-[14px] text-[#5D534A] leading-relaxed mb-6">
                                    Manage wake-up services and pick-up times.
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#D35400] group-hover:gap-4 transition-all">
                                Open Services <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </span>
                        </Link>
                    </div>
                </section>
            </div>
        </>
    );
};

export default ReceptionDashboard;
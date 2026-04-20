import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
// import Layout from '../components/Layout'; // ❌ REMOVED
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getStaffList } from '../api/users';
import { getDepartments } from '../api/departments';
import { getRequests } from '../api/requests';

const quickLinks = [
    {
        to: '/admin/staff',
        title: 'Manage Staff',
        desc: 'View, create, and manage staff members',
        cta: 'Open Roster',
        icon: 'badge',
    },
    {
        to: '/admin/departments',
        title: 'Manage Departments',
        desc: 'Configure hotel departments',
        cta: 'Configure Org',
        icon: 'corporate_fare',
    },
    {
        to: '/admin/requests',
        title: 'View Requests',
        desc: 'Monitor and manage guest requests',
        cta: 'Queue Board',
        icon: 'notification_important',
    },
    {
        to: '/admin/rooms',
        title: 'Manage Rooms',
        desc: 'View and manage hotel rooms',
        cta: 'Inventory',
        icon: 'bed',
    },
    {
        to: '/admin/rooms/create',
        title: 'Create Rooms',
        desc: 'Create single or bulk rooms',
        cta: 'Create Rooms',
        icon: 'add_circle',
    },
    {
        to: '/admin/service-items',
        title: 'Service Items',
        desc: 'Manage service items and menu',
        cta: 'Edit Catalog',
        icon: 'room_service',
    },
    {
        to: '/admin/events',
        title: 'Hotel Events',
        desc: 'Configure hotel events, meal info and earn points campaigns',
        cta: 'Hotel Events',
        icon: 'event',
    },
    {
        to: '/reception/services',
        title: 'Reception Services',
        desc: 'Manage wake-up and pick-up times',
        cta: 'Reception Services',
        icon: 'concierge',
    },
    {
        to: '/admin/vouchers',
        title: 'Reward Vouchers',
        desc: 'View and manage guest reward vouchers and redemptions',
        cta: 'Loyalty Suite',
        icon: 'confirmation_number',
    },
    {
        to: '/admin/surveys',
        title: 'Manage Surveys',
        desc: 'Create active feedback surveys for guests to intercept issues early.',
        cta: 'Survey Creator',
        icon: 'poll',
    },
    {
        to: '/admin/surveys/results',
        title: 'Survey Results',
        desc: 'Analyze guest feedback and view specific room responses.',
        cta: 'View Analytics',
        icon: 'analytics',
    },
];

const AdminDashboard = () => {
    const location = useLocation();
    const isAdminDashboardSuite =
        location.pathname === '/admin' ||
        location.pathname === '/admin/' ||
        location.pathname === '/manager' ||
        location.pathname === '/manager/';

    const [stats, setStats] = useState({
        totalStaff: 0,
        totalDepartments: 0,
        totalRequests: 0,
        pendingRequests: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError('');

                const [staffRes, deptRes, requestsRes] = await Promise.all([
                    getStaffList(),
                    getDepartments(),
                    getRequests().catch(() => []),
                ]);

                const staffData = staffRes?.data || [];
                const departments = Array.isArray(deptRes) ? deptRes : [];
                const requests = Array.isArray(requestsRes) ? requestsRes : [];

                setStats({
                    totalStaff: staffData.length,
                    totalDepartments: departments.length,
                    totalRequests: requests.length,
                    pendingRequests: requests.filter((r) => r.status === 'Pending').length,
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
        <> {/* ✅ Replaced <Layout> with a fragment */}
            {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

            {isAdminDashboardSuite ? (
                <div className="p-4 sm:p-10 space-y-8 sm:space-y-12 max-w-7xl mx-auto">
                    <section>
                        <h2 className="font-headline text-[clamp(30px,6vw,52px)] text-[#4A3728] mb-2 font-bold leading-tight">
                            Operational Overview
                        </h2>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-[#FDFBF7] p-5 sm:p-8 rounded-[22px] sm:rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] group hover:shadow-[0_25px_55px_rgba(15,28,44,0.07)] transition-shadow duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#F2EBE1] border border-[#E3DCD2]/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#D35400]">groups</span>
                                </div>
                                <span className="text-[10px] font-label uppercase tracking-widest text-[#8E735B] font-bold">Live</span>
                            </div>
                            <p className="text-[clamp(28px,5vw,44px)] font-headline text-[#4A3728] mb-1 leading-none">{stats.totalStaff}</p>
                            <p className="font-label text-[11px] uppercase tracking-widest text-[#8E735B] font-bold">Total Staff</p>
                        </div>

                        <div className="bg-[#FDFBF7] p-5 sm:p-8 rounded-[22px] sm:rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] group hover:shadow-[0_25px_55px_rgba(15,28,44,0.07)] transition-shadow duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#F2EBE1] border border-[#E3DCD2]/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#D35400]">account_tree</span>
                                </div>
                            </div>
                            <p className="text-[clamp(28px,5vw,44px)] font-headline text-[#4A3728] mb-1 leading-none">{stats.totalDepartments}</p>
                            <p className="font-label text-[11px] uppercase tracking-widest text-[#8E735B] font-bold">Departments</p>
                        </div>

                        <div className="bg-[#FDFBF7] p-5 sm:p-8 rounded-[22px] sm:rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] group hover:shadow-[0_25px_55px_rgba(15,28,44,0.07)] transition-shadow duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#F2EBE1] border border-[#E3DCD2]/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#D35400]">receipt_long</span>
                                </div>
                                <span className="text-[10px] font-label uppercase tracking-widest text-[#8E735B] font-bold">Today</span>
                            </div>
                            <p className="text-[clamp(28px,5vw,44px)] font-headline text-[#4A3728] mb-1 leading-none">{stats.totalRequests}</p>
                            <p className="font-label text-[11px] uppercase tracking-widest text-[#8E735B] font-bold">Total Requests</p>
                        </div>

                        <div className="bg-[#4A3728] text-white p-5 sm:p-8 rounded-[22px] sm:rounded-[28px] shadow-[0_30px_60px_rgba(14,28,43,0.20)] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white">schedule</span>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest bg-[#D35400] text-white px-3 py-1 rounded-full shadow-sm">Urgent</span>
                                </div>
                                <p className="text-[clamp(28px,5vw,44px)] font-headline mb-1 leading-none">{stats.pendingRequests}</p>
                                <p className="font-label text-[11px] uppercase tracking-widest text-white/80 font-bold">Pending Requests</p>
                            </div>
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
                        </div>
                    </section>

                    <section className="space-y-8">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <h3 className="font-headline text-[clamp(20px,3.2vw,30px)] text-[#4A3728] font-bold leading-tight">Executive Actions</h3>
                                <p className="text-[14px] text-[#5D534A] leading-relaxed">Instant access to core administrative modules.</p>
                            </div>
                            <button className="text-[13px] sm:text-[15px] font-bold text-[#D35400] underline underline-offset-8 decoration-[#E3DCD2] decoration-2 hover:decoration-[#D35400] transition-all whitespace-nowrap">
                                View Full Directory
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
                            {quickLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className="bg-[#F2EBE1] p-5 sm:p-8 rounded-[22px] sm:rounded-[28px] flex flex-col justify-between hover:bg-white transition-all group border border-[#E3DCD2]/20 hover:border-[#E3DCD2]/40 shadow-none hover:shadow-[0_25px_55px_rgba(15,28,44,0.08)]"
                                >
                                    <div>
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FDFBF7] border border-[#E3DCD2]/30 flex items-center justify-center mb-5 sm:mb-6">
                                            <span className="material-symbols-outlined text-[#D35400] text-3xl">{link.icon}</span>
                                        </div>
                                        <h4 className="font-headline text-xl text-[#4A3728] font-bold mb-2">{link.title}</h4>
                                        <p className="text-[14px] text-[#5D534A] leading-relaxed mb-6">{link.desc}</p>
                                    </div>
                                    <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#D35400] group-hover:gap-4 transition-all">
                                        {link.cta} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            ) : (
                <div className="p-4 sm:p-10 space-y-8 sm:space-y-12 max-w-7xl mx-auto">
                    <section>
                        <h2 className="font-headline text-display-lg text-primary mb-2">Operational Overview</h2>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 shadow-[0_20px_40px_rgba(15,28,44,0.04)] group hover:scale-[1.02] transition-transform duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">groups</span>
                                </div>
                                <span className="text-xs font-label uppercase tracking-widest text-secondary opacity-60">Live</span>
                            </div>
                            <p className="text-4xl font-headline text-primary mb-1">{stats.totalStaff}</p>
                            <p className="font-label text-[11px] uppercase tracking-widest text-secondary font-semibold">Total Staff</p>
                        </div>

                        <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 shadow-[0_20px_40px_rgba(15,28,44,0.04)] group hover:scale-[1.02] transition-transform duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">account_tree</span>
                                </div>
                            </div>
                            <p className="text-4xl font-headline text-primary mb-1">{stats.totalDepartments}</p>
                            <p className="font-label text-[11px] uppercase tracking-widest text-secondary font-semibold">Departments</p>
                        </div>

                        <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 shadow-[0_20px_40px_rgba(15,28,44,0.04)] group hover:scale-[1.02] transition-transform duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">receipt_long</span>
                                </div>
                                <span className="text-xs font-label uppercase tracking-widest text-secondary opacity-60">Today</span>
                            </div>
                            <p className="text-4xl font-headline text-primary mb-1">{stats.totalRequests}</p>
                            <p className="font-label text-[11px] uppercase tracking-widest text-secondary font-semibold">Total Requests</p>
                        </div>

                        <div className="bg-primary text-white p-8 rounded-xl shadow-[0_30px_60px_rgba(14,28,43,0.15)] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white">schedule</span>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest bg-red-700 text-white px-3 py-1 rounded-full">Urgent</span>
                                </div>
                                <p className="text-4xl font-headline mb-1">{stats.pendingRequests}</p>
                                <p className="font-label text-[11px] uppercase tracking-widest text-white/80 font-semibold">Pending Requests</p>
                            </div>
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
                        </div>
                    </section>

                    <section className="space-y-8">
                        <div className="flex items-end justify-between">
                            <div>
                                <h3 className="font-headline text-headline-md text-primary">Executive Actions</h3>
                                <p className="text-sm text-secondary">Instant access to core administrative modules.</p>
                            </div>
                            <button className="text-sm font-semibold text-primary underline underline-offset-8 decoration-tertiary-fixed decoration-2 hover:decoration-primary transition-all">
                                View Full Directory
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
                            {quickLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className="bg-surface-container-low p-8 rounded-xl flex flex-col justify-between hover:bg-surface-container-lowest transition-all group border border-transparent hover:border-outline-variant/20 shadow-none hover:shadow-xl"
                                >
                                    <div>
                                        <span className="material-symbols-outlined text-primary text-4xl mb-6">{link.icon}</span>
                                        <h4 className="font-headline text-title-md text-primary mb-2">{link.title}</h4>
                                        <p className="text-sm text-on-surface-variant leading-relaxed mb-6">{link.desc}</p>
                                    </div>
                                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary group-hover:gap-4 transition-all">
                                        {link.cta} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </>
    );
};

export default AdminDashboard;
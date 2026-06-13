import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getStaffList } from '../api/users';
import { getDepartments } from '../api/departments';
import { getRequests } from '../api/requests';
import { getHistoryLogs } from '../api/historylogs';
import useSignalR from '../hooks/useSignalR';

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
        to: '/admin/users-logs',
        title: 'User Logs',
        desc: 'Monitor user actions, room history, and account events.',
        cta: 'View Logs',
        icon: 'manage_history',
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
    // 👇 HERE IS YOUR NEW REPUTATION DASHBOARD CARD!
    {
        to: '/admin/reputation',
        title: 'Guest Reputation',
        desc: 'Monitor live TripAdvisor reviews and guest satisfaction scores.',
        cta: 'View Reviews',
        icon: 'rate_review',
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
        inProcessRequests: 0,
        completedRequests: 0,
    });
    const [performance, setPerformance] = useState([]);
    const [revenue, setRevenue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [livePulse, setLivePulse] = useState(false);

    const isToday = (dateStr) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        const now = new Date();
        return d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth() &&
            d.getDate() === now.getDate();
    };

    const buildPerformance = (requests) => {
        const todays = requests.filter((r) => isToday(r.requestDate));
        const byType = {};
        todays.forEach((r) => {
            const key = r.type || 'Other';
            if (!byType[key]) byType[key] = { type: key, total: 0, completed: 0, pending: 0 };
            byType[key].total += 1;
            if (r.status === 'Completed') byType[key].completed += 1;
            if (r.status === 'Pending' || r.status === 'InProcess') byType[key].pending += 1;
        });
        return Object.values(byType).sort((a, b) => b.total - a.total);
    };

    const buildRevenue = (logs) => {
        // Last 6 months of revenue from checkout history (HistoryLog.MoneySpent)
        const buckets = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            buckets.push({
                key: `${d.getFullYear()}-${d.getMonth()}`,
                label: d.toLocaleString('en-US', { month: 'short' }),
                year: d.getFullYear(),
                total: 0,
            });
        }
        const bucketMap = Object.fromEntries(buckets.map((b) => [b.key, b]));
        logs.forEach((log) => {
            const when = log.checkOutDate || log.timestamp;
            if (!when) return;
            const d = new Date(when);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (bucketMap[key]) bucketMap[key].total += Number(log.moneySpent) || 0;
        });
        return buckets;
    };

    const fetchStats = useCallback(async (isInitial = false) => {
        try {
            if (isInitial) setLoading(true);
            setError('');

            const [staffRes, deptRes, requestsRes, logsRes] = await Promise.all([
                getStaffList().catch(() => ({ data: [] })),
                getDepartments().catch(() => []),
                getRequests().catch(() => []),
                getHistoryLogs().catch(() => []),
            ]);

            const staffData = staffRes?.data || [];
            const departments = Array.isArray(deptRes) ? deptRes : [];
            const requests = Array.isArray(requestsRes) ? requestsRes : [];
            const logs = Array.isArray(logsRes) ? logsRes : [];

            setStats({
                totalStaff: staffData.length,
                totalDepartments: departments.length,
                totalRequests: requests.length,
                pendingRequests: requests.filter((r) => r.status === 'Pending').length,
                inProcessRequests: requests.filter((r) => r.status === 'InProcess').length,
                completedRequests: requests.filter((r) => r.status === 'Completed').length,
            });
            setPerformance(buildPerformance(requests));
            setRevenue(buildRevenue(logs));
        } catch (err) {
            if (isInitial) setError('Failed to load dashboard statistics');
            console.error(err);
        } finally {
            if (isInitial) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats(true);
    }, [fetchStats]);

    // Live updates: re-fetch (debounced) when a request is created or its status changes
    const refreshTimerRef = useRef(null);
    const handleRequestsUpdated = useCallback(() => {
        setLivePulse(true);
        setTimeout(() => setLivePulse(false), 1200);
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = setTimeout(() => fetchStats(false), 400);
    }, [fetchStats]);

    useSignalR(true, null, null, handleRequestsUpdated);

    if (loading) {
        return <LoadingSpinner text="Loading dashboard..." />;
    }

    return (
        <>
            {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

            {isAdminDashboardSuite ? (
                <div className="p-4 sm:p-10 space-y-6 sm:space-y-12 max-w-7xl mx-auto">
                    <section>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="font-headline text-[clamp(22px,6vw,52px)] text-[#4A3728] font-bold leading-tight">
                                Operational Overview
                            </h2>
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full transition-colors ${livePulse ? 'bg-[#D35400] text-white' : 'bg-[#F2EBE1] text-[#8E735B]'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${livePulse ? 'bg-white animate-ping' : 'bg-[#1B7F4B]'}`}></span>
                                Live
                            </span>
                        </div>
                    </section>

                    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        <div className="bg-[#FDFBF7] p-4 sm:p-8 rounded-[20px] sm:rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] group hover:shadow-[0_25px_55px_rgba(15,28,44,0.07)] transition-shadow duration-300">
                            <div className="flex justify-between items-start mb-3 sm:mb-4">
                                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#F2EBE1] border border-[#E3DCD2]/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#D35400]">groups</span>
                                </div>
                                <span className="text-[10px] font-label uppercase tracking-widest text-[#8E735B] font-bold">Live</span>
                            </div>
                            <p className="text-[clamp(24px,5vw,44px)] font-headline text-[#4A3728] mb-1 leading-none">{stats.totalStaff}</p>
                            <p className="font-label text-[11px] uppercase tracking-widest text-[#8E735B] font-bold">Total Staff</p>
                        </div>

                        <div className="bg-[#FDFBF7] p-4 sm:p-8 rounded-[20px] sm:rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] group hover:shadow-[0_25px_55px_rgba(15,28,44,0.07)] transition-shadow duration-300">
                            <div className="flex justify-between items-start mb-3 sm:mb-4">
                                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#F2EBE1] border border-[#E3DCD2]/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#D35400]">account_tree</span>
                                </div>
                            </div>
                            <p className="text-[clamp(24px,5vw,44px)] font-headline text-[#4A3728] mb-1 leading-none">{stats.totalDepartments}</p>
                            <p className="font-label text-[11px] uppercase tracking-widest text-[#8E735B] font-bold">Departments</p>
                        </div>

                        <div className="bg-[#FDFBF7] p-4 sm:p-8 rounded-[20px] sm:rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] group hover:shadow-[0_25px_55px_rgba(15,28,44,0.07)] transition-shadow duration-300">
                            <div className="flex justify-between items-start mb-3 sm:mb-4">
                                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#F2EBE1] border border-[#E3DCD2]/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#D35400]">receipt_long</span>
                                </div>
                                <span className="text-[10px] font-label uppercase tracking-widest text-[#8E735B] font-bold">Today</span>
                            </div>
                            <p className="text-[clamp(24px,5vw,44px)] font-headline text-[#4A3728] mb-1 leading-none">{stats.totalRequests}</p>
                            <p className="font-label text-[11px] uppercase tracking-widest text-[#8E735B] font-bold">Total Requests</p>
                        </div>

                        <div className="bg-[#4A3728] text-white p-4 sm:p-8 rounded-[20px] sm:rounded-[28px] shadow-[0_30px_60px_rgba(14,28,43,0.20)] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-3 sm:mb-4">
                                    <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white">schedule</span>
                                    </div>
                                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-[#D35400] text-white px-2 sm:px-3 py-1 rounded-full shadow-sm">Urgent</span>
                                </div>
                                <p className="text-[clamp(24px,5vw,44px)] font-headline mb-1 leading-none">{stats.pendingRequests}</p>
                                <p className="font-label text-[11px] uppercase tracking-widest text-white/80 font-bold">Pending Requests</p>
                                <div className="flex gap-4 mt-4 pt-3 border-t border-white/10">
                                    <div>
                                        <p className="text-lg font-headline leading-none">{stats.inProcessRequests}</p>
                                        <p className="text-[9px] uppercase tracking-widest text-white/60 font-bold mt-1">In Process</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-headline leading-none">{stats.completedRequests}</p>
                                        <p className="text-[9px] uppercase tracking-widest text-white/60 font-bold mt-1">Completed</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Today's performance by department */}
                        <div className="bg-[#FDFBF7] p-5 sm:p-8 rounded-[22px] sm:rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)]">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-headline text-[clamp(18px,2.6vw,24px)] text-[#4A3728] font-bold leading-tight">Today's Performance</h3>
                                <span className="text-[10px] font-label uppercase tracking-widest text-[#8E735B] font-bold">By Department</span>
                            </div>
                            {performance.length === 0 ? (
                                <p className="text-[14px] text-[#5D534A] py-8 text-center">No requests recorded today yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {performance.map((p) => {
                                        const pct = p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0;
                                        return (
                                            <div key={p.type}>
                                                <div className="flex justify-between items-baseline mb-1.5">
                                                    <span className="text-[13px] font-bold text-[#4A3728]">{p.type}</span>
                                                    <span className="text-[12px] text-[#5D534A]">
                                                        <span className="text-[#1B7F4B] font-bold">{p.completed}</span> / {p.total} completed
                                                        {p.pending > 0 && <span className="text-[#D35400] ml-2">{p.pending} open</span>}
                                                    </span>
                                                </div>
                                                <div className="h-2.5 w-full bg-[#F2EBE1] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#1B7F4B] rounded-full transition-all duration-500"
                                                        style={{ width: `${pct}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Revenue trend (last 6 months) */}
                        <div className="bg-[#FDFBF7] p-5 sm:p-8 rounded-[22px] sm:rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)]">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-headline text-[clamp(18px,2.6vw,24px)] text-[#4A3728] font-bold leading-tight">Revenue Trend</h3>
                                <span className="text-[10px] font-label uppercase tracking-widest text-[#8E735B] font-bold">Last 6 Months</span>
                            </div>
                            {(() => {
                                const maxRev = Math.max(1, ...revenue.map((r) => r.total));
                                const totalRev = revenue.reduce((s, r) => s + r.total, 0);
                                return (
                                    <>
                                        <p className="text-[clamp(24px,4vw,36px)] font-headline text-[#4A3728] leading-none mb-6">
                                            €{totalRev.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            <span className="text-[12px] font-label uppercase tracking-widest text-[#8E735B] font-bold ml-2">total</span>
                                        </p>
                                        <div className="flex items-end justify-between gap-2 sm:gap-3 h-40">
                                            {revenue.map((r) => {
                                                const h = Math.round((r.total / maxRev) * 100);
                                                return (
                                                    <div key={r.key} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                                                        <span className="text-[10px] font-bold text-[#5D534A]">
                                                            {r.total > 0 ? `€${Math.round(r.total)}` : ''}
                                                        </span>
                                                        <div
                                                            className="w-full bg-[#D35400] rounded-t-lg transition-all duration-500 min-h-[2px]"
                                                            style={{ height: `${Math.max(h, r.total > 0 ? 4 : 0)}%` }}
                                                            title={`${r.label}: €${r.total.toFixed(2)}`}
                                                        ></div>
                                                        <span className="text-[10px] font-label uppercase tracking-widest text-[#8E735B] font-bold">{r.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                );
                            })()}
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

                    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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
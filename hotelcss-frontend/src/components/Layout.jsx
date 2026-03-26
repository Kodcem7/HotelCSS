import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import ChatWidget from './ChatWidget';
import { getMyPoints } from '../api/rooms';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isAdminSuite =
        (user?.role === 'Admin' || user?.role === 'Manager') && location.pathname.startsWith('/admin');

    const [myPoints, setMyPoints] = useState(0);

    useEffect(() => {
        const fetchPoints = async () => {
            if (user?.role === 'Room') {
                try {
                    const res = await getMyPoints();
                    const points = res?.data || 0;
                    setMyPoints(points);
                } catch (err) {
                    console.error("Could not load points", err);
                }
            }
        };

        fetchPoints();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getRoleDisplayName = (role) => {
        const roleMap = {
            Admin: 'Administrator',
            Manager: 'Manager',
            Reception: 'Reception',
            Staff: 'Staff',
            Housekeeping: 'Housekeeping',
            Restaurant: 'Restaurant',
            Room: 'Room',
        };
        return roleMap[role] || role;
    };

    const getDashboardTitle = () => {
        const path = location.pathname;
        if (path.includes('/admin')) return 'Admin Dashboard';
        if (path.includes('/manager')) return 'Manager Dashboard';
        if (path.includes('/reception')) return 'Reception Dashboard';
        if (path.includes('/staff')) return 'Staff Dashboard';
        if (path.includes('/room')) return 'Room Dashboard';
        return 'Dashboard';
    };

    const getDashboardRoot = () => {
        const path = location.pathname;
        if (path.startsWith('/admin')) return '/admin';
        if (path.startsWith('/manager')) return '/manager';
        if (path.startsWith('/reception')) return '/reception';
        if (path.startsWith('/staff')) return '/staff';
        if (path.startsWith('/room')) return '/room';
        return '/';
    };

    const isMainDashboard = () => {
        const path = location.pathname;
        const root = getDashboardRoot();
        return path === root || path === root + '/';
    };

    const showBackButton = !isMainDashboard();

    return (
        <div
            className={`font-body antialiased flex min-h-screen ${
                isAdminSuite ? 'bg-[#FDFBF7] text-[#2C241E]' : 'bg-background text-on-surface'
            }`}
            style={isAdminSuite ? { zoom: 0.8 } : undefined}
        >

            {/* SideNavBar */}
            {isAdminSuite ? (
                <aside className="h-screen w-72 fixed left-0 top-0 bg-[#FDFBF7] flex flex-col py-8 pr-5 z-50 border-r border-[#E3DCD2]/30 overflow-hidden">
                    <div className="px-8 mb-12">
                        <h1 className="font-headline text-lg text-[#4A3728] font-bold leading-tight">
                            Parador Beach Hotel
                        </h1>
                        <p className="font-label text-[11px] uppercase tracking-widest text-[#8E735B] mt-1">
                            Admin Suite
                        </p>
                    </div>

                    <nav className="flex-grow space-y-1 overflow-y-auto overflow-x-hidden">
                        {/* NOTE: Dashboard '/admin' için Staff aktif görünsün */}
                        <Link
                            to="/admin/staff"
                            className="flex items-center gap-4 py-3 px-8 text-[#D35400] bg-white rounded-r-full font-bold transition-all active:scale-98"
                        >
                            <span className="material-symbols-outlined">badge</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">STAFF</span>
                        </Link>

                        <Link
                            to="/admin/departments"
                            className="flex items-center gap-4 py-3 px-8 text-[#5D534A] hover:text-[#D35400] hover:translate-x-1 transition-transform duration-300"
                        >
                            <span className="material-symbols-outlined">corporate_fare</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">DEPARTMENTS</span>
                        </Link>

                        <Link
                            to="/admin/requests"
                            className="flex items-center gap-4 py-3 px-8 text-[#5D534A] hover:text-[#D35400] hover:translate-x-1 transition-transform duration-300"
                        >
                            <span className="material-symbols-outlined">notification_important</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">REQUESTS</span>
                        </Link>

                        <Link
                            to="/admin/rooms"
                            className="flex items-center gap-4 py-3 px-8 text-[#5D534A] hover:text-[#D35400] hover:translate-x-1 transition-transform duration-300"
                        >
                            <span className="material-symbols-outlined">bed</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">ROOMS</span>
                        </Link>

                        <Link
                            to="/admin/rooms/create"
                            className="flex items-center gap-4 py-3 px-8 text-[#5D534A] hover:text-[#D35400] hover:translate-x-1 transition-transform duration-300"
                        >
                            <span className="material-symbols-outlined">add_circle</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">CREATE ROOMS</span>
                        </Link>

                        <Link
                            to="/admin/service-items"
                            className="flex items-center gap-4 py-3 px-8 text-[#5D534A] hover:text-[#D35400] hover:translate-x-1 transition-transform duration-300"
                        >
                            <span className="material-symbols-outlined">room_service</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">SERVICE ITEMS</span>
                        </Link>

                        <Link
                            to="/admin/events"
                            className="flex items-center gap-4 py-3 px-8 text-[#5D534A] hover:text-[#D35400] hover:translate-x-1 transition-transform duration-300"
                        >
                            <span className="material-symbols-outlined">event</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">EVENTS</span>
                        </Link>

                        <Link
                            to="/reception/services"
                            className="flex items-center gap-4 py-3 px-8 text-[#5D534A] hover:text-[#D35400] hover:translate-x-1 transition-transform duration-300"
                        >
                            <span className="material-symbols-outlined">concierge</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">RECEPTION SERVICES</span>
                        </Link>

                        <Link
                            to="/admin/vouchers"
                            className="flex items-center gap-4 py-3 px-8 text-[#5D534A] hover:text-[#D35400] hover:translate-x-1 transition-transform duration-300"
                        >
                            <span className="material-symbols-outlined">confirmation_number</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">VOUCHERS</span>
                        </Link>
                    </nav>

                    <footer className="mt-auto space-y-1 pb-4 flex-shrink-0">
                        <Link
                            to="/settings"
                            className="flex items-center gap-4 py-3 px-8 text-[#5D534A] hover:text-[#D35400] hover:translate-x-1 transition-transform duration-300"
                        >
                            <span className="material-symbols-outlined">settings</span>
                            <span className="font-label text-[12px] uppercase tracking-widest">Settings</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-4 py-3 px-8 text-[#5D534A] hover:text-[#B22222] transition-transform duration-300 hover:translate-x-1 w-full text-left"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            <span className="font-label text-[12px] uppercase tracking-widest">Logout</span>
                        </button>
                    </footer>
                </aside>
            ) : (
                <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-50 dark:bg-slate-950 flex flex-col py-8 pr-4 z-50 border-r border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-8 mb-12">
                        <h1 className="font-serif text-lg text-indigo-950 dark:text-white leading-tight">Parador Beach Hotel</h1>
                        <p className="font-label text-[11px] all-caps tracking-widest text-slate-500 mt-1 uppercase">
                            {getRoleDisplayName(user?.role)} Suite
                        </p>
                    </div>

                    <nav className="flex-grow space-y-1 overflow-y-auto overflow-x-hidden">
                        {/* NOTE: You can wrap these links in {user?.role === 'Admin' && (...)} to hide them from guests/staff */}
                        <Link
                            to="/admin/staff"
                            className="flex items-center gap-4 py-3 px-8 text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 rounded-r-full font-bold shadow-sm transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined">badge</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">Staff</span>
                        </Link>
                        <Link to="/admin/departments" className="flex items-center gap-4 py-3 px-8 text-slate-500 hover:text-indigo-600 transition-transform duration-300 hover:translate-x-1">
                            <span className="material-symbols-outlined">corporate_fare</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">Departments</span>
                        </Link>
                        <Link to="/admin/requests" className="flex items-center gap-4 py-3 px-8 text-slate-500 hover:text-indigo-600 transition-transform duration-300 hover:translate-x-1">
                            <span className="material-symbols-outlined">notification_important</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">Requests</span>
                        </Link>
                        <Link to="/admin/rooms" className="flex items-center gap-4 py-3 px-8 text-slate-500 hover:text-indigo-600 transition-transform duration-300 hover:translate-x-1">
                            <span className="material-symbols-outlined">bed</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">Rooms</span>
                        </Link>
                        <Link to="/admin/rooms/create" className="flex items-center gap-4 py-3 px-8 text-slate-500 hover:text-indigo-600 transition-transform duration-300 hover:translate-x-1">
                            <span className="material-symbols-outlined">add_circle</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">Create Rooms</span>
                        </Link>
                        <Link to="/admin/service-items" className="flex items-center gap-4 py-3 px-8 text-slate-500 hover:text-indigo-600 transition-transform duration-300 hover:translate-x-1">
                            <span className="material-symbols-outlined">room_service</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">Service Items</span>
                        </Link>
                        <Link to="/admin/events" className="flex items-center gap-4 py-3 px-8 text-slate-500 hover:text-indigo-600 transition-transform duration-300 hover:translate-x-1">
                            <span className="material-symbols-outlined">event</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">Events</span>
                        </Link>
                        <Link to="/reception/services" className="flex items-center gap-4 py-3 px-8 text-slate-500 hover:text-indigo-600 transition-transform duration-300 hover:translate-x-1">
                            <span className="material-symbols-outlined">concierge</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">Reception Services</span>
                        </Link>
                        <Link to="/admin/vouchers" className="flex items-center gap-4 py-3 px-8 text-slate-500 hover:text-indigo-600 transition-transform duration-300 hover:translate-x-1">
                            <span className="material-symbols-outlined">confirmation_number</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">Vouchers</span>
                        </Link>
                    </nav>

                    <footer className="mt-auto space-y-1 flex-shrink-0">
                        <Link to="/settings" className="flex items-center gap-4 py-3 px-8 text-slate-500 hover:text-indigo-600 transition-transform duration-300 hover:translate-x-1">
                            <span className="material-symbols-outlined">settings</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">Settings</span>
                        </Link>
                        <button onClick={handleLogout} className="flex items-center gap-4 py-3 px-8 text-slate-500 hover:text-red-600 transition-transform duration-300 hover:translate-x-1 w-full text-left">
                            <span className="material-symbols-outlined">logout</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">Logout</span>
                        </button>
                    </footer>
                </aside>
            )}

            {/* Main Canvas */}
            <main className={`flex-1 min-h-screen flex flex-col ${isAdminSuite ? 'ml-72' : 'ml-64'}`}>

                {/* TopNavBar */}
                {isAdminSuite ? (
                    <header className="sticky top-0 z-40 bg-[#FDFBF7]/80 border-b border-[#E3DCD2]/30 backdrop-blur-xl flex justify-between items-center w-full px-8 py-4">
                        <div className="flex items-center gap-6">
                            {showBackButton && (
                                <button
                                    onClick={() => navigate(getDashboardRoot())}
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-[#F2EBE1] hover:bg-[#E8DFD1] text-[#5D534A] transition-colors"
                                    aria-label="Back to dashboard"
                                >
                                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                                </button>
                            )}

                            <span className="font-headline italic text-2xl text-[#4A3728]">
                                Admin Page
                            </span>

                            {/* Search Bar - Hidden on smaller screens */}
                            <div className="relative hidden lg:block">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8E735B] text-sm">search</span>
                                <input
                                    type="text"
                                    placeholder="Search operations..."
                                    className="bg-[#F2EBE1] border-none rounded-full py-2 pl-10 pr-4 text-base w-64 focus:ring-2 focus:ring-[#D35400]/20 transition-all text-[#2C241E] placeholder:text-[#8E735B]"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="p-2 rounded-full hover:bg-[#F2EBE1] transition-colors relative">
                                <span className="material-symbols-outlined text-[#4A3728]">notifications</span>
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#D35400] rounded-full"></span>
                            </button>

                            <div className="flex items-center gap-3 pl-4 border-l border-[#E3DCD2]/30">
                                <div className="text-right hidden sm:block">
                                    <p className="text-base font-semibold text-[#4A3728] leading-none">
                                        {user?.username || 'Admin User'}
                                    </p>
                                    <p className="text-[11px] text-[#8E735B] uppercase tracking-wider mt-1">
                                        {user?.role === 'Manager' ? 'HOTEL MANAGER' : 'ADMINISTRATOR'}
                                    </p>
                                </div>

                                <div className="w-10 h-10 rounded-full bg-[#F2EBE1] flex items-center justify-center text-[#4A3728] font-bold shadow-sm ring-2 ring-white">
                                    {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
                                </div>
                            </div>
                        </div>
                    </header>
                ) : (
                    <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_20px_40px_rgba(15,28,44,0.06)] flex justify-between items-center w-full px-8 py-4">
                        <div className="flex items-center gap-6">
                            {showBackButton && (
                                <button
                                    onClick={() => navigate(getDashboardRoot())}
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                                    aria-label="Back to dashboard"
                                >
                                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                                </button>
                            )}
                            <span className="font-serif italic text-xl text-indigo-900 dark:text-indigo-300">
                                {getDashboardTitle()}
                            </span>

                            {/* Search Bar - Hidden on smaller screens */}
                            <div className="relative hidden lg:block">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                                <input
                                    type="text"
                                    placeholder="Search operations..."
                                    className="bg-surface-container-high border-none rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:ring-1 focus:ring-primary/20 transition-all dark:bg-slate-800 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">

                            {/* Points Badge for Guests */}
                            {user?.role === 'Room' && (
                                <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200 px-3 py-1.5 rounded-full shadow-sm">
                                    <span className="material-symbols-outlined text-amber-500 text-sm">stars</span>
                                    <span className="font-bold text-amber-700 tracking-wide">
                                        {myPoints} <span className="text-xs font-semibold uppercase">pts</span>
                                    </span>
                                </div>
                            )}

                            <button className="p-2 rounded-full hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors relative">
                                <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">notifications</span>
                                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
                            </button>

                            <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/20">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">
                                        {user?.username || 'Guest User'}
                                    </p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter mt-1">
                                        {getRoleDisplayName(user?.role)}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold shadow-sm ring-2 ring-white dark:ring-slate-800">
                                    {user?.username ? user.username.charAt(0).toUpperCase() : 'G'}
                                </div>
                            </div>
                        </div>
                    </header>
                )}

                {/* Content Area */}
                <div className={`flex-1 w-full ${isAdminSuite ? 'bg-[#FDFBF7]' : 'bg-background'} overflow-x-auto`}>
                    {children}
                </div>
            </main>

            {/* Chat widget for Room users */}
            {user?.role === 'Room' && <ChatWidget />}
        </div>
    );
};

export default Layout;
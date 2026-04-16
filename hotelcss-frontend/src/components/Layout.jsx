import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import ChatWidget from './ChatWidget';
import { getMyPoints } from '../api/rooms';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();

    // Suite görünümü, sadece kullanıcının ana dashboard rolüne göre belirlenmeli.
    // Böylece Admin/Manager reception services'e girse bile layout reception suite'e geçmez,
    // sadece içerik /reception/services sayfası olarak açılır.
    const role = user?.role;
    const isStaffLike =
        role === 'Staff' ||
        role === 'Housekeeping' ||
        role === 'HouseKeeping' ||
        role === 'Restaurant' ||
        role === 'Kitchen' ||
        role === 'Technic';

    const suiteKey = role === 'Admin' ? 'admin' : role === 'Manager' ? 'manager' : role === 'Reception' ? 'reception' : isStaffLike ? 'staff' : role === 'Room' ? 'room' : 'none';

    const isDashboardSuite = suiteKey !== 'none';

    const suiteLabel =
        suiteKey === 'admin'
            ? t('adminSuite', 'ADMIN SUITE')
            : suiteKey === 'manager'
              ? t('hotelManagerSuite', 'HOTEL MANAGER SUITE')
              : suiteKey === 'reception'
                ? t('receptionSuite', 'RECEPTION SUITE')
                : suiteKey === 'staff'
                  ? t('staffSuite', 'STAFF SUITE')
                  : suiteKey === 'room'
                    ? t('roomSuite', 'ROOM SUITE')
                    : '';

    const navItemsBySuite = {
        admin: [
            { to: '/admin/staff', label: 'STAFF', icon: 'badge' },
            { to: '/admin/departments', label: 'DEPARTMENTS', icon: 'corporate_fare' },
            { to: '/admin/requests', label: 'REQUESTS', icon: 'notification_important' },
            { to: '/admin/rooms', label: 'ROOMS', icon: 'bed' },
            { to: '/admin/rooms/create', label: 'CREATE ROOMS', icon: 'add_circle' },
            { to: '/admin/service-items', label: 'SERVICE ITEMS', icon: 'room_service' },
            { to: '/admin/events', label: 'EVENTS', icon: 'event' },
            { to: '/admin/reception/services', label: 'RECEPTION SERVICES', icon: 'concierge' },
            { to: '/admin/vouchers', label: 'VOUCHERS', icon: 'confirmation_number' },
        ],
        manager: [
            { to: '/manager', label: 'DASHBOARD', icon: 'dashboard' },
            { to: '/admin/staff', label: 'STAFF', icon: 'badge' },
            { to: '/admin/departments', label: 'DEPARTMENTS', icon: 'corporate_fare' },
            { to: '/admin/requests', label: 'REQUESTS', icon: 'notification_important' },
            { to: '/admin/rooms', label: 'ROOMS', icon: 'bed' },
            { to: '/admin/rooms/create', label: 'CREATE ROOMS', icon: 'add_circle' },
            { to: '/admin/service-items', label: 'SERVICE ITEMS', icon: 'room_service' },
            { to: '/admin/events', label: 'EVENTS', icon: 'event' },
            { to: '/manager/reception/services', label: 'RECEPTION SERVICES', icon: 'concierge' },
            { to: '/admin/vouchers', label: 'VOUCHERS', icon: 'confirmation_number' },
        ],
        reception: [
            { to: '/reception', label: 'DASHBOARD', icon: 'dashboard' },
            { to: '/reception/rooms', label: 'ROOMS', icon: 'bed' },
            { to: '/reception/requests', label: 'REQUESTS', icon: 'notification_important' },
            { to: '/reception/services', label: 'RECEPTION SERVICES', icon: 'concierge' },
            { to: '/reception/rewards', label: 'REWARDS', icon: 'confirmation_number' },
        ],
        staff: [
            { to: '/staff', label: 'MY TASKS', icon: 'badge' },
            { to: '/staff/requests', label: 'REQUESTS', icon: 'notification_important' },
        ],
        room: [
            { to: '/room', label: 'DASHBOARD', icon: 'dashboard' },
            { to: '/room/point-shop', label: 'POINT SHOP', icon: 'stars' },
            { to: '/room/history', label: 'MY REQUESTS', icon: 'history' },
            { to: '/room/campaigns', label: 'CAMPAIGNS', icon: 'campaign' },
            { to: '/room/vouchers', label: 'VOUCHERS', icon: 'confirmation_number' },
            { to: '/room/events', label: 'EVENTS', icon: 'event' },
        ],
        none: [],
    };

    const navItems = navItemsBySuite[suiteKey] ?? [];

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
            Admin: t('administrator', 'Administrator'),
            Manager: t('manager', 'Manager'),
            Reception: t('reception', 'Reception'),
            Staff: t('staff', 'Staff'),
            Housekeeping: t('housekeeping', 'Housekeeping'),
            Restaurant: t('restaurant', 'Restaurant'),
            Room: t('room', 'Room'),
        };
        return roleMap[role] || role;
    };

    const getDashboardTitle = () => {
        const path = location.pathname;
        // Daha spesifik path'ler önce gelmeli; aksi halde "/reception/services" gibi alt rotalar
        // "Reception Dashboard" olarak yanlış başlıklanır.
        if (path.startsWith('/admin/reception/services')) return 'Reception Services';
        if (path.startsWith('/manager/reception/services')) return 'Reception Services';

        if (path.startsWith('/admin/')) return 'Admin Dashboard';
        if (path === '/admin' || path === '/admin/') return 'Admin Dashboard';

        if (path.startsWith('/manager/')) return 'Manager Dashboard';
        if (path === '/manager' || path === '/manager/') return 'Manager Dashboard';

        if (path.startsWith('/reception/services')) return 'Reception Services';
        if (path.startsWith('/reception/requests')) return 'Reception Requests';
        if (path.startsWith('/reception/rewards')) return 'Reward Vouchers';
        if (path.startsWith('/reception/rooms')) return 'Reception Rooms';
        if (path === '/reception' || path === '/reception/') return 'Reception Dashboard';

        if (path.startsWith('/staff/requests')) return 'Staff Requests';
        if (path === '/staff' || path === '/staff/') return 'Staff Dashboard';

        if (path.startsWith('/room/rewards')) return 'Room Rewards';
        if (path.startsWith('/room/point-shop')) return 'Point Shop';
        if (path.startsWith('/room/history')) return 'My Requests';
        if (path.startsWith('/room/campaigns')) return 'Campaigns';
        if (path.startsWith('/room/vouchers')) return 'Room Vouchers';
        if (path.startsWith('/room/events')) return 'Hotel Events';
        if (path === '/room' || path === '/room/') return 'Room Dashboard';
        if (path === '/settings' || path === '/settings/') return t('settings', 'Settings');
        return t('dashboard', 'Dashboard');
    };

    const getDashboardRoot = () => {
        // back butonu / ana dashboard dönüşü, path'e değil kullanıcı rolüne göre belirlenmeli.
        if (suiteKey === 'admin') return '/admin';
        if (suiteKey === 'manager') return '/manager';
        if (suiteKey === 'reception') return '/reception';
        if (suiteKey === 'staff') return '/staff';
        if (suiteKey === 'room') return '/room';
        return '/';
    };

    const isMainDashboard = () => {
        const path = location.pathname;
        const root = getDashboardRoot();
        return path === root || path === root + '/';
    };

    const showBackButton = !isMainDashboard();

    // --- AKTİF LİNK STİL KONTROLLERİ ---
    // Eğer bulunduğumuz sayfanın adresi, linkin adresine eşitse "aktif" stili döndürür.
    const getAdminLinkClass = (path) => {
        const isActive = location.pathname === path;
        return isActive
            ? "flex items-center gap-4 py-3 px-8 text-[#D35400] bg-white rounded-r-full font-bold transition-all active:scale-98 shadow-sm"
            : "flex items-center gap-4 py-3 px-8 text-[#5D534A] hover:text-[#D35400] transition-transform duration-300";
    };

    const getStandardLinkClass = (path) => {
        const isActive = location.pathname === path;
        return isActive
            ? "flex items-center gap-4 py-3 px-8 text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 rounded-r-full font-bold shadow-sm transition-all active:scale-95"
            : "flex items-center gap-4 py-3 px-8 text-slate-500 hover:text-indigo-600 transition-transform duration-300 hover:translate-x-1";
    };

    return (
        <div
            className={`font-body antialiased flex min-h-screen ${
                isDashboardSuite ? 'bg-[#FDFBF7] text-[#2C241E]' : 'bg-background text-on-surface'
            }`}
            style={isDashboardSuite ? { zoom: 0.8 } : undefined}
        >

            {/* SideNavBar */}
            {isDashboardSuite ? (
                <aside className="w-72 fixed inset-y-0 left-0 bg-[#FDFBF7] flex flex-col py-8 pr-5 z-50 border-r border-[#E3DCD2]/30">
                    {/* Header Kısmı: flex-shrink-0 vererek sıkışmasını önlüyoruz */}
                    <div className="px-8 mb-8 flex-shrink-0">
                        <h1 className="font-headline text-lg text-[#4A3728] font-bold leading-tight">
                            Parador Beach Hotel
                        </h1>
                        <p className="font-label text-[11px] uppercase tracking-widest text-[#8E735B] mt-1">{suiteLabel}</p>
                    </div>

                    {/* Navigasyon: flex-1 ile ortadaki tüm boş alanı kaplamasını sağlıyoruz */}
                    <nav className="flex-1 min-h-0 space-y-1 overflow-y-auto overflow-x-hidden">
                        {navItems.map((item) => (
                            <Link key={item.to} to={item.to} className={getAdminLinkClass(item.to)}>
                                <span className="material-symbols-outlined">{item.icon}</span>
                                <span className="font-label text-[11px] uppercase tracking-widest">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Footer: mt-auto sayesinde flex-1'in itmesiyle tamamen en alta yapışır */}
                    <footer className="mt-auto pt-4 border-t border-[#E3DCD2]/40 space-y-1 flex-shrink-0 bg-[#FDFBF7]">
                        <Link to="/settings" className={getAdminLinkClass('/settings')}>
                            <span className="material-symbols-outlined">settings</span>
                            <span className="font-label text-[12px] uppercase tracking-widest">{t('settings', 'Settings')}</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-4 py-3 px-8 text-[#5D534A] hover:text-[#B22222] transition-transform duration-300 w-full text-left"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            <span className="font-label text-[12px] uppercase tracking-widest">{t('logout', 'Logout')}</span>
                        </button>
                    </footer>
                </aside>
            ) : (
                <aside className="w-64 fixed inset-y-0 left-0 bg-slate-50 dark:bg-slate-950 flex flex-col py-8 pr-4 z-50 border-r border-slate-200 dark:border-slate-800">
                    <div className="px-8 mb-8 flex-shrink-0">
                        <h1 className="font-serif text-lg text-indigo-950 dark:text-white leading-tight">Parador Beach Hotel</h1>
                        <p className="font-label text-[11px] all-caps tracking-widest text-slate-500 mt-1 uppercase">
                            {getRoleDisplayName(user?.role)} Suite
                        </p>
                    </div>

                    <nav className="flex-1 min-h-0 space-y-1 overflow-y-auto overflow-x-hidden">
                        <Link to="/admin/staff" className={getStandardLinkClass('/admin/staff')}>
                            <span className="material-symbols-outlined">badge</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">Staff</span>
                        </Link>
                        <Link to="/admin/departments" className={getStandardLinkClass('/admin/departments')}>
                            <span className="material-symbols-outlined">corporate_fare</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">Departments</span>
                        </Link>
                        <Link to="/admin/requests" className={getStandardLinkClass('/admin/requests')}>
                            <span className="material-symbols-outlined">notification_important</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">Requests</span>
                        </Link>
                        <Link to="/admin/rooms" className={getStandardLinkClass('/admin/rooms')}>
                            <span className="material-symbols-outlined">bed</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">Rooms</span>
                        </Link>
                        <Link to="/admin/rooms/create" className={getStandardLinkClass('/admin/rooms/create')}>
                            <span className="material-symbols-outlined">add_circle</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">Create Rooms</span>
                        </Link>
                        <Link to="/admin/service-items" className={getStandardLinkClass('/admin/service-items')}>
                            <span className="material-symbols-outlined">room_service</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">Service Items</span>
                        </Link>
                        <Link to="/admin/events" className={getStandardLinkClass('/admin/events')}>
                            <span className="material-symbols-outlined">event</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">Events</span>
                        </Link>
                        <Link to="/reception/services" className={getStandardLinkClass('/reception/services')}>
                            <span className="material-symbols-outlined">concierge</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">Reception Services</span>
                        </Link>
                        <Link to="/admin/vouchers" className={getStandardLinkClass('/admin/vouchers')}>
                            <span className="material-symbols-outlined">confirmation_number</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">Vouchers</span>
                        </Link>
                    </nav>

                    <footer className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1 flex-shrink-0 bg-slate-50 dark:bg-slate-950">
                        <Link to="/settings" className={getStandardLinkClass('/settings')}>
                            <span className="material-symbols-outlined">settings</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">{t('settings', 'Settings')}</span>
                        </Link>
                        <button onClick={handleLogout} className="flex items-center gap-4 py-3 px-8 text-slate-500 hover:text-red-600 transition-transform duration-300 w-full text-left">
                            <span className="material-symbols-outlined">logout</span>
                            <span className="font-label text-[11px] uppercase tracking-widest">{t('logout', 'Logout')}</span>
                        </button>
                    </footer>
                </aside>
            )}

            {/* Main Canvas */}
            <main className={`flex-1 min-h-screen flex flex-col ${isDashboardSuite ? 'ml-72' : 'ml-64'}`}>
                {/* Header kodun mevcut haliyle bıraktım, değişikliğe ihtiyacı yok */}
                {isDashboardSuite ? (
                    <header className="sticky top-0 z-40 bg-[#FDFBF7]/80 border-b border-[#E3DCD2]/30 backdrop-blur-xl flex justify-between items-center w-full px-8 py-4">
                        <div className="flex items-center gap-6">
                            {showBackButton && (
                                <button
                                    onClick={() => navigate(getDashboardRoot())}
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-[#F2EBE1] hover:bg-[#E8DFD1] text-[#5D534A] transition-colors"
                                    aria-label={t('backToDashboard', 'Back to dashboard')}
                                >
                                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                                </button>
                            )}

                            <span className="font-headline italic text-2xl text-[#4A3728]">{getDashboardTitle()}</span>

                            <div className="relative hidden lg:block">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8E735B] text-sm">search</span>
                                <input
                                    type="text"
                                    placeholder={t('searchOperations', 'Search operations...')}
                                    className="bg-[#F2EBE1] border-none rounded-full py-2 pl-10 pr-4 text-base w-64 focus:ring-2 focus:ring-[#D35400]/20 transition-all text-[#2C241E] placeholder:text-[#8E735B]"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Points Badge for Room users (suite header) */}
                            {user?.role === 'Room' && (
                                <div className="flex items-center gap-1.5 bg-[#F2EBE1] border border-[#E3DCD2]/30 px-3 py-1.5 rounded-full shadow-sm">
                                    <span className="material-symbols-outlined text-[#D35400] text-sm">stars</span>
                                    <span className="font-bold text-[#4A3728] tracking-wide">
                                        {myPoints} <span className="text-xs font-semibold uppercase text-[#8E735B]">pts</span>
                                    </span>
                                </div>
                            )}

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
                                        {(user?.role === 'Manager' ? 'HOTEL MANAGER' : getRoleDisplayName(user?.role)).toUpperCase()}
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
                                    aria-label={t('backToDashboard', 'Back to dashboard')}
                                >
                                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                                </button>
                            )}
                            <span className="font-serif italic text-xl text-indigo-900 dark:text-indigo-300">
                                {getDashboardTitle()}
                            </span>

                            <div className="relative hidden lg:block">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                                <input
                                    type="text"
                                    placeholder={t('searchOperations', 'Search operations...')}
                                    className="bg-surface-container-high border-none rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:ring-1 focus:ring-primary/20 transition-all dark:bg-slate-800 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
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
                <div className={`flex-1 w-full ${isDashboardSuite ? 'bg-[#FDFBF7]' : 'bg-background'} overflow-x-auto p-6`}>
                    {children}
                </div>
            </main>

            {/* Chat widget for Room users */}
            {user?.role === 'Room' && <ChatWidget />}
        </div>
    );
};

export default Layout;
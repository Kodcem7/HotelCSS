import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { getRoom } from '../api/rooms';
import { getPendingSurvey } from '../api/surveys';
import SurveyModal from '../components/SurveyModal';
import GuestEmailBanner from '../components/GuestEmailBanner';

import { getActiveEvents, getMealList, getActiveBonusEvents } from '../api/events';

const RoomDashboard = () => {
    const { user } = useAuth();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [pendingSurvey, setPendingSurvey] = useState(null);
    const [checkingSurvey, setCheckingSurvey] = useState(true);

    const [notifications, setNotifications] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    // 👇 1. Extract room number synchronously for the greeting UI
    const displayRoomNumber = user?.username ? user.username.replace('Room', '') : '';

    // 👇 2. Time-based dynamic greeting function
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Good morning,';
        if (hour >= 12 && hour < 18) return 'Good afternoon,';
        if (hour >= 18 && hour < 22) return 'Good evening,';
        return 'Good night,';
    };

    useEffect(() => {
        const fetchRoomStatus = async () => {
            try {
                setLoading(true);
                setError('');

                const username = user?.username || '';
                const roomNumber = parseInt(username.replace('Room', ''), 10);

                const res = await getRoom(roomNumber);
                setRoom(res?.data || null);

                try {
                    const surveyRes = await getPendingSurvey();
                    if (surveyRes?.hasPendingSurvey) {
                        setPendingSurvey(surveyRes.survey);
                    }
                } catch (surveyErr) {
                    console.error("Could not check for surveys:", surveyErr);
                } finally {
                    setCheckingSurvey(false);
                }

            } catch (err) {
                setError('Failed to load room information');
                console.error(err);
                setCheckingSurvey(false);
            } finally {
                setLoading(false);
            }
        };

        const fetchDashboardEvents = async () => {
            try {
                setLoadingEvents(true);

                const [activeRes, mealRes, bonusRes] = await Promise.all([
                    getActiveEvents().catch(() => []),
                    getMealList().catch(() => []),
                    getActiveBonusEvents().catch(() => [])
                ]);

                const activeEvents = Array.isArray(activeRes) ? activeRes : activeRes?.data ?? [];
                const mealEvents = Array.isArray(mealRes) ? mealRes : mealRes?.data ?? [];
                const bonusEvents = Array.isArray(bonusRes) ? bonusRes : bonusRes?.data ?? [];

                const allEvents = [...activeEvents, ...mealEvents, ...bonusEvents];

                const uniqueEvents = Array.from(new Map(allEvents.map(item => [item.id || item.Id, item])).values());

                setNotifications(uniqueEvents);
            } catch (err) {
                console.error("Failed to load events:", err);
            } finally {
                setLoadingEvents(false);
            }
        };

        if (user?.role === 'Room') {
            fetchRoomStatus();
            fetchDashboardEvents();
        } else {
            setLoading(false);
            setCheckingSurvey(false);
            setLoadingEvents(false);
        }
    }, [user?.role, user?.username]);

    const handleEmailSaved = () => {
        if (room) {
            setRoom({ ...room, mailSent: true });
        }
    };

    const isRoomAvailable = room && room.status === 'Available';

    const formatEventDate = (dateString) => {
        if (!dateString) return '';
        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return <LoadingSpinner text="Loading room dashboard..." />;
    }

    return (
        <>
            <div className="p-4 sm:p-10 space-y-8 sm:space-y-12 max-w-7xl mx-auto">

                {room && (
                    <GuestEmailBanner
                        isMailSent={room.mailSent}
                        onEmailSaved={handleEmailSaved}
                    />
                )}

                <section>
                    {/* 👇 3. Replaced "Room Overview" with dynamic greeting */}
                    <h2 className="font-headline text-[clamp(30px,6vw,52px)] text-[#4A3728] mb-2 font-bold leading-tight">
                        {getGreeting()} Room {displayRoomNumber}
                    </h2>
                    <p className="text-[14px] text-[#5D534A] leading-relaxed">
                        Welcome to your hotel-app. You can create requests, view events, learn your pick-up time, see the hotel events and more.
                    </p>

                    {room && (
                        <div className="mt-4 inline-flex items-center gap-2 bg-[#F2EBE1] border border-[#E3DCD2]/30 px-4 py-2 rounded-full">
                            <span className="font-semibold text-[#4A3728]">Room</span>
                            <span className="font-semibold text-[#4A3728]">#{room.roomNumber}</span>
                            <span
                                className={`ml-2 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${room.status === 'Occupied' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                {room.status}
                            </span>
                        </div>
                    )}

                    {isRoomAvailable && (
                        <p className="mt-3 text-[13px] text-[#B22222]">
                            This room is currently empty. Creating new requests is disabled.
                        </p>
                    )}
                </section>

                {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

                {!loadingEvents && notifications.length > 0 && (
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold tracking-widest uppercase text-[#8E735B] ml-2">
                            Today's Highlights
                        </h3>

                        <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {notifications.map((event) => {
                                const id = event.id || event.Id;
                                const title = event.title || event.Title;
                                const eventType = event.eventType || event.EventType;
                                const startDate = event.startDate || event.StartDate;
                                const endDate = event.endDate || event.EndDate;

                                const description = event.description ||
                                    event.Description ||
                                    event.details ||
                                    event.Details ||
                                    (eventType === 'BonusPoint'
                                        ? 'Participate in this exclusive offer to earn extra reward points during your stay.'
                                        : 'Join us for this special hotel event.');

                                let iconName = 'celebration';
                                if (eventType === 'Meal') iconName = 'restaurant';
                                if (eventType === 'BonusPoint') iconName = 'stars';

                                return (
                                    <div
                                        key={id}
                                        className="flex-none w-[85%] sm:w-[350px] snap-center bg-[#FDFBF7] border border-[#E3DCD2]/40 rounded-[24px] p-5 flex flex-col justify-between shadow-[0_10px_30px_rgba(15,28,44,0.03)] hover:shadow-[0_15px_35px_rgba(15,28,44,0.06)] transition-shadow"
                                    >
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#F2EBE1] flex items-center justify-center text-[#D35400]">
                                                <span className="material-symbols-outlined">
                                                    {iconName}
                                                </span>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <h4 className="font-headline font-bold text-lg text-[#4A3728]">
                                                        {title}
                                                    </h4>
                                                    <span className="bg-[#D35400]/10 text-[#D35400] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                        {eventType}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-[#5D534A] leading-relaxed line-clamp-2">
                                                    {description}
                                                </p>
                                            </div>
                                        </div>

                                        {startDate && (
                                            <div className="pt-3 mt-auto border-t border-[#E3DCD2]/40 flex items-center gap-2 text-xs font-semibold text-[#8E735B]">
                                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                <span>
                                                    {formatEventDate(startDate)}
                                                    {endDate && ` - ${formatEventDate(endDate)}`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
                    {isRoomAvailable ? (
                        <div className="bg-[#F2EBE1] p-5 sm:p-8 rounded-[22px] sm:rounded-[28px] opacity-60 cursor-not-allowed border border-[#E3DCD2]/20">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FDFBF7] border border-[#E3DCD2]/30 flex items-center justify-center mb-5 sm:mb-6">
                                <span className="material-symbols-outlined text-[#D35400] text-3xl">add</span>
                            </div>
                            <h3 className="font-headline text-xl text-[#4A3728] font-bold mb-2">Create Service Request</h3>
                            <p className="text-[14px] text-[#5D534A] leading-relaxed">
                                Not available while the room status is Available.
                            </p>
                        </div>
                    ) : (
                        <Link
                            to="/room/create-request"
                            className="bg-[#F2EBE1] p-5 sm:p-8 rounded-[22px] sm:rounded-[28px] flex flex-col justify-between hover:bg-white transition-all group border border-[#E3DCD2]/20 hover:border-[#E3DCD2]/40 shadow-none hover:shadow-[0_25px_55px_rgba(15,28,44,0.08)]"
                        >
                            <div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FDFBF7] border border-[#E3DCD2]/30 flex items-center justify-center mb-5 sm:mb-6">
                                    <span className="material-symbols-outlined text-[#D35400] text-3xl">add</span>
                                </div>
                                <h3 className="font-headline text-xl text-[#4A3728] font-bold mb-2">Create Service Request</h3>
                                <p className="text-[14px] text-[#5D534A] leading-relaxed mb-6">Request room service or amenities.</p>
                            </div>
                            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#D35400] group-hover:gap-4 transition-all">
                                Open <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </span>
                        </Link>
                    )}

                    <Link
                        to="/room/report-issue"
                        className={`bg-[#F2EBE1] p-5 sm:p-8 rounded-[22px] sm:rounded-[28px] flex flex-col justify-between hover:bg-white transition-all group border border-[#E3DCD2]/20 hover:border-[#E3DCD2]/40 shadow-none hover:shadow-[0_25px_55px_rgba(15,28,44,0.08)] ${isRoomAvailable ? 'opacity-60 cursor-not-allowed' : ''}`}
                        onClick={(e) => isRoomAvailable && e.preventDefault()}
                    >
                        <div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FDFBF7] border border-[#E3DCD2]/30 flex items-center justify-center mb-5 sm:mb-6">
                                <span className="material-symbols-outlined text-[#D35400] text-3xl">report</span>
                            </div>
                            <h3 className="font-headline text-xl text-[#4A3728] font-bold mb-2">Report an Issue</h3>
                            <p className="text-[14px] text-[#5D534A] leading-relaxed mb-6">Report problems in your room.</p>
                        </div>
                        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#D35400] group-hover:gap-4 transition-all">
                            Open <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </span>
                    </Link>

                    <Link
                        to="/room/reception-request"
                        className={`bg-[#F2EBE1] p-5 sm:p-8 rounded-[22px] sm:rounded-[28px] flex flex-col justify-between hover:bg-white transition-all group border border-[#E3DCD2]/20 hover:border-[#E3DCD2]/40 shadow-none hover:shadow-[0_25px_55px_rgba(15,28,44,0.08)] ${isRoomAvailable ? 'opacity-60 cursor-not-allowed' : ''}`}
                        onClick={(e) => isRoomAvailable && e.preventDefault()}
                    >
                        <div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FDFBF7] border border-[#E3DCD2]/30 flex items-center justify-center mb-5 sm:mb-6">
                                <span className="material-symbols-outlined text-[#D35400] text-3xl">concierge</span>
                            </div>
                            <h3 className="font-headline text-xl text-[#4A3728] font-bold mb-2">Reception Request</h3>
                            <p className="text-[14px] text-[#5D534A] leading-relaxed mb-6">Wake-up calls or other services.</p>
                        </div>
                        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#D35400] group-hover:gap-4 transition-all">
                            Open <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </span>
                    </Link>

                    <Link
                        to="/room/history"
                        className="bg-[#F2EBE1] p-5 sm:p-8 rounded-[22px] sm:rounded-[28px] flex flex-col justify-between hover:bg-white transition-all group border border-[#E3DCD2]/20 hover:border-[#E3DCD2]/40 shadow-none hover:shadow-[0_25px_55px_rgba(15,28,44,0.08)]"
                    >
                        <div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FDFBF7] border border-[#E3DCD2]/30 flex items-center justify-center mb-5 sm:mb-6">
                                <span className="material-symbols-outlined text-[#D35400] text-3xl">history</span>
                            </div>
                            <h3 className="font-headline text-xl text-[#4A3728] font-bold mb-2">My Requests</h3>
                            <p className="text-[14px] text-[#5D534A] leading-relaxed mb-6">View your request history.</p>
                        </div>
                        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#D35400] group-hover:gap-4 transition-all">
                            Open <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </span>
                    </Link>

                    <Link
                        to="/room/point-shop"
                        className="bg-[#F2EBE1] p-5 sm:p-8 rounded-[22px] sm:rounded-[28px] flex flex-col justify-between hover:bg-white transition-all group border border-[#E3DCD2]/20 hover:border-[#E3DCD2]/40 shadow-none hover:shadow-[0_25px_55px_rgba(15,28,44,0.08)]"
                    >
                        <div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FDFBF7] border border-[#E3DCD2]/30 flex items-center justify-center mb-5 sm:mb-6">
                                <span className="material-symbols-outlined text-[#D35400] text-3xl">stars</span>
                            </div>
                            <h3 className="font-headline text-xl text-[#4A3728] font-bold mb-2">Point Shop</h3>
                            <p className="text-[14px] text-[#5D534A] leading-relaxed mb-6">Spend points on rewards.</p>
                        </div>
                        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#D35400] group-hover:gap-4 transition-all">
                            Open <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </span>
                    </Link>

                    <Link
                        to="/room/vouchers"
                        className="bg-[#F2EBE1] p-5 sm:p-8 rounded-[22px] sm:rounded-[28px] flex flex-col justify-between hover:bg-white transition-all group border border-[#E3DCD2]/20 hover:border-[#E3DCD2]/40 shadow-none hover:shadow-[0_25px_55px_rgba(15,28,44,0.08)]"
                    >
                        <div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FDFBF7] border border-[#E3DCD2]/30 flex items-center justify-center mb-5 sm:mb-6">
                                <span className="material-symbols-outlined text-[#D35400] text-3xl">confirmation_number</span>
                            </div>
                            <h3 className="font-headline text-xl text-[#4A3728] font-bold mb-2">My Vouchers</h3>
                            <p className="text-[14px] text-[#5D534A] leading-relaxed mb-6">View your earned reward codes.</p>
                        </div>
                        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#D35400] group-hover:gap-4 transition-all">
                            Open <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </span>
                    </Link>
                </section>

                <section className="bg-[#FDFBF7] p-5 sm:p-8 rounded-[22px] sm:rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)]">
                    <h3 className="font-headline text-2xl text-[#4A3728] font-bold mb-2">Room Information</h3>
                    <p className="text-[14px] text-[#5D534A] leading-relaxed">
                        This dashboard is for room-based access. Guests can scan QR codes to access room-specific features.
                    </p>
                </section>
            </div>

            {pendingSurvey && !checkingSurvey && (
                <SurveyModal
                    survey={pendingSurvey}
                    onComplete={() => setPendingSurvey(null)}
                />
            )}
        </>
    );
};

export default RoomDashboard;
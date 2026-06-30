import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext'; // ✅ Added Language Context
import { getRoom } from '../api/rooms';
import { getPendingSurvey } from '../api/surveys';
import SurveyModal from '../components/SurveyModal';
import GuestEmailBanner from '../components/GuestEmailBanner';
import PointsHowItWorks from '../components/PointsHowItWorks';

import { getActiveEvents, getMealList, getActiveBonusEvents } from '../api/events';

// Responsive action card: compact horizontal row on mobile, full card on >= sm.
const ActionCard = ({ to, icon, title, desc, t, disabled = false, onClick }) => {
    const containerClass =
        "bg-[#F2EBE1] p-3.5 sm:p-8 rounded-2xl sm:rounded-[28px] flex flex-row sm:flex-col items-center sm:items-stretch sm:justify-between gap-3 sm:gap-0 transition-all group border border-[#E3DCD2]/20 " +
        (disabled
            ? "opacity-60 cursor-not-allowed"
            : "hover:bg-white hover:border-[#E3DCD2]/40 shadow-none hover:shadow-[0_25px_55px_rgba(15,28,44,0.08)]");

    const inner = (
        <>
            <div className="flex flex-row sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0 flex-1 sm:flex-none min-w-0 w-full">
                <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-full bg-[#FDFBF7] border border-[#E3DCD2]/30 flex items-center justify-center sm:mb-6">
                    <span className="material-symbols-outlined text-[#D35400] text-[22px] sm:text-3xl">{icon}</span>
                </div>
                <div className="flex-1 sm:flex-none min-w-0">
                    <h3 className="font-headline text-[15px] sm:text-xl text-[#4A3728] font-bold sm:mb-2 leading-snug">{t(title)}</h3>
                    <p className="text-[12px] sm:text-[14px] text-[#5D534A] leading-snug sm:leading-relaxed sm:mb-6">{t(desc)}</p>
                </div>
                <span className="material-symbols-outlined text-[#D35400] text-2xl sm:hidden flex-shrink-0">chevron_right</span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#D35400] group-hover:gap-4 transition-all">
                {t('Open')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </span>
        </>
    );

    if (disabled) {
        return <div className={containerClass}>{inner}</div>;
    }
    return (
        <Link to={to} className={containerClass} onClick={onClick}>
            {inner}
        </Link>
    );
};

const RoomDashboard = () => {
    const { user } = useAuth();
    const { translateUiText } = useLanguage(); // ✅ Hook initialized
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [pendingSurvey, setPendingSurvey] = useState(null);
    const [checkingSurvey, setCheckingSurvey] = useState(true);

    const [notifications, setNotifications] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    // Ids of highlight cards whose full menu is expanded.
    const [expandedHighlights, setExpandedHighlights] = useState([]);
    const toggleHighlight = (id) => {
        setExpandedHighlights((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // 👇 1. Extract room number synchronously for the greeting UI
    const displayRoomNumber = user?.username ? user.username.replace('Room', '') : '';

    // 👇 2. Time-based dynamic greeting function
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Good morning';
        if (hour >= 12 && hour < 18) return 'Good afternoon';
        if (hour >= 18 && hour < 22) return 'Good evening';
        return 'Good Night'; // Matches the exact key in your PHRASE_TRANSLATIONS
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
                setError(translateUiText('Failed to load room information'));
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
            // Submitting the email + KVKK is what actually checks the room in,
            // so flip the local status too — otherwise the action cards stay
            // disabled (isRoomAvailable) until a manual refresh.
            setRoom({ ...room, mailSent: true, status: 'Occupied' });
        }
    };

    const isRoomAvailable = room && room.status === 'Available';

    const formatEventDate = (dateString) => {
        if (!dateString) return '';
        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return <LoadingSpinner text={translateUiText('Loading room dashboard...')} />;
    }

    return (
        <>
            <div className="p-4 sm:p-10 space-y-6 sm:space-y-12 max-w-7xl mx-auto">

                {room && (
                    <GuestEmailBanner
                        isMailSent={room.mailSent}
                        onEmailSaved={handleEmailSaved}
                    />
                )}

                <section>
                    {/* 👇 3. Replaced "Room Overview" with dynamic greeting */}
                    <h2 className="font-headline text-[clamp(22px,6vw,52px)] text-[#4A3728] mb-1.5 sm:mb-2 font-bold leading-tight">
                        {translateUiText(getGreeting())}, {translateUiText('Room')} {displayRoomNumber}
                    </h2>
                    <p className="text-[13px] sm:text-[14px] text-[#5D534A] leading-relaxed">
                        {translateUiText('Welcome to your hotel-app. You can create requests,view events,learn your pick-up time,see the hotel events and more')}
                    </p>

                    {room && (
                        <div className="mt-4 inline-flex items-center gap-2 bg-[#F2EBE1] border border-[#E3DCD2]/30 px-4 py-2 rounded-full">
                            <span className="font-semibold text-[#4A3728]">{translateUiText('Room')}</span>
                            <span className="font-semibold text-[#4A3728]">#{room.roomNumber}</span>
                            <span
                                className={`ml-2 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${room.status === 'Occupied'
                                    ? 'bg-red-100 text-red-700'
                                    : room.status === 'Available'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                {translateUiText(room.status)}
                            </span>
                        </div>
                    )}

                    {isRoomAvailable && (
                        <p className="mt-3 text-[13px] text-[#B22222]">
                            {translateUiText('This room is currently empty. Creating new requests is disabled.')} {/* Ensure you add this to PHRASE_TRANSLATIONS if you haven't! */}
                        </p>
                    )}
                </section>

                {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

                {!loadingEvents && notifications.length > 0 && (
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold tracking-widest uppercase text-[#8E735B] ml-2">
                            {translateUiText("Today's Highlights")} {/* Ensure you add this to PHRASE_TRANSLATIONS if you haven't! */}
                        </h3>

                        <div className="flex items-start overflow-x-auto gap-4 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {notifications.map((event) => {
                                const id = event.id || event.Id;
                                const title = event.title || event.Title;
                                const eventType = event.eventType || event.EventType;
                                const startDate = event.startDate || event.StartDate;
                                const endDate = event.endDate || event.EndDate;

                                // Meal events store their menu in MealInfo (not Description),
                                // so surface that for meals; otherwise use the usual fields.
                                const mealInfo = event.mealInfo || event.MealInfo;

                                const description = (eventType === 'Meal' && mealInfo)
                                    ? mealInfo
                                    : event.description ||
                                    event.Description ||
                                    event.details ||
                                    event.Details ||
                                    (eventType === 'BonusPoint'
                                        ? translateUiText('Participate in this exclusive offer to earn extra reward points during your stay.')
                                        : eventType === 'Meal'
                                            ? translateUiText("Today's menu will be shared shortly.")
                                            : translateUiText('Join us for this special hotel event.'));

                                const isMeal = eventType === 'Meal';
                                const isExpanded = expandedHighlights.includes(id);
                                // Only offer "Show full menu" when the text would actually be clipped.
                                const isExpandable = isMeal && !!mealInfo &&
                                    (mealInfo.split('\n').filter((l) => l.trim()).length > 6 || mealInfo.length > 220);

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
                                                        {translateUiText(title)}
                                                    </h4>
                                                    <span className="bg-[#D35400]/10 text-[#D35400] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                        {translateUiText(eventType)}
                                                    </span>
                                                </div>
                                                <p className={`text-sm text-[#5D534A] leading-relaxed whitespace-pre-line ${isMeal ? (isExpanded ? '' : 'line-clamp-6') : 'line-clamp-2'}`}>
                                                    {translateUiText(description)}
                                                </p>
                                                {isExpandable && (
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleHighlight(id)}
                                                        className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-[#D35400] hover:text-[#b94702] transition-colors"
                                                    >
                                                        {isExpanded ? translateUiText('Show less') : translateUiText('Show full menu')}
                                                        <span className="material-symbols-outlined text-[16px]">
                                                            {isExpanded ? 'expand_less' : 'expand_more'}
                                                        </span>
                                                    </button>
                                                )}
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

                <section className="flex flex-col gap-2.5 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
                    {isRoomAvailable ? (
                        <ActionCard
                            t={translateUiText}
                            icon="add"
                            title="Create Service Request"
                            desc="Not available while the room status is Available."
                            disabled
                        />
                    ) : (
                        <ActionCard
                            t={translateUiText}
                            to="/room/create-request"
                            icon="add"
                            title="Create Service Request"
                            desc="Request room service or amenities."
                        />
                    )}

                    <ActionCard
                        t={translateUiText}
                        to="/room/report-issue"
                        icon="report"
                        title="Report an Issue"
                        desc="Report problems in your room."
                        disabled={isRoomAvailable}
                        onClick={(e) => isRoomAvailable && e.preventDefault()}
                    />

                    <ActionCard
                        t={translateUiText}
                        to="/room/reception-request"
                        icon="concierge"
                        title="Reception Request"
                        desc="Learn your hotel pick-up time and set a Wake-Up call."
                        disabled={isRoomAvailable}
                        onClick={(e) => isRoomAvailable && e.preventDefault()}
                    />

                    <ActionCard
                        t={translateUiText}
                        to="/room/history"
                        icon="history"
                        title="My Requests"
                        desc="View your request history."
                    />

                    <ActionCard
                        t={translateUiText}
                        to="/room/point-shop"
                        icon="stars"
                        title="Point Shop"
                        desc="Spend points on exclusive rewards."
                    />

                    <ActionCard
                        t={translateUiText}
                        to="/room/vouchers"
                        icon="confirmation_number"
                        title="My Vouchers"
                        desc="View earned reward codes."
                    />
                </section>

                <PointsHowItWorks />

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
import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
// 👇 Import getMealList alongside getActiveEvents!
import { getActiveEvents, getMealList } from '../api/events';

const HotelEventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // "cardbox" seçimleri: Event General veya Günlük Menüler
    const [activeTab, setActiveTab] = useState('general');

    const fetchEvents = async () => {
        // 👇 Fetch BOTH General Events and Meals at the same time!
        const [generalRes, mealRes] = await Promise.all([
            getActiveEvents(),
            getMealList()
        ]);

        // Combine them into one big array for the page to use
        const combinedEvents = [
            ...(generalRes?.data || []),
            ...(mealRes?.data || [])
        ];

        setEvents(combinedEvents);
    };

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                setError('');
                await fetchEvents();
            } catch (err) {
                setError('Failed to load hotel events');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    const generalEvents = useMemo(() => {
        return (events || []).filter((ev) => ev.eventType === 'General' || ev.EventType === 'General');
    }, [events]);

    const menuEvents = useMemo(() => {
        return (events || []).filter((ev) => ev.eventType === 'Meal' || ev.EventType === 'Meal');
    }, [events]);

    const displayedEvents = activeTab === 'menu' ? menuEvents : generalEvents;

    if (loading) {
        return (
            <Layout>
                <LoadingSpinner text="Loading hotel events..." />
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="p-10 space-y-10 max-w-7xl mx-auto">
                <section>
                    <h2 className="font-headline text-[52px] text-[#4A3728] mb-2 font-bold leading-tight">
                        Hotel Events & Information
                    </h2>
                    <p className="text-[14px] text-[#5D534A] leading-relaxed">
                        Stay up to date with what&apos;s happening at the hotel and today&apos;s meal information.
                    </p>
                </section>

                {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('general')}
                        className={`bg-[#F2EBE1] rounded-[28px] p-8 hover:bg-white transition border ${activeTab === 'general' ? 'border-[#D35400]/30' : 'border-[#E3DCD2]/20'
                            } hover:border-[#E3DCD2]/40 shadow-none hover:shadow-[0_25px_55px_rgba(15,28,44,0.08)] text-left`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#FDFBF7] border border-[#E3DCD2]/30 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-[#D35400] text-3xl">campaign</span>
                            </div>
                            <div>
                                <h3 className="font-headline text-xl text-[#4A3728] font-bold">Event General</h3>
                                <p className="text-[14px] text-[#5D534A] mt-1">Announcements & hotel updates</p>
                            </div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('menu')}
                        className={`bg-[#F2EBE1] rounded-[28px] p-8 hover:bg-white transition border ${activeTab === 'menu' ? 'border-[#D35400]/30' : 'border-[#E3DCD2]/20'
                            } hover:border-[#E3DCD2]/40 shadow-none hover:shadow-[0_25px_55px_rgba(15,28,44,0.08)] text-left`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#FDFBF7] border border-[#E3DCD2]/30 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-[#D35400] text-3xl">restaurant</span>
                            </div>
                            <div>
                                <h3 className="font-headline text-xl text-[#4A3728] font-bold">Günlük Menüler</h3>
                                <p className="text-[14px] text-[#5D534A] mt-1">Breakfast / lunch / dinner details</p>
                            </div>
                        </div>
                    </button>
                </div>

                <div className="mt-2">
                    {displayedEvents.length === 0 ? (
                        <div className="bg-[#FDFBF7] p-8 rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] text-center text-[#5D534A] max-w-3xl mx-auto">
                            Şu anda aktif içerik bulunmuyor.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {displayedEvents.map((ev) => (
                                <div
                                    key={ev.id}
                                    className="bg-[#FDFBF7] p-8 rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] hover:shadow-[0_25px_55px_rgba(15,28,44,0.07)] transition-shadow duration-300 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-headline text-xl text-[#4A3728] font-bold">{ev.title}</h3>
                                                {ev.eventType && (
                                                    <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#F2EBE1] text-[#4A3728] border border-[#E3DCD2]/40">
                                                        {ev.eventType}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {ev.description && (
                                            <p className="text-[14px] text-[#5D534A] mt-3 whitespace-pre-wrap leading-relaxed">
                                                {ev.description}
                                            </p>
                                        )}

                                        {ev.eventType === 'Meal' && ev.mealInfo && (
                                            <div className="mt-4 text-[12px] text-[#4A3728] bg-[#F2EBE1]/60 border border-[#E3DCD2]/40 rounded-2xl px-4 py-3 whitespace-pre-wrap">
                                                {ev.mealInfo}
                                            </div>
                                        )}

                                        {(ev.startDate || ev.endDate) && (
                                            <p className="text-xs text-[#8E735B] mt-4">
                                                {ev.startDate && (
                                                    <>
                                                        <span className="font-medium">Başlangıç:</span>{' '}
                                                        {new Date(ev.startDate).toLocaleString()}
                                                    </>
                                                )}
                                                {ev.endDate && (
                                                    <>
                                                        {' '}
                                                        • <span className="font-medium">Bitiş:</span>{' '}
                                                        {new Date(ev.endDate).toLocaleString()}
                                                    </>
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default HotelEventsPage;
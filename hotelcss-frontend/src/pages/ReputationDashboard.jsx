import { useEffect, useState, useMemo } from 'react';
import LoadingSpinner from '../components/LoadingSpinner'; // Assuming you have this
import { getTripAdvisorReviews } from '../api/reviews'; // Update path if needed

const ReputationDashboard = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 👇 1. New state to track the active tab
    const [activeTab, setActiveTab] = useState('positive');

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                const data = await getTripAdvisorReviews();
                setReviews(data);
            } catch (err) {
                setError('Could not load live reviews at this time.');
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    // 👇 2. The Senior Move: Splitting the data efficiently
    const positiveReviews = useMemo(() => {
        return reviews.filter(review => parseInt(review.rating, 10) >= 3);
    }, [reviews]);

    const negativeReviews = useMemo(() => {
        return reviews.filter(review => parseInt(review.rating, 10) < 3);
    }, [reviews]);

    // 👇 3. Decide which bucket to show
    const displayedReviews = activeTab === 'positive' ? positiveReviews : negativeReviews;

    // Helper to render star icons based on rating
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    className={`material-symbols-outlined text-[18px] ${i <= rating ? 'text-[#D35400] fill-current' : 'text-[#E3DCD2]'}`}
                    style={{ fontVariationSettings: i <= rating ? "'FILL' 1" : "'FILL' 0" }}
                >
                    star
                </span>
            );
        }
        return stars;
    };

    if (loading) {
        return <LoadingSpinner text="Fetching live guest reviews..." />;
    }

    return (
        <div className="p-4 sm:p-10 max-w-7xl mx-auto">
            <div className="mb-8">
                <h2 className="font-headline text-[clamp(30px,6vw,42px)] text-[#4A3728] font-bold leading-tight flex items-center gap-3">
                    Guest Reputation
                    <img
                        src="https://static.tacdn.com/img2/brand_refresh/Tripadvisor_lockup_horizontal_secondary_registered.svg"
                        alt="TripAdvisor"
                        className="h-6 sm:h-8 mt-2"
                    />
                </h2>
                <p className="text-[14px] text-[#5D534A] leading-relaxed mt-2">
                    Live feedback from your recent visitors.
                </p>
            </div>

            {/* 👇 4. THE TAB BUTTONS */}
            {!error && reviews.length > 0 && (
                <div className="flex gap-6 border-b border-[#E3DCD2]/60 mb-8 pb-2">
                    <button
                        onClick={() => setActiveTab('positive')}
                        className={`pb-3 px-2 font-headline font-bold text-[15px] transition-all duration-300 ${activeTab === 'positive'
                                ? 'text-[#4A3728] border-b-2 border-[#D35400]'
                                : 'text-[#8E735B] hover:text-[#4A3728] border-b-2 border-transparent'
                            }`}
                    >
                        🟢 Positive ({positiveReviews.length})
                    </button>

                    <button
                        onClick={() => setActiveTab('negative')}
                        className={`pb-3 px-2 font-headline font-bold text-[15px] transition-all duration-300 ${activeTab === 'negative'
                                ? 'text-[#4A3728] border-b-2 border-[#D35400]'
                                : 'text-[#8E735B] hover:text-[#4A3728] border-b-2 border-transparent'
                            }`}
                    >
                        🔴 Needs Improvement ({negativeReviews.length})
                    </button>
                </div>
            )}

            {error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-[16px] border border-red-100">
                    {error}
                </div>
            ) : reviews.length === 0 ? (
                <div className="bg-[#FDFBF7] p-8 rounded-[24px] border border-[#E3DCD2]/40 text-center text-[#8E735B]">
                    No recent reviews found.
                </div>
            ) : displayedReviews.length === 0 ? (
                // 👇 Handles the case where a specific tab is completely empty
                <div className="bg-[#FDFBF7] p-8 rounded-[24px] border border-[#E3DCD2]/40 text-center text-[#8E735B]">
                    No {activeTab} reviews found.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 👇 5. Mapping over displayedReviews instead of all reviews */}
                    {displayedReviews.map((review) => {
                        const id = review.id;
                        const title = review.title;
                        const text = review.text;
                        const rating = parseInt(review.rating, 10);
                        const author = review.user?.username || 'Verified Guest';
                        const date = new Date(review.published_date).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', year: 'numeric'
                        });

                        return (
                            <div
                                key={id}
                                className="bg-[#FDFBF7] border border-[#E3DCD2]/40 rounded-[24px] p-6 shadow-[0_10px_30px_rgba(15,28,44,0.03)] flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex gap-1">
                                            {renderStars(rating)}
                                        </div>
                                        <span className="text-xs font-bold text-[#8E735B] bg-[#F2EBE1] px-2.5 py-1 rounded-full">
                                            {date}
                                        </span>
                                    </div>
                                    <h4 className="font-headline font-bold text-lg text-[#4A3728] mb-2 leading-snug">
                                        "{title}"
                                    </h4>
                                    <p className="text-sm text-[#5D534A] leading-relaxed mb-6 line-clamp-4">
                                        {text}
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-[#E3DCD2]/40 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#D35400]/10 flex items-center justify-center text-[#D35400] font-bold text-xs uppercase">
                                        {author.charAt(0)}
                                    </div>
                                    <span className="text-sm font-semibold text-[#4A3728]">
                                        {author}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ReputationDashboard;
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
// 👇 Make sure the import path perfectly matches your setup!
import { getRewardsCatalog, claimReward } from '../api/rewards'; 

const PointShopPage = () => {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [claimingId, setClaimingId] = useState(null);

    useEffect(() => {
        const fetchCatalog = async () => {
            try {
                setLoading(true);
                const res = await getRewardsCatalog();
                
                // Since C# returns Ok(rewards) directly, the array is likely right inside res (or res.data)
                const catalogData = res?.data || res || [];
                setRewards(Array.isArray(catalogData) ? catalogData : []);
            } catch (err) {
                setError('Failed to load the rewards catalog.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCatalog();
    }, []);

    const handleClaim = async (reward) => {
        const confirmClaim = window.confirm(`Spend ${reward.pointsCost} points to claim "${reward.name}"?`);
        if (!confirmClaim) return;

        try {
            setClaimingId(reward.id);
            setError('');
            setSuccess('');
            
            // Call your backend to spend the points and generate the voucher!
            await claimReward(reward.id);
            
            setSuccess(`Successfully claimed ${reward.name}! You can view your code in "My Reward Vouchers".`);
            
            // Note: If you want to update their points in the Header immediately, 
            // you might need to trigger a global state update or refresh the page.
            
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to claim reward. Do you have enough points?');
        } finally {
            setClaimingId(null);
        }
    };

    if (loading) {
        return (
            <Layout>
                <LoadingSpinner text="Loading PointShop..." />
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="p-10 space-y-10 max-w-7xl mx-auto">
                <section className="text-center max-w-3xl mx-auto">
                    <h2 className="font-headline text-[52px] text-[#4A3728] mb-2 font-bold leading-tight">
                        Point Shop
                    </h2>
                    <p className="text-[14px] text-[#5D534A] leading-relaxed">
                        Trade your earned points for exclusive hotel rewards and services.
                    </p>
                </section>

                {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
                {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

                {rewards.length === 0 ? (
                    <div className="bg-[#FDFBF7] p-8 rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] text-center text-[#5D534A] max-w-3xl mx-auto">
                        No rewards are currently available in the catalog. Check back later!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {rewards.map((reward) => (
                            <div
                                key={reward.id}
                                className="bg-[#FDFBF7] rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] hover:shadow-[0_25px_55px_rgba(15,28,44,0.07)] transition-shadow flex flex-col overflow-hidden"
                            >
                                <div className="h-1 bg-gradient-to-r from-[#4A3728] via-[#8E735B] to-[#D35400]" />

                                <div className="p-8 flex-grow flex flex-col">
                                    <h3 className="font-headline text-xl text-[#4A3728] font-bold mb-2">{reward.name}</h3>
                                    <p className="text-[14px] text-[#5D534A] mb-6 flex-grow leading-relaxed">
                                        {reward.description || 'Special hotel reward.'}
                                    </p>

                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#E3DCD2]/40">
                                        <div className="flex items-center gap-1.5 text-[#D35400] font-bold text-lg">
                                            <span className="material-symbols-outlined text-base">stars</span>
                                            {reward.pointsCost}
                                        </div>

                                        <button
                                            onClick={() => handleClaim(reward)}
                                            disabled={claimingId === reward.id}
                                            className={`px-4 py-2 rounded-2xl font-bold text-[12px] uppercase tracking-widest transition-colors border ${
                                                claimingId === reward.id
                                                    ? 'bg-[#F2EBE1] text-[#8E735B] border-[#E3DCD2]/50 cursor-not-allowed'
                                                    : 'bg-[#4A3728] text-white border-[#4A3728] hover:bg-[#3a2b20]'
                                            }`}
                                        >
                                            {claimingId === reward.id ? 'Claiming...' : 'Claim'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default PointShopPage;
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
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">🎁 PointShop</h2>
                <p className="text-gray-600">
                    Trade your earned points for exclusive hotel rewards and services.
                </p>
            </div>

            {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
            {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

            {rewards.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                    No rewards are currently available in the catalog. Check back later!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {rewards.map((reward) => (
                        <div key={reward.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                            {/* Decorative top banner */}
                            <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-500"></div>
                            
                            <div className="p-6 flex-grow flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{reward.name}</h3>
                                {/* Assuming your ServiceItem has a description property */}
                                <p className="text-sm text-gray-600 mb-6 flex-grow">
                                    {reward.description || "Special hotel reward."}
                                </p>
                                
                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-1.5 text-amber-600 font-bold text-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        {reward.pointsCost}
                                    </div>
                                    
                                    <button
                                        onClick={() => handleClaim(reward)}
                                        disabled={claimingId === reward.id}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                                            claimingId === reward.id 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
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
        </Layout>
    );
};

export default PointShopPage;
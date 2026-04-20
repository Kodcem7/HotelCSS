import { useEffect, useMemo, useState } from 'react';
// import Layout from '../components/Layout'; // ❌ REMOVED
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { claimReward, getRewardsCatalog } from '../api/rewards';

const RoomRewardsPage = () => {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [claimingId, setClaimingId] = useState(null);

    const sortedRewards = useMemo(() => {
        return [...(rewards || [])].sort((a, b) => (a.pointsCost ?? 0) - (b.pointsCost ?? 0));
    }, [rewards]);

    const fetchRewards = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await getRewardsCatalog();
            const items = Array.isArray(res) ? res : res?.data ?? [];
            setRewards(items);
        } catch (err) {
            console.error(err);
            setError('Failed to load rewards catalog.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRewards();
    }, []);

    const onClaim = async (item) => {
        try {
            setError('');
            setSuccess('');
            setClaimingId(item.id);
            const res = await claimReward(item.id);
            if (res?.success) {
                setSuccess(res.message || `Voucher created: ${res.voucherCode}`);
            } else {
                setError(res?.message || 'Failed to claim reward.');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to claim reward.');
        } finally {
            setClaimingId(null);
        }
    };

    if (loading) {
        // ✅ No Layout wrapper here anymore
        return <LoadingSpinner text="Loading rewards..." />;
    }

    return (
        <> {/* ✅ Replaced <Layout> with Fragment */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Rewards Catalog</h2>
                <p className="text-gray-600 mt-1 text-sm">
                    Redeem your points for hotel services. After claiming, show the voucher code at
                    reception.
                </p>
            </div>

            {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
            {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

            {sortedRewards.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
                    No rewards available.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {sortedRewards.map((it) => (
                        <div
                            key={it.id}
                            className="bg-white rounded-lg shadow p-5 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-start justify-between gap-3">
                                    <h3 className="text-lg font-semibold text-gray-900">{it.name}</h3>
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-800 whitespace-nowrap">
                                        {it.pointsCost} pts
                                    </span>
                                </div>
                                {it.description && (
                                    <p className="text-sm text-gray-700 mt-2 line-clamp-3">{it.description}</p>
                                )}
                            </div>

                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={() => onClaim(it)}
                                    disabled={claimingId === it.id}
                                    className="w-full px-3 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:bg-blue-300"
                                >
                                    {claimingId === it.id ? 'Claiming...' : 'Claim Reward'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

export default RoomRewardsPage;
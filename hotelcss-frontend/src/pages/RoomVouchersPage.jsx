import { useState, useEffect } from 'react';
// import Layout from '../components/Layout'; // ❌ REMOVED
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getVouchersForRoom } from '../api/rewards';

const RoomVouchersPage = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await getVouchersForRoom();
                const voucherData = res?.data?.data || res?.data || res || [];
                setVouchers(Array.isArray(voucherData) ? voucherData : []);
            } catch (err) {
                setError('Failed to load your reward vouchers.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchVouchers();
    }, []);

    if (loading) {
        // ✅ No Layout here
        return <LoadingSpinner text="Loading your vouchers..." />;
    }

    return (
        <> {/* ✅ Replaced <Layout> with Fragment */}
            <div className="p-4 sm:p-10 space-y-8 sm:space-y-10 max-w-7xl mx-auto">
                <section className="max-w-4xl mx-auto">
                    <h2 className="font-headline text-[clamp(30px,6vw,52px)] text-[#4A3728] mb-2 font-bold leading-tight">
                        My Reward Vouchers
                    </h2>
                    <p className="text-[14px] text-[#5D534A] leading-relaxed">
                        Show these codes to the reception to claim your rewards.
                    </p>
                </section>

                {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

                <div className="max-w-4xl mx-auto bg-[#FDFBF7] rounded-[22px] sm:rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] overflow-hidden">
                    {vouchers.length === 0 ? (
                        <div className="p-6 sm:p-10 text-center text-[#5D534A]">
                            You don&apos;t have any vouchers yet. Visit Point Shop to spend your points.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E3DCD2]/50">
                                <thead className="bg-[#F2EBE1]/55">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-[11px] font-bold text-[#8E735B] uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-3 text-left text-[11px] font-bold text-[#8E735B] uppercase tracking-widest">Reward Item</th>
                                        <th className="px-6 py-3 text-left text-[11px] font-bold text-[#8E735B] uppercase tracking-widest">Voucher Code</th>
                                        <th className="px-6 py-3 text-left text-[11px] font-bold text-[#8E735B] uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E3DCD2]/40">
                                    {vouchers.map((v) => (
                                        <tr key={v.id} className="hover:bg-[#F2EBE1]/35 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-[13px] text-[#5D534A]">
                                                {new Date(v.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-[13px] font-semibold text-[#4A3728]">{v.itemName}</div>
                                                <div className="text-[11px] text-[#8E735B] font-bold">{v.pointsPaid} Points</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-mono text-[14px] font-bold tracking-wider text-[#4A3728] bg-[#F2EBE1]/55 px-3 py-1.5 rounded-2xl border border-[#E3DCD2]/40">
                                                    {v.voucherCode}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-3 py-1 inline-flex text-[11px] leading-5 font-bold rounded-full border ${v.status === 'Pending'
                                                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                            : v.status === 'Completed' || v.status === 'Redeemed'
                                                                ? 'bg-green-100 text-green-800 border-green-200'
                                                                : 'bg-[#F2EBE1] text-[#4A3728] border-[#E3DCD2]/40'
                                                        }`}
                                                >
                                                    {v.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default RoomVouchersPage;
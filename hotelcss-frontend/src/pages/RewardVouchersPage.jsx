import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getVouchersForReception, updateRewardVoucherStatus } from '../api/rewards';

const RewardVouchersPage = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 👇 NEW: State to hold our current filter choice
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                setLoading(true);
                const res = await getVouchersForReception();
                const voucherData = res?.data?.data || res?.data || res || [];
                setVouchers(Array.isArray(voucherData) ? voucherData : []);
            } catch (err) {
                setError('Failed to load reward vouchers');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchVouchers();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateRewardVoucherStatus(id, newStatus);
            setVouchers(prevVouchers =>
                prevVouchers.map(v =>
                    v.id === id ? { ...v, status: newStatus } : v
                )
            );
        } catch (err) {
            setError('Failed to update voucher status.');
            console.error(err);
        }
    };

    // 👇 NEW: The magic filter! 
    // This creates a temporary list based on the dropdown choice.
    const filteredVouchers = vouchers.filter(v => {
        if (filterStatus === 'All') return true;
        return v.status === filterStatus;
    });

    if (loading) {
        return (
            <Layout>
                <LoadingSpinner text="Loading reward vouchers..." />
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="p-10 space-y-8 max-w-7xl mx-auto">
                <section className="text-center max-w-3xl mx-auto">
                    <h2 className="font-headline text-[52px] text-[#4A3728] mb-2 font-bold leading-tight">
                        Reward Vouchers
                    </h2>
                    <p className="text-[14px] text-[#5D534A] leading-relaxed">
                        View and manage guest reward vouchers generated from points.
                    </p>
                </section>

                <div className="max-w-5xl mx-auto w-full space-y-4">
                    <div className="flex justify-center">
                        <div className="flex items-center gap-3 bg-[#FDFBF7] px-4 py-3 rounded-[22px] border border-[#E3DCD2]/40 shadow-sm">
                            <label htmlFor="status-filter" className="text-sm font-semibold text-[#4A3728]">
                                Filter by
                            </label>
                            <select
                                id="status-filter"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E] text-sm outline-none cursor-pointer"
                            >
                                <option value="All">All Vouchers</option>
                                <option value="Pending">Pending</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
                </div>

                <div className="max-w-6xl mx-auto bg-[#FDFBF7] rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] overflow-hidden">
                    {filteredVouchers.length === 0 ? (
                        <div className="p-10 text-center text-[#5D534A]">
                            {vouchers.length === 0
                                ? "No vouchers found in the system."
                                : `No vouchers found with status: ${filterStatus}`}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E3DCD2]/50">
                                <thead className="bg-[#F2EBE1]/55">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-[11px] font-bold text-[#8E735B] uppercase tracking-widest">Room</th>
                                        <th className="px-6 py-3 text-left text-[11px] font-bold text-[#8E735B] uppercase tracking-widest">Item / Reward</th>
                                        <th className="px-6 py-3 text-left text-[11px] font-bold text-[#8E735B] uppercase tracking-widest">Code</th>
                                        <th className="px-6 py-3 text-left text-[11px] font-bold text-[#8E735B] uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-3 text-right text-[11px] font-bold text-[#8E735B] uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E3DCD2]/40">
                                    {filteredVouchers.map((v) => (
                                        <tr key={v.id} className="hover:bg-[#F2EBE1]/35 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-[13px] font-semibold text-[#4A3728]">Room {v.roomNumber}</div>
                                                <div className="text-xs text-[#8E735B]">{new Date(v.createdAt).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-[13px] font-semibold text-[#2C241E]">{v.itemName}</div>
                                                <div className="text-xs text-[#1B7F4B] font-bold">{v.pointsPaid} Points Paid</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-mono text-[13px] font-bold tracking-wider text-[#4A3728] bg-[#F2EBE1] px-3 py-1.5 rounded-full border border-[#E3DCD2]/50">
                                                    {v.voucherCode}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${v.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        v.status === 'Completed' || v.status === 'Redeemed' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                                    {v.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                {v.status === 'Pending' ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(v.id, 'Completed')}
                                                        className="inline-flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-2xl bg-[#D35400] text-white hover:bg-[#b94702] transition"
                                                    >
                                                        Mark Completed
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(v.id, 'Pending')}
                                                        className="inline-flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-2xl bg-[#F2EBE1] text-[#4A3728] hover:bg-[#E8DFD1] transition border border-[#E3DCD2]/40"
                                                    >
                                                        Revert to Pending
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default RewardVouchersPage;
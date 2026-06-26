import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
// 👇 1. Added deleteRewardVoucher to the imports
import { getVouchersForReception, updateRewardVoucherStatus, deleteRewardVoucher, bulkDeleteVouchers } from '../api/rewards';

const RewardVouchersPage = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                setLoading(true);
                setError('');
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

    // 👇 2. NEW: Delete handler with confirmation
    const handleDelete = async (id) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this voucher? This action cannot be undone.");
        if (!isConfirmed) return;

        try {
            await deleteRewardVoucher(id);
            // Instantly remove the deleted voucher from the UI without reloading the page
            setVouchers(prevVouchers => prevVouchers.filter(v => v.id !== id));
        } catch (err) {
            setError('Failed to delete voucher.');
            console.error(err);
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = (ids) => {
        const allSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id));
        setSelectedIds(allSelected ? [] : ids);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete the selected ${selectedIds.length} voucher(s)? This cannot be undone.`)) return;
        try {
            setError('');
            setBulkDeleting(true);
            await bulkDeleteVouchers(selectedIds);
            // Drop the deleted vouchers from the UI without a full reload.
            setVouchers(prev => prev.filter(v => !selectedIds.includes(v.id)));
            setSelectedIds([]);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete selected vouchers.');
            console.error(err);
        } finally {
            setBulkDeleting(false);
        }
    };

    const filteredVouchers = vouchers.filter(v => {
        if (filterStatus === 'All') return true;
        return v.status === filterStatus;
    });

    if (loading) {
        return <LoadingSpinner text="Loading reward vouchers..." />;
    }

    return (
        <>
            <div className="p-4 sm:p-10 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
                <section className="text-center max-w-3xl mx-auto">
                    <h2 className="font-headline text-[clamp(22px,6vw,52px)] text-[#4A3728] mb-2 font-bold leading-tight">
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
                        {selectedIds.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                disabled={bulkDeleting}
                                className="flex items-center justify-center gap-2 px-5 py-3 bg-[#B22222] text-white hover:bg-[#8f1b1b] font-bold text-[12px] uppercase tracking-widest rounded-2xl transition-all shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span>
                                {bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}
                            </button>
                        )}
                    </div>

                    {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
                </div>

                <div className="max-w-6xl mx-auto bg-[#FDFBF7] rounded-[22px] sm:rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] overflow-hidden">
                    {filteredVouchers.length === 0 ? (
                        <div className="p-6 sm:p-10 text-center text-[#5D534A]">
                            {vouchers.length === 0
                                ? "No vouchers found in the system."
                                : `No vouchers found with status: ${filterStatus}`}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E3DCD2]/50">
                                <thead className="bg-[#F2EBE1]/55">
                                    <tr>
                                        <th className="px-6 py-3 text-left w-10">
                                            <input
                                                type="checkbox"
                                                aria-label="Select all vouchers"
                                                className="w-4 h-4 rounded border-[#E3DCD2] text-[#B22222] cursor-pointer"
                                                checked={filteredVouchers.length > 0 && filteredVouchers.every((v) => selectedIds.includes(v.id))}
                                                onChange={() => toggleSelectAll(filteredVouchers.map((v) => v.id))}
                                            />
                                        </th>
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
                                                <input
                                                    type="checkbox"
                                                    aria-label={`Select voucher ${v.voucherCode}`}
                                                    className="w-4 h-4 rounded border-[#E3DCD2] text-[#B22222] cursor-pointer"
                                                    checked={selectedIds.includes(v.id)}
                                                    onChange={() => toggleSelect(v.id)}
                                                />
                                            </td>
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
                                            {/* 👇 3. Updated Action Column with Flexbox and Delete Button */}
                                            <td className="px-6 py-4 whitespace-nowrap flex justify-end items-center gap-2">
                                                {v.status === 'Pending' ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(v.id, 'Completed')}
                                                        className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-2xl bg-[#D35400] text-white hover:bg-[#b94702] transition"
                                                    >
                                                        Mark Completed
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(v.id, 'Pending')}
                                                        className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-2xl bg-[#F2EBE1] text-[#4A3728] hover:bg-[#E8DFD1] transition border border-[#E3DCD2]/40"
                                                    >
                                                        Revert to Pending
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(v.id)}
                                                    className="inline-flex items-center justify-center w-[36px] h-[36px] rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition border border-red-100"
                                                    title="Delete Voucher"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
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

export default RewardVouchersPage;
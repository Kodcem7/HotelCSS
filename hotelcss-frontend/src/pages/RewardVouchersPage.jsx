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
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Reward Vouchers</h2>
                    <p className="text-gray-600 mt-1 text-sm">
                        View and manage guest reward vouchers generated from points.
                    </p>
                </div>

                {/* 👇 NEW: The Filter Dropdown UI */}
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                    <label htmlFor="status-filter" className="text-sm font-medium text-gray-700 pl-2">
                        Filter by:
                    </label>
                    <select
                        id="status-filter"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 border p-1.5 outline-none cursor-pointer"
                    >
                        {/* Make sure these values match your exact C# statuses! */}
                        <option value="All">All Vouchers</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* 👇 Notice we check filteredVouchers.length now, not vouchers.length */}
                {filteredVouchers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        {vouchers.length === 0
                            ? "No vouchers found in the system."
                            : `No vouchers found with status: ${filterStatus}`}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item / Reward</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {/* 👇 Notice we map over filteredVouchers now! */}
                                {filteredVouchers.map((v) => (
                                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">Room {v.roomNumber}</div>
                                            <div className="text-xs text-gray-500">{new Date(v.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{v.itemName}</div>
                                            <div className="text-xs text-green-600 font-semibold">{v.pointsPaid} Points Paid</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm font-bold tracking-wider text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
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
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {v.status === 'Pending' ? (
                                                <button
                                                    onClick={() => handleStatusChange(v.id, 'Completed')}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 transition"
                                                >
                                                    Mark Completed
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleStatusChange(v.id, 'Pending')}
                                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition"
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
        </Layout>
    );
};

export default RewardVouchersPage;
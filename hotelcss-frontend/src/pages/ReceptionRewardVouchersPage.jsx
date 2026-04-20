import { useEffect, useMemo, useState } from 'react';
// import Layout from '../components/Layout'; // ❌ REMOVED
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { getVouchersForReception, updateRewardVoucherStatus } from '../api/rewards';

const STATUS_OPTIONS = [
    { value: 'InProcess', label: 'InProcess' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'Completed', label: 'Completed' },
];

const ReceptionRewardVouchersPage = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    const sorted = useMemo(() => {
        return [...(vouchers || [])].sort((a, b) => {
            const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bd - ad;
        });
    }, [vouchers]);

    const fetchVouchers = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await getVouchersForReception();
            const items = Array.isArray(res) ? res : res?.data ?? [];
            setVouchers(items);
        } catch (err) {
            console.error(err);
            setError('Failed to load reward vouchers.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    const onChangeStatus = async (voucher, newStatus) => {
        try {
            setError('');
            setSuccess('');
            setUpdatingId(voucher.id);
            const res = await updateRewardVoucherStatus(voucher.id, newStatus);
            if (res?.success) {
                setSuccess(res.message || 'Voucher status updated.');
                await fetchVouchers();
            } else {
                setError(res?.message || 'Failed to update voucher status.');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update voucher status.');
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        // ✅ No Layout here
        return <LoadingSpinner text="Loading vouchers..." />;
    }

    return (
        <> {/* ✅ Replaced <Layout> with Fragment */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Reward Vouchers</h2>
                <p className="text-gray-600 mt-1 text-sm">
                    Verify voucher codes from guests and update their status.
                </p>
            </div>

            {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
            {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

            {sorted.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
                    No vouchers found.
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Code
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Room
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Item
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Points Paid
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {sorted.map((v) => (
                                    <tr key={v.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-mono text-gray-900">
                                            {v.voucherCode}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{v.roomNumber}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{v.itemName}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{v.pointsPaid}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {v.createdAt ? new Date(v.createdAt).toLocaleString() : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <select
                                                value={v.status || ''}
                                                disabled={updatingId === v.id}
                                                onChange={(e) => onChangeStatus(v, e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                            >
                                                <option value="" disabled>
                                                    Select...
                                                </option>
                                                {STATUS_OPTIONS.map((s) => (
                                                    <option key={s.value} value={s.value}>
                                                        {s.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
};

export default ReceptionRewardVouchersPage;
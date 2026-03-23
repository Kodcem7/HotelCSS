import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getVouchersForRoom } from '../api/rewards'; // 👈 Using our new function!

const RoomVouchersPage = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                setLoading(true);
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
        return (
            <Layout>
                <LoadingSpinner text="Loading your vouchers..." />
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Reward Vouchers</h2>
                <p className="text-gray-600 mt-1 text-sm">
                    Show these codes to the reception to claim your rewards!
                </p>
            </div>

            {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {vouchers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        You don't have any vouchers yet. Visit the Rewards Catalog to spend your points!
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward Item</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voucher Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {vouchers.map((v) => (
                                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(v.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{v.itemName}</div>
                                            <div className="text-xs text-green-600 font-semibold">{v.pointsPaid} Points</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-lg font-bold tracking-wider text-blue-700 bg-blue-50 px-3 py-1.5 rounded border border-blue-200 shadow-sm">
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

export default RoomVouchersPage;
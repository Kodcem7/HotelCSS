import { useState, useEffect } from 'react';
import { getHistoryLogs, deleteLog, deleteLast6Months } from '../api/historylogs';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString();
};

const formatDateTime = (value) => {
    if (!value) return { date: '—', time: '' };
    const d = new Date(value);
    if (isNaN(d)) return { date: '—', time: '' };
    return { date: d.toLocaleDateString(), time: d.toLocaleTimeString() };
};

const get = (log, ...keys) => {
    for (const key of keys) {
        if (log[key] !== undefined && log[key] !== null) return log[key];
    }
    return null;
};

const UsersLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [expandedRow, setExpandedRow] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError('');
            const responseData = await getHistoryLogs();

            let logsArray = [];
            if (Array.isArray(responseData)) {
                logsArray = responseData;
            } else if (responseData?.$values) {
                logsArray = responseData.$values;
            } else if (responseData?.data) {
                logsArray = responseData.data;
            } else if (responseData?.value) {
                logsArray = responseData.value;
            }

            const sortedLogs = [...logsArray].sort((a, b) => {
                const timeA = new Date(a.timestamp || a.Timestamp);
                const timeB = new Date(b.timestamp || b.Timestamp);
                return timeB - timeA;
            });

            setLogs(sortedLogs);
        } catch (err) {
            setError('Failed to load user logs.');
            console.error('API ERROR:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu log kaydını silmek istediğinize emin misiniz?')) return;
        try {
            setError('');
            setSuccess('');
            await deleteLog(id);
            setSuccess('Log başarıyla silindi.');
            setLogs(logs.filter(log => (log.id || log.Id) !== id));
        } catch (err) {
            setError(err.response?.data?.message || 'Log silinemedi.');
        }
    };

    const handleDeleteOldLogs = async () => {
        if (!window.confirm('UYARI: 6 aydan eski tüm loglar kalıcı olarak silinecek. Devam etmek istiyor musunuz?')) return;
        try {
            setLoading(true);
            setError('');
            setSuccess('');
            const res = await deleteLast6Months();
            setSuccess(res.message || 'Eski loglar temizlendi.');
            await fetchLogs();
        } catch (err) {
            setError(err.response?.data?.message || 'Eski loglar silinemedi.');
            setLoading(false);
        }
    };

    if (loading && logs.length === 0) {
        return <LoadingSpinner text="Loglar yükleniyor..." />;
    }

    const totalMoneySpent = logs.reduce((sum, log) => sum + parseFloat(get(log, 'moneySpent', 'MoneySpent') ?? 0), 0);
    const totalPointsEarned = logs.reduce((sum, log) => sum + (get(log, 'pointsEarned', 'PointsEarned') ?? 0), 0);

    return (
        <div className="p-4 sm:p-10 max-w-7xl mx-auto space-y-8">

            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E3DCD2]/50 pb-6">
                <div>
                    <h2 className="font-headline text-[clamp(30px,5vw,42px)] text-[#4A3728] mb-2 font-bold leading-tight">
                        Misafir Logları
                    </h2>
                    <p className="text-[14px] text-[#5D534A]">
                        Check-out sonrası misafir aktivitelerinin geçmişi.
                    </p>
                </div>
                <button
                    onClick={handleDeleteOldLogs}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-[#B22222]/10 text-[#B22222] hover:bg-[#B22222] hover:text-white border border-[#B22222]/20 font-bold text-[12px] uppercase tracking-widest rounded-xl transition-all shadow-sm whitespace-nowrap"
                >
                    <span className="material-symbols-outlined text-sm">delete_sweep</span>
                    6 Aydan Eskiyi Temizle
                </button>
            </section>

            {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
            {success && (
                <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-bold flex items-center justify-between">
                    <span>{success}</span>
                    <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-900">✕</button>
                </div>
            )}

            {/* Summary Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#FDFBF7] rounded-2xl border border-[#E3DCD2]/40 shadow-sm p-5 flex items-center gap-4">
                    <span className="material-symbols-outlined text-[32px] text-[#D35400]">receipt_long</span>
                    <div>
                        <div className="text-xs text-[#8E735B] uppercase tracking-wider font-bold">Toplam Konaklama</div>
                        <div className="text-2xl font-bold text-[#4A3728]">{logs.length}</div>
                    </div>
                </div>
                <div className="bg-[#FDFBF7] rounded-2xl border border-[#E3DCD2]/40 shadow-sm p-5 flex items-center gap-4">
                    <span className="material-symbols-outlined text-[32px] text-[#1B7F4B]">payments</span>
                    <div>
                        <div className="text-xs text-[#8E735B] uppercase tracking-wider font-bold">Toplam Ciro</div>
                        <div className="text-2xl font-bold text-[#1B7F4B]">€{totalMoneySpent.toFixed(2)}</div>
                    </div>
                </div>
                <div className="bg-[#FDFBF7] rounded-2xl border border-[#E3DCD2]/40 shadow-sm p-5 flex items-center gap-4">
                    <span className="material-symbols-outlined text-[32px] text-[#D35400]">stars</span>
                    <div>
                        <div className="text-xs text-[#8E735B] uppercase tracking-wider font-bold">Toplam Kazanılan Puan</div>
                        <div className="text-2xl font-bold text-[#D35400]">{totalPointsEarned.toLocaleString()} pts</div>
                    </div>
                </div>
            </section>

            {/* Table */}
            <section className="bg-[#FDFBF7] rounded-[24px] border border-[#E3DCD2]/40 shadow-[0_15px_35px_rgba(15,28,44,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1100px]">
                        <thead>
                            <tr className="bg-[#F2EBE1]/50 border-b border-[#E3DCD2]/50 text-[#8E735B] text-[10px] uppercase tracking-widest font-bold">
                                <th className="p-5 w-12">ID</th>
                                <th className="p-5">Kayıt Tarihi</th>
                                <th className="p-5">Oda</th>
                                <th className="p-5">Misafir E-posta</th>
                                <th className="p-5">Check-In</th>
                                <th className="p-5">Check-Out</th>
                                <th className="p-5">Harcama</th>
                                <th className="p-5">Kazanılan Puan</th>
                                <th className="p-5">Harcanan Puan</th>
                                <th className="p-5">Siparişler</th>
                                <th className="p-5 text-right w-16">Sil</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-[#4A3728]">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="p-10 text-center text-[#8E735B] italic">
                                        Henüz log kaydı bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => {
                                    const id = get(log, 'id', 'Id');
                                    const ts = formatDateTime(get(log, 'timestamp', 'Timestamp'));
                                    const guestMail = get(log, 'guestMail', 'GuestMail') || '—';
                                    const roomNumber = get(log, 'roomNumber', 'RoomNumber') || '?';
                                    const checkIn = formatDate(get(log, 'checkInDate', 'CheckInDate'));
                                    const checkOut = formatDate(get(log, 'checkOutDate', 'CheckOutDate'));
                                    const moneySpent = parseFloat(get(log, 'moneySpent', 'MoneySpent') ?? 0).toFixed(2);
                                    const pointsEarned = get(log, 'pointsEarned', 'PointsEarned') ?? 0;
                                    const pointsSpent = get(log, 'pointsSpent', 'PointsSpent') ?? 0;
                                    const ordersSummary = get(log, 'ordersSummary', 'OrdersSummary');
                                    const isExpanded = expandedRow === id;

                                    return (
                                        <>
                                            <tr
                                                key={id}
                                                className="border-b border-[#E3DCD2]/30 hover:bg-[#F2EBE1]/30 transition-colors"
                                            >
                                                {/* ID */}
                                                <td className="p-5 font-mono text-xs text-[#8E735B]">#{id}</td>

                                                {/* Timestamp */}
                                                <td className="p-5 whitespace-nowrap">
                                                    <div className="font-bold">{ts.date}</div>
                                                    <div className="text-xs text-[#8E735B]">{ts.time}</div>
                                                </td>

                                                {/* Room */}
                                                <td className="p-5">
                                                    <span className="inline-flex items-center gap-1.5 bg-[#F2EBE1] border border-[#E3DCD2]/50 px-3 py-1 rounded-lg font-bold text-[#4A3728]">
                                                        <span className="material-symbols-outlined text-[16px] text-[#D35400]">meeting_room</span>
                                                        {roomNumber}
                                                    </span>
                                                </td>

                                                {/* Guest Email */}
                                                <td className="p-5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px] text-[#8E735B]">mail</span>
                                                        <span className="text-[#5D534A] font-medium">{guestMail}</span>
                                                    </div>
                                                </td>

                                                {/* Check-In */}
                                                <td className="p-5 whitespace-nowrap text-[#5D534A]">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px] text-[#1B7F4B]">login</span>
                                                        {checkIn}
                                                    </div>
                                                </td>

                                                {/* Check-Out */}
                                                <td className="p-5 whitespace-nowrap text-[#5D534A]">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px] text-[#B22222]">logout</span>
                                                        {checkOut}
                                                    </div>
                                                </td>

                                                {/* Money Spent */}
                                                <td className="p-5 whitespace-nowrap">
                                                    <span className="font-bold text-[#1B7F4B]">€{moneySpent}</span>
                                                </td>

                                                {/* Points Earned */}
                                                <td className="p-5 whitespace-nowrap">
                                                    <span className="bg-[#D35400]/10 border border-[#D35400]/20 text-[#D35400] px-2.5 py-1 rounded-full font-bold text-xs tracking-wide">
                                                        +{pointsEarned} pts
                                                    </span>
                                                </td>

                                                {/* Points Spent */}
                                                <td className="p-5 whitespace-nowrap">
                                                    {pointsSpent > 0 ? (
                                                        <span className="bg-[#B22222]/10 border border-[#B22222]/20 text-[#B22222] px-2.5 py-1 rounded-full font-bold text-xs tracking-wide">
                                                            -{pointsSpent} pts
                                                        </span>
                                                    ) : (
                                                        <span className="text-[#C4B8AE] text-xs">—</span>
                                                    )}
                                                </td>

                                                {/* Orders Summary */}
                                                <td className="p-5">
                                                    {ordersSummary ? (
                                                        <button
                                                            onClick={() => setExpandedRow(isExpanded ? null : id)}
                                                            className="flex items-center gap-1.5 text-xs font-bold text-[#4A3728] bg-[#F2EBE1] hover:bg-[#E8DDD3] border border-[#E3DCD2]/60 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px] text-[#D35400]">receipt</span>
                                                            Detay
                                                            <span className="material-symbols-outlined text-[14px]">
                                                                {isExpanded ? 'expand_less' : 'expand_more'}
                                                            </span>
                                                        </button>
                                                    ) : (
                                                        <span className="text-[#C4B8AE] text-xs">Sipariş yok</span>
                                                    )}
                                                </td>

                                                {/* Delete */}
                                                <td className="p-5 text-right">
                                                    <button
                                                        onClick={() => handleDelete(id)}
                                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center"
                                                        title="Logu Sil"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* Expandable Orders Row */}
                                            {isExpanded && ordersSummary && (
                                                <tr key={`${id}-orders`} className="bg-[#FDF8F3] border-b border-[#E3DCD2]/30">
                                                    <td colSpan="11" className="px-8 py-4">
                                                        <div className="flex items-start gap-3">
                                                            <span className="material-symbols-outlined text-[20px] text-[#D35400] mt-0.5">shopping_bag</span>
                                                            <div>
                                                                <div className="text-xs font-bold text-[#8E735B] uppercase tracking-wider mb-2">
                                                                    Tamamlanan Siparişler
                                                                </div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {ordersSummary.split(', ').map((item, i) => (
                                                                        <span
                                                                            key={i}
                                                                            className="bg-white border border-[#E3DCD2] text-[#4A3728] px-3 py-1 rounded-lg text-sm font-medium shadow-sm"
                                                                        >
                                                                            {item}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default UsersLogsPage;

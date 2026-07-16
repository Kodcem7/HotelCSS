import { useState, useEffect } from 'react';
import { getHistoryLogs, deleteLog, deleteLast6Months, bulkDeleteLogs, sendEmail } from '../api/historylogs';
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

// Languages offered when sending the survey email (codes match the backend templates).
const MAIL_LANGUAGES = [
    { code: 'tr', label: 'Türkçe' },
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Русский' },
    { code: 'de', label: 'Deutsch' },
    { code: 'da', label: 'Dansk' },
    { code: 'pl', label: 'Polski' },
];

const UsersLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [expandedRow, setExpandedRow] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [sendingId, setSendingId] = useState(null);
    const [mailTargetId, setMailTargetId] = useState(null); // log id whose language picker is open

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
            setSelectedIds([]); // drop stale selection after a reload
        } catch (err) {
            setError('Failed to load user logs.');
            console.error('API ERROR:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this log entry?')) return;
        try {
            setError('');
            setSuccess('');
            await deleteLog(id);
            setSuccess('Log deleted successfully.');
            setLogs(logs.filter(log => (log.id || log.Id) !== id));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete log.');
        }
    };

    const handleDeleteOldLogs = async () => {
        if (!window.confirm('WARNING: This will permanently delete all logs older than 6 months. Do you want to proceed?')) return;
        try {
            setLoading(true);
            setError('');
            setSuccess('');
            const res = await deleteLast6Months();
            setSuccess(res.message || 'Old logs cleared successfully.');
            await fetchLogs();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to clear old logs.');
            setLoading(false);
        }
    };

    const handleExportCsv = () => {
        if (logs.length === 0) {
            setError('There is nothing to export yet.');
            return;
        }
        const esc = (v) => {
            const s = (v ?? '').toString();
            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        };
        const headers = ['ID', 'Log Date', 'Room', 'Guest Email', 'Check-In', 'Check-Out', 'Money Spent (EUR)', 'Points Earned', 'Points Spent', 'Orders'];
        const rows = logs.map((log) => [
            get(log, 'id', 'Id'),
            formatDate(get(log, 'timestamp', 'Timestamp')),
            get(log, 'roomNumber', 'RoomNumber') ?? '',
            get(log, 'guestMail', 'GuestMail') ?? '',
            formatDate(get(log, 'checkInDate', 'CheckInDate')),
            formatDate(get(log, 'checkOutDate', 'CheckOutDate')),
            parseFloat(get(log, 'moneySpent', 'MoneySpent') ?? 0).toFixed(2),
            get(log, 'pointsEarned', 'PointsEarned') ?? 0,
            get(log, 'pointsSpent', 'PointsSpent') ?? 0,
            get(log, 'ordersSummary', 'OrdersSummary') ?? '',
        ].map(esc).join(','));
        // Leading BOM so Excel opens UTF-8 correctly.
        const csv = '﻿' + [headers.join(','), ...rows].join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `guest-logs-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setSuccess(`Exported ${logs.length} log${logs.length === 1 ? '' : 's'} to CSV.`);
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        const ids = logs.map((log) => get(log, 'id', 'Id'));
        const allSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id));
        setSelectedIds(allSelected ? [] : ids);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete the selected ${selectedIds.length} log(s)?`)) return;
        try {
            setError('');
            setSuccess('');
            setBulkDeleting(true);
            const res = await bulkDeleteLogs(selectedIds);
            setSuccess(res?.message || 'Selected logs deleted successfully.');
            await fetchLogs();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete selected logs.');
        } finally {
            setBulkDeleting(false);
        }
    };

    const handleSendMail = async (id, lang) => {
        setMailTargetId(null); // close the language picker
        try {
            setError('');
            setSuccess('');
            setSendingId(id);
            const res = await sendEmail(id, lang);
            setSuccess(res?.message || 'Survey email sent successfully.');
            // Reflect the sent state without a full reload.
            setLogs((prev) => prev.map((log) =>
                (get(log, 'id', 'Id') === id) ? { ...log, isMailSent: true, IsMailSent: true } : log
            ));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send email.');
        } finally {
            setSendingId(null);
        }
    };

    if (loading && logs.length === 0) {
        return <LoadingSpinner text="Loading user logs..." />;
    }

    const totalMoneySpent = logs.reduce((sum, log) => sum + parseFloat(get(log, 'moneySpent', 'MoneySpent') ?? 0), 0);
    const totalPointsEarned = logs.reduce((sum, log) => sum + (get(log, 'pointsEarned', 'PointsEarned') ?? 0), 0);

    return (
        <div className="p-4 sm:p-10 max-w-7xl mx-auto space-y-8">

            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E3DCD2]/50 pb-6">
                <div>
                    <h2 className="font-headline text-[clamp(24px,4vw,42px)] text-[#4A3728] mb-2 font-bold leading-tight">
                        Guest Logs
                    </h2>
                    <p className="text-[14px] text-[#5D534A]">
                        Post check-out history of guest activity.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            disabled={bulkDeleting}
                            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#B22222] text-white hover:bg-[#8B1A1A] font-bold text-[12px] uppercase tracking-widest rounded-xl transition-all shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            {bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}
                        </button>
                    )}
                    <button
                        onClick={handleExportCsv}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1B7F4B]/10 text-[#1B7F4B] hover:bg-[#1B7F4B] hover:text-white border border-[#1B7F4B]/20 font-bold text-[12px] uppercase tracking-widest rounded-xl transition-all shadow-sm whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-sm">download</span>
                        Export CSV
                    </button>
                    <button
                        onClick={handleDeleteOldLogs}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-[#B22222]/10 text-[#B22222] hover:bg-[#B22222] hover:text-white border border-[#B22222]/20 font-bold text-[12px] uppercase tracking-widest rounded-xl transition-all shadow-sm whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-sm">delete_sweep</span>
                        Clear &gt; 6 Months
                    </button>
                </div>
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
                        <div className="text-xs text-[#8E735B] uppercase tracking-wider font-bold">Total Stays</div>
                        <div className="text-2xl font-bold text-[#4A3728]">{logs.length}</div>
                    </div>
                </div>
                <div className="bg-[#FDFBF7] rounded-2xl border border-[#E3DCD2]/40 shadow-sm p-5 flex items-center gap-4">
                    <span className="material-symbols-outlined text-[32px] text-[#1B7F4B]">payments</span>
                    <div>
                        <div className="text-xs text-[#8E735B] uppercase tracking-wider font-bold">Total Revenue</div>
                        <div className="text-2xl font-bold text-[#1B7F4B]">€{totalMoneySpent.toFixed(2)}</div>
                    </div>
                </div>
                <div className="bg-[#FDFBF7] rounded-2xl border border-[#E3DCD2]/40 shadow-sm p-5 flex items-center gap-4">
                    <span className="material-symbols-outlined text-[32px] text-[#D35400]">stars</span>
                    <div>
                        <div className="text-xs text-[#8E735B] uppercase tracking-wider font-bold">Total Points Earned</div>
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
                                <th className="p-5 w-10">
                                    <input
                                        type="checkbox"
                                        aria-label="Select all logs"
                                        className="w-4 h-4 rounded border-[#E3DCD2] text-[#B22222] cursor-pointer"
                                        checked={logs.length > 0 && logs.every((log) => selectedIds.includes(get(log, 'id', 'Id')))}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="p-5 w-12">ID</th>
                                <th className="p-5">Log Date</th>
                                <th className="p-5">Room</th>
                                <th className="p-5">Guest Email</th>
                                <th className="p-5">Check-In</th>
                                <th className="p-5">Check-Out</th>
                                <th className="p-5">Spending</th>
                                <th className="p-5">Points Earned</th>
                                <th className="p-5">Points Spent</th>
                                <th className="p-5">Orders</th>
                                <th className="p-5 text-right w-28">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-[#4A3728]">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan="12" className="p-10 text-center text-[#8E735B] italic">
                                        No user logs found.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => {
                                    const id = get(log, 'id', 'Id');
                                    const ts = formatDateTime(get(log, 'timestamp', 'Timestamp'));
                                    const guestMail = get(log, 'guestMail', 'GuestMail') || '—';
                                    const isMailSent = get(log, 'isMailSent', 'IsMailSent') === true;
                                    const hasEmail = guestMail && guestMail !== '—';
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
                                                <td className="p-5">
                                                    <input
                                                        type="checkbox"
                                                        aria-label={`Select log ${id}`}
                                                        className="w-4 h-4 rounded border-[#E3DCD2] text-[#B22222] cursor-pointer"
                                                        checked={selectedIds.includes(id)}
                                                        onChange={() => toggleSelect(id)}
                                                    />
                                                </td>
                                                <td className="p-5 font-mono text-xs text-[#8E735B]">#{id}</td>

                                                <td className="p-5 whitespace-nowrap">
                                                    <div className="font-bold">{ts.date}</div>
                                                    <div className="text-xs text-[#8E735B]">{ts.time}</div>
                                                </td>

                                                <td className="p-5">
                                                    <span className="inline-flex items-center gap-1.5 bg-[#F2EBE1] border border-[#E3DCD2]/50 px-3 py-1 rounded-lg font-bold text-[#4A3728]">
                                                        <span className="material-symbols-outlined text-[16px] text-[#D35400]">meeting_room</span>
                                                        {roomNumber}
                                                    </span>
                                                </td>

                                                <td className="p-5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px] text-[#8E735B]">mail</span>
                                                        <span className="text-[#5D534A] font-medium">{guestMail}</span>
                                                    </div>
                                                </td>

                                                <td className="p-5 whitespace-nowrap text-[#5D534A]">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px] text-[#1B7F4B]">login</span>
                                                        {checkIn}
                                                    </div>
                                                </td>

                                                <td className="p-5 whitespace-nowrap text-[#5D534A]">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px] text-[#B22222]">logout</span>
                                                        {checkOut}
                                                    </div>
                                                </td>

                                                <td className="p-5 whitespace-nowrap">
                                                    <span className="font-bold text-[#1B7F4B]">€{moneySpent}</span>
                                                </td>

                                                <td className="p-5 whitespace-nowrap">
                                                    <span className="bg-[#D35400]/10 border border-[#D35400]/20 text-[#D35400] px-2.5 py-1 rounded-full font-bold text-xs tracking-wide">
                                                        +{pointsEarned} pts
                                                    </span>
                                                </td>

                                                <td className="p-5 whitespace-nowrap">
                                                    {pointsSpent > 0 ? (
                                                        <span className="bg-[#B22222]/10 border border-[#B22222]/20 text-[#B22222] px-2.5 py-1 rounded-full font-bold text-xs tracking-wide">
                                                            -{pointsSpent} pts
                                                        </span>
                                                    ) : (
                                                        <span className="text-[#C4B8AE] text-xs">—</span>
                                                    )}
                                                </td>

                                                <td className="p-5">
                                                    {ordersSummary ? (
                                                        <button
                                                            onClick={() => setExpandedRow(isExpanded ? null : id)}
                                                            className="flex items-center gap-1.5 text-xs font-bold text-[#4A3728] bg-[#F2EBE1] hover:bg-[#E8DDD3] border border-[#E3DCD2]/60 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px] text-[#D35400]">receipt</span>
                                                            Details
                                                            <span className="material-symbols-outlined text-[14px]">
                                                                {isExpanded ? 'expand_less' : 'expand_more'}
                                                            </span>
                                                        </button>
                                                    ) : (
                                                        <span className="text-[#C4B8AE] text-xs">No orders</span>
                                                    )}
                                                </td>

                                                <td className="p-5 text-right">
                                                    <div className="inline-flex items-center justify-end gap-1">
                                                        {isMailSent ? (
                                                            <span
                                                                className="p-2 text-[#1B7F4B] inline-flex items-center justify-center"
                                                                title="Survey email already sent"
                                                            >
                                                                <span className="material-symbols-outlined text-[20px]">mark_email_read</span>
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => setMailTargetId(id)}
                                                                disabled={!hasEmail || sendingId === id}
                                                                className="p-2 text-[#D35400] hover:text-[#b84800] hover:bg-[#F2EBE1] rounded-lg transition-colors inline-flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                                                                title={hasEmail ? 'Send survey email' : 'No guest email on file'}
                                                            >
                                                                <span className="material-symbols-outlined text-[20px]">
                                                                    {sendingId === id ? 'hourglass_top' : 'mail'}
                                                                </span>
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(id)}
                                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center"
                                                            title="Delete Log"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {isExpanded && ordersSummary && (
                                                <tr key={`${id}-orders`} className="bg-[#FDF8F3] border-b border-[#E3DCD2]/30">
                                                    <td colSpan="12" className="px-8 py-4">
                                                        <div className="flex items-start gap-3">
                                                            <span className="material-symbols-outlined text-[20px] text-[#D35400] mt-0.5">shopping_bag</span>
                                                            <div>
                                                                <div className="text-xs font-bold text-[#8E735B] uppercase tracking-wider mb-2">
                                                                    Completed Orders
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

            {/* Language picker for the survey email */}
            {mailTargetId !== null && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setMailTargetId(null)}
                >
                    <div
                        className="bg-[#FDFBF7] rounded-[24px] border border-[#E3DCD2]/40 shadow-2xl p-6 sm:p-8 w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-[#F2EBE1] flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-[#D35400]">mail</span>
                            </div>
                            <h3 className="font-headline text-xl text-[#4A3728] font-bold">Send survey email</h3>
                        </div>
                        <p className="text-[13px] text-[#5D534A] mb-5">
                            In which language would you like to send the survey email?
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {MAIL_LANGUAGES.map((l) => (
                                <button
                                    key={l.code}
                                    type="button"
                                    onClick={() => handleSendMail(mailTargetId, l.code)}
                                    className="px-4 py-3 rounded-2xl bg-[#F2EBE1] text-[#4A3728] font-semibold text-sm border border-[#E3DCD2]/50 hover:bg-[#D35400] hover:text-white hover:border-[#D35400] transition-colors"
                                >
                                    {l.label}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => setMailTargetId(null)}
                            className="mt-5 w-full py-2.5 text-sm font-semibold text-[#8E735B] hover:text-[#4A3728] transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersLogsPage;

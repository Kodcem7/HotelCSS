import { useState, useEffect } from 'react';
import { getHistoryLogs, deleteLog, deleteLast6Months } from '../api/historylogs';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const UsersLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
            } else if (responseData && responseData.$values) {
                logsArray = responseData.$values;
            } else if (responseData && responseData.data) {
                logsArray = responseData.data;
            } else if (responseData && responseData.value) {
                logsArray = responseData.value;
            }

            // Safe sort using fallback for PascalCase vs camelCase
            const sortedLogs = [...logsArray].sort((a, b) => {
                const timeA = new Date(a.timestamp || a.Timestamp);
                const timeB = new Date(b.timestamp || b.Timestamp);
                return timeB - timeA;
            });

            setLogs(sortedLogs);

        } catch (err) {
            setError('Failed to load user logs.');
            console.error("API ERROR:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this log entry?");
        if (!confirmed) return;

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
        const confirmed = window.confirm(
            "WARNING: This will permanently delete all logs older than 6 months. Do you want to proceed?"
        );
        if (!confirmed) return;

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

    if (loading && logs.length === 0) {
        return <LoadingSpinner text="Loading user logs..." />;
    }

    return (
        <div className="p-4 sm:p-10 max-w-7xl mx-auto space-y-8">
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E3DCD2]/50 pb-6">
                <div>
                    <h2 className="font-headline text-[clamp(30px,5vw,42px)] text-[#4A3728] mb-2 font-bold leading-tight">
                        User Logs
                    </h2>
                    <p className="text-[14px] text-[#5D534A]">
                        Monitor administrative actions, room events, and user history.
                    </p>
                </div>

                <button
                    onClick={handleDeleteOldLogs}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-[#B22222]/10 text-[#B22222] hover:bg-[#B22222] hover:text-white border border-[#B22222]/20 font-bold text-[12px] uppercase tracking-widest rounded-xl transition-all shadow-sm whitespace-nowrap"
                >
                    <span className="material-symbols-outlined text-sm">delete_sweep</span>
                    Clear > 6 Months
                </button>
            </section>

            {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
            {success && (
                <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-bold flex items-center justify-between">
                    <span>{success}</span>
                    <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-900">✕</button>
                </div>
            )}

            <section className="bg-[#FDFBF7] rounded-[24px] border border-[#E3DCD2]/40 shadow-[0_15px_35px_rgba(15,28,44,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-[#F2EBE1]/50 border-b border-[#E3DCD2]/50 text-[#8E735B] text-[10px] uppercase tracking-widest font-bold">
                                <th className="p-5 w-16">ID</th>
                                <th className="p-5">Logged At</th>
                                <th className="p-5">Room</th>
                                <th className="p-5">Guest Email</th>
                                <th className="p-5">Check-In</th>
                                <th className="p-5">Check-Out</th>
                                <th className="p-5 text-right w-20">Manage</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-[#4A3728]">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-10 text-center text-[#8E735B] italic">
                                        No user logs found.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr
                                        key={log.id || log.Id}
                                        className="border-b border-[#E3DCD2]/30 hover:bg-[#F2EBE1]/30 transition-colors last:border-0"
                                    >
                                        {/* ID */}
                                        <td className="p-5 font-mono text-xs text-[#8E735B]">
                                            #{log.id || log.Id}
                                        </td>

                                        {/* Timestamp */}
                                        <td className="p-5 whitespace-nowrap">
                                            <div className="font-bold">
                                                {new Date(log.timestamp || log.Timestamp).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-[#8E735B]">
                                                {new Date(log.timestamp || log.Timestamp).toLocaleTimeString()}
                                            </div>
                                        </td>

                                        {/* Room Number */}
                                        <td className="p-5">
                                            <span className="inline-flex items-center gap-1.5 bg-[#F2EBE1] border border-[#E3DCD2]/50 px-3 py-1 rounded-lg font-bold text-[#4A3728]">
                                                <span className="material-symbols-outlined text-[16px] text-[#D35400]">meeting_room</span>
                                                {log.roomNumber || log.RoomNumber || "N/A"}
                                            </span>
                                        </td>

                                        {/* Guest Email */}
                                        <td className="p-5 text-[#5D534A] font-medium">
                                            {log.guestMail || log.GuestMail || "No Email"}
                                        </td>

                                        {/* Check-In Date */}
                                        <td className="p-5 whitespace-nowrap text-[#5D534A]">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[16px] text-[#8E735B]">login</span>
                                                {new Date(log.checkInDate || log.CheckInDate).toLocaleDateString()}
                                            </div>
                                        </td>

                                        {/* Check-Out Date */}
                                        <td className="p-5 whitespace-nowrap text-[#5D534A]">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[16px] text-[#8E735B]">logout</span>
                                                {new Date(log.checkOutDate || log.CheckOutDate).toLocaleDateString()}
                                            </div>
                                        </td>

                                        {/* Manage / Delete */}
                                        <td className="p-5 text-right">
                                            <button
                                                onClick={() => handleDelete(log.id || log.Id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center"
                                                title="Delete Log"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default UsersLogsPage;
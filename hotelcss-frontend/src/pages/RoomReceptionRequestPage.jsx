import { useState, useEffect } from 'react';
// import Layout from '../components/Layout'; // ❌ REMOVED
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext'; // ✅ Added Language Context
import { createWakeUpCall, getPickUpTime, getReceptionServices, cancelMyWakeUp } from '../api/receptionService';
import useSignalR from '../hooks/useSignalR';

const RoomReceptionRequestPage = () => {
    const { user } = useAuth();
    const { translateUiText } = useLanguage(); // ✅ Hook initialized

    const [selectedType, setSelectedType] = useState('wake-up'); // 'wake-up' | 'pickup-info'
    const [formData, setFormData] = useState({
        Date: '',
        Time: '',
        Notes: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [loadingPickup, setLoadingPickup] = useState(false);
    const [pickupInfos, setPickupInfos] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [wakeUps, setWakeUps] = useState([]);
    const [loadingWakeUps, setLoadingWakeUps] = useState(false);
    const [cancellingId, setCancellingId] = useState(null);

    // The Room-role endpoint already returns only this room's wake-up services.
    const loadWakeUps = async () => {
        try {
            setLoadingWakeUps(true);
            const data = await getReceptionServices();
            const list = Array.isArray(data) ? data : data?.data ?? [];
            setWakeUps(
                list
                    .filter((s) => s.requestType === 'Wake-Up Service')
                    .sort((a, b) => new Date(b.scheduledTime || 0) - new Date(a.scheduledTime || 0))
            );
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingWakeUps(false);
        }
    };

    // Live tracking: when reception changes a status, refresh the guest's list.
    useSignalR(user?.role === 'Room', null, null, null, () => loadWakeUps());

    const statusBadgeClass = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-100 text-amber-800';
            case 'InProcess': return 'bg-blue-100 text-blue-800';
            case 'Completed': return 'bg-emerald-100 text-emerald-800';
            default: return 'bg-[#F2EBE1] text-[#4A3728] border border-[#E3DCD2]/40';
        }
    };

    useEffect(() => {
        const loadPickupInfos = async () => {
            try {
                setLoadingPickup(true);
                const data = await getPickUpTime();
                setPickupInfos(Array.isArray(data) ? data : data?.data ?? []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingPickup(false);
            }
        };

        loadPickupInfos();
        loadWakeUps();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedType !== 'wake-up') {
            return;
        }

        if (!formData.Date || !formData.Time) {
            setError(translateUiText('Please select a time.')); // ✅ English Base
            return;
        }

        if (new Date(`${formData.Date}T${formData.Time}`).getTime() < Date.now()) {
            setError(translateUiText('Please choose a future date and time.'));
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            setSuccess('');

            await createWakeUpCall({
                // Combine the date + time fields into the "YYYY-MM-DDTHH:mm" the backend expects.
                ScheduledTime: `${formData.Date}T${formData.Time}`,
                Notes: formData.Notes || undefined,
            });

            setSuccess(translateUiText('Your reception request has been successfully submitted!')); // ✅ English Base
            setFormData({
                Date: '',
                Time: '',
                Notes: '',
            });
            await loadWakeUps();
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                translateUiText('An error occurred while creating the reception request.'); // ✅ English Base
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelWakeUp = async (id) => {
        if (!window.confirm(translateUiText('Are you sure you want to cancel this wake-up call?'))) return;
        try {
            setError('');
            setSuccess('');
            setCancellingId(id);
            await cancelMyWakeUp(id);
            setSuccess(translateUiText('Wake-up call cancelled.'));
            await loadWakeUps();
        } catch (err) {
            setError(err.response?.data?.message || translateUiText('Failed to cancel wake-up call.'));
        } finally {
            setCancellingId(null);
        }
    };

    // Friendly preview of the chosen wake-up slot.
    const wakePreview = (() => {
        if (!formData.Date || !formData.Time) return '';
        const dt = new Date(`${formData.Date}T${formData.Time}`);
        if (isNaN(dt.getTime())) return '';
        return dt.toLocaleString(undefined, {
            weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
        });
    })();

    // Block scheduling in the past: min date = today; min time = now when today is picked.
    const pad = (n) => String(n).padStart(2, '0');
    const nowDt = new Date();
    const todayStr = `${nowDt.getFullYear()}-${pad(nowDt.getMonth() + 1)}-${pad(nowDt.getDate())}`;
    const nowTimeStr = `${pad(nowDt.getHours())}:${pad(nowDt.getMinutes())}`;
    const timeMin = formData.Date === todayStr ? nowTimeStr : undefined;

    return (
        <> {/* ✅ Replaced <Layout> with Fragment */}
            <div className="p-4 sm:p-10 space-y-8 sm:space-y-10 max-w-7xl mx-auto">
                <section>
                    <h2 className="font-headline text-[clamp(22px,6vw,52px)] text-[#4A3728] mb-2 font-bold leading-tight">
                        {translateUiText('Reception Requests')}
                    </h2>
                    <p className="text-[14px] text-[#5D534A] leading-relaxed">
                        {translateUiText('You can request services from reception or view available information.')} {/* ✅ English Base */}
                    </p>
                </section>

                {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
                {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

                {/* Request type selector (segmented control) */}
                <div className="max-w-3xl mx-auto">
                    <div className="flex w-full p-1 bg-[#F2EBE1] rounded-full border border-[#E3DCD2]/40">
                        <button
                            type="button"
                            onClick={() => setSelectedType('wake-up')}
                            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-full transition ${selectedType === 'wake-up'
                                ? 'bg-[#4A3728] text-white shadow-sm'
                                : 'text-[#4A3728] hover:text-[#D35400]'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">alarm</span>
                            {translateUiText('Wake-up Service')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedType('pickup-info')}
                            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-full transition ${selectedType === 'pickup-info'
                                ? 'bg-[#4A3728] text-white shadow-sm'
                                : 'text-[#4A3728] hover:text-[#D35400]'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">directions_bus</span>
                            {translateUiText('Learn Pick-Up Time')}
                        </button>
                    </div>
                </div>

                {/* Wake-up Service form & list */}
                {selectedType === 'wake-up' && (
                    <form
                        onSubmit={handleSubmit}
                        className="bg-[#FDFBF7] rounded-[22px] sm:rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] p-5 sm:p-8 space-y-6 max-w-3xl mx-auto"
                    >
                        <div>
                            <label className="block text-sm font-semibold text-[#4A3728] mb-1">
                                {translateUiText('Room')}
                            </label>
                            <p className="px-4 py-3 border border-[#E3DCD2]/50 rounded-2xl bg-[#F2EBE1]/55 text-[#2C241E] font-semibold">
                                {user?.username}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#4A3728] mb-2">
                                {translateUiText('Wake-up Time')} *
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8E735B] text-[20px] pointer-events-none">calendar_month</span>
                                    <input
                                        type="date"
                                        value={formData.Date}
                                        min={todayStr}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, Date: e.target.value }))
                                        }
                                        className="w-full pl-12 pr-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8E735B] text-[20px] pointer-events-none">schedule</span>
                                    <input
                                        type="time"
                                        value={formData.Time}
                                        min={timeMin}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, Time: e.target.value }))
                                        }
                                        className="w-full pl-12 pr-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {['06:30', '07:00', '07:30', '08:00', '09:00'].map((quick) => (
                                    <button
                                        key={quick}
                                        type="button"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                Time: quick,
                                                Date: prev.Date || todayStr,
                                            }))
                                        }
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${formData.Time === quick
                                            ? 'bg-[#D35400] text-white border-[#D35400]'
                                            : 'bg-[#F2EBE1] text-[#4A3728] border-[#E3DCD2]/50 hover:bg-[#E8DFD1]'
                                            }`}
                                    >
                                        {quick}
                                    </button>
                                ))}
                            </div>
                            {wakePreview && (
                                <div className="mt-3 inline-flex items-center gap-2 bg-[#F2EBE1] border border-[#E3DCD2]/40 text-[#4A3728] rounded-full px-4 py-2 text-sm">
                                    <span className="material-symbols-outlined text-[18px] text-[#D35400]">alarm</span>
                                    <span className="font-semibold">{wakePreview}</span>
                                </div>
                            )}
                            <p className="text-xs text-[#8E735B] mt-2">
                                {translateUiText('Please select the date and time you want to wake up.')} {/* ✅ English Base */}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#4A3728] mb-1">
                                {translateUiText('Notes (optional)')}
                            </label>
                            <textarea
                                value={formData.Notes}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, Notes: e.target.value }))
                                }
                                className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E] placeholder:text-[#8E735B]"
                                rows="3"
                                placeholder={translateUiText('e.g. Please wake me up gently')} // ✅ English Base
                            />
                        </div>

                        <div className="flex space-x-4 pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-[#4A3728] text-white py-3 px-4 rounded-2xl hover:bg-[#3a2b20] transition disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
                            >
                                {submitting ? translateUiText('Sending...') : translateUiText('Create Wake-up Request')} {/* ✅ English Base */}
                            </button>
                        </div>
                    </form>
                )}

                {/* Your scheduled wake-up calls (live status) */}
                {selectedType === 'wake-up' && (
                    <div className="bg-[#FDFBF7] rounded-[22px] sm:rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] p-5 sm:p-8 max-w-3xl mx-auto">
                        <h3 className="font-headline text-xl text-[#4A3728] font-bold mb-4">
                            {translateUiText('Your wake-up calls')}
                        </h3>
                        {loadingWakeUps && wakeUps.length === 0 ? (
                            <LoadingSpinner text={translateUiText('Loading...')} />
                        ) : wakeUps.length === 0 ? (
                            <p className="text-[#8E735B] text-sm">
                                {translateUiText('No wake-up calls scheduled yet.')}
                            </p>
                        ) : (
                            <ul className="divide-y divide-[#E3DCD2]/50">
                                {wakeUps.map((w) => (
                                    <li key={w.id} className="py-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="material-symbols-outlined text-[#D35400] text-[22px]">alarm</span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-[#4A3728]">
                                                    {w.scheduledTime
                                                        ? new Date(w.scheduledTime).toLocaleString(undefined, {
                                                            weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                                                        })
                                                        : '-'}
                                                </p>
                                                {w.notes && <p className="text-xs text-[#8E735B] mt-0.5 truncate">{w.notes}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span className={`px-2.5 py-1 inline-flex text-[11px] leading-5 font-bold rounded-full ${statusBadgeClass(w.status)}`}>
                                                {translateUiText(w.status)}
                                            </span>
                                            {w.status === 'Pending' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCancelWakeUp(w.id)}
                                                    disabled={cancellingId === w.id}
                                                    className="text-xs font-bold text-[#B22222] hover:text-[#8f1b1b] disabled:opacity-50 transition-colors"
                                                >
                                                    {cancellingId === w.id ? translateUiText('Cancelling…') : translateUiText('Cancel')}
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {/* Learn Pick-Up Time view */}
                {selectedType === 'pickup-info' && (
                    <div className="bg-[#FDFBF7] rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] p-8 max-w-3xl mx-auto">
                        <h3 className="font-headline text-2xl text-[#4A3728] font-bold mb-2">
                            {translateUiText('Learn Pick-Up Time')}
                        </h3>
                        <p className="text-[14px] text-[#5D534A] mb-6 leading-relaxed">
                            {translateUiText('If a pick-up (transfer) time has been set for you by the reception, you can view it below.')} {/* ✅ English Base */}
                        </p>
                        {loadingPickup ? (
                            <LoadingSpinner text={translateUiText('Loading...')} />
                        ) : pickupInfos.length === 0 ? (
                            <p className="text-[#8E735B] text-sm">
                                {translateUiText('There is currently no pick-up time set for your room.')} {/* ✅ English Base */}
                            </p>
                        ) : (
                            <ul className="divide-y divide-[#E3DCD2]/50">
                                {pickupInfos.map((info) => (
                                    <li key={info.id} className="py-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-[#4A3728]">
                                                {new Date(info.pickUpTime).toLocaleString()}
                                            </p>
                                            {info.notes && (
                                                <p className="text-xs text-[#8E735B] mt-1">{info.notes}</p>
                                            )}
                                        </div>
                                        <span className="px-2.5 py-1 inline-flex text-[11px] leading-5 font-bold rounded-full bg-[#F2EBE1] text-[#4A3728] border border-[#E3DCD2]/40">
                                            {translateUiText(info.status)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default RoomReceptionRequestPage;
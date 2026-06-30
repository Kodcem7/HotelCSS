import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { useLanguage } from '../context/LanguageContext';
import { setPickUpTime } from '../api/receptionService';

const ReceptionPickupPage = () => {
    const { translateUiText } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    // /reception/pickup -> /reception/services (works for admin & manager prefixes too)
    const logsPath = location.pathname.replace(/\/pickup$/, '/services');

    const [roomNumber, setRoomNumber] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Friendly preview of the chosen slot.
    const previewLabel = (() => {
        if (!date || !time) return '';
        const dt = new Date(`${date}T${time}`);
        if (isNaN(dt.getTime())) return '';
        return dt.toLocaleString(undefined, {
            weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
        });
    })();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!roomNumber) {
            setError(translateUiText('Please enter a room number.'));
            return;
        }
        if (!date || !time) {
            setError(translateUiText('Please select a date and time for pick-up.'));
            return;
        }

        try {
            setSubmitting(true);
            await setPickUpTime(Number(roomNumber), {
                ScheduledTime: `${date}T${time}`,
                Notes: notes || undefined,
            });
            setSuccess(translateUiText('Pick-up time successfully saved or updated.'));
            setRoomNumber('');
            setDate('');
            setTime('');
            setNotes('');
        } catch (err) {
            setError(err.response?.data?.message || translateUiText('An error occurred while saving the pick-up time.'));
        } finally {
            setSubmitting(false);
        }
    };

    const fieldBase =
        'w-full bg-concierge-surface-container-low border-none rounded-2xl text-concierge-on-surface text-sm focus:ring-2 focus:ring-concierge-primary/25 focus:bg-concierge-surface-container-lowest transition-all placeholder:text-concierge-outline/45';

    return (
        <div className="max-w-2xl mx-auto p-6">
            <button
                type="button"
                onClick={() => navigate(logsPath)}
                className="inline-flex items-center gap-2 text-concierge-on-surface-variant hover:text-concierge-on-surface text-sm font-semibold mb-6 transition-colors"
            >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                {translateUiText('Back to requests')}
            </button>

            <div className="bg-concierge-surface-container-lowest/90 backdrop-blur-sm rounded-[2rem] p-6 sm:p-10 border border-concierge-outline-variant/15 concierge-editorial-shadow">
                <div className="flex items-start gap-4 mb-8">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl concierge-hero-gradient text-white flex items-center justify-center shadow-lg shadow-concierge-primary/20">
                        <span className="material-symbols-outlined text-[28px]">directions_bus</span>
                    </div>
                    <div>
                        <h2 className="font-headline text-2xl sm:text-3xl text-concierge-on-background tracking-tight">
                            {translateUiText('Enter / update pick-up time')}
                        </h2>
                        <p className="text-sm text-concierge-on-surface-variant mt-1 max-w-md">
                            {translateUiText('By entering a room number, you can define a new pick-up (transfer) time for guests or update an existing one.')}
                        </p>
                    </div>
                </div>

                {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
                {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

                <form onSubmit={handleSubmit} className="space-y-6 mt-2">
                    <div>
                        <label className="block text-[10px] font-bold tracking-widest uppercase text-concierge-outline mb-2 ml-1">
                            {translateUiText('Room')} *
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-concierge-outline/70 text-[20px] pointer-events-none">meeting_room</span>
                            <input
                                type="number"
                                min="1"
                                value={roomNumber}
                                onChange={(e) => setRoomNumber(e.target.value)}
                                className={`${fieldBase} pl-12 pr-4 py-3.5`}
                                placeholder={translateUiText('e.g. 101')}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold tracking-widest uppercase text-concierge-outline mb-2 ml-1">
                                {translateUiText('Date')} *
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-concierge-outline/70 text-[20px] pointer-events-none">calendar_month</span>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className={`${fieldBase} pl-12 pr-4 py-3.5`}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold tracking-widest uppercase text-concierge-outline mb-2 ml-1">
                                {translateUiText('Time')} *
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-concierge-outline/70 text-[20px] pointer-events-none">schedule</span>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className={`${fieldBase} pl-12 pr-4 py-3.5`}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {previewLabel && (
                        <div className="flex items-center flex-wrap gap-2 bg-concierge-secondary-container/60 text-concierge-on-secondary-container rounded-2xl px-4 py-3 text-sm">
                            <span className="material-symbols-outlined text-[18px]">event_available</span>
                            <span className="font-semibold">{previewLabel}</span>
                            {roomNumber && (
                                <span className="text-concierge-on-surface-variant">· {translateUiText('Room')} {roomNumber}</span>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-bold tracking-widest uppercase text-concierge-outline mb-2 ml-1">
                            {translateUiText('Notes')}
                        </label>
                        <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className={`${fieldBase} px-4 py-3.5`}
                            placeholder={translateUiText('e.g. Airport transfer, departure 2 hours before.')}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate(logsPath)}
                            className="py-3 px-6 rounded-full text-sm font-semibold text-concierge-on-surface-variant hover:text-concierge-on-surface transition-colors"
                        >
                            {translateUiText('Cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="concierge-hero-gradient text-white py-3.5 px-8 rounded-full text-sm font-semibold uppercase tracking-widest shadow-lg shadow-concierge-primary/20 hover:shadow-concierge-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
                        >
                            {submitting ? translateUiText('Saving...') : translateUiText('Save pick-up time')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReceptionPickupPage;

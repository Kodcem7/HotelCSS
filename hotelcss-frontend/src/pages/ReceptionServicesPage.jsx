import { useEffect, useState } from 'react';
// import Layout from '../components/Layout'; // ❌ REMOVED
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { useLanguage } from '../context/LanguageContext'; // ✅ Added Language Context
import {
    getReceptionServices,
    updateWakeUpTime,
    updatePickUpTime,
    setPickUpTime,
    updateWakeUpStatus,
    updatePickUpStatus,
    deleteWakeUpService,
    deletePickUpService,
} from '../api/receptionService';

const ReceptionServicesPage = () => {
    const { translateUiText } = useLanguage(); // ✅ Hook initialized

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editValues, setEditValues] = useState({});
    const [pickupForm, setPickupForm] = useState({
        roomNumber: '',
        ScheduledTime: '',
        Notes: '',
    });
    const [pickupSubmitting, setPickupSubmitting] = useState(false);

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-concierge-secondary-container text-concierge-on-secondary-container';
            case 'InProcess':
                return 'bg-concierge-primary-fixed-dim/40 text-concierge-on-background';
            case 'Completed':
                return 'bg-emerald-100 text-emerald-900';
            default:
                return 'bg-concierge-surface-container-high text-concierge-on-surface-variant';
        }
    };

    const toLocalInput = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    const loadServices = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getReceptionServices();
            const list = Array.isArray(data) ? data : data?.data ?? [];
            setServices(list);
            const ev = {};
            list.forEach((s) => { ev[s.id] = toLocalInput(s.scheduledTime || s.pickUpTime); });
            setEditValues(ev);
        } catch (err) {
            setError(translateUiText('Failed to load reception services'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadServices();
    }, []);

    const handlePickupSubmit = async (e) => {
        e.preventDefault();

        if (!pickupForm.roomNumber) {
            setError(translateUiText('Please enter a room number.')); // ✅ English Base
            return;
        }

        if (!pickupForm.ScheduledTime) {
            setError(translateUiText('Please select a date and time for pick-up.')); // ✅ English Base
            return;
        }

        try {
            setError('');
            setSuccess('');
            setPickupSubmitting(true);

            await setPickUpTime(Number(pickupForm.roomNumber), {
                ScheduledTime: pickupForm.ScheduledTime,
                Notes: pickupForm.Notes || undefined,
            });

            setSuccess(translateUiText('Pick-up time successfully saved or updated.')); // ✅ English Base
            setPickupForm({
                roomNumber: '',
                ScheduledTime: '',
                Notes: '',
            });

            await loadServices();
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                translateUiText('An error occurred while saving the pick-up time.'); // ✅ English Base
            setError(msg);
        } finally {
            setPickupSubmitting(false);
        }
    };

    const saveTime = async (service, val) => {
        if (service.requestType === 'Pick-Up') {
            await updatePickUpTime(service.id, val);
        } else {
            await updateWakeUpTime(service.id, val);
        }
    };

    // Time is always editable and auto-saves on change (no Edit/Save buttons).
    const handleTimeChange = async (service, val) => {
        setEditValues((prev) => ({ ...prev, [service.id]: val }));
        if (!val) return;
        try {
            setError('');
            setSuccess('');
            await saveTime(service, val);
            setSuccess(translateUiText('Time updated successfully'));
        } catch (err) {
            setError(err.response?.data?.message || translateUiText('Failed to update time'));
        }
    };

    // Cancel = revert the row's time back to the value it had on page load.
    const handleCancel = async (service) => {
        const orig = toLocalInput(service.scheduledTime || service.pickUpTime);
        setEditValues((prev) => ({ ...prev, [service.id]: orig }));
        if (!orig) return;
        try {
            setError('');
            setSuccess('');
            await saveTime(service, orig);
            setSuccess(translateUiText('Changes reverted'));
        } catch (err) {
            setError(err.response?.data?.message || translateUiText('Failed to revert'));
        }
    };

    const handleStatusChange = async (service, nextStatus) => {
        try {
            setError('');
            setSuccess('');

            if (service.requestType === 'Pick-Up') {
                await updatePickUpStatus(service.id, nextStatus);
            } else {
                await updateWakeUpStatus(service.id, nextStatus);
            }

            setSuccess(translateUiText('Status updated successfully'));
            await loadServices();
        } catch (err) {
            const msg = err.response?.data?.message || translateUiText('Failed to update status');
            setError(msg);
        }
    };

    const handleDelete = async (service) => {
        if (!window.confirm(translateUiText('Are you sure you want to delete this record?'))) { // ✅ English Base
            return;
        }

        try {
            setError('');
            setSuccess('');

            if (service.requestType === 'Pick-Up') {
                await deletePickUpService(service.id);
            } else {
                await deleteWakeUpService(service.id);
            }

            setSuccess(translateUiText('Record deleted successfully'));
            await loadServices();
        } catch (err) {
            const msg = err.response?.data?.message || translateUiText('Failed to delete record');
            setError(msg);
        }
    };

    if (loading) {
        return <LoadingSpinner text={translateUiText('Loading reception services...')} />;
    }

    const inputClass =
        'w-full px-4 py-3 bg-concierge-surface-container-low border-none rounded-full text-concierge-on-surface text-sm focus:ring-2 focus:ring-concierge-primary/25 focus:bg-concierge-surface-container-lowest transition-all placeholder:text-concierge-outline/45';
    const textareaClass =
        'w-full px-4 py-3 bg-concierge-surface-container-low border-none rounded-2xl text-concierge-on-surface text-sm focus:ring-2 focus:ring-concierge-primary/25 focus:bg-concierge-surface-container-lowest transition-all placeholder:text-concierge-outline/45';

    return (
        <>
            <div className="-mx-4 sm:-mx-6 px-4 sm:px-6 py-2 min-h-[calc(100vh-6rem)] bg-concierge-background rounded-[2rem] sm:rounded-[3rem] border border-concierge-outline-variant/20 concierge-editorial-shadow">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8 pt-2">
                        <span className="inline-block py-1.5 px-4 rounded-full bg-concierge-secondary-container text-concierge-on-secondary-container text-[10px] font-bold tracking-widest uppercase mb-3">
                            {translateUiText('Concierge operations')}
                        </span>
                        <h2 className="font-headline text-3xl sm:text-4xl text-concierge-on-background tracking-tight">
                            {translateUiText('Reception services')}
                        </h2>
                        <p className="text-concierge-on-surface-variant font-light text-lg mt-2 max-w-2xl">
                            {translateUiText('Manage wake-up calls and pick-up times with the same editorial clarity as the guest-facing portal.')}
                        </p>
                    </div>

                    {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
                    {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

                    <div className="mb-8 bg-concierge-surface-container-lowest/90 backdrop-blur-sm rounded-[2rem] p-6 sm:p-8 border border-concierge-outline-variant/15 concierge-editorial-shadow">
                        <h3 className="font-headline text-xl text-concierge-on-background mb-1">
                            {translateUiText('Enter / update pick-up time')} {/* ✅ English Base */}
                        </h3>
                        <p className="text-sm text-concierge-on-surface-variant mb-6">
                            {translateUiText('By entering a room number, you can define a new pick-up (transfer) time for guests or update an existing one.')} {/* ✅ English Base */}
                        </p>
                        <form onSubmit={handlePickupSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                            <div>
                                <label className="block text-[10px] font-bold tracking-widest uppercase text-concierge-outline mb-2 ml-1">
                                    {translateUiText('Room')} *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={pickupForm.roomNumber}
                                    onChange={(e) =>
                                        setPickupForm((prev) => ({ ...prev, roomNumber: e.target.value }))
                                    }
                                    className={inputClass}
                                    placeholder={translateUiText('e.g. 101')} // ✅ English Base
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold tracking-widest uppercase text-concierge-outline mb-2 ml-1">
                                    {translateUiText('Time')} *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={pickupForm.ScheduledTime}
                                    onChange={(e) =>
                                        setPickupForm((prev) => ({ ...prev, ScheduledTime: e.target.value }))
                                    }
                                    className={`${inputClass} rounded-2xl`}
                                    required
                                />
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-[10px] font-bold tracking-widest uppercase text-concierge-outline mb-2 ml-1">
                                    {translateUiText('Notes')}
                                </label>
                                <textarea
                                    rows={2}
                                    value={pickupForm.Notes}
                                    onChange={(e) =>
                                        setPickupForm((prev) => ({ ...prev, Notes: e.target.value }))
                                    }
                                    className={textareaClass}
                                    placeholder={translateUiText('e.g. Airport transfer, departure 2 hours before.')} // ✅ English Base
                                />
                            </div>
                            <div className="md:col-span-3 flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={pickupSubmitting}
                                    className="concierge-hero-gradient text-white py-3.5 px-8 rounded-full text-sm font-semibold uppercase tracking-widest shadow-lg shadow-concierge-primary/20 hover:shadow-concierge-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
                                >
                                    {pickupSubmitting ? translateUiText('Saving...') : translateUiText('Save pick-up time')} {/* ✅ English Base */}
                                </button>
                            </div>
                        </form>
                    </div>

                    {services.length === 0 ? (
                        <div className="bg-concierge-surface-container-lowest/80 rounded-[2rem] p-6 sm:p-10 text-center text-concierge-on-surface-variant border border-concierge-outline-variant/10">
                            {translateUiText('No reception services found.')}
                        </div>
                    ) : (
                        <div className="bg-concierge-surface-container-lowest/90 rounded-[2rem] overflow-hidden border border-concierge-outline-variant/15 concierge-editorial-shadow">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-concierge-outline-variant/20">
                                    <thead className="bg-concierge-surface-container-high/80">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-concierge-outline uppercase tracking-widest">
                                                {translateUiText('Room')}
                                            </th>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-concierge-outline uppercase tracking-widest">
                                                {translateUiText('Type')}
                                            </th>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-concierge-outline uppercase tracking-widest">
                                                {translateUiText('Time')}
                                            </th>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-concierge-outline uppercase tracking-widest">
                                                {translateUiText('Status')}
                                            </th>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-concierge-outline uppercase tracking-widest">
                                                {translateUiText('Notes')}
                                            </th>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-concierge-outline uppercase tracking-widest">
                                                {translateUiText('Action')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-concierge-outline-variant/15">
                                        {services.map((service) => {
                                            const isWakeUp = service.requestType === 'Wake-Up Service';
                                            const time = isWakeUp ? service.scheduledTime : service.pickUpTime;
                                            return (
                                                <tr key={service.id} className="hover:bg-concierge-surface-container-low/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-concierge-on-surface">
                                                        {translateUiText('Room')} {service.roomNumber}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-concierge-on-surface">
                                                        {translateUiText(service.requestType)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-concierge-on-surface">
                                                        <input
                                                            type="datetime-local"
                                                            value={editValues[service.id] ?? ''}
                                                            onChange={(e) => handleTimeChange(service, e.target.value)}
                                                            className={`${inputClass} rounded-xl py-2 text-xs max-w-[200px]`}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span
                                                            className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusBadgeClass(
                                                                service.status
                                                            )}`}
                                                        >
                                                            {translateUiText(service.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-concierge-on-surface-variant max-w-xs truncate">
                                                        {service.notes || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                        {service.status !== 'Completed' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCancel(service)}
                                                                className="text-concierge-on-surface-variant hover:text-concierge-on-surface text-xs font-semibold"
                                                            >
                                                                {translateUiText('Cancel')}
                                                            </button>
                                                        )}
                                                        {service.status === 'Pending' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleStatusChange(service, 'InProcess')}
                                                                className="text-concierge-primary hover:text-concierge-primary-container text-xs font-semibold"
                                                            >
                                                                {translateUiText('Start')}
                                                            </button>
                                                        )}
                                                        {service.status === 'InProcess' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleStatusChange(service, 'Completed')}
                                                                className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
                                                            >
                                                                {translateUiText('Complete')}
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(service)}
                                                            className="text-concierge-error hover:text-red-800 text-xs font-semibold"
                                                        >
                                                            {translateUiText('Delete')}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ReceptionServicesPage;
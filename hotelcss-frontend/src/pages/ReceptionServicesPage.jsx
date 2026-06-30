import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { useLanguage } from '../context/LanguageContext';
import {
    getReceptionServices,
    updateWakeUpTime,
    updatePickUpTime,
    updateWakeUpStatus,
    updatePickUpStatus,
    deleteWakeUpService,
    deletePickUpService,
    bulkDeleteReceptionServices,
} from '../api/receptionService';

const ReceptionServicesPage = () => {
    const { translateUiText } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    // /reception/services -> /reception/pickup (works for admin & manager prefixes too)
    const pickupPath = location.pathname.replace(/\/services$/, '/pickup');

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editValues, setEditValues] = useState({});
    const [filterType, setFilterType] = useState('All');
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkDeleting, setBulkDeleting] = useState(false);

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
            setSelectedIds([]); // drop stale selection; ids may no longer exist
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

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = (ids) => {
        // If every visible row is already selected, clear; otherwise select all visible.
        const allSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id));
        setSelectedIds(allSelected ? [] : ids);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(
            translateUiText('Are you sure you want to delete the selected records?')
        )) {
            return;
        }

        try {
            setError('');
            setSuccess('');
            setBulkDeleting(true);

            const res = await bulkDeleteReceptionServices(selectedIds);
            setSuccess(res?.message || translateUiText('Selected records deleted successfully'));
            await loadServices();
        } catch (err) {
            const msg = err.response?.data?.message || translateUiText('Failed to delete selected records');
            setError(msg);
        } finally {
            setBulkDeleting(false);
        }
    };

    if (loading) {
        return <LoadingSpinner text={translateUiText('Loading reception services...')} />;
    }

    const inputClass =
        'w-full px-4 py-3 bg-concierge-surface-container-low border-none rounded-full text-concierge-on-surface text-sm focus:ring-2 focus:ring-concierge-primary/25 focus:bg-concierge-surface-container-lowest transition-all placeholder:text-concierge-outline/45';

    const displayedServices = services
        .filter((s) => filterType === 'All' || s.requestType === filterType)
        .slice()
        .sort((a, b) => {
            const tb = new Date(b.createdAt || 0).getTime();
            const ta = new Date(a.createdAt || 0).getTime();
            if (tb !== ta) return tb - ta;
            return (b.id || 0) - (a.id || 0);
        });

    return (
        <>
            <div className="max-w-6xl mx-auto p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8 pt-2 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <span className="inline-block py-1.5 px-4 rounded-full bg-concierge-secondary-container text-concierge-on-secondary-container text-[10px] font-bold tracking-widest uppercase mb-3">
                                {translateUiText('Concierge operations')}
                            </span>
                            <h2 className="font-headline text-3xl sm:text-4xl text-concierge-on-background tracking-tight">
                                {translateUiText('Reception services')}
                            </h2>
                            <p className="text-concierge-on-surface-variant font-light text-lg mt-2 max-w-2xl">
                                {translateUiText('Wake-up and pick-up requests from guests.')}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate(pickupPath)}
                            className="inline-flex items-center gap-2 concierge-hero-gradient text-white py-3 px-6 rounded-full text-sm font-semibold uppercase tracking-widest shadow-lg shadow-concierge-primary/20 hover:shadow-concierge-primary/30 transition-all active:scale-[0.99] whitespace-nowrap self-start sm:self-auto"
                        >
                            <span className="material-symbols-outlined text-[20px]">directions_bus</span>
                            {translateUiText('Set pick-up time')}
                        </button>
                    </div>

                    {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
                    {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

                    <div className="mb-4 flex items-center gap-3">
                        <label className="text-[10px] font-bold tracking-widest uppercase text-concierge-outline">
                            {translateUiText('Type')}
                        </label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2.5 bg-concierge-surface-container-low border-none rounded-full text-concierge-on-surface text-sm focus:ring-2 focus:ring-concierge-primary/25"
                        >
                            <option value="All">{translateUiText('All')}</option>
                            <option value="Wake-Up Service">{translateUiText('Wake-Up Service')}</option>
                            <option value="Pick-Up">{translateUiText('Pick-Up')}</option>
                        </select>

                        {selectedIds.length > 0 && (
                            <button
                                type="button"
                                onClick={handleBulkDelete}
                                disabled={bulkDeleting}
                                className="ml-auto inline-flex items-center gap-2 bg-concierge-error text-white py-2.5 px-5 rounded-full text-xs font-semibold uppercase tracking-widest shadow-lg shadow-concierge-error/20 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <span className="material-symbols-outlined text-base">delete</span>
                                {bulkDeleting
                                    ? translateUiText('Deleting...')
                                    : `${translateUiText('Delete selected')} (${selectedIds.length})`}
                            </button>
                        )}
                    </div>

                    {displayedServices.length === 0 ? (
                        <div className="bg-concierge-surface-container-lowest/80 rounded-[2rem] p-6 sm:p-10 text-center text-concierge-on-surface-variant border border-concierge-outline-variant/10">
                            {translateUiText('No reception services found.')}
                        </div>
                    ) : (
                        <div className="bg-concierge-surface-container-lowest/90 rounded-[2rem] overflow-hidden border border-concierge-outline-variant/15 concierge-editorial-shadow">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-concierge-outline-variant/20">
                                    <thead className="bg-concierge-surface-container-high/80">
                                        <tr>
                                            <th className="px-6 py-4 text-left">
                                                <input
                                                    type="checkbox"
                                                    aria-label={translateUiText('Select all')}
                                                    className="w-4 h-4 rounded border-concierge-outline-variant text-concierge-error focus:ring-concierge-error/40 cursor-pointer"
                                                    checked={
                                                        displayedServices.length > 0 &&
                                                        displayedServices.every((s) => selectedIds.includes(s.id))
                                                    }
                                                    onChange={() =>
                                                        toggleSelectAll(displayedServices.map((s) => s.id))
                                                    }
                                                />
                                            </th>
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
                                        {displayedServices.map((service) => {
                                            return (
                                                <tr key={service.id} className="hover:bg-concierge-surface-container-low/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            aria-label={`${translateUiText('Select')} ${service.roomNumber}`}
                                                            className="w-4 h-4 rounded border-concierge-outline-variant text-concierge-error focus:ring-concierge-error/40 cursor-pointer"
                                                            checked={selectedIds.includes(service.id)}
                                                            onChange={() => toggleSelect(service.id)}
                                                        />
                                                    </td>
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
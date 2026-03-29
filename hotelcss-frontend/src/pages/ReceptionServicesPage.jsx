import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
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
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTime, setEditingTime] = useState('');
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

  const loadServices = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getReceptionServices();
      setServices(Array.isArray(data) ? data : data?.data ?? []);
    } catch (err) {
      setError('Failed to load reception services');
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
      setError('Lütfen bir oda numarası girin.');
      return;
    }

    if (!pickupForm.ScheduledTime) {
      setError('Lütfen pick-up için bir tarih ve saat seçin.');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setPickupSubmitting(true);

      await setPickUpTime(Number(pickupForm.roomNumber), {
        // HTML datetime-local zaten yerel zamanı "YYYY-MM-DDTHH:mm" formatında veriyor.
        // Bunu doğrudan gönderiyoruz; ekstra UTC dönüşümü yapmıyoruz.
        ScheduledTime: pickupForm.ScheduledTime,
        Notes: pickupForm.Notes || undefined,
      });

      setSuccess('Pick-up zamanı başarıyla kaydedildi veya güncellendi.');
      setPickupForm({
        roomNumber: '',
        ScheduledTime: '',
        Notes: '',
      });

      await loadServices();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Pick-up zamanı kaydedilirken bir hata oluştu.';
      setError(msg);
    } finally {
      setPickupSubmitting(false);
    }
  };

  const startEdit = (service) => {
    setEditingId(service.id);
    const baseDate = service.scheduledTime || service.pickUpTime;
    if (baseDate) {
      const d = new Date(baseDate);
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setEditingTime(local);
    } else {
      setEditingTime('');
    }
    setSuccess('');
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTime('');
  };

  const saveEdit = async (service) => {
    if (!editingTime) {
      setError('Please choose a time');
      return;
    }
    try {
      setError('');
      setSuccess('');

      if (service.requestType === 'Wake-Up Service') {
        // editingTime de datetime-local formatında yerel saat,
        // backend'e direkt bu string'i yolluyoruz.
        await updateWakeUpTime(service.id, editingTime);
      } else if (service.requestType === 'Pick-Up') {
        await updatePickUpTime(service.id, editingTime);
      }

      setSuccess('Time updated successfully');
      setEditingId(null);
      setEditingTime('');
      await loadServices();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update time';
      setError(msg);
    }
  };

  const handleStatusChange = async (service, nextStatus) => {
    try {
      setError('');
      setSuccess('');

      if (service.requestType === 'Wake-Up Service') {
        await updateWakeUpStatus(service.id, nextStatus);
      } else if (service.requestType === 'Pick-Up') {
        await updatePickUpStatus(service.id, nextStatus);
      }

      setSuccess('Status updated successfully');
      await loadServices();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status';
      setError(msg);
    }
  };

  const handleDelete = async (service) => {
    if (!window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      if (service.requestType === 'Wake-Up Service') {
        await deleteWakeUpService(service.id);
      } else if (service.requestType === 'Pick-Up') {
        await deletePickUpService(service.id);
      }

      setSuccess('Record deleted successfully');
      await loadServices();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete record';
      setError(msg);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading reception services..." />
      </Layout>
    );
  }

  const inputClass =
    'w-full px-4 py-3 bg-concierge-surface-container-low border-none rounded-full text-concierge-on-surface text-sm focus:ring-2 focus:ring-concierge-primary/25 focus:bg-concierge-surface-container-lowest transition-all placeholder:text-concierge-outline/45';
  const textareaClass =
    'w-full px-4 py-3 bg-concierge-surface-container-low border-none rounded-2xl text-concierge-on-surface text-sm focus:ring-2 focus:ring-concierge-primary/25 focus:bg-concierge-surface-container-lowest transition-all placeholder:text-concierge-outline/45';

  return (
    <Layout>
      <div className="-mx-4 sm:-mx-6 px-4 sm:px-6 py-2 min-h-[calc(100vh-6rem)] bg-concierge-background rounded-[2rem] sm:rounded-[3rem] border border-concierge-outline-variant/20 concierge-editorial-shadow">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 pt-2">
            <span className="inline-block py-1.5 px-4 rounded-full bg-concierge-secondary-container text-concierge-on-secondary-container text-[10px] font-bold tracking-widest uppercase mb-3">
              Concierge operations
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl text-concierge-on-background tracking-tight">
              Reception services
            </h2>
            <p className="text-concierge-on-surface-variant font-light text-lg mt-2 max-w-2xl">
              Manage wake-up calls and pick-up times with the same editorial clarity as the guest-facing portal.
            </p>
          </div>

          {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
          {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

          <div className="mb-8 bg-concierge-surface-container-lowest/90 backdrop-blur-sm rounded-[2rem] p-6 sm:p-8 border border-concierge-outline-variant/15 concierge-editorial-shadow">
            <h3 className="font-headline text-xl text-concierge-on-background mb-1">
              Pick-up zamanı gir / güncelle
            </h3>
            <p className="text-sm text-concierge-on-surface-variant mb-6">
              Oda numarası girerek misafirler için yeni bir pick-up (transfer) saati tanımlayabilir veya mevcut zamanı
              güncelleyebilirsiniz.
            </p>
            <form onSubmit={handlePickupSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-concierge-outline mb-2 ml-1">
                  Room number *
                </label>
                <input
                  type="number"
                  min="1"
                  value={pickupForm.roomNumber}
                  onChange={(e) =>
                    setPickupForm((prev) => ({ ...prev, roomNumber: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="Örn: 101"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-concierge-outline mb-2 ml-1">
                  Pick-up time *
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
                  Notes (optional)
                </label>
                <textarea
                  rows={2}
                  value={pickupForm.Notes}
                  onChange={(e) =>
                    setPickupForm((prev) => ({ ...prev, Notes: e.target.value }))
                  }
                  className={textareaClass}
                  placeholder="Örneğin: Havaalanı transferi, otelden 2 saat önce çıkış."
                />
              </div>
              <div className="md:col-span-3 flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={pickupSubmitting}
                  className="concierge-hero-gradient text-white py-3.5 px-8 rounded-full text-sm font-semibold uppercase tracking-widest shadow-lg shadow-concierge-primary/20 hover:shadow-concierge-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
                >
                  {pickupSubmitting ? 'Kaydediliyor...' : 'Pick-up zamanı kaydet'}
                </button>
              </div>
            </form>
          </div>

          {services.length === 0 ? (
            <div className="bg-concierge-surface-container-lowest/80 rounded-[2rem] p-10 text-center text-concierge-on-surface-variant border border-concierge-outline-variant/10">
              No reception services found.
            </div>
          ) : (
            <div className="bg-concierge-surface-container-lowest/90 rounded-[2rem] overflow-hidden border border-concierge-outline-variant/15 concierge-editorial-shadow">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-concierge-outline-variant/20">
                  <thead className="bg-concierge-surface-container-high/80">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-concierge-outline uppercase tracking-widest">
                        Room
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-concierge-outline uppercase tracking-widest">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-concierge-outline uppercase tracking-widest">
                        Time
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-concierge-outline uppercase tracking-widest">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-concierge-outline uppercase tracking-widest">
                        Notes
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-concierge-outline uppercase tracking-widest">
                        Actions
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
                            Room {service.roomNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-concierge-on-surface">
                            {service.requestType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-concierge-on-surface">
                            {editingId === service.id ? (
                              <input
                                type="datetime-local"
                                value={editingTime}
                                onChange={(e) => setEditingTime(e.target.value)}
                                className={`${inputClass} rounded-xl py-2 text-xs max-w-[200px]`}
                              />
                            ) : time ? (
                              new Date(time).toLocaleString()
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusBadgeClass(
                                service.status
                              )}`}
                            >
                              {service.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-concierge-on-surface-variant max-w-xs truncate">
                            {service.notes || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {editingId === service.id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => saveEdit(service)}
                                  className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  className="text-concierge-on-surface-variant hover:text-concierge-on-surface text-xs"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEdit(service)}
                                className="text-concierge-primary hover:text-concierge-primary-container text-xs font-semibold"
                              >
                                Edit time
                              </button>
                            )}
                            {service.status === 'Pending' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(service, 'InProcess')}
                                className="text-concierge-primary hover:text-concierge-primary-container text-xs font-semibold"
                              >
                                Start
                              </button>
                            )}
                            {service.status === 'InProcess' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(service, 'Completed')}
                                className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
                              >
                                Complete
                              </button>
                            )}
                            {service.status === 'Completed' && (
                              <button
                                type="button"
                                onClick={() => handleDelete(service)}
                                className="text-concierge-error hover:text-red-800 text-xs font-semibold"
                              >
                                Delete
                              </button>
                            )}
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
    </Layout>
  );
};

export default ReceptionServicesPage;


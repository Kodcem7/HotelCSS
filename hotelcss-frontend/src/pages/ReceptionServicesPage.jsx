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

      const scheduledIso = new Date(pickupForm.ScheduledTime).toISOString();

      await setPickUpTime(Number(pickupForm.roomNumber), {
        ScheduledTime: scheduledIso,
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

      const iso = new Date(editingTime).toISOString();

      if (service.requestType === 'Wake-Up Service') {
        await updateWakeUpTime(service.id, iso);
      } else if (service.requestType === 'Pick-Up') {
        await updatePickUpTime(service.id, iso);
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

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading reception services..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reception Services</h2>
        <p className="text-gray-600 mt-1">
          Manage wake-up services and pick-up times for guests.
        </p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
      {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

      {/* Pick-up time creation / update form */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Pick-up Zamanı Gir / Güncelle
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Oda numarası girerek misafirler için yeni bir pick-up (transfer) saati
          tanımlayabilir veya mevcut zamanı güncelleyebilirsiniz.
        </p>
        <form
          onSubmit={handlePickupSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Number *
            </label>
            <input
              type="number"
              min="1"
              value={pickupForm.roomNumber}
              onChange={(e) =>
                setPickupForm((prev) => ({ ...prev, roomNumber: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Örn: 101"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pick-up Time *
            </label>
            <input
              type="datetime-local"
              value={pickupForm.ScheduledTime}
              onChange={(e) =>
                setPickupForm((prev) => ({ ...prev, ScheduledTime: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              rows="2"
              value={pickupForm.Notes}
              onChange={(e) =>
                setPickupForm((prev) => ({ ...prev, Notes: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Örneğin: Havaalanı transferi, otelden 2 saat önce çıkış."
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={pickupSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pickupSubmitting ? 'Kaydediliyor...' : 'Pick-up Zamanı Kaydet'}
            </button>
          </div>
        </form>
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No reception services found.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service) => {
                  const isWakeUp = service.requestType === 'Wake-Up Service';
                  const time = isWakeUp ? service.scheduledTime : service.pickUpTime;
                  return (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Room {service.roomNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {service.requestType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingId === service.id ? (
                          <input
                            type="datetime-local"
                            value={editingTime}
                            onChange={(e) => setEditingTime(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                          />
                        ) : time ? (
                          new Date(time).toLocaleString()
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {service.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                        {service.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {editingId === service.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(service)}
                              className="text-green-600 hover:text-green-900 text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-gray-600 hover:text-gray-900 text-xs"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => startEdit(service)}
                            className="text-blue-600 hover:text-blue-900 text-xs"
                          >
                            Edit Time
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
    </Layout>
  );
};

export default ReceptionServicesPage;


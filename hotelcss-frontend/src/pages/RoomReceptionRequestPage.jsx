import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { useAuth } from '../context/AuthContext';
import {
  createWakeUpService,
  getReceptionServices,
  getPickUpTime,
} from '../api/receptionService';

const RoomReceptionRequestPage = () => {
  const { user } = useAuth();

  const [selectedType, setSelectedType] = useState('wake-up'); // 'wake-up' | 'pickup-info'
  const [formData, setFormData] = useState({
    ScheduledTime: '',
    Notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [existingRequests, setExistingRequests] = useState([]);
  const [loadingPickup, setLoadingPickup] = useState(false);
  const [pickupInfos, setPickupInfos] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadExisting = async () => {
      try {
        setLoadingExisting(true);
        setError('');
        const data = await getReceptionServices();
        setExistingRequests(Array.isArray(data) ? data : data?.data ?? []);
      } catch (err) {
        // Not critical, just log
        console.error(err);
      } finally {
        setLoadingExisting(false);
      }
    };

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

    loadExisting();
    loadPickupInfos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedType !== 'wake-up') {
      return;
    }

    if (!formData.ScheduledTime) {
      setError('Lütfen bir saat seçin.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      // Convert HTML datetime-local (local time) to ISO string so backend can parse DateTime
      const scheduledDate = new Date(formData.ScheduledTime);

      await createWakeUpService({
        ScheduledTime: scheduledDate.toISOString(),
        Notes: formData.Notes || undefined,
      });

      setSuccess('Resepsiyon isteğiniz başarıyla iletildi! (Uyanma servisi)');
      setFormData({
        ScheduledTime: '',
        Notes: '',
      });

      // Refresh existing list
      const data = await getReceptionServices();
      setExistingRequests(Array.isArray(data) ? data : data?.data ?? []);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Resepsiyon isteği oluşturulurken bir hata oluştu.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reception Requests</h2>
        <p className="text-gray-600 mb-6">
          Resepsiyondan farklı hizmetler talep edebilir veya mevcut bilgileri
          görüntüleyebilirsiniz.
        </p>

        {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
        {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

        {/* Request type selector */}
        <div className="mb-6 flex gap-3">
          <button
            type="button"
            onClick={() => setSelectedType('wake-up')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition ${
              selectedType === 'wake-up'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Wake-up Service
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('pickup-info')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition ${
              selectedType === 'pickup-info'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Learn Pick-Up Time
          </button>
        </div>

        {/* Wake-up Service form & list */}
        {selectedType === 'wake-up' && (
          <>
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow p-6 space-y-6 mb-8"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room
                </label>
                <p className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-800">
                  {user?.username}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wake-up Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.ScheduledTime}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, ScheduledTime: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lütfen uyanmak istediğiniz tarihi ve saati seçin.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.Notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, Notes: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Örneğin: Lütfen nazikçe uyandırın."
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Gönderiliyor...' : 'Wake-up Request Oluştur'}
                </button>
              </div>
            </form>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Mevcut Wake-up İstekleriniz
              </h3>
              {loadingExisting ? (
                <LoadingSpinner text="Yükleniyor..." />
              ) : existingRequests.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  Kayıtlı bir wake-up servisi isteğiniz bulunmuyor.
                </p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {existingRequests.map((req) => (
                    <li key={req.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(req.scheduledTime).toLocaleString()}
                        </p>
                        {req.notes && (
                          <p className="text-xs text-gray-500 mt-0.5">{req.notes}</p>
                        )}
                      </div>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {req.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {/* Learn Pick-Up Time view */}
        {selectedType === 'pickup-info' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Learn Pick-Up Time
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Resepsiyon tarafından sizin için tanımlanmış pick-up (transfer) saati
              varsa aşağıda görebilirsiniz.
            </p>
            {loadingPickup ? (
              <LoadingSpinner text="Yükleniyor..." />
            ) : pickupInfos.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Şu anda odanız için tanımlı bir pick-up zamanı bulunmuyor.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {pickupInfos.map((info) => (
                  <li key={info.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(info.pickUpTime).toLocaleString()}
                      </p>
                      {info.notes && (
                        <p className="text-xs text-gray-500 mt-0.5">{info.notes}</p>
                      )}
                    </div>
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {info.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RoomReceptionRequestPage;


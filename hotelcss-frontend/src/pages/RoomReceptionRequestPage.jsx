import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { useAuth } from '../context/AuthContext';
import { createWakeUpService, getPickUpTime } from '../api/receptionService';

const RoomReceptionRequestPage = () => {
  const { user } = useAuth();

  const [selectedType, setSelectedType] = useState('wake-up'); // 'wake-up' | 'pickup-info'
  const [formData, setFormData] = useState({
    ScheduledTime: '',
    Notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [loadingPickup, setLoadingPickup] = useState(false);
  const [pickupInfos, setPickupInfos] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

      await createWakeUpService({
        // HTML datetime-local already returns local time in "YYYY-MM-DDTHH:mm" format.
        // Bunu direkt backend'e gönderiyoruz ki ek bir UTC dönüşümü yapılmasın.
        ScheduledTime: formData.ScheduledTime,
        Notes: formData.Notes || undefined,
      });

      setSuccess('Resepsiyon isteğiniz başarıyla iletildi! (Uyanma servisi)');
      setFormData({
        ScheduledTime: '',
        Notes: '',
      });
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
      <div className="p-10 space-y-10 max-w-7xl mx-auto">
        <section>
          <h2 className="font-headline text-[52px] text-[#4A3728] mb-2 font-bold leading-tight">
            Reception Requests
          </h2>
          <p className="text-[14px] text-[#5D534A] leading-relaxed">
            Resepsiyondan hizmet talep edebilir veya mevcut bilgileri görüntüleyebilirsiniz.
          </p>
        </section>

        {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
        {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

        {/* Request type selector */}
        <div className="flex gap-3 max-w-3xl mx-auto">
          <button
            type="button"
            onClick={() => setSelectedType('wake-up')}
            className={`flex-1 px-4 py-3 text-sm font-semibold rounded-2xl border transition ${
              selectedType === 'wake-up'
                ? 'bg-[#4A3728] text-white border-[#4A3728]'
                : 'bg-[#F2EBE1] text-[#4A3728] border-[#E3DCD2]/50 hover:bg-[#E8DFD1]'
            }`}
          >
            Wake-up Service
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('pickup-info')}
            className={`flex-1 px-4 py-3 text-sm font-semibold rounded-2xl border transition ${
              selectedType === 'pickup-info'
                ? 'bg-[#4A3728] text-white border-[#4A3728]'
                : 'bg-[#F2EBE1] text-[#4A3728] border-[#E3DCD2]/50 hover:bg-[#E8DFD1]'
            }`}
          >
            Learn Pick-Up Time
          </button>
        </div>

        {/* Wake-up Service form & list */}
        {selectedType === 'wake-up' && (
            <form
              onSubmit={handleSubmit}
              className="bg-[#FDFBF7] rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] p-8 space-y-6 max-w-3xl mx-auto"
            >
              <div>
                <label className="block text-sm font-semibold text-[#4A3728] mb-1">
                  Room
                </label>
                <p className="px-4 py-3 border border-[#E3DCD2]/50 rounded-2xl bg-[#F2EBE1]/55 text-[#2C241E] font-semibold">
                  {user?.username}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#4A3728] mb-1">
                  Wake-up Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.ScheduledTime}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, ScheduledTime: e.target.value }))
                  }
                  className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
                  required
                />
                <p className="text-xs text-[#8E735B] mt-1">
                  Lütfen uyanmak istediğiniz tarihi ve saati seçin.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#4A3728] mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.Notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, Notes: e.target.value }))
                  }
                  className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E] placeholder:text-[#8E735B]"
                  rows="3"
                  placeholder="Örneğin: Lütfen nazikçe uyandırın."
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#4A3728] text-white py-3 px-4 rounded-2xl hover:bg-[#3a2b20] transition disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
                >
                  {submitting ? 'Gönderiliyor...' : 'Wake-up Request Oluştur'}
                </button>
              </div>
            </form>
        )}

        {/* Learn Pick-Up Time view */}
        {selectedType === 'pickup-info' && (
          <div className="bg-[#FDFBF7] rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] p-8 max-w-3xl mx-auto">
            <h3 className="font-headline text-2xl text-[#4A3728] font-bold mb-2">
              Learn Pick-Up Time
            </h3>
            <p className="text-[14px] text-[#5D534A] mb-6 leading-relaxed">
              Resepsiyon tarafından sizin için tanımlanmış pick-up (transfer) saati
              varsa aşağıda görebilirsiniz.
            </p>
            {loadingPickup ? (
              <LoadingSpinner text="Yükleniyor..." />
            ) : pickupInfos.length === 0 ? (
              <p className="text-[#8E735B] text-sm">
                Şu anda odanız için tanımlı bir pick-up zamanı bulunmuyor.
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


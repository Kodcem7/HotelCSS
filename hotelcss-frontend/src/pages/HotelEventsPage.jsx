import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getActiveEvents } from '../api/events';

const HotelEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getActiveEvents();
        setEvents(res?.data || []);
      } catch (err) {
        setError('Failed to load hotel events');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const hasEarnPointsEvent = events.some((ev) => ev.eventType === 'EarnPoints');

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading hotel events..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Hotel Events & Information</h2>
        <p className="text-gray-600 mt-1 text-sm">
          Stay up to date with what&apos;s happening at the hotel and today&apos;s meal
          information.
        </p>
        {hasEarnPointsEvent && (
          <p className="mt-3 text-sm text-green-800 bg-green-50 border border-green-100 rounded-lg px-4 py-2">
            Şu anda yaptığınız satın alımlarda ekstra puan kazanabilirsiniz. Geçerli
            kampanyaları aşağıdaki listeden görebilirsiniz.
          </p>
        )}
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      {events.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
          Şu anda aktif bir etkinlik veya kampanya bulunmuyor.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-lg shadow p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{ev.title}</h3>
                    {ev.eventType && (
                      <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                        {ev.eventType}
                      </span>
                    )}
                  </div>
                </div>

                {ev.description && (
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                    {ev.description}
                  </p>
                )}

                {ev.eventType === 'EarnPoints' && (
                  <p className="mt-3 text-xs text-green-800 bg-green-50 border border-green-100 rounded px-3 py-2">
                    Bu kampanya kapsamında uygun satın alımlarınızdan ekstra{' '}
                    <span className="font-semibold">{ev.bonusPoints}</span> puan
                    kazanabilirsiniz.
                  </p>
                )}

                {ev.eventType === 'Meal' && ev.mealInfo && (
                  <div className="mt-3 text-xs text-blue-800 bg-blue-50 border border-blue-100 rounded px-3 py-2 whitespace-pre-wrap">
                    {ev.mealInfo}
                  </div>
                )}

                {(ev.startDate || ev.endDate) && (
                  <p className="text-xs text-gray-500 mt-2">
                    {ev.startDate && (
                      <>
                        <span className="font-medium">Başlangıç:</span>{' '}
                        {new Date(ev.startDate).toLocaleString()}
                      </>
                    )}
                    {ev.endDate && (
                      <>
                        {' '}
                        • <span className="font-medium">Bitiş:</span>{' '}
                        {new Date(ev.endDate).toLocaleString()}
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default HotelEventsPage;


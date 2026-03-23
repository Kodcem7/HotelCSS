import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getActiveEvents } from '../api/events';

const HotelEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // "cardbox" seçimleri: Event General veya Günlük Menüler
  const [activeTab, setActiveTab] = useState('general');

  const fetchEvents = async () => {
    const res = await getActiveEvents();
    setEvents(res?.data || []);
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError('');
        await fetchEvents();
      } catch (err) {
        setError('Failed to load hotel events');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const generalEvents = useMemo(() => {
    return (events || []).filter((ev) => ev.eventType === 'General');
  }, [events]);

  const menuEvents = useMemo(() => {
    return (events || []).filter((ev) => ev.eventType === 'Meal');
  }, [events]);

  const displayedEvents = activeTab === 'menu' ? menuEvents : generalEvents;

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
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 ${
            activeTab === 'general' ? 'border-blue-200' : 'border-transparent'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Event General</h3>
              <p className="text-sm text-gray-600">Announcements & hotel updates</p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('menu')}
          className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 ${
            activeTab === 'menu' ? 'border-blue-200' : 'border-transparent'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Günlük Menüler</h3>
              <p className="text-sm text-gray-600">Breakfast / lunch / dinner details</p>
            </div>
          </div>
        </button>
      </div>

      <div className="mb-8">
        {displayedEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
            Şu anda aktif içerik bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedEvents.map((ev) => (
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
      </div>

    </Layout>
  );
};

export default HotelEventsPage;


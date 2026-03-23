import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { deleteBonusCampaign, getActiveBonusEventsForDashboard } from '../api/bonusCampaigns';

const RoomCampaignDashboardPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  const fetchCampaigns = async () => {
    try {
      setError('');
      const res = await getActiveBonusEventsForDashboard();
      setCampaigns(res?.data || []);
    } catch (err) {
      setError('Failed to load bonus campaigns');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const onDeleteCampaign = async (campaignId) => {
    const ok = window.confirm('Bu kampanyayı silmek istediğinizden emin misiniz?');
    if (!ok) return;

    try {
      setDeleteError('');
      setDeleteSuccess('');
      await deleteBonusCampaign(campaignId);
      setDeleteSuccess('Kampanya silindi.');
      await fetchCampaigns();
    } catch (err) {
      setDeleteError(err?.response?.data?.message || 'Failed to delete campaign');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading bonus campaigns..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Dashboard</h2>
          <p className="text-gray-600 mt-1 text-sm">
            Active bonus campaigns for room users.
          </p>
        </div>

        <Link
          to="/room/events"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Back to Hotel Events
        </Link>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
      {deleteError && (
        <ErrorMessage message={deleteError} onDismiss={() => setDeleteError('')} />
      )}
      {deleteSuccess && (
        <SuccessMessage message={deleteSuccess} onDismiss={() => setDeleteSuccess('')} />
      )}

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
          Şu anda aktif bonus kampanya bulunmuyor.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-lg shadow p-5 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">{c.title}</h3>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800 whitespace-nowrap">
                    +{c.bonusPoints} pts
                  </span>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  {c.startDate && (
                    <>
                      <span className="font-medium">Başlangıç:</span>{' '}
                      {new Date(c.startDate).toLocaleString()}
                    </>
                  )}
                  {c.endDate && (
                    <>
                      {' '}
                      • <span className="font-medium">Bitiş:</span>{' '}
                      {new Date(c.endDate).toLocaleString()}
                    </>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onDeleteCampaign(c.id)}
                className="w-full px-3 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:bg-red-300"
              >
                Sil
              </button>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default RoomCampaignDashboardPage;


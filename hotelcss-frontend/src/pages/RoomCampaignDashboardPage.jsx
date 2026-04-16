import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getActiveBonusEventsForDashboard } from '../api/bonusCampaigns';

const RoomCampaignDashboardPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading bonus campaigns..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-10 space-y-10 max-w-7xl mx-auto">
        <section className="text-center max-w-3xl mx-auto">
          <div>
            <h2 className="font-headline text-[52px] text-[#4A3728] mb-2 font-bold leading-tight">
              Campaign Dashboard
            </h2>
            <p className="text-[14px] text-[#5D534A] leading-relaxed">
              Active bonus campaigns for room users.
            </p>
          </div>
        </section>

        {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

        {campaigns.length === 0 ? (
          <div className="bg-[#FDFBF7] p-8 rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] text-center text-[#5D534A] max-w-3xl mx-auto">
            There are no active bonus campaigns right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="bg-[#FDFBF7] p-8 rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] hover:shadow-[0_25px_55px_rgba(15,28,44,0.07)] transition-shadow duration-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-headline text-xl text-[#4A3728] font-bold">{c.title}</h3>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#F2EBE1] text-[#4A3728] border border-[#E3DCD2]/40 whitespace-nowrap">
                    +{c.bonusPoints} pts
                  </span>
                </div>

                <p className="text-xs text-[#8E735B] mt-3">
                  {c.startDate && (
                    <>
                      <span className="font-medium">Start:</span>{' '}
                      {new Date(c.startDate).toLocaleString()}
                    </>
                  )}
                  {c.endDate && (
                    <>
                      {' '}
                      • <span className="font-medium">End:</span>{' '}
                      {new Date(c.endDate).toLocaleString()}
                    </>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RoomCampaignDashboardPage;


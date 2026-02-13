import { useState } from 'react';
import { updateProfile } from '../api/users';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [userName, setUserName] = useState(user?.userName || user?.UserName || '');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await updateProfile({ Name: name, UserName: userName });
      setStatus({
        type: res.success ? 'success' : 'error',
        message: res.message || 'Profile updated.',
      });

      if (res.success && user) {
        const updated = { ...user, name, userName };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || 'Failed to update profile.';
      setStatus({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="My Profile">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow border border-slate-200 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-800 mb-4">
          My Profile
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          Update your personal information. Your changes will be used across
          the system.
        </p>

        {status && (
          <div
            className={`mb-5 p-4 rounded-xl text-sm font-medium flex items-start gap-3 shadow-sm ${
              status.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200/80 text-emerald-700'
                : 'bg-red-50 border border-red-200/80 text-red-700'
            }`}
            role="alert"
          >
            <span>{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Full name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50/60 rounded-xl border-2 border-slate-200 focus:border-slate-400 focus:outline-none text-slate-800 placeholder-slate-400 text-sm font-medium transition-colors"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="userName"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Username
            </label>
            <input
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50/60 rounded-xl border-2 border-slate-200 focus:border-slate-400 focus:outline-none text-slate-800 placeholder-slate-400 text-sm font-medium transition-colors"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 py-3.5 px-4 rounded-xl font-semibold text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-400/40 shadow-lg shadow-slate-900/10 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 active:scale-[0.99]"
          >
            {loading ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Profile;


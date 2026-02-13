import { useState } from 'react';
import { changePassword } from '../api/users';
import Layout from '../components/Layout';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      setStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await changePassword(oldPassword, newPassword);
      setStatus({
        type: res.success ? 'success' : 'error',
        message: res.message || 'Password updated.',
      });
      if (res.success) {
        setOldPassword('');
        setNewPassword('');
        setConfirm('');
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || 'Failed to change password.';
      setStatus({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Change Password">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow border border-slate-200 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-800 mb-4">
          Change Password
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          For security reasons, choose a strong password that you haven&apos;t
          used elsewhere.
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
              htmlFor="oldPassword"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Current password
            </label>
            <input
              id="oldPassword"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50/60 rounded-xl border-2 border-slate-200 focus:border-slate-400 focus:outline-none text-slate-800 placeholder-slate-400 text-sm font-medium transition-colors"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50/60 rounded-xl border-2 border-slate-200 focus:border-slate-400 focus:outline-none text-slate-800 placeholder-slate-400 text-sm font-medium transition-colors"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="confirm"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Confirm new password
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50/60 rounded-xl border-2 border-slate-200 focus:border-slate-400 focus:outline-none text-slate-800 placeholder-slate-400 text-sm font-medium transition-colors"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 py-3.5 px-4 rounded-xl font-semibold text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-400/40 shadow-lg shadow-slate-900/10 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 active:scale-[0.99]"
          >
            {loading ? 'Updating...' : 'Change password'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default ChangePassword;


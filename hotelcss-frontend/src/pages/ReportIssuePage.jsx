import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { reportIssue } from '../api/requests';
import { useAuth } from '../context/AuthContext';

const ReportIssuePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    Title: '',
    Description: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
    } else {
      setPhotoFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      if (!formData.Title.trim() || !formData.Description.trim()) {
        setError('Please provide a title and description for the issue.');
        setSubmitting(false);
        return;
      }

      await reportIssue({
        Title: formData.Title.trim(),
        Description: formData.Description.trim(),
        Photo: photoFile || undefined,
      });

      setSuccess('Issue reported successfully!');
      setFormData({ Title: '', Description: '' });
      setPhotoFile(null);

      setTimeout(() => {
        navigate('/room');
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to report issue';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Report an Issue</h2>
        <p className="text-gray-600 mb-6">
          Use this form to report any problems in your room (e.g. broken light, leaking tap). Our staff will review your report.
        </p>

        {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
        {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room
            </label>
            <p className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-800">
              {user?.username}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              The issue will be linked to this room.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.Title}
              onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Short summary (e.g. Bathroom light not working)"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.Description}
              onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
              placeholder="Please describe the problem in detail..."
              maxLength={1000}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              A clear photo can help staff resolve the issue faster.
            </p>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Sending...' : 'Send Report'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/room')}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ReportIssuePage;


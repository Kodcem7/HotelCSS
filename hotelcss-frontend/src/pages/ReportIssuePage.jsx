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
      <div className="p-10 space-y-10 max-w-7xl mx-auto">
        <section>
          <h2 className="font-headline text-[52px] text-[#4A3728] mb-2 font-bold leading-tight">
            Report an Issue
          </h2>
          <p className="text-[14px] text-[#5D534A] leading-relaxed">
            Report problems in your room (e.g. broken light, leaking tap). Our staff will review your report.
          </p>
        </section>

        {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
        {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

        <form onSubmit={handleSubmit} className="bg-[#FDFBF7] rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] p-8 space-y-6 max-w-3xl mx-auto">
          <div>
            <label className="block text-sm font-semibold text-[#4A3728] mb-1">
              Room
            </label>
            <p className="px-4 py-3 border border-[#E3DCD2]/50 rounded-2xl bg-[#F2EBE1]/55 text-[#2C241E] font-semibold">
              {user?.username}
            </p>
            <p className="text-xs text-[#8E735B] mt-1">
              The issue will be linked to this room.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#4A3728] mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.Title}
              onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E] placeholder:text-[#8E735B]"
              placeholder="Short summary (e.g. Bathroom light not working)"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#4A3728] mb-1">
              Description *
            </label>
            <textarea
              value={formData.Description}
              onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
              className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E] placeholder:text-[#8E735B]"
              rows="4"
              placeholder="Please describe the problem in detail..."
              maxLength={1000}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#4A3728] mb-1">
              Photo (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
            />
            <p className="text-xs text-[#8E735B] mt-1">
              A clear photo can help staff resolve the issue faster.
            </p>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#4A3728] text-white py-3 px-4 rounded-2xl hover:bg-[#3a2b20] transition disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
            >
              {submitting ? 'Sending...' : 'Send Report'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/room')}
              className="flex-1 bg-[#F2EBE1] text-[#4A3728] py-3 px-4 rounded-2xl hover:bg-[#E8DFD1] transition font-semibold border border-[#E3DCD2]/40"
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


import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUser } from '../api/users';
import { getDepartments } from '../api/departments';

const Register = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    Name: '',
    UserName: '',
    Email: '',
    Password: '',
    ConfirmPassword: '',
    DepartmentId: 0,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await getDepartments();
        const list = Array.isArray(res) ? res : [];
        // Hide "Room" department from public registration
        setDepartments(list.filter((d) => d.departmentName !== 'Room'));
      } catch {
        // Fail silently – departments are optional
      }
    };

    loadDepartments();
  }, []);

  const handleChange = (field) => (e) => {
    const value = field === 'DepartmentId' ? parseInt(e.target.value, 10) : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.Password !== formData.ConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        Name: formData.Name,
        UserName: formData.UserName,
        Email: formData.Email,
        Password: formData.Password,
        DepartmentId: formData.DepartmentId,
      };

      const res = await createUser(payload);

      if (res.success) {
        setSuccess(res.message || 'Account created successfully. You can now sign in.');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(res.message || 'Failed to create account.');
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create account.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50/95 to-stone-100/80" />

      <div
        className="relative w-full max-w-md login-card"
        style={{ animation: 'fadeInUp 0.6s ease-out' }}
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200/80 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600" />

          <div className="p-8 sm:p-10">
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                ← Back to login
              </button>
              <div className="flex-1 text-center">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                  Create account
                </h1>
                <p className="mt-2 text-sm text-slate-600 font-medium">
                  Register to access HotelCSS dashboard
                </p>
              </div>
            </div>

            {error && (
              <div
                className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-sm font-medium flex items-start gap-3 shadow-sm"
                role="alert"
              >
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-sm font-medium flex items-start gap-3 shadow-sm"
                role="alert"
              >
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  value={formData.Name}
                  onChange={handleChange('Name')}
                  className="w-full px-4 py-3 bg-slate-50/60 rounded-xl border-2 border-slate-200 focus:border-slate-400 focus:outline-none text-slate-800 placeholder-slate-400 text-sm font-medium transition-colors"
                  placeholder="John Doe"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.UserName}
                  onChange={handleChange('UserName')}
                  className="w-full px-4 py-3 bg-slate-50/60 rounded-xl border-2 border-slate-200 focus:border-slate-400 focus:outline-none text-slate-800 placeholder-slate-400 text-sm font-medium transition-colors"
                  placeholder="johndoe"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.Email}
                  onChange={handleChange('Email')}
                  className="w-full px-4 py-3 bg-slate-50/60 rounded-xl border-2 border-slate-200 focus:border-slate-400 focus:outline-none text-slate-800 placeholder-slate-400 text-sm font-medium transition-colors"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.Password}
                    onChange={handleChange('Password')}
                    className="w-full px-4 py-3 bg-slate-50/60 rounded-xl border-2 border-slate-200 focus:border-slate-400 focus:outline-none text-slate-800 placeholder-slate-400 text-sm font-medium transition-colors"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={formData.ConfirmPassword}
                    onChange={handleChange('ConfirmPassword')}
                    className="w-full px-4 py-3 bg-slate-50/60 rounded-xl border-2 border-slate-200 focus:border-slate-400 focus:outline-none text-slate-800 placeholder-slate-400 text-sm font-medium transition-colors"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Department (optional)
                </label>
                <select
                  value={formData.DepartmentId}
                  onChange={handleChange('DepartmentId')}
                  className="w-full px-4 py-3 bg-slate-50/60 rounded-xl border-2 border-slate-200 focus:border-slate-400 focus:outline-none text-slate-800 text-sm font-medium transition-colors"
                  disabled={loading}
                >
                  <option value={0}>Admin / No department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.departmentName}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl font-semibold text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-400/40 shadow-lg shadow-slate-900/20 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 active:scale-[0.99]"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="mt-4 text-xs text-slate-500 text-center">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-slate-700 hover:text-slate-900"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .login-card {
          animation: fadeInUp 0.6s ease-out;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Register;


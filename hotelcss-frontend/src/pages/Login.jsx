import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getDashboardPathForRole } from '../utils/dashboardPath';
import ConciergeAuthLayout from '../components/ConciergeAuthLayout';

const Login = () => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!userName || !password) {
            setError('Please enter both username and password');
            setLoading(false);
            return;
        }

        const result = await login(userName, password);

        if (result.success) {
            navigate(getDashboardPathForRole(result.user?.role));
        } else {
            setError(result.message || 'Login failed. Please try again.');
            setLoading(false);
        }
    };

    const footer = (
        <footer className="mt-16 pt-12 border-t border-concierge-outline-variant/10">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex gap-4">
                    <button
                        type="button"
                        title="Google sign-in (coming soon)"
                        className="p-4 rounded-full bg-concierge-surface-container-low hover:bg-concierge-surface-container-high transition-colors opacity-60 cursor-not-allowed"
                        disabled
                    >
                        <span className="material-symbols-outlined text-concierge-outline text-xl">login</span>
                    </button>
                    <button
                        type="button"
                        title="Key login (coming soon)"
                        className="p-4 rounded-full bg-concierge-surface-container-low hover:bg-concierge-surface-container-high transition-colors opacity-60 cursor-not-allowed"
                        disabled
                    >
                        <span className="material-symbols-outlined text-concierge-outline">key</span>
                    </button>
                </div>
                <p className="text-sm text-concierge-on-surface-variant italic font-headline text-center sm:text-right">
                    Need room access?{' '}
                    <Link className="text-concierge-primary font-sans font-bold not-italic ml-1 hover:underline" to="/room-login">
                        Room login
                    </Link>
                    <span className="mx-2 text-concierge-outline/50">·</span>
                </p>
            </div>

        </footer>
    );

    return (
        <ConciergeAuthLayout
            badge="Parador Beach Portal"
            title="Login"
            subtitle="Please enter your informations to login the system."
            footer={footer}
            image="/hotel1.webp"
            // 👇 CUSTOM WARM TEXT IMPLEMENTED HERE
            heroHeadline={
                <>
                    Parador Beach <br />
                    Hospitality Management
                </>
            }
            heroParagraph="Welcome to the Customer Satisfaction System. Your dedicated portal for creating unforgettable guest experiences and managing excellence at Parador Beach Hotel."
        >
            {error && (
                <div
                    className="mb-8 p-4 rounded-2xl bg-concierge-error-container/90 border border-concierge-outline-variant/30 text-concierge-on-error-container text-sm font-medium flex items-start gap-3"
                    role="alert"
                >
                    <span className="material-symbols-outlined text-lg shrink-0">error</span>
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label
                            className="block text-[10px] font-bold tracking-widest uppercase text-concierge-outline ml-6"
                            htmlFor="userName"
                        >
                            Username
                        </label>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-concierge-outline group-focus-within:text-concierge-primary transition-colors">
                                person
                            </span>
                            <input
                                id="userName"
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-concierge-surface-container-low rounded-full border-none focus:ring-2 focus:ring-concierge-primary/20 focus:bg-concierge-surface-container-lowest transition-all duration-300 placeholder:text-concierge-outline/40 placeholder:font-light text-concierge-on-surface"
                                placeholder="concierge.username"
                                disabled={loading}
                                required
                            />
                            <div className="absolute inset-0 rounded-full border border-concierge-primary/0 group-focus-within:border-concierge-primary/20 pointer-events-none transition-all duration-300" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-6 mr-6">
                            <label
                                className="block text-[10px] font-bold tracking-widest uppercase text-concierge-outline"
                                htmlFor="password"
                            >
                                Password
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-[10px] font-bold tracking-widest uppercase text-concierge-primary hover:text-concierge-primary/80 transition-colors"
                            >
                                Reset Password
                            </Link>
                        </div>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-concierge-outline group-focus-within:text-concierge-primary transition-colors">
                                lock_open
                            </span>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-concierge-surface-container-low rounded-full border-none focus:ring-2 focus:ring-concierge-primary/20 focus:bg-concierge-surface-container-lowest transition-all duration-300 placeholder:text-concierge-outline/40"
                                placeholder="••••••••"
                                disabled={loading}
                                required
                            />
                            <div className="absolute inset-0 rounded-full border border-concierge-primary/0 group-focus-within:border-concierge-primary/20 pointer-events-none transition-all duration-300" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-2">
                    <label className="flex items-center cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="peer h-5 w-5 rounded-full border-concierge-outline-variant text-concierge-primary focus:ring-concierge-primary/20 bg-concierge-surface-container-low"
                        />
                        <span className="ml-3 text-sm text-concierge-on-surface-variant font-medium select-none group-hover:text-concierge-on-surface transition-colors">
                            Remember this user
                        </span>
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full concierge-hero-gradient text-white py-5 px-8 rounded-full font-medium tracking-wide shadow-xl shadow-concierge-primary/20 hover:shadow-concierge-primary/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                    {loading ? (
                        <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Signing in…
                        </span>
                    ) : (
                        <>
                            <span className="text-sm font-semibold uppercase tracking-widest">Enter the system</span>
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </>
                    )}
                </button>
            </form>
        </ConciergeAuthLayout>
    );
};

export default Login;
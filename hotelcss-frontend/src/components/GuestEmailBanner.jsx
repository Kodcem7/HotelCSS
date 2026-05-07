import { useState } from 'react';
import { updateGuestEmail } from '../api/users';

const GuestEmailBanner = ({ isMailSent, onEmailSaved }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // State to track the KVKK checkbox
    const [agreedToKvkk, setAgreedToKvkk] = useState(false);

    // If they already submitted the email, the pop-up stays hidden!
    if (isMailSent) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Block submission if KVKK is not accepted
        if (!agreedToKvkk) {
            setError('Lütfen devam etmek için KVKK Aydınlatma Metnini okuyup onaylayın. (Please accept the KVKK terms.)');
            return;
        }

        if (!email) return;

        setLoading(true);
        try {
            const res = await updateGuestEmail(email);

            if (res.success) {
                // Instantly unlocks the dashboard
                onEmailSaved();
            } else {
                setError(res.message || 'Failed to save email.');
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">

            {/* The actual pop-up card */}
            <div className="bg-[#FDFBF7] w-full max-w-md rounded-[32px] p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">

                {/* Decorative background accent */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#D35400] opacity-10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 text-center">
                    <div className="w-16 h-16 bg-[#F2EBE1] rounded-full flex items-center justify-center mx-auto mb-5 border border-[#E3DCD2]/50">
                        <span className="material-symbols-outlined text-[#D35400] text-3xl">mark_email_unread</span>
                    </div>

                    <h3 className="font-headline font-bold text-2xl text-[#4A3728] mb-2 tracking-wide">
                        Welcome to your suite
                    </h3>
                    <p className="text-sm text-[#5D534A] mb-8 px-2">
                        Please enter your email to secure your session and unlock your digital concierge.
                    </p>

                    {error && (
                        <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold transition-all">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5 text-left">
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-[#8E735B] group-focus-within:text-[#D35400] transition-colors">
                                mail
                            </span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="guest@example.com"
                                className="w-full pl-14 pr-5 py-4 bg-[#F2EBE1]/50 border-2 border-[#E3DCD2]/70 rounded-2xl text-[#2C241E] focus:outline-none focus:border-[#D35400]/40 transition-colors placeholder:text-[#8E735B]/50"
                                required
                            />
                        </div>

                        {/* The KVKK Checkbox Area */}
                        <div className="flex items-start gap-3 p-1">
                            <div className="flex items-center h-5 mt-0.5">
                                <input
                                    id="kvkk-checkbox-banner"
                                    type="checkbox"
                                    checked={agreedToKvkk}
                                    onChange={(e) => {
                                        setAgreedToKvkk(e.target.checked);
                                        if (e.target.checked) setError(''); // Clear error instantly when checked
                                    }}
                                    className="w-5 h-5 rounded border-[#E3DCD2] text-[#D35400] focus:ring-[#D35400] focus:ring-2 cursor-pointer transition-colors"
                                />
                            </div>
                            <label htmlFor="kvkk-checkbox-banner" className="text-xs text-[#5D534A] leading-relaxed cursor-pointer select-none">
                                I have read and agree to the{' '}
                                {/* 👇 THE UPDATED LINK IS RIGHT HERE 👇 */}
                                <a
                                    href="/KVKK-policy.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#D35400] font-bold underline hover:text-[#4A3728] transition-colors"
                                >
                                    KVKK Privacy Policy
                                </a>
                                {' '}and consent to the processing of my email address for accommodation services.
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 font-bold text-sm tracking-widest uppercase rounded-2xl transition flex items-center justify-center gap-3
                                ${loading
                                    ? 'bg-[#F2EBE1] text-[#8E735B] shadow-none cursor-not-allowed'
                                    : 'bg-[#D35400] hover:bg-[#b84800] text-white shadow-lg shadow-[#D35400]/20'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    Unlock Dashboard
                                    <span className="material-symbols-outlined text-lg">lock_open</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GuestEmailBanner;
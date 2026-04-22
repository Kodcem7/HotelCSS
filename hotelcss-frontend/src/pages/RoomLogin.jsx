import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { roomLogin } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import ConciergeAuthLayout from '../components/ConciergeAuthLayout';

const RoomLogin = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();

    // Grab the data from the URL silently
    const roomId = searchParams.get('room');
    const qrToken = searchParams.get('token');

    const [error, setError] = useState('');
    const hasAttempted = useRef(false);

    // 👇 THE MAGIC TELEPORTER
    useEffect(() => {
        const attemptAutoLogin = async () => {
            if (!roomId || !qrToken) {
                setError('Invalid QR code. Please scan the welcome card in your room again.');
                return;
            }

            try {
                // Notice we send an EMPTY string for the email ("")! 
                // The C# backend will let them in, and the Dashboard Banner will ask for the email later.
                const res = await roomLogin(Number(roomId), qrToken, "");

                if (res.success && res.token) {
                    const ok = loginWithToken(res.token);
                    if (!ok) {
                        setError('Invalid token returned from server.');
                    } else {
                        navigate('/room'); // 🚀 TELEPORT DIRECTLY TO DASHBOARD!
                    }
                } else {
                    setError(res.message || 'Room login failed.');
                }
            } catch (err) {
                const msg = err?.response?.data?.message || err?.message || 'Access denied.';
                setError(msg);
            }
        };

        // This prevents React from firing the API twice in strict mode
        if (!hasAttempted.current) {
            hasAttempted.current = true;
            attemptAutoLogin();
        }
    }, [roomId, qrToken, navigate, loginWithToken]);

    return (
        <ConciergeAuthLayout
            badge="Guest Portal"
            title="Unlocking your suite..."
            subtitle="Please wait while we connect to your digital concierge."
            heroHeadline={
                <>
                    Your stay, <br />
                    elevated.
                </>
            }
            heroParagraph="Access your in-room concierge, services, and preferences."
        >
            {/* If there is an error (like a bad QR code), we show your error box */}
            {error ? (
                <div
                    className="mb-8 p-4 rounded-2xl bg-concierge-error-container/90 border border-concierge-outline-variant/30 text-concierge-on-error-container text-sm font-medium flex items-start gap-3"
                    role="alert"
                >
                    <span className="material-symbols-outlined text-lg shrink-0">error</span>
                    <span>{error}</span>
                </div>
            ) : (
                /* If no error, we just show a beautiful loading spinner while it teleports them */
                <div className="flex flex-col items-center justify-center py-12 space-y-6">
                    <svg className="animate-spin h-12 w-12 text-[#D35400]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-concierge-outline font-bold tracking-widest uppercase text-sm animate-pulse">
                        Authenticating...
                    </p>
                </div>
            )}
        </ConciergeAuthLayout>
    );
};

export default RoomLogin;
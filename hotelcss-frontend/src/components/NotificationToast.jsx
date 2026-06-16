import { useEffect, useState } from 'react';

/**
 * Displays a list of toast notifications at the bottom-right of the screen.
 * Each toast auto-dismisses after 5 seconds.
 *
 * @param {Array} toasts - [{ id, itemName, quantity }]
 * @param {function} onDismiss - (id) => void
 */
const NotificationToast = ({ toasts, onDismiss }) => {
    return (
        <div className="fixed bottom-24 right-4 z-[60] flex flex-col gap-3 max-w-[320px] w-full pointer-events-none">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
};

const Toast = ({ toast, onDismiss }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        const show = requestAnimationFrame(() => setVisible(true));

        // Auto-dismiss (longer for cancellations so the reason can be read)
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onDismiss(toast.id), 300);
        }, toast.type === 'cancelled' ? 8000 : 5000);

        return () => {
            cancelAnimationFrame(show);
            clearTimeout(timer);
        };
    }, [toast.id, onDismiss]);

    const isCancelled = toast.type === 'cancelled';
    const itemLabel = `${toast.quantity > 1 ? `${toast.quantity}× ` : ''}${toast.itemName}`;

    return (
        <div
            className={`pointer-events-auto bg-[#FDFBF7] border border-[#E3DCD2]/60 rounded-2xl shadow-[0_20px_40px_rgba(15,28,44,0.15)] p-4 flex items-start gap-3 transition-all duration-300 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
            <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${isCancelled ? 'bg-red-100' : 'bg-green-100'}`}>
                <span className={`material-symbols-outlined text-[20px] ${isCancelled ? 'text-red-600' : 'text-green-600'}`}>
                    {isCancelled ? 'cancel' : 'check_circle'}
                </span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#4A3728] leading-snug">
                    {isCancelled ? 'Request Cancelled' : 'Order Delivered!'}
                </p>
                <p className="text-xs text-[#5D534A] mt-0.5 leading-snug">
                    <span className={`font-semibold ${isCancelled ? 'text-[#B22222]' : 'text-[#D35400]'}`}>
                        {itemLabel}
                    </span>{' '}
                    {isCancelled ? 'has been cancelled.' : 'has been completed.'}
                </p>
                {isCancelled && toast.reason && (
                    <p className="text-xs text-[#7f1d1d] mt-1 leading-snug bg-red-50 border border-red-200/70 rounded-lg px-2 py-1">
                        <span className="font-semibold">Reason:</span> {toast.reason}
                    </p>
                )}
            </div>
            <button
                onClick={() => {
                    setVisible(false);
                    setTimeout(() => onDismiss(toast.id), 300);
                }}
                className="flex-shrink-0 p-1 rounded-lg text-[#8E735B] hover:bg-[#F2EBE1] hover:text-[#4A3728] transition-colors"
            >
                <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
        </div>
    );
};

export default NotificationToast;

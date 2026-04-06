import { useState, useRef, useEffect } from 'react';
import { analyzeRequest } from '../api/chat';
import { createRequest } from '../api/requests';
import { getPickUpTime, createWakeUpCall } from '../api/receptionservice';
import { useAuth } from '../context/AuthContext';

const ChatWidget = () => {
    const { user } = useAuth();

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: "Hi! I am your digital concierge. I can order room service, set wake-up calls, or check your airport pick-up time.", id: 'welcome' },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pendingOrder, setPendingOrder] = useState(null);
    const [pendingOrderMessageId, setPendingOrderMessageId] = useState(null);
    const [confirming, setConfirming] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || loading) return;

        setInput('');
        setError('');
        setMessages((prev) => [...prev, { role: 'user', text, id: Date.now().toString() }]);
        setLoading(true);

        try {
            const res = await analyzeRequest(text);
            if (res?.success && res?.data) {
                const d = res.data;
                const serviceItemId = d.ServiceItemId ?? d.serviceItemId;
                const itemName = d.ItemName ?? d.itemName;
                const quantity = d.Quantity ?? d.quantity ?? 1;
                const note = d.Note ?? d.note ?? '';
                const intentRaw = d.Intent ?? d.intent ?? '';
                const intent = intentRaw.toLowerCase();

                const time = d.Time ?? d.time ?? '';

                const hasItem = serviceItemId != null && itemName;
                const botId = `bot-${Date.now()}`;

                let reply = '';
                let allowConfirm = false;
                let pending = null;

                // ==========================================
                // 🧠 AI INTENT ROUTER (Brain)
                // ==========================================
                if (intent === 'info') {
                    reply = note || 'I am your Hotel Assistant. Please tell me what you need for your room.';
                }
                // 🏨 Wake-Up Call Logic
                else if (intent === 'wakeupcall') {
                    const finalTime = time || note;

                    if (finalTime && !finalTime.includes("What time")) {
                        allowConfirm = true;
                        pending = { Type: 'WakeUpCall', Time: finalTime, Note: note };

                        // Make it pretty for the chat bubble
                        let prettyTime = finalTime;
                        try {
                            const dateObj = new Date(finalTime);
                            if (!isNaN(dateObj.getTime())) {
                                prettyTime = dateObj.toLocaleString([], { dateStyle: 'long', timeStyle: 'short' });
                            }
                        } catch (e) { }

                        reply = `I can set a wake-up call for your room at **${prettyTime}**. Please confirm to set the alarm.`;
                    } else {
                        allowConfirm = false;
                        reply = "What time and date would you like me to set the wake-up call for?";
                    }
                }
                // 🚐 Pick-up Time Logic
                else if (intent === 'pickuptime') {
                    try {
                        const pickupRes = await getPickUpTime();

                        if (pickupRes && pickupRes.length > 0) {
                            const rawTime = pickupRes[0].pickUpTime;
                            const formattedTime = new Date(rawTime).toLocaleString([], {
                                dateStyle: 'long',
                                timeStyle: 'short'
                            });
                            reply = `Your pick-up transfer is scheduled for **${formattedTime}**. Please be ready in the lobby!`;
                        } else {
                            reply = `I checked the system, but I don't see a pick-up scheduled for your room yet. Please contact reception.`;
                        }
                    } catch (err) {
                        reply = "I couldn't fetch your pick-up time right now. Please call reception.";
                    }
                }
                // 🍔 EXISTING: Menu Order Logic
                else if (intent === 'clarify' && hasItem) {
                    reply = note || `Before I place your order for **${itemName}**, please tell me the required options.`;
                } else if (intent === 'order' && hasItem) {
                    allowConfirm = true;
                    pending = { Type: 'MenuOrder', ServiceItemId: serviceItemId, ItemName: itemName, Quantity: quantity, Note: note };
                    reply = `I found: **${itemName}** × ${quantity}${note ? ` — "${note}"` : ''}. Confirm to place the order.`;
                } else if (hasItem) {
                    reply = note || `You requested **${itemName}**. Please confirm quantity and any special options before I place the order.`;
                } else {
                    reply = note || 'I could not match that to a specific service item. Try asking for towels, food, or a wake-up call.';
                }

                setPendingOrder(pending);
                setPendingOrderMessageId(allowConfirm ? botId : null);

                setMessages((prev) => [
                    ...prev,
                    { role: 'bot', text: reply, id: botId, hasConfirm: allowConfirm },
                ]);
            } else {
                setPendingOrder(null);
                setPendingOrderMessageId(null);
                setMessages((prev) => [
                    ...prev,
                    { role: 'bot', text: 'Sorry, I couldn\'t understand that. Try something like "2 towels" or "wake me up at 8 AM".', id: `bot-${Date.now()}` },
                ]);
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Something went wrong.';
            setError(msg);
            setMessages((prev) => [
                ...prev,
                { role: 'bot', text: `Error: ${msg}`, id: `bot-err-${Date.now()}`, isError: true },
            ]);
            setPendingOrder(null);
            setPendingOrderMessageId(null);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmOrder = async () => {
        if (!pendingOrder || confirming) return;
        setConfirming(true);
        setError('');

        try {
            const currentRoomNumber = parseInt(user?.username?.replace('Room', '') || '0', 10);

            // 🚦 Check what type of order we are confirming (Button Logic)
            if (pendingOrder.Type === 'WakeUpCall') {
                // 👉 Just pass the AI's perfect time string directly to C#!
                await createWakeUpCall({
                    ScheduledTime: pendingOrder.Time,
                    Notes: pendingOrder.Note || "Requested via AI Chatbot"
                });

                // Format it nicely for the final green success message
                let prettySuccessTime = pendingOrder.Time;
                try {
                    const d = new Date(pendingOrder.Time);
                    if (!isNaN(d.getTime())) {
                        prettySuccessTime = d.toLocaleString([], { dateStyle: 'long', timeStyle: 'short' });
                    }
                } catch (e) { }

                setMessages((prev) => [
                    ...prev,
                    { role: 'bot', text: `Confirmed! Your wake-up call is set for ${prettySuccessTime}. Sleep well!`, id: `bot-${Date.now()}`, isSuccess: true },
                ]);
            } else {
                // 👉 Route to the standard Service Order Endpoint
                await createRequest({
                    RoomNumber: currentRoomNumber,
                    Type: "Order",
                    ServiceItemId: pendingOrder.ServiceItemId,
                    Quantity: pendingOrder.Quantity ?? 1,
                    Note: pendingOrder.Note ?? '',
                });

                setMessages((prev) => [
                    ...prev,
                    { role: 'bot', text: 'Order confirmed! Your request has been sent.', id: `bot-${Date.now()}`, isSuccess: true },
                ]);
            }

            setPendingOrder(null);
            setPendingOrderMessageId(null);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to process request';
            setError(msg);
            setMessages((prev) => [
                ...prev,
                { role: 'bot', text: `Could not complete request: ${msg}`, id: `bot-err-${Date.now()}`, isError: true },
            ]);
        } finally {
            setConfirming(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating button */}
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-slate-700 text-white shadow-lg transition hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                aria-label={open ? 'Close chat' : 'Open chat'}
            >
                {open ? (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}
            </button>

            {/* Chat window */}
            {open && (
                <div className="fixed bottom-24 right-6 z-40 flex h-[420px] w-[360px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                        <span className="font-semibold text-slate-800">Room assistant</span>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                            aria-label="Close"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.role === 'user'
                                        ? 'bg-slate-700 text-white'
                                        : m.isError
                                            ? 'bg-red-50 text-red-800 border border-red-200'
                                            : m.isSuccess
                                                ? 'bg-green-50 text-green-800 border border-green-200'
                                                : 'bg-slate-100 text-slate-800'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap">{m.text.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
                                    {m.hasConfirm && pendingOrder && m.id === pendingOrderMessageId && (
                                        <button
                                            type="button"
                                            onClick={handleConfirmOrder}
                                            disabled={confirming}
                                            className="mt-2 w-full rounded-lg bg-slate-700 px-3 py-2 text-xs font-medium text-white hover:bg-slate-600 disabled:opacity-50"
                                        >
                                            {confirming ? 'Processing...' : 'Confirm'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm text-slate-500">
                                    Thinking...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {error && (
                        <div className="px-4 py-1 text-xs text-red-600">{error}</div>
                    )}

                    <div className="border-t border-slate-200 p-3">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your request..."
                                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
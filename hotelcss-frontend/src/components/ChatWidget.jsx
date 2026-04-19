// 👇 1. THESE TWO NEW IMPORTS MUST BE AT THE VERY TOP
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

import { useState, useRef, useEffect } from 'react';
import { analyzeRequest } from '../api/chat';
import { createRequest } from '../api/requests';
import { getPickUpTime, createWakeUpCall } from '../api/receptionservice';
import { useAuth } from '../context/AuthContext';
import { getActiveBonusEvents, getActiveEvents, getMealList } from '../api/events';
import { getMyPoints } from '../api/rooms';
import { getRewardsCatalog } from '../api/rewards';

const ChatWidget = () => {
    const { user } = useAuth();

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: "Hi! I am your digital concierge. I can order room service, set wake-up calls, check your points balance, or show you the point shop.", id: 'welcome' },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pendingOrder, setPendingOrder] = useState(null);
    const [pendingOrderMessageId, setPendingOrderMessageId] = useState(null);
    const [confirming, setConfirming] = useState(false);
    const messagesEndRef = useRef(null);

    // 👇 2. THE NEW SPEECH RECOGNITION HOOK
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    // Dynamically combines what you typed with what the AI is currently hearing!
    const currentInput = listening
        ? input + (input && transcript ? ' ' : '') + transcript
        : input;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        const text = currentInput.trim();
        if (!text || loading) return;

        // Reset the input and the mic transcript
        setInput('');
        resetTranscript();

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

                let actionLink = null;
                let actionLinkText = '';

                // ==========================================
                // 🧠 AI INTENT ROUTER (Brain)
                // ==========================================
                if (intent === 'info') {
                    reply = note || 'I am your Hotel Assistant. Please tell me what you need for your room.';
                }
                else if (intent === 'wakeupcall') {
                    const finalTime = time || note;

                    if (finalTime && !finalTime.includes("What time")) {
                        allowConfirm = true;
                        pending = { Type: 'WakeUpCall', Time: finalTime, Note: note };

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
                else if (intent === 'campaigns') {
                    try {
                        const json = await getActiveBonusEvents();
                        const campaigns = json.data || [];

                        if (campaigns.length > 0) {
                            let text = "Here are our current active campaigns:\n\n";
                            campaigns.forEach(ev => {
                                const title = ev.title || ev.Title || 'Special Offer';
                                const desc = ev.description || ev.Description || '';
                                const points = ev.bonusPoints || ev.BonusPoints || 0;

                                text += `• **${title}**: Earn ${points} extra points!`;
                                if (desc) text += `\n  ${desc}`;

                                const rawEndDate = ev.endDate || ev.EndDate;
                                if (rawEndDate) text += ` *(Valid until ${new Date(rawEndDate).toLocaleDateString()})*`;
                                text += `\n\n`;
                            });
                            reply = text.trim();
                        } else {
                            reply = "At this time, we do not have any active promotional campaigns. Please check back later!";
                        }
                    } catch (err) {
                        reply = "I am currently unable to retrieve the campaign information.";
                    }
                }
                else if (intent === 'events') {
                    try {
                        const json = await getActiveEvents();
                        const generalEvents = json.data || [];

                        if (generalEvents.length > 0) {
                            let text = "Here are our upcoming hotel events:\n\n";
                            generalEvents.forEach(ev => {
                                const title = ev.title || ev.Title || 'Hotel Event';
                                const desc = ev.description || ev.Description || '';

                                text += `• **${title}**`;
                                if (desc) text += `\n  ${desc}`;

                                const rawStartDate = ev.startDate || ev.StartDate;
                                if (rawStartDate) text += `\n  *(Starts: ${new Date(rawStartDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })})*`;
                                text += `\n\n`;
                            });
                            reply = text.trim();
                        } else {
                            reply = "We don't have any special events scheduled right now. Enjoy your stay!";
                        }
                    } catch (err) {
                        reply = "I am currently unable to retrieve the event schedule.";
                    }
                }
                else if (intent === 'meals') {
                    try {
                        const json = await getMealList();
                        const meals = json.data || [];

                        if (meals.length > 0) {
                            let text = "Here is our dining information:\n\n";
                            meals.forEach(ev => {
                                const title = ev.title || ev.Title || 'Dining Menu';
                                const mealInfo = ev.mealInfo || ev.MealInfo || ev.description || ev.Description || '';

                                text += `• **${title}**\n`;
                                if (mealInfo) text += `  ${mealInfo}\n`;
                                text += `\n`;
                            });
                            reply = text.trim();
                        } else {
                            reply = "We do not have any special meal menus posted at the moment. Please check with the restaurant!";
                        }
                    } catch (err) {
                        reply = "I am currently unable to retrieve the dining menus.";
                    }
                }
                else if (intent === 'pointsbalance') {
                    try {
                        const json = await getMyPoints();

                        if (json?.success) {
                            const points = json.data || 0;
                            reply = `You currently have **${points} points**! You can use these points to get free services from the point shop.`;
                        } else {
                            reply = "I couldn't find a points account for your room. Please contact reception.";
                        }
                    } catch (err) {
                        reply = "I am currently unable to retrieve your points balance.";
                    }
                }
                else if (intent === 'pointshop') {
                    try {
                        const json = await getRewardsCatalog();
                        const items = json?.data || json || [];

                        if (items.length > 0) {
                            let text = "You can use your points to get free services from the point shop! Here is what you can get:\n\n";

                            items.forEach(item => {
                                const name = item.name || item.Name || item.title || item.Title || 'Reward Item';
                                const cost = item.pointsCost || item.PointsCost || 0;

                                text += `• **${name}**: ${cost} points\n`;
                            });

                            reply = text.trim();

                            actionLink = "/room/point-shop";
                            actionLinkText = "Go to Point Shop 🎁";
                        } else {
                            reply = "You can use your points to get free services, but our Point Shop is currently updating its inventory. Check back soon!";
                        }
                    } catch (err) {
                        reply = "You can use your points to get free services, but I am currently unable to load the shop menu.";
                    }
                }
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
                    { role: 'bot', text: reply, id: botId, hasConfirm: allowConfirm, link: actionLink, linkText: actionLinkText },
                ]);
            } else {
                setPendingOrder(null);
                setPendingOrderMessageId(null);
                setMessages((prev) => [
                    ...prev,
                    { role: 'bot', text: 'Sorry, I couldn\'t understand that. Try something like "2 towels", "wake me up at 8 AM", or "what can I buy with points?".', id: `bot-${Date.now()}` },
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

            if (pendingOrder.Type === 'WakeUpCall') {
                await createWakeUpCall({
                    ScheduledTime: pendingOrder.Time,
                    Notes: pendingOrder.Note || "Requested via AI Chatbot"
                });

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

    // 👇 3. NEW: The Library Microphone Handler
    const handleMicClick = () => {
        if (!browserSupportsSpeechRecognition) {
            alert("Your browser does not support voice input.");
            return;
        }

        if (listening) {
            // Stop listening, save the combined text, and reset the transcript memory
            SpeechRecognition.stopListening();
            setInput(currentInput);
            resetTranscript();
        } else {
            // 👇 THE MAGIC FIX: Detect the device's language automatically!
            const deviceLanguage = navigator.language || 'en-US';

            // Start listening in whatever language their phone/browser is set to
            SpeechRecognition.startListening({ continuous: true, language: deviceLanguage });
        }
    };

    // Allows the user to manually type while the mic is off, or overwrite while the mic is on
    const handleInputChange = (e) => {
        if (listening) {
            SpeechRecognition.stopListening();
            setInput(e.target.value);
            resetTranscript();
        } else {
            setInput(e.target.value);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#4A3728] text-white shadow-[0_16px_30px_rgba(74,55,40,0.28)] transition hover:bg-[#3A2B20] focus:outline-none focus:ring-2 focus:ring-[#D35400]/40 focus:ring-offset-2"
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

            {open && (
                <div className="fixed bottom-24 right-6 z-40 flex h-[440px] w-[360px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-[24px] border border-[#E3DCD2]/40 bg-[#FDFBF7] shadow-[0_30px_70px_rgba(15,28,44,0.14)]">
                    <div className="flex items-center justify-between border-b border-[#E3DCD2]/50 bg-[#F2EBE1] px-4 py-3">
                        <span className="font-semibold text-[#4A3728]">Room assistant</span>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="rounded-lg p-1.5 text-[#8E735B] hover:bg-[#E8DFD1] hover:text-[#4A3728]"
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
                                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm border ${m.role === 'user'
                                        ? 'bg-[#4A3728] text-white border-[#4A3728]'
                                        : m.isError
                                            ? 'bg-red-50 text-red-800 border-red-200'
                                            : m.isSuccess
                                                ? 'bg-green-50 text-green-800 border-green-200'
                                                : 'bg-[#F2EBE1] text-[#2C241E] border-[#E3DCD2]/50'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap">{m.text.replace(/\*\*(.*?)\*\*/g, '$1')}</p>

                                    {m.link && (
                                        <a
                                            href={m.link}
                                            className="mt-3 block w-full rounded-lg bg-[#4A3728] px-3 py-2 text-center text-xs font-medium text-white hover:bg-[#3A2B20] transition"
                                        >
                                            {m.linkText}
                                        </a>
                                    )}

                                    {m.hasConfirm && pendingOrder && m.id === pendingOrderMessageId && (
                                        <button
                                            type="button"
                                            onClick={handleConfirmOrder}
                                            disabled={confirming}
                                            className="mt-3 w-full rounded-lg bg-[#4A3728] px-3 py-2 text-xs font-medium text-white hover:bg-[#3A2B20] disabled:opacity-50"
                                        >
                                            {confirming ? 'Processing...' : 'Confirm'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="rounded-2xl border border-[#E3DCD2]/40 bg-[#F2EBE1] px-4 py-2.5 text-sm text-[#8E735B]">
                                    Thinking...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {error && (
                        <div className="px-4 py-1 text-xs text-red-600">{error}</div>
                    )}

                    <div className="border-t border-[#E3DCD2]/50 bg-[#FDFBF7] p-3">
                        <div className="flex gap-2">

                            <div className="relative flex-1 flex items-center">
                                {/* 👇 4. BOUND TO currentInput SO YOU CAN SEE LIVE TYPING */}
                                <input
                                    type="text"
                                    value={currentInput}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder={listening ? "Listening..." : "Type your request..."}
                                    className={`w-full rounded-xl border px-4 py-2.5 pr-10 text-sm outline-none transition-all ${listening
                                        ? 'border-red-400 bg-red-50 text-red-900 placeholder:text-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                        : 'border-[#E3DCD2]/70 bg-[#F2EBE1]/55 text-[#2C241E] placeholder:text-[#8E735B] focus:border-[#D35400]/40 focus:ring-1 focus:ring-[#D35400]/25'
                                        }`}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={handleMicClick}
                                    disabled={loading}
                                    className={`absolute right-1 p-1.5 rounded-lg flex items-center justify-center transition-all ${listening
                                        ? 'text-red-600 bg-red-100 animate-pulse'
                                        : 'text-[#8E735B] hover:bg-[#E3DCD2] hover:text-[#D35400]'
                                        }`}
                                    title="Click to speak"
                                >
                                    <span className="material-symbols-outlined text-[18px]">
                                        {listening ? 'mic' : 'mic_none'}
                                    </span>
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={handleSend}
                                disabled={loading || (!currentInput.trim() && !listening)}
                                className="rounded-xl bg-[#4A3728] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#3A2B20] disabled:opacity-50 disabled:cursor-not-allowed"
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
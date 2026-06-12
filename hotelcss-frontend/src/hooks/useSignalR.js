import { useEffect, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';

const HUB_URL = (import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.105:5237/api')
    .replace(/\/api\/?$/, '') + '/hubs/notifications';

/**
 * Connects to the SignalR NotificationHub and calls onOrderCompleted
 * whenever the backend emits "OrderCompleted" for this room.
 *
 * @param {boolean} enabled  - only connect when user is authenticated (role=Room)
 * @param {function} onOrderCompleted - ({ itemName, quantity, roomNumber }) => void
 */
const useSignalR = (enabled, onOrderCompleted) => {
    const connectionRef = useRef(null);
    const onOrderCompletedRef = useRef(onOrderCompleted);

    useEffect(() => {
        onOrderCompletedRef.current = onOrderCompleted;
    }, [onOrderCompleted]);

    useEffect(() => {
        if (!enabled) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(HUB_URL, {
                accessTokenFactory: () => localStorage.getItem('token') ?? '',
                skipNegotiation: false,
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        connection.on('OrderCompleted', (payload) => {
            onOrderCompletedRef.current?.(payload);
        });

        let isMounted = true;
        connection
            .start()
            .catch((err) => {
                if (isMounted) console.warn('SignalR connection failed:', err?.message);
            });

        connectionRef.current = connection;

        return () => {
            isMounted = false;
            connection.stop();
            connectionRef.current = null;
        };
    }, [enabled]);
};

export default useSignalR;

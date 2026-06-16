import { useEffect, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';

const HUB_URL = (import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.105:5237/api')
    .replace(/\/api\/?$/, '') + '/hubs/notifications';

/**
 * Connects to the SignalR NotificationHub.
 *
 * @param {boolean} enabled        - connect only when authenticated
 * @param {function} onOrderCompleted   - ({ itemName, quantity, roomNumber }) => void  (Room users)
 * @param {function} onNewRequest       - (message: string) => void  (Staff/Admin users)
 * @param {function} onRequestsUpdated  - () => void  (Staff/Admin dashboards — refresh live stats)
 * @param {function} onRequestStatusChanged - ({ requestId, status }) => void  (Room users — live request tracking)
 * @param {function} onOrderCancelled  - ({ itemName, quantity, roomNumber, reason }) => void  (Room users)
 */
const useSignalR = (enabled, onOrderCompleted, onNewRequest, onRequestsUpdated, onRequestStatusChanged, onOrderCancelled) => {
    const connectionRef = useRef(null);
    const onOrderCompletedRef = useRef(onOrderCompleted);
    const onNewRequestRef = useRef(onNewRequest);
    const onRequestsUpdatedRef = useRef(onRequestsUpdated);
    const onRequestStatusChangedRef = useRef(onRequestStatusChanged);
    const onOrderCancelledRef = useRef(onOrderCancelled);

    useEffect(() => { onOrderCompletedRef.current = onOrderCompleted; }, [onOrderCompleted]);
    useEffect(() => { onNewRequestRef.current = onNewRequest; }, [onNewRequest]);
    useEffect(() => { onRequestsUpdatedRef.current = onRequestsUpdated; }, [onRequestsUpdated]);
    useEffect(() => { onRequestStatusChangedRef.current = onRequestStatusChanged; }, [onRequestStatusChanged]);
    useEffect(() => { onOrderCancelledRef.current = onOrderCancelled; }, [onOrderCancelled]);

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

        connection.on('OrderCancelled', (payload) => {
            onOrderCancelledRef.current?.(payload);
        });

        connection.on('ReceiveMessage', (message) => {
            onNewRequestRef.current?.(message);
            onRequestsUpdatedRef.current?.();
        });

        connection.on('RequestsUpdated', () => {
            onRequestsUpdatedRef.current?.();
        });

        connection.on('RequestStatusChanged', (payload) => {
            onRequestStatusChangedRef.current?.(payload);
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

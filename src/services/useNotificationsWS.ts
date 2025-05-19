// hooks/useNotifications.ts
import { useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { Notification } from '@/types';

export const useNotificationsWS = (
  clinicId: string,
  onMessage: (notification: Notification) => void
) => {
  useEffect(() => {
    if (!clinicId) return;

    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log(`[WS] Connected to WebSocket`);
        client.subscribe(`/topic/clinic/${clinicId}`, (msg) => {
          const body = JSON.parse(msg.body);
          console.log('[WS] Received message:', body); // opțional, vezi notificările în consolă
          onMessage(body);
        });
      },
      onStompError: (frame) => {
        console.error('[WS] STOMP error:', frame);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
      console.log('[WS] WebSocket disconnected');
    };
  }, [clinicId, onMessage]);
};

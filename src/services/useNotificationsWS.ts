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
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/clinic/${clinicId}`, (msg) => {
          const body = JSON.parse(msg.body);
          onMessage(body);
        });
      }
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [clinicId, onMessage]);
};

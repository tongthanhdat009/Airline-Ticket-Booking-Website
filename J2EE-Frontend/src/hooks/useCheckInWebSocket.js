import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = 'http://localhost:8080/ws';

/**
 * Hook để lắng nghe sự kiện check-in real-time qua WebSocket
 * @param {Function} onCheckIn - Callback khi có hành khách check-in
 */
export const useCheckInWebSocket = (onCheckIn) => {
  const clientRef = useRef(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('WebSocket connected');
      
      // Subscribe to check-in updates
      client.subscribe('/topic/checkin-updates', (message) => {
        try {
          const event = JSON.parse(message.body);
          console.log('Check-in event received:', event);
          if (onCheckIn) {
            onCheckIn(event);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });
    };

    client.onDisconnect = () => {
      console.log('WebSocket disconnected');
    };

    client.onStompError = (frame) => {
      console.error('WebSocket error:', frame.headers['message']);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [onCheckIn]);

  return clientRef.current;
};

export default useCheckInWebSocket;

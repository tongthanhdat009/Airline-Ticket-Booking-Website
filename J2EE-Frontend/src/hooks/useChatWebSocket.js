import { useEffect, useRef, useState, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

// WebSocket URL
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "http://localhost:8080/ws";

/**
 * Hook kết nối WebSocket cho Customer live chat
 * @param {string} sessionId - Chat session ID
 * @param {Function} onMessage - Callback khi nhận tin nhắn mới
 * @param {Function} onStatusUpdate - Callback khi trạng thái thay đổi
 */
const useChatWebSocket = (sessionId, onMessage, onStatusUpdate) => {
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return;

    const socket = new SockJS(WS_BASE_URL);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      console.log("Chat WebSocket connected");
      setIsConnected(true);

      // Subscribe nhận tin nhắn + status update cho session này
      stompClient.subscribe(`/topic/chat/session/${sessionId}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          if (data.type === "STATUS_UPDATE") {
            // Status update từ admin hoặc scheduler
            if (onStatusUpdate) {
              onStatusUpdate(data);
            }
          } else {
            // Tin nhắn mới (từ admin hoặc system)
            if (onMessage) {
              onMessage(data);
            }
          }
        } catch (error) {
          console.error("Error parsing chat WebSocket message:", error);
        }
      });
    };

    stompClient.onStompError = (frame) => {
      console.error("Chat WebSocket error:", frame.headers["message"]);
      setIsConnected(false);
    };

    stompClient.onWebSocketClose = () => {
      console.log("Chat WebSocket disconnected");
      setIsConnected(false);
    };

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [sessionId]);

  return { isConnected };
};

export default useChatWebSocket;

import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getAdminAccessToken } from "../utils/cookieUtils";
import { WS_BASE_URL } from "../config/api.config";

/**
 * Hook kết nối WebSocket cho Admin live chat
 * @param {string} activeSessionId - Session đang xem chi tiết (nếu có)
 * @param {Function} onNewMessage - Callback khi nhận tin nhắn mới
 * @param {Function} onStatsUpdate - Callback khi thống kê thay đổi
 */
const useAdminChatWebSocket = (activeSessionId, onNewMessage, onStatsUpdate) => {
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef(null);
  const activeSessionRef = useRef(activeSessionId);
  const sessionSubscriptionRef = useRef(null);
  const onNewMessageRef = useRef(onNewMessage);
  const onStatsUpdateRef = useRef(onStatsUpdate);

  // Luôn cập nhật refs để tránh stale closure
  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  }, [onNewMessage]);

  useEffect(() => {
    onStatsUpdateRef.current = onStatsUpdate;
  }, [onStatsUpdate]);

  // Cập nhật ref khi activeSessionId thay đổi
  useEffect(() => {
    activeSessionRef.current = activeSessionId;

    // Unsubscribe session cũ và subscribe session mới
    if (stompClientRef.current && stompClientRef.current.connected) {
      // Unsubscribe cũ
      if (sessionSubscriptionRef.current) {
        sessionSubscriptionRef.current.unsubscribe();
        sessionSubscriptionRef.current = null;
      }

      // Subscribe session mới
      if (activeSessionId) {
        sessionSubscriptionRef.current = stompClientRef.current.subscribe(
          `/topic/chat/admin/session/${activeSessionId}`,
          (message) => {
            try {
              const data = JSON.parse(message.body);
              if (onNewMessageRef.current) {
                onNewMessageRef.current(data);
              }
            } catch (error) {
              console.error("Error parsing admin chat message:", error);
            }
          }
        );
      }
    }
  }, [activeSessionId]);

  useEffect(() => {
    const token = getAdminAccessToken();
    if (!token) {
      console.log("No admin token, skipping admin chat WebSocket");
      return;
    }

    const socket = new SockJS(WS_BASE_URL);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      console.log("Admin Chat WebSocket connected");
      setIsConnected(true);

      // Subscribe nhận cập nhật thống kê (sessions mới, status changes)
      stompClient.subscribe("/topic/chat/admin/updates", (message) => {
        try {
          const stats = JSON.parse(message.body);
          if (onStatsUpdateRef.current) {
            onStatsUpdateRef.current(stats);
          }
        } catch (error) {
          console.error("Error parsing admin stats:", error);
        }
      });

      // Subscribe session cụ thể nếu có
      if (activeSessionRef.current) {
        sessionSubscriptionRef.current = stompClient.subscribe(
          `/topic/chat/admin/session/${activeSessionRef.current}`,
          (message) => {
            try {
              const data = JSON.parse(message.body);
              if (onNewMessageRef.current) {
                onNewMessageRef.current(data);
              }
            } catch (error) {
              console.error("Error parsing admin chat message:", error);
            }
          }
        );
      }
    };

    stompClient.onStompError = (frame) => {
      console.error("Admin Chat WebSocket error:", frame.headers["message"]);
      setIsConnected(false);
    };

    stompClient.onWebSocketClose = () => {
      console.log("Admin Chat WebSocket disconnected");
      setIsConnected(false);
    };

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  return { isConnected };
};

export default useAdminChatWebSocket;

import { useEffect, useRef, useState, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getClientAccessToken, getAdminAccessToken } from "../utils/cookieUtils";

// Lấy WebSocket URL từ biến môi trường, fallback về localhost khi phát triển
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "http://localhost:8080/ws";

// Hàm để lấy access token từ cookie (thử client trước, sau đó admin)
const getAccessToken = () => {
  return getClientAccessToken() || getAdminAccessToken() || "";
};

const useWebSocket = () => {
  const [flightUpdates, setFlightUpdates] = useState([]);
  const [latestUpdate, setLatestUpdate] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef(null);

  useEffect(() => {
    // Lấy token để authenticate WebSocket connection
    const token = getAccessToken();

    // Không kết nối nếu không có token
    if (!token) {
      console.log("No access token found, skipping WebSocket connection");
      return;
    }

    // Tạo kết nối WebSocket với authentication headers
    const socket = new SockJS(WS_BASE_URL, null, {
      // Thêm token vào request headers cho SockJS
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = (frame) => {
      console.log("Connected to WebSocket:", frame);
      setIsConnected(true);

      // Subscribe để nhận cập nhật trạng thái chuyến bay
      stompClient.subscribe("/topic/flight-updates", (message) => {
        const update = JSON.parse(message.body);
        console.log("Received flight update:", update);

        // Thêm update vào state
        setFlightUpdates((prev) => [update, ...prev.slice(0, 9)]); // Giữ tối đa 10 updates gần nhất
        setLatestUpdate(update);
      });
    };

    stompClient.onStompError = (frame) => {
      console.error("Broker reported error:", frame.headers["message"]);
      console.error("Additional details:", frame.body);
      setIsConnected(false);
    };

    stompClient.onWebSocketClose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false);
    };

    stompClient.onWebSocketError = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    stompClient.activate();
    stompClientRef.current = stompClient;

    // Cleanup khi component unmount
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  const sendMessage = (destination, body) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      });
    }
  };

  const clearLatestUpdate = useCallback(() => {
    setLatestUpdate(null);
  }, []);

  return {
    flightUpdates,
    latestUpdate,
    isConnected,
    sendMessage,
    clearLatestUpdate,
  };
};

export default useWebSocket;

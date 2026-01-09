import { useEffect, useRef, useState, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

// Hàm để lấy access token từ localStorage
const getAccessToken = () => {
  return localStorage.getItem("accessToken") || "";
};

const useWebSocket = () => {
  const [flightUpdates, setFlightUpdates] = useState([]);
  const [latestUpdate, setLatestUpdate] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef(null);

  useEffect(() => {
    // Lấy token để authenticate WebSocket connection
    const token = getAccessToken();

    // Tạo kết nối WebSocket với authentication headers
    const socket = new SockJS("http://localhost:8080/ws");
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

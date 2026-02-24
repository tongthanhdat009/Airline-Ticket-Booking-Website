import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaComments, FaTimes } from 'react-icons/fa';
import ChatPreForm from './ChatPreForm';
import ChatWindow from './ChatWindow';
import useChatWebSocket from '../../hooks/useChatWebSocket';
import { startChat, sendMessage, getChatHistory, getSessionInfo } from '../../services/ChatService';

const STORAGE_KEY = 'live_chat_session';

/**
 * LiveChatWidget - Float button + chat widget cho khách hàng
 * Hiển thị ở góc phải dưới màn hình
 */
const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessionStatus, setSessionStatus] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const isOpenRef = useRef(isOpen);

  // Cập nhật ref khi isOpen thay đổi
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Callback khi nhận tin nhắn mới qua WebSocket
  const handleNewMessage = useCallback((data) => {
    setMessages(prev => [...prev, data]);
    // Tăng unread nếu chat đang đóng
    if (!isOpenRef.current) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // Callback khi trạng thái thay đổi
  const handleStatusUpdate = useCallback((data) => {
    setSessionStatus(data.status);
    if (data.status === 'RESOLVED' || data.status === 'CLOSED') {
      // Session đã đóng
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Kết nối WebSocket
  const { isConnected } = useChatWebSocket(sessionId, handleNewMessage, handleStatusUpdate);

  // Khôi phục session từ localStorage khi mount
  useEffect(() => {
    const savedSession = localStorage.getItem(STORAGE_KEY);
    if (savedSession) {
      try {
        const { sessionId: savedId, email } = JSON.parse(savedSession);
        if (savedId) {
          restoreSession(savedId);
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Khôi phục session
  const restoreSession = async (savedId) => {
    try {
      const response = await getSessionInfo(savedId);
      if (response.success && response.data) {
        const session = response.data;
        if (session.trangThai !== 'RESOLVED' && session.trangThai !== 'CLOSED') {
          setSessionId(savedId);
          setSessionStatus(session.trangThai);
          // Load lịch sử chat
          const historyRes = await getChatHistory(savedId);
          if (historyRes.success) {
            setMessages(historyRes.data || []);
          }
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (e) {
      console.error('Lỗi khôi phục session:', e);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Bắt đầu chat
  const handleStartChat = async (formData) => {
    setLoading(true);
    try {
      const response = await startChat(formData);
      if (response.success && response.data) {
        const { sessionId: newId, status } = response.data;
        setSessionId(newId);
        setSessionStatus(status);

        // Lưu vào localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          sessionId: newId,
          email: formData.email,
        }));

        // Load lịch sử (trường hợp reopen)
        const historyRes = await getChatHistory(newId);
        if (historyRes.success) {
          setMessages(historyRes.data || []);
        }
      }
    } catch (error) {
      console.error('Lỗi bắt đầu chat:', error);
      alert(error.response?.data?.message || 'Không thể bắt đầu phiên chat');
    } finally {
      setLoading(false);
    }
  };

  // Gửi tin nhắn
  const handleSendMessage = async (noiDung) => {
    if (!sessionId) return;
    setSending(true);
    try {
      const response = await sendMessage({ sessionId, noiDung });
      if (response.success && response.data) {
        setMessages(prev => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error);
    } finally {
      setSending(false);
    }
  };

  // Toggle mở/đóng widget
  const toggleChat = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  // Đóng widget
  const closeWidget = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Chat Widget Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-96 h-[500px] sm:h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <FaComments className="w-5 h-5" />
              <div>
                <h3 className="font-semibold text-sm">Hỗ trợ trực tuyến</h3>
                <p className="text-xs text-blue-100">
                  {isConnected ? 'Đang kết nối' : 'Đang kết nối...'}
                </p>
              </div>
            </div>
            <button
              onClick={closeWidget}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {!sessionId ? (
              <ChatPreForm onSubmit={handleStartChat} loading={loading} />
            ) : (
              <ChatWindow
                messages={messages}
                onSendMessage={handleSendMessage}
                status={sessionStatus}
                sending={sending}
              />
            )}
          </div>
        </div>
      )}

      {/* Float Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center"
        aria-label="Mở chat hỗ trợ"
      >
        {isOpen ? (
          <FaTimes className="w-6 h-6 sm:w-7 sm:h-7" />
        ) : (
          <FaComments className="w-6 h-6 sm:w-7 sm:h-7" />
        )}

        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </>
  );
};

export default LiveChatWidget;

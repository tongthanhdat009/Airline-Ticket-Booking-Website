import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FaComments,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSyncAlt,
} from 'react-icons/fa';
import ChatSessionList from '../../components/QuanLy/ChatSessionList';
import ChatDetail from '../../components/QuanLy/ChatDetail';
import useAdminChatWebSocket from '../../hooks/useAdminChatWebSocket';
import * as QLChatService from '../../services/QLChatService';
import Toast from '../../components/common/Toast';

const QuanLyChat = () => {
  // State
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ waitingCount: 0, activeCount: 0, idleCount: 0 });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  const activeSessionRef = useRef(null);

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  // Load danh sách sessions
  const fetchSessions = useCallback(async () => {
    try {
      const res = await QLChatService.getChatSessions();
      if (res.success) {
        setSessions(res.data || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  }, []);

  // Load thống kê
  const fetchStats = useCallback(async () => {
    try {
      const res = await QLChatService.getChatStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  // Load lịch sử chat
  const fetchMessages = useCallback(async (sessionId) => {
    if (!sessionId) return;
    try {
      const res = await QLChatService.getChatHistory(sessionId);
      if (res.success) {
        setMessages(res.data || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  // WebSocket callbacks
  const handleNewMessage = useCallback((data) => {
    // Tin nhắn mới cho session đang xem
    if (data.sessionId === activeSessionRef.current?.sessionId) {
      setMessages(prev => [...prev, data]);
    }
    // Refresh session list
    fetchSessions();
  }, [fetchSessions]);

  const handleStatsUpdate = useCallback((newStats) => {
    setStats(newStats);
    // Refresh sessions khi có thay đổi
    fetchSessions();
  }, [fetchSessions]);

  // WebSocket connection
  const { isConnected } = useAdminChatWebSocket(
    activeSession?.sessionId,
    handleNewMessage,
    handleStatsUpdate
  );

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSessions(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, [fetchSessions, fetchStats]);

  // Khi chọn session
  const handleSelectSession = useCallback((session) => {
    setActiveSession(session);
    activeSessionRef.current = session;
    fetchMessages(session.sessionId);
  }, [fetchMessages]);

  // Admin nhận chat
  const handleAssign = useCallback(async () => {
    if (!activeSession) return;
    try {
      const res = await QLChatService.assignChat(activeSession.sessionId);
      if (res.success) {
        showToast('Đã nhận chat thành công');
        // Refresh
        fetchSessions();
        fetchStats();
        fetchMessages(activeSession.sessionId);
        // Update active session status
        setActiveSession(prev => prev ? { ...prev, trangThai: 'IN_PROGRESS' } : null);
      } else {
        showToast(res.message || 'Không thể nhận chat', 'error');
      }
    } catch (error) {
      showToast('Lỗi khi nhận chat', 'error');
    }
  }, [activeSession, fetchSessions, fetchStats, fetchMessages]);

  // Admin gửi tin nhắn
  const handleSendMessage = useCallback(async (text) => {
    if (!activeSession || !text.trim()) return;
    setSending(true);
    try {
      const res = await QLChatService.sendAdminMessage({
        sessionId: activeSession.sessionId,
        noiDung: text.trim(),
      });
      if (res.success) {
        // Message sẽ được thêm qua WebSocket
        // Nhưng fallback thêm vào local nếu WebSocket chậm
        if (!isConnected) {
          setMessages(prev => [...prev, res.data]);
        }
      } else {
        showToast(res.message || 'Không thể gửi tin nhắn', 'error');
      }
    } catch (error) {
      showToast('Lỗi khi gửi tin nhắn', 'error');
    } finally {
      setSending(false);
    }
  }, [activeSession, isConnected]);

  // Admin đóng chat
  const handleCloseChat = useCallback(async () => {
    if (!activeSession) return;
    try {
      const res = await QLChatService.closeChat(activeSession.sessionId);
      if (res.success) {
        showToast('Đã đóng phiên chat');
        fetchSessions();
        fetchStats();
        setActiveSession(prev => prev ? { ...prev, trangThai: 'RESOLVED' } : null);
      } else {
        showToast(res.message || 'Không thể đóng chat', 'error');
      }
    } catch (error) {
      showToast('Lỗi khi đóng chat', 'error');
    }
  }, [activeSession, fetchSessions, fetchStats]);

  // Refresh manual
  const handleRefresh = async () => {
    await Promise.all([fetchSessions(), fetchStats()]);
    if (activeSession) {
      fetchMessages(activeSession.sessionId);
    }
    showToast('Đã cập nhật dữ liệu');
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-gray-50">
      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />

      {/* Header + Stats */}
      <div className="px-4 md:px-6 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FaComments className="w-6 h-6 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-800">Quản lý Chat trực tuyến</h1>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              {isConnected ? 'Đang kết nối' : 'Mất kết nối'}
            </span>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FaSyncAlt className="w-4 h-4" />
            Làm mới
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 rounded-lg border border-yellow-100">
            <FaClock className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-xs text-yellow-600 font-medium">Chờ tiếp nhận</p>
              <p className="text-lg font-bold text-yellow-700">{stats.waitingCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-100">
            <FaComments className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xs text-green-600 font-medium">Đang xử lý</p>
              <p className="text-lg font-bold text-green-700">{stats.activeCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg border border-orange-100">
            <FaExclamationTriangle className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-xs text-orange-600 font-medium">Chờ phản hồi</p>
              <p className="text-lg font-bold text-orange-700">{stats.idleCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content: 2-column layout */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin w-8 h-8 text-blue-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Session list */}
          <div className="w-80 lg:w-96 border-r border-gray-200 bg-white flex-shrink-0">
            <ChatSessionList
              sessions={sessions}
              activeSessionId={activeSession?.sessionId}
              onSelectSession={handleSelectSession}
              filter={filter}
              onFilterChange={setFilter}
            />
          </div>

          {/* Right: Chat detail */}
          <div className="flex-1 bg-white">
            <ChatDetail
              session={activeSession}
              messages={messages}
              onSendMessage={handleSendMessage}
              onAssign={handleAssign}
              onClose={handleCloseChat}
              sending={sending}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuanLyChat;

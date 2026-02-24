import React from 'react';
import { FaClock, FaUser, FaCommentDots } from 'react-icons/fa';

/**
 * Danh sách sessions cho admin
 * @param {Array} sessions - Danh sách sessions
 * @param {string} activeSessionId - Session đang chọn
 * @param {Function} onSelectSession - Callback chọn session
 * @param {string} filter - Filter trạng thái hiện tại
 * @param {Function} onFilterChange - Callback thay đổi filter
 */
const ChatSessionList = ({ sessions = [], activeSessionId, onSelectSession, filter, onFilterChange }) => {

  const statusFilters = [
    { value: 'all', label: 'Tất cả' },
    { value: 'WAITING_FOR_ADMIN', label: 'Chờ tiếp nhận' },
    { value: 'IN_PROGRESS', label: 'Đang xử lý' },
    { value: 'IDLE', label: 'Chờ phản hồi' },
    { value: 'RESOLVED', label: 'Đã giải quyết' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'WAITING_FOR_ADMIN':
        return { text: 'Chờ tiếp nhận', bg: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' };
      case 'IN_PROGRESS':
        return { text: 'Đang xử lý', bg: 'bg-green-100 text-green-700', dot: 'bg-green-500' };
      case 'WAITING_FOR_USER':
        return { text: 'Đã trả lời', bg: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' };
      case 'IDLE':
        return { text: 'Chờ phản hồi', bg: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' };
      case 'RESOLVED':
        return { text: 'Đã giải quyết', bg: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
      case 'CLOSED':
        return { text: 'Đã đóng', bg: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' };
      default:
        return { text: status, bg: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút`;
    if (diff < 86400000) return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const filteredSessions = filter === 'all' 
    ? sessions 
    : sessions.filter(s => s.trangThai === filter);

  return (
    <div className="h-full flex flex-col">
      {/* Filter tabs */}
      <div className="p-3 border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-1.5 min-w-max">
          {statusFilters.map(f => (
            <button
              key={f.value}
              onClick={() => onFilterChange(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                filter === f.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
              {f.value !== 'all' && (
                <span className="ml-1">
                  ({sessions.filter(s => s.trangThai === f.value).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto">
        {filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
            <FaCommentDots className="w-12 h-12 mb-2" />
            <p className="text-sm">Không có phiên chat nào</p>
          </div>
        ) : (
          filteredSessions.map(session => {
            const badge = getStatusBadge(session.trangThai);
            const isActive = activeSessionId === session.sessionId;

            return (
              <button
                key={session.sessionId}
                onClick={() => onSelectSession(session)}
                className={`w-full px-4 py-3 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  isActive ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-800 truncate">
                        {session.hoTen}
                      </span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${badge.bg}`}>
                        <span className={`w-1 h-1 rounded-full ${badge.dot} mr-1`} />
                        {badge.text}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{session.email}</p>
                    {session.lastMessage && (
                      <p className="text-xs text-gray-400 mt-1 truncate">{session.lastMessage}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end ml-2 flex-shrink-0">
                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                      <FaClock className="w-3 h-3" />
                      {formatTime(session.lastMessageAt)}
                    </span>
                    {session.messageCount > 0 && (
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        {session.messageCount} tin nhắn
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSessionList;

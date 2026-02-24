import React, { useState, useRef, useEffect } from 'react';
import { 
  FaPaperPlane, 
  FaUserCircle, 
  FaEnvelope, 
  FaPhone,
  FaTimesCircle,
  FaSyncAlt 
} from 'react-icons/fa';

/**
 * Chi tiết chat cho admin - hiển thị tin nhắn + thông tin KH + input reply
 * @param {Object} session - Thông tin session
 * @param {Array} messages - Danh sách tin nhắn
 * @param {Function} onSendMessage - Callback gửi tin nhắn
 * @param {Function} onAssign - Callback nhận chat
 * @param {Function} onClose - Callback đóng chat
 * @param {boolean} sending - Đang gửi tin nhắn
 */
const ChatDetail = ({ session, messages = [], onSendMessage, onAssign, onClose, sending }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || sending) return;
    onSendMessage(text);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit' 
    });
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-sm font-medium">Chọn một phiên chat để xem</p>
        <p className="text-xs mt-1">Chọn phiên chat từ danh sách bên trái</p>
      </div>
    );
  }

  const isClosed = session.trangThai === 'RESOLVED' || session.trangThai === 'CLOSED';
  const needsAssignment = session.trangThai === 'WAITING_FOR_ADMIN';

  return (
    <div className="flex flex-col h-full">
      {/* Header - Thông tin khách hàng */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FaUserCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-800">{session.hoTen}</h3>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <FaEnvelope className="w-3 h-3" /> {session.email}
                </span>
                <span className="flex items-center gap-1">
                  <FaPhone className="w-3 h-3" /> {session.soDienThoai}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {needsAssignment && (
              <button
                onClick={onAssign}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
              >
                <FaSyncAlt className="w-3.5 h-3.5" />
                Nhận chat
              </button>
            )}
            {!isClosed && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
              >
                <FaTimesCircle className="w-3.5 h-3.5" />
                Đóng chat
              </button>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
          <span>Tạo: {formatDate(session.ngayTao)}</span>
          {session.adminName && <span>Admin: {session.adminName}</span>}
          {session.reopenCount > 0 && <span>Mở lại: {session.reopenCount} lần</span>}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
        {messages.map((msg, index) => {
          // System message
          if (msg.nguoiGui === 'system' || msg.messageType === 'SYSTEM') {
            return (
              <div key={msg.maMessage || index} className="flex justify-center">
                <div className="bg-gray-200 text-gray-500 text-xs px-3 py-1.5 rounded-full max-w-[85%] text-center">
                  {msg.noiDung}
                </div>
              </div>
            );
          }

          const isAdmin = msg.nguoiGui === 'admin';

          return (
            <div key={msg.maMessage || index} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%]`}>
                {!isAdmin && (
                  <p className="text-xs text-gray-400 mb-0.5 ml-1">{session.hoTen}</p>
                )}
                {isAdmin && msg.adminName && (
                  <p className="text-xs text-gray-400 mb-0.5 mr-1 text-right">{msg.adminName}</p>
                )}
                <div
                  className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                    isAdmin
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
                  }`}
                >
                  {msg.noiDung}
                </div>
                <p className={`text-[10px] text-gray-400 mt-0.5 ${isAdmin ? 'text-right mr-1' : 'ml-1'}`}>
                  {formatTime(msg.ngayGui)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {isClosed ? (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-center">
          <p className="text-sm text-gray-500">Phiên chat đã kết thúc</p>
        </div>
      ) : (
        <div className="px-4 py-3 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={needsAssignment ? "Nhận chat trước khi trả lời..." : "Nhập tin nhắn trả lời..."}
              rows={1}
              disabled={needsAssignment}
              className="flex-1 resize-none px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm max-h-20 overflow-y-auto disabled:bg-gray-50 disabled:cursor-not-allowed"
              style={{ minHeight: '38px' }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || sending || needsAssignment}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              {sending ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <FaPaperPlane className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatDetail;

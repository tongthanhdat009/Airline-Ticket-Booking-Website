import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

/**
 * Hiển thị cửa sổ chat: danh sách tin nhắn + input gửi tin
 * @param {Array} messages - Danh sách tin nhắn [{ maMessage, noiDung, nguoiGui, adminName, messageType, ngayGui }]
 * @param {Function} onSendMessage - Callback khi gửi tin nhắn (noiDung)
 * @param {string} status - Trạng thái session
 * @param {boolean} sending - Đang gửi tin nhắn
 */
const ChatWindow = ({ messages = [], onSendMessage, status, sending }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input khi mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

  const isClosed = status === 'RESOLVED' || status === 'CLOSED';

  // Hiển thị trạng thái
  const getStatusDisplay = () => {
    switch (status) {
      case 'WAITING_FOR_ADMIN':
        return { text: 'Đang chờ nhân viên hỗ trợ...', color: 'bg-yellow-100 text-yellow-700' };
      case 'IN_PROGRESS':
        return { text: 'Đang hỗ trợ', color: 'bg-green-100 text-green-700' };
      case 'WAITING_FOR_USER':
        return { text: 'Đã trả lời', color: 'bg-blue-100 text-blue-700' };
      case 'IDLE':
        return { text: 'Đang chờ phản hồi', color: 'bg-orange-100 text-orange-700' };
      case 'RESOLVED':
        return { text: 'Đã giải quyết', color: 'bg-gray-100 text-gray-600' };
      case 'CLOSED':
        return { text: 'Đã đóng', color: 'bg-gray-100 text-gray-600' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-600' };
    }
  };

  const statusDisplay = getStatusDisplay();

  // Format thời gian
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Status bar */}
      <div className="px-4 py-2 border-b border-gray-100">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}>
          {status === 'WAITING_FOR_ADMIN' && (
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5 animate-pulse" />
          )}
          {status === 'IN_PROGRESS' && (
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5" />
          )}
          {statusDisplay.text}
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, index) => {
          // System message
          if (msg.nguoiGui === 'system' || msg.messageType === 'SYSTEM') {
            return (
              <div key={msg.maMessage || index} className="flex justify-center">
                <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1.5 rounded-full max-w-[85%] text-center">
                  {msg.noiDung}
                </div>
              </div>
            );
          }

          const isCustomer = msg.nguoiGui === 'customer';

          return (
            <div key={msg.maMessage || index} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${isCustomer ? 'order-2' : 'order-1'}`}>
                {/* Admin name label */}
                {!isCustomer && msg.adminName && (
                  <p className="text-xs text-gray-400 mb-0.5 ml-1">{msg.adminName}</p>
                )}
                <div
                  className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                    isCustomer
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}
                >
                  {msg.noiDung}
                </div>
                <p className={`text-[10px] text-gray-400 mt-0.5 ${isCustomer ? 'text-right mr-1' : 'ml-1'}`}>
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
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-center">
          <p className="text-sm text-gray-500">Phiên chat đã kết thúc</p>
        </div>
      ) : (
        <div className="px-3 py-2 border-t border-gray-100 bg-white">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn..."
              rows={1}
              className="flex-1 resize-none px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm max-h-20 overflow-y-auto"
              style={{ minHeight: '38px' }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || sending}
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

export default ChatWindow;

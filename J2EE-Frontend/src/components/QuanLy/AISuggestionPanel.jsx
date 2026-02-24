import { useState, useEffect, useCallback } from 'react';
import { FaRobot, FaSync } from 'react-icons/fa';
import { getAISuggestions } from '../../services/AIChatService';

/**
 * AI Suggestion Panel - Hiển thị gợi ý từ AI cho admin
 * Chỉ hiển thị khi tin nhắn cuối là từ customer
 *
 * @param {string} sessionId - ID phiên chat
 * @param {Array} messages - Danh sách tin nhắn
 * @param {Function} onSelect - Callback khi admin chọn gợi ý
 * @param {string} lastMessageType - 'customer' | 'admin' | 'system'
 */
const AISuggestionPanel = ({ sessionId, messages, onSelect, lastMessageType }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSuggestions = useCallback(async () => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await getAISuggestions(sessionId);
      if (res.success && res.data?.suggestions?.length > 0) {
        setSuggestions(res.data.suggestions);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      setError('Không thể tạo gợi ý');
      console.error('AI suggestion error:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Tự động gọi AI khi có tin nhắn mới từ customer
  useEffect(() => {
    // Chỉ trigger khi tin nhắn cuối là từ customer
    if (!sessionId || lastMessageType !== 'customer') {
      setSuggestions([]);
      return;
    }

    // Debounce: Đợi 500ms
    const timer = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timer);
  }, [sessionId, lastMessageType, messages.length, fetchSuggestions]);

  // Không hiển thị nếu không phải tin nhắn từ customer
  if (lastMessageType !== 'customer') return null;

  return (
    <div className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex-shrink-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
          <FaRobot className="w-4 h-4" />
          <span>Gợi ý từ AI</span>
          {loading && (
            <span className="text-xs text-blue-500 animate-pulse">
              (đang phân tích...)
            </span>
          )}
        </div>
        <button
          onClick={fetchSuggestions}
          disabled={loading}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors"
        >
          <FaSync className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Tạo lại
        </button>
      </div>

      {loading ? (
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-1 h-10 bg-blue-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : suggestions.length > 0 ? (
        <div className="space-y-2">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(suggestion)}
              className="w-full text-left p-2.5 bg-white rounded-lg border border-blue-200
                         hover:border-blue-400 hover:shadow-sm transition-all text-sm
                         active:bg-blue-50"
            >
              <span className="font-medium text-blue-600 mr-2">{idx + 1}.</span>
              <span className="text-gray-700">{suggestion}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">Không có gợi ý</p>
      )}
    </div>
  );
};

export default AISuggestionPanel;

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FaTimes, FaPaperPlane, FaTrash, FaHeadset } from 'react-icons/fa';
import { sendAdvisorMessageStream } from '../../services/AdvisorChatService';

const STORAGE_KEY = 'advisor_chat_history';
const MAX_HISTORY_TURNS = 10;

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: 'Xin chào! Tôi là trợ lý AI của JadT Airline. Bạn cần hỗ trợ gì về đặt vé, hành lý, check-in hay khuyến mãi?',
};

const QUICK_QUESTIONS = [
  'Cách đặt vé máy bay?',
  'Hành lý được mang bao nhiêu kg?',
  'Cách check-in online?',
  'Chính sách hoàn/hủy vé?',
];

/**
 * Style các thẻ markdown trong bong bóng chat (react-markdown không render
 * HTML thô nên an toàn XSS; chỉ hỗ trợ markdown chuẩn + GFM tables).
 */
const markdownComponents = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-slate-800">{children}</strong>,
  ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => <p className="font-bold text-[15px] mb-1.5">{children}</p>,
  h2: ({ children }) => <p className="font-bold text-sm mb-1.5">{children}</p>,
  h3: ({ children }) => <p className="font-bold text-sm mb-1">{children}</p>,
  h4: ({ children }) => <p className="font-bold text-sm mb-1">{children}</p>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-blue-300 pl-2.5 text-slate-600 italic mb-2">{children}</blockquote>
  ),
  pre: ({ children }) => (
    <pre className="bg-slate-900 text-slate-100 rounded-xl p-3 overflow-x-auto text-xs mb-2">{children}</pre>
  ),
  code: ({ children, className }) =>
    className ? (
      <code className="bg-transparent p-0 font-mono">{children}</code>
    ) : (
      <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md text-[13px] font-mono">{children}</code>
    ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-2">
      <table className="min-w-full text-[13px] border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-slate-200 bg-slate-50 px-2 py-1 text-left font-semibold">{children}</th>
  ),
  td: ({ children }) => <td className="border border-slate-200 px-2 py-1">{children}</td>,
};

/**
 * AdvisorChatWidget - Khung chat tư vấn với LLM (backend proxy tới 9router).
 * Nút float góc phải dưới, mở panel chat, không cần đăng nhập hay nhập thông tin.
 */
const AdvisorChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [sending, setSending] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Khôi phục lịch sử từ localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed.slice(-MAX_HISTORY_TURNS));
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Lưu lịch sử (bỏ qua khi chỉ còn tin chào)
  useEffect(() => {
    try {
      if (messages.length === 1 && messages[0] === WELCOME_MESSAGE) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_HISTORY_TURNS)));
    } catch {
      // Bỏ qua lỗi quota localStorage
    }
  }, [messages]);

  // Auto-scroll + focus input khi mở panel
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const doSend = async (text) => {
    const content = text.trim();
    if (!content || sending) return;
    setInputValue('');
    setError(null);

    const userMsg = { role: 'user', content };
    const history = messages
      .filter((m) => m !== WELCOME_MESSAGE)
      .slice(-MAX_HISTORY_TURNS)
      .map((m) => ({ role: m.role, content: m.content }));
    // Thêm chỗ trống cho câu trả lời, token stream sẽ điền dần vào đây
    setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: '' }]);
    setSending(true);

    try {
      let acc = '';
      await sendAdvisorMessageStream(
        { message: content, history },
        {
          onToken: (token) => {
            acc += token;
            const snapshot = acc;
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = { role: 'assistant', content: snapshot };
              return next;
            });
          },
        },
      );
      if (!acc.trim()) throw new Error('empty');
    } catch (e) {
      console.error('Lỗi chat tư vấn:', e);
      // Gỡ bubble trống, báo lỗi gọn
      setMessages((prev) => prev.slice(0, -1));
      setError(e.message || 'Không thể kết nối tới trợ lý AI. Vui lòng thử lại sau.');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doSend(inputValue);
    }
  };

  const handleClear = () => {
    setMessages([WELCOME_MESSAGE]);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const showQuickQuestions = messages.length <= 1 && !sending;

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[400px] h-[540px] max-h-[78vh] bg-white rounded-3xl shadow-[0_20px_60px_rgba(30,64,175,0.25)] border border-blue-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 text-white px-5 py-4 flex-shrink-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-xl" />
            <div className="absolute -bottom-12 -left-8 w-28 h-28 bg-cyan-300/20 rounded-full blur-xl" />
            <div className="relative flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center flex-shrink-0">
                <FaHeadset className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[15px] leading-tight">Trợ lý đặt vé AI</h3>
                <p className="text-xs text-blue-100 flex items-center gap-1.5">
                  <span className="relative flex w-2 h-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300" />
                  </span>
                  {sending ? 'Đang trả lời...' : 'Trực tuyến · JadT Airline'}
                </p>
              </div>
              <button
                onClick={handleClear}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                title="Xóa lịch sử chat"
              >
                <FaTrash className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                title="Đóng chat"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-blue-50/60 to-white">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              if (isUser) {
                return (
                  <div key={index} className="flex justify-end">
                    <div className="max-w-[82%] px-4 py-2.5 rounded-2xl rounded-br-md text-sm leading-relaxed bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md shadow-blue-200 whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                );
              }
              return (
                <div key={index} className="flex justify-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaHeadset className="w-3 h-3 text-white" />
                  </div>
                  <div className="max-w-[82%] px-4 py-2.5 rounded-2xl rounded-bl-md text-sm leading-relaxed bg-white text-slate-700 shadow-sm border border-slate-100">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {msg.content}
                    </ReactMarkdown>
                    {sending && index === messages.length - 1 && (
                      <span className="inline-block w-2 h-4 bg-blue-500 rounded-sm animate-pulse ml-0.5 align-middle" />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Gợi ý câu hỏi nhanh */}
            {showQuickQuestions && (
              <div className="flex flex-wrap gap-2 pl-9">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => doSend(q)}
                    disabled={sending}
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors disabled:opacity-40"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {sending && !messages[messages.length - 1]?.content && (
              <div className="flex justify-start gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <FaHeadset className="w-3 h-3 text-white" />
                </div>
                <div className="bg-white border border-slate-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-md flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-center">
                <div className="bg-red-50 text-red-600 text-xs px-3 py-1.5 rounded-full max-w-[90%] text-center border border-red-100">
                  {error}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 pt-2 pb-3 border-t border-slate-100 bg-white flex-shrink-0">
            <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi về vé, hành lý, check-in..."
                rows={1}
                maxLength={2000}
                className="flex-1 resize-none bg-transparent px-2.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none max-h-20 overflow-y-auto"
                style={{ minHeight: '36px' }}
              />
              <button
                onClick={() => doSend(inputValue)}
                disabled={!inputValue.trim() || sending}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-md shadow-blue-200"
                title="Gửi tin nhắn"
              >
                {sending ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <FaPaperPlane className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 px-1 text-center">
              Trợ lý AI chỉ tư vấn trong phạm vi dịch vụ hàng không
            </p>
          </div>
        </div>
      )}

      {/* Nút float */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="group fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 hover:from-blue-800 hover:to-cyan-600 text-white rounded-full shadow-[0_10px_30px_rgba(37,99,235,0.45)] hover:shadow-[0_14px_36px_rgba(37,99,235,0.55)] hover:scale-105 transition-all duration-200 pl-4 pr-4 sm:pl-5 sm:pr-6 py-3 sm:py-3.5"
        aria-label="Mở chat tư vấn AI"
      >
        {isOpen ? (
          <FaTimes className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <>
            <span className="relative">
              <FaHeadset className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-blue-600" />
            </span>
            <span className="text-sm font-semibold whitespace-nowrap">Hỏi đáp AI</span>
          </>
        )}
      </button>
    </>
  );
};

export default AdvisorChatWidget;

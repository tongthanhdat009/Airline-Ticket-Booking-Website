import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      type: 'bot', 
      text: '👋 Xin chào! Tôi là trợ lý ảo SGU Airline. Tôi có thể giúp bạn:\n\n✈️ Tìm kiếm chuyến bay\n💰 Xem giá vé\n📅 Kiểm tra lịch bay\n📋 Tư vấn chọn chuyến bay phù hợp\n\nBạn muốn hỏi về chuyến bay nào?' 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Thêm tin nhắn người dùng
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Gọi API chat với AI
      const response = await axios.post('http://localhost:8080/api/ai/chat', {
        message: userMessage,
        temperature: 0.7,
        maxTokens: 4096
      });

      // Thêm phản hồi từ bot
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: response.data.response 
      }]);
    } catch (error) {
      console.error('Error calling AI:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: '😔 Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau hoặc liên hệ hotline: 1900 1886 để được hỗ trợ.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "Có chuyến bay nào sắp tới không?",
    "Cho tôi xem giá vé từ Hà Nội đi TP.HCM",
    "Chuyến bay từ Đà Nẵng đi Hà Nội",
    "Tôi muốn tìm chuyến bay giá rẻ"
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white rounded-3xl shadow-2xl w-[450px] h-[650px] flex flex-col overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 via-red-700 to-pink-600 text-white px-6 py-5 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden ring-4 ring-white/30">
                  <img 
                    src="/chatbot/logo-vj.png" 
                    alt="SGU Airline AI" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg">SGU AI Assistant</h3>
                <p className="text-sm opacity-95 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Đang hoạt động
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-all hover:rotate-90 duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-br from-gray-50 to-gray-100">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div className={`flex gap-2 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {msg.type === 'bot' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <img src="/chatbot/logo-vj.png" alt="Bot" className="w-5 h-5" />
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-md whitespace-pre-line ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-md">
                    <img src="/chatbot/logo-vj.png" alt="Bot" className="w-5 h-5" />
                  </div>
                  <div className="bg-white px-5 py-3 rounded-2xl rounded-bl-sm shadow-md border border-gray-200">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-5 py-3 bg-white border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2 font-semibold">💡 Gợi ý câu hỏi:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="px-3 py-1.5 text-xs bg-gradient-to-r from-red-50 to-pink-50 text-red-700 rounded-full hover:from-red-100 hover:to-pink-100 transition-all border border-red-200 hover:shadow-md"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200 shadow-lg">
            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi của bạn..."
                disabled={isLoading}
                rows="1"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-all text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by SGU AI • Luôn sẵn sàng hỗ trợ 24/7
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative w-16 h-16 bg-gradient-to-br from-red-600 via-red-700 to-pink-600 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center overflow-hidden animate-bounce hover:animate-none"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <img 
            src="/chatbot/logo-vj.png" 
            alt="Chat AI" 
            className="w-10 h-10 object-contain relative z-10" 
          />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
        </button>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;

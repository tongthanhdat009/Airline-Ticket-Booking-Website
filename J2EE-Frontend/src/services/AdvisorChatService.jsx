import apiClient from "./apiClient";

const ADVISOR_API_BASE = "/advisor";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

/**
 * Gửi tin nhắn tới trợ lý tư vấn AI (backend proxy tới 9router,
 * chuẩn OpenAI-compatible). Không cần đăng nhập.
 * @param {Object} data - { message: string, history: [{ role: 'user'|'assistant', content: string }] }
 */
export const sendAdvisorMessage = async (data) => {
  const response = await apiClient.post(`${ADVISOR_API_BASE}/chat`, data, {
    timeout: 60000,
  });
  return response.data;
};

/**
 * Gửi tin nhắn và nhận từng token qua SSE (stream).
 * Mỗi SSE event là một token đã JSON-encode. Gọi onToken(token) khi có token mới.
 * Ném lỗi nếu request thất bại hoặc stream rỗng.
 */
export const sendAdvisorMessageStream = async (data, { onToken, signal } = {}) => {
  const response = await fetch(`${API_BASE_URL}${ADVISOR_API_BASE}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    signal,
  });
  if (!response.ok || !response.body) {
    throw new Error(`Trợ lý AI tạm thời không khả dụng (HTTP ${response.status}). Vui lòng thử lại sau.`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sep;
    while ((sep = buffer.indexOf("\n\n")) >= 0) {
      const eventText = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      const match = eventText.match(/^data:(.*)$/m);
      if (!match) continue;
      const payload = match[1].trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const token = JSON.parse(payload);
        if (typeof token === "string" && token) {
          received += 1;
          onToken?.(token);
        }
      } catch {
        // Bỏ qua chunk không parse được, chờ chunk tiếp theo
      }
    }
  }
  if (received === 0) {
    throw new Error("Trợ lý AI chưa trả lời. Vui lòng thử lại.");
  }
};

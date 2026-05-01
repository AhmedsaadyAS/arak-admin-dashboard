import { useEffect, useRef, useState } from "react";
import { api } from "../../services/api";

interface Message {
  id: number;
  role: "user" | "bot";
  text: string;
  timestamp: string;
  confidence?: number;
}

interface ChatResponse {
  reply: string;
  intent: string;
  confidence: number;
  entities: Record<string, unknown>;
}

const getCurrentTime = (): string =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 1,
      role: "bot",
      text: "أهلاً! أنا مساعد Arak. كيف يمكنني مساعدتك؟",
      timestamp: getCurrentTime(),
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text: trimmed,
      timestamp: getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInput("");

    try {
      const data = await api.askChatbot(trimmed);

      const botMessage: Message = {
        id: Date.now() + 1,
        role: "bot",
        text: data.reply,
        timestamp: getCurrentTime(),
        confidence: data.confidence,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: "bot",
        text: "حدث خطأ، حاول مرة أخرى",
        timestamp: getCurrentTime(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
      >
        💬
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[500px] w-80 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
            <span>Arak Assistant</span>
            <button type="button" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
            {messages.map((message) =>
              message.role === "user" ? (
                <div key={message.id} className="max-w-[75%] self-end rounded-2xl rounded-tr-sm bg-blue-500 px-4 py-2 text-white">
                  <p className="text-sm">{message.text}</p>
                  <p className="text-right text-xs opacity-70">{message.timestamp}</p>
                </div>
              ) : (
                <div key={message.id} className="max-w-[75%] self-start rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-2 text-gray-800">
                  <p className={`text-sm ${typeof message.confidence === "number" && message.confidence < 0.75 ? "text-orange-500" : ""}`}>
                    {message.text}
                  </p>
                  {typeof message.confidence === "number" && message.confidence < 0.75 && (
                    <p className="text-xs text-orange-400">غير متأكد من الإجابة</p>
                  )}
                  <p className="text-xs text-gray-400">{message.timestamp}</p>
                </div>
              )
            )}

            {isLoading && (
              <div className="self-start rounded-2xl bg-gray-100 px-4 py-3">
                <div className="flex gap-1">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce delay-150">●</span>
                  <span className="animate-bounce delay-300">●</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2 border-t p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              dir="rtl"
              placeholder="اكتب سؤالك..."
              disabled={isLoading}
              className="flex-1 rounded-xl border px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={isLoading}
              className="rounded-xl bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

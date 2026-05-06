import { useEffect, useRef, useState } from "react";
import { api } from "../../services/api";

interface Message {
  id: number;
  role: "user" | "bot";
  text: string;
  timestamp: string;
  confidence?: number;
  layer?: string;
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

  const [showSettings, setShowSettings] = useState(false);
  const [modelConfig, setModelConfig] = useState(() => {
    const saved = localStorage.getItem("arak_chatbot_config");
    if (saved) return JSON.parse(saved);
    return {
      enable_gemini_lite: true,
      enable_gemini_flash: true,
      enable_ollama: false,
      enable_sklearn: true,
      gemini_lite_model: "gemini-2.0-flash-lite",
      gemini_flash_model: "gemini-1.5-flash",
      ollama_model: "qwen2.5:1.5b",
    };
  });

  useEffect(() => {
    localStorage.setItem("arak_chatbot_config", JSON.stringify(modelConfig));
  }, [modelConfig]);

  useEffect(() => {
    api.getActiveLayers()
      .then((res: any) => setModelConfig((prev: any) => ({ ...prev, ...res.data })))
      .catch(() => {}); // silent fail
  }, []);

  const toggleLayer = (key: string) => {
    setModelConfig((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

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
      const data = await api.sendChatMessage(trimmed, modelConfig);

      const botMessage: Message = {
        id: Date.now() + 1,
        role: "bot",
        text: data.reply || data.text || "...",
        timestamp: getCurrentTime(),
        confidence: data.confidence,
        layer: data.intent || "unknown",
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
            <span className="flex items-center gap-2">
              Arak Assistant
              <button type="button" onClick={() => setShowSettings(!showSettings)} className="text-lg hover:opacity-80" title="Settings">⚙️</button>
            </span>
            <button type="button" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          {showSettings && (
            <div className="bg-gray-50 border-b p-3 text-sm text-gray-800 shadow-inner">
              <h4 className="font-bold mb-2">⚙️ AI Model Settings</h4>
              <div className="mb-2">
                <span className="font-semibold text-xs text-gray-500 uppercase tracking-wider">☁️ Cloud Models</span>
                <label className="flex items-center justify-between mt-1 cursor-pointer hover:bg-gray-100 p-1 rounded">
                  Gemini Lite <input type="checkbox" checked={modelConfig.enable_gemini_lite} onChange={() => toggleLayer('enable_gemini_lite')} className="w-4 h-4 text-blue-600" />
                </label>
                <label className="flex items-center justify-between mt-1 cursor-pointer hover:bg-gray-100 p-1 rounded">
                  Gemini Flash <input type="checkbox" checked={modelConfig.enable_gemini_flash} onChange={() => toggleLayer('enable_gemini_flash')} className="w-4 h-4 text-blue-600" />
                </label>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-xs text-gray-500 uppercase tracking-wider">🖥️ Local Models</span>
                <label className="flex items-center justify-between mt-1 cursor-pointer hover:bg-gray-100 p-1 rounded">
                  Ollama <input type="checkbox" checked={modelConfig.enable_ollama} onChange={() => toggleLayer('enable_ollama')} className="w-4 h-4 text-blue-600" />
                </label>
              </div>
              <div className="mb-1">
                <span className="font-semibold text-xs text-gray-500 uppercase tracking-wider">🔧 Fallback</span>
                <label className="flex items-center justify-between mt-1 cursor-pointer hover:bg-gray-100 p-1 rounded">
                  sklearn <input type="checkbox" checked={modelConfig.enable_sklearn} onChange={() => toggleLayer('enable_sklearn')} className="w-4 h-4 text-blue-600" />
                </label>
              </div>
            </div>
          )}

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
                  {message.layer && message.role === "bot" && (
                    <div className="mt-1 flex justify-end">
                      <span className="inline-block rounded bg-gray-200 px-2 py-0.5 text-[10px] text-gray-600 shadow-sm border border-gray-300">
                        {message.layer}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{message.timestamp}</p>
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

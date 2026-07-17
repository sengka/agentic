import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../ThemeContext";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const { isDark } = useTheme();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  if (!token) return null; // giriş yapılmadıysa widget'ı gösterme

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/reports/search",
        { query: userMessage.text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, { role: "assistant", text: res.data.answer || "Bir cevap bulunamadı." }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", text: "Bir hata oluştu, tekrar dener misin?" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      {/* Yüzen buton */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition"
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* Sohbet paneli */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] rounded-2xl shadow-2xl border flex flex-col ${
            isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
          }`}
          style={{ height: "520px" }}
        >
          <div className={`px-4 py-3 border-b ${isDark ? "border-gray-800" : "border-gray-200"} flex justify-between items-center`}>
            <span className="font-semibold text-indigo-400">💬 Agentic Asistan</span>
            <button onClick={() => setIsOpen(false)} className={isDark ? "text-gray-500 hover:text-white" : "text-gray-400 hover:text-gray-900"}>
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className={`${isDark ? "text-gray-500" : "text-gray-400"} text-sm text-center mt-10`}>
                Geçmiş raporların hakkında bana bir şey sor 👋
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : isDark
                      ? "bg-gray-800 text-gray-200"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className={`${isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"} rounded-2xl px-3 py-2 text-sm`}>
                  Yazıyor...
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className={`p-3 border-t ${isDark ? "border-gray-800" : "border-gray-200"} flex gap-2`}>
            <input
              type="text"
              placeholder="Bir şey sor..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`flex-1 text-sm ${isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"} px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
            >
              Gönder
            </button>
          </div>
        </div>
      )}
    </>
  );
}
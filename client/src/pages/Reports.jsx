import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { useTheme } from "../ThemeContext";

const cleanText = (text) => {
  if (!text) return "";
  return text.replace(/\*\*/g, "").replace(/\*/g, "").trim();
};

const statusLabels = {
  scraping: "🔍 Kaynaklar taranıyor...",
  embedding: "🧠 Embedding oluşturuluyor...",
  summarizing: "✍️ Özet yazılıyor...",
  done: "✅ Rapor hazır!",
  error: "❌ Hata oluştu",
  failed: "⚠️ İçerik bulunamadı",
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentStatus, setAgentStatus] = useState(null);
  const navigate = useNavigate();
  const { isDark, setIsDark } = useTheme();

  const fetchReports = () => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/api/reports", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setReports(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleFeedback = async (reportId, feedback) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/reports/${reportId}/feedback`,
        { feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReports((prev) =>
        prev.map((r) => (r._id === reportId ? { ...r, feedback: res.data.feedback } : r))
      );
    } catch (err) {
      console.error("Feedback hatası:", err.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchReports();

    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("Socket bağlandı:", socket.id);
    });

    socket.on("agentStatus", (data) => {
      console.log("Agent durumu:", data);
      setAgentStatus(data);

      if (data.status === "done") {
        fetchReports();
        setTimeout(() => setAgentStatus(null), 4000);
      }
      if (data.status === "error" || data.status === "failed") {
        setTimeout(() => setAgentStatus(null), 4000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading) return (
    <div className={`min-h-screen ${isDark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"} flex items-center justify-center`}>
      Yükleniyor...
    </div>
  );

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
      <nav className={`${isDark ? "bg-gray-900" : "bg-white border-b border-gray-200"} px-8 py-4 flex justify-between items-center`}>
        <h1 className="text-xl font-bold text-indigo-500">Agentic</h1>
        <div className="flex gap-4 items-center">
          <button onClick={() => navigate("/dashboard")} className={`${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition`}>
            Dashboard
          </button>
          <button onClick={() => setIsDark(!isDark)} className={`${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition`}>
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <h2 className="text-3xl font-bold mb-2">Raporlar</h2>
        <p className={`${isDark ? "text-gray-400" : "text-gray-500"} mb-8`}>Agent'larının oluşturduğu günlük özetler</p>
<button onClick={() => navigate("/search")} className={`${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition`}>
  Ara
</button>
        {agentStatus && (
          <div className={`${isDark ? "bg-indigo-950 border-indigo-800" : "bg-indigo-50 border-indigo-200"} rounded-xl p-4 mb-6 border flex items-center gap-2`}>
            <span className="text-sm font-medium">
              {statusLabels[agentStatus.status] || agentStatus.message}
            </span>
          </div>
        )}

        {reports.length === 0 ? (
          <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} rounded-2xl p-8 text-center border`}>
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>Henüz rapor yok</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <div key={report._id} className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} rounded-2xl p-6 border`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{report.agent?.name || "Agent"}</h3>
                    <p className={`${isDark ? "text-gray-500" : "text-gray-400"} text-sm mt-1`}>
                      {new Date(report.createdAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>

                <div className={`${isDark ? "bg-gray-800" : "bg-gray-50 border border-gray-200"} rounded-xl p-4 mb-4`}>
                  <p className="text-sm font-semibold text-indigo-400 mb-2">📋 Günlük Özet</p>
                  <p className={`${isDark ? "text-gray-300" : "text-gray-700"} text-sm leading-relaxed`}>
                    {cleanText(report.dailySummary)}
                  </p>
                </div>

                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => handleFeedback(report._id, report.feedback === "like" ? null : "like")}
                    className={`px-3 py-1.5 rounded-lg text-sm transition ${
                      report.feedback === "like"
                        ? "bg-green-600 text-white"
                        : isDark
                        ? "bg-gray-800 text-gray-400 hover:text-white"
                        : "bg-gray-100 text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    👍 Beğendim
                  </button>
                  <button
                    onClick={() => handleFeedback(report._id, report.feedback === "dislike" ? null : "dislike")}
                    className={`px-3 py-1.5 rounded-lg text-sm transition ${
                      report.feedback === "dislike"
                        ? "bg-red-600 text-white"
                        : isDark
                        ? "bg-gray-800 text-gray-400 hover:text-white"
                        : "bg-gray-100 text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    👎 Beğenmedim
                  </button>
                </div>

                <p className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm font-semibold mb-3`}>📰 Haberler</p>
                <div className="space-y-2">
                  {report.items.map((item, i) => (
                    <a
                      key={i}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block ${isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-50 hover:bg-gray-100 border border-gray-200"} rounded-xl px-4 py-3 transition`}
                    >
                      <p className={`${isDark ? "text-white" : "text-gray-900"} text-sm font-medium`}>{item.title}</p>
                      <p className={`${isDark ? "text-gray-500" : "text-gray-400"} text-xs mt-1`}>{item.source}</p>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
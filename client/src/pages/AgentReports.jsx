import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../ThemeContext";

const cleanText = (text) => {
  if (!text) return "";
  return text.replace(/\*\*/g, "").replace(/\*/g, "").trim();
};

export default function AgentReports() {
  const { id } = useParams();
  const [reports, setReports] = useState([]);
  const [agentName, setAgentName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isDark, setIsDark } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(`http://localhost:5000/api/reports/agent/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setReports(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    axios
      .get("http://localhost:5000/api/agents", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const found = res.data.find((a) => a._id === id);
        if (found) setAgentName(found.name);
      });
  }, [id]);

  if (loading) return (
    <div className={`min-h-screen ${isDark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"} flex items-center justify-center`}>
      Yükleniyor...
    </div>
  );

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
      <nav className={`${isDark ? "bg-gray-900" : "bg-white border-b border-gray-200"} px-8 py-4 flex justify-between items-center`}>
        <button onClick={() => navigate("/dashboard")} className="text-xl font-bold text-indigo-500 hover:text-indigo-400 transition">
          Agentic
        </button>
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
        <button onClick={() => navigate("/dashboard")} className={`${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} text-sm mb-4 transition`}>
          ← Dashboard'a dön
        </button>
        <h2 className="text-3xl font-bold mb-2">{agentName || "Agent"} — Rapor Geçmişi</h2>
        <p className={`${isDark ? "text-gray-400" : "text-gray-500"} mb-8`}>Bu agent'ın oluşturduğu tüm raporlar</p>

        {reports.length === 0 ? (
          <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} rounded-2xl p-8 text-center border`}>
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>Henüz rapor yok</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <div key={report._id} className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} rounded-2xl p-6 border`}>
                <p className={`${isDark ? "text-gray-500" : "text-gray-400"} text-sm mb-3`}>
                  {new Date(report.createdAt).toLocaleDateString("tr-TR", {
                    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                  })}
                </p>
                <div className={`${isDark ? "bg-gray-800" : "bg-gray-50 border border-gray-200"} rounded-xl p-4 mb-4`}>
                  <p className="text-sm font-semibold text-indigo-400 mb-2">📋 Günlük Özet</p>
                  <p className={`${isDark ? "text-gray-300" : "text-gray-700"} text-sm leading-relaxed`}>
                    {cleanText(report.dailySummary)}
                  </p>
                </div>
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
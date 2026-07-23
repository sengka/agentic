import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { useTheme } from "../ThemeContext";
import ActivityHeatmap from "../components/ActivityHeatmap";

const statusLabels = {
  scraping: "🔍 Kaynaklar taranıyor...",
  embedding: "🧠 Embedding oluşturuluyor...",
  summarizing: "✍️ Özet yazılıyor...",
  done: "✅ Rapor hazır!",
  error: "❌ Hata oluştu",
  failed: "⚠️ İçerik bulunamadı",
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [agents, setAgents] = useState([]);
  const [reports, setReports] = useState([]);
  const [agentStatuses, setAgentStatuses] = useState({}); // { agentId: { status, message } }
  const [editingAgent, setEditingAgent] = useState(null); // düzenlenen agent'ın id'si
  const [editForm, setEditForm] = useState({ name: "", description: "", topics: "", scheduledHour: 7 });
  const [selectedDate, setSelectedDate] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);
  const navigate = useNavigate();
  const { isDark, setIsDark } = useTheme();

  const fetchAgents = (token) => {
    axios
      .get("http://localhost:5000/api/agents", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAgents(res.data));
  };

  const fetchReports = (token) => {
    axios
      .get("http://localhost:5000/api/reports", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setReports(res.data));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });

    fetchAgents(token);
    fetchReports(token);

    const socket = io("http://localhost:5000");

    socket.on("agentStatus", (data) => {
      setAgentStatuses((prev) => ({ ...prev, [data.agentId]: data }));

      if (data.status === "done") {
        fetchReports(token);
        fetchAgents(token);
        setTimeout(() => {
          setAgentStatuses((prev) => {
            const updated = { ...prev };
            delete updated[data.agentId];
            return updated;
          });
        }, 4000);
      }
      if (data.status === "error" || data.status === "failed") {
        setTimeout(() => {
          setAgentStatuses((prev) => {
            const updated = { ...prev };
            delete updated[data.agentId];
            return updated;
          });
        }, 4000);
      }
    });

    return () => socket.disconnect();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const runAgent = async (agentId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `http://localhost:5000/api/agents/${agentId}/run`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      alert("Hata oluştu");
    }
  };

  const deleteAgent = async (agentId, agentName) => {
    if (!window.confirm(`"${agentName}" adlı agent'ı silmek istediğine emin misin? Bu işlem geri alınamaz.`)) {
      return;
    }
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/agents/${agentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAgents((prev) => prev.filter((a) => a._id !== agentId));
    } catch (err) {
      alert("Agent silinirken hata oluştu");
    }
  };
  const toggleAgent = async (agentId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/agents/${agentId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAgents((prev) => prev.map((a) => (a._id === agentId ? res.data.agent : a)));
    } catch (err) {
      alert("Durum değiştirilirken hata oluştu");
    }
  };

  const startEditing = (agent) => {
    setEditingAgent(agent._id);
    setEditForm({
      name: agent.name,
      description: agent.description || "",
      topics: agent.topics.join(", "),
      scheduledHour: agent.scheduledHour ?? 7,
    });
  };

  const cancelEditing = () => {
    setEditingAgent(null);
  };

  const saveEditing = async (agentId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/agents/${agentId}`,
        {
          name: editForm.name,
          description: editForm.description,
          topics: editForm.topics.split(",").map((t) => t.trim()).filter(Boolean),
          scheduledHour: parseInt(editForm.scheduledHour, 10),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAgents((prev) => prev.map((a) => (a._id === agentId ? res.data.agent : a)));
      setEditingAgent(null);
    } catch (err) {
      alert("Agent güncellenirken hata oluştu");
    }
  };
  const fetchWeeklySummary = async () => {
    const token = localStorage.getItem("token");
    setShowWeeklySummary(true);
    try {
      const res = await axios.get("http://localhost:5000/api/reports/weekly-summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWeeklySummary(res.data);
    } catch (err) {
      console.error("Haftalık özet hatası:", err.message);
    }
  };

  const getAgentReports = (agentId) => {
    return reports.filter((r) => (r.agent?._id || r.agent) === agentId);
  };

  const formatLastRun = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalReports = reports.length;
  const activeAgentCount = agents.filter((a) => a.isActive).length;
  const mostActiveAgent = agents.length
    ? agents.reduce((best, agent) => {
        const count = getAgentReports(agent._id).length;
        const bestCount = best ? getAgentReports(best._id).length : -1;
        return count > bestCount ? agent : best;
      }, null)
    : null;

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
      <nav className={`${isDark ? "bg-gray-900" : "bg-white border-b border-gray-200"} px-8 py-4 flex justify-between items-center`}>
        <button onClick={() => navigate("/dashboard")} className="text-xl font-bold text-indigo-500 hover:text-indigo-400 transition">
          Agentic
        </button>
        <div className="flex gap-4 items-center">
          <button onClick={() => navigate("/reports")} className={`${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition`}>
            Raporlar
          </button>
          <button onClick={() => navigate("/search")} className={`${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition`}>
            Ara
          </button>
          <button onClick={() => setIsDark(!isDark)} className={`${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition`}>
            {isDark ? "☀️" : "🌙"}
          </button>
          <button onClick={handleLogout} className={`${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition`}>
            Çıkış Yap
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <h2 className="text-3xl font-bold mb-2">Hoş geldin 👋</h2>
        <p className={`${isDark ? "text-gray-400" : "text-gray-500"} mb-8`}>Agent'larını oluştur ve yönet</p>

        {agents.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} rounded-2xl p-5 border`}>
              <p className={`${isDark ? "text-gray-500" : "text-gray-400"} text-sm mb-1`}>Toplam Rapor</p>
              <p className="text-2xl font-bold text-indigo-400">{totalReports}</p>
            </div>
            <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} rounded-2xl p-5 border`}>
              <p className={`${isDark ? "text-gray-500" : "text-gray-400"} text-sm mb-1`}>Aktif Agent</p>
              <p className="text-2xl font-bold text-green-400">{activeAgentCount} / {agents.length}</p>
            </div>
            <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} rounded-2xl p-5 border`}>
              <p className={`${isDark ? "text-gray-500" : "text-gray-400"} text-sm mb-1`}>En Aktif Agent</p>
              <p className="text-lg font-bold truncate">{mostActiveAgent?.name || "-"}</p>
            </div>
          </div>
        )}

{reports.length > 0 && (
          <ActivityHeatmap reports={reports} isDark={isDark} onDayClick={(date) => setSelectedDate(date)} />
        )}

        {selectedDate && (
          <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} rounded-2xl p-5 border mb-8`}>
            <div className="flex justify-between items-center mb-3">
              <p className="font-semibold">
                📅 {selectedDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} tarihli raporlar
              </p>
              <button
                onClick={() => setSelectedDate(null)}
                className={isDark ? "text-gray-500 hover:text-white" : "text-gray-400 hover:text-gray-700"}
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {reports
                .filter((r) => {
                  const d = new Date(r.createdAt);
                  return (
                    d.getFullYear() === selectedDate.getFullYear() &&
                    d.getMonth() === selectedDate.getMonth() &&
                    d.getDate() === selectedDate.getDate()
                  );
                })
                .map((r) => (
                  <div key={r._id} className={`${isDark ? "bg-gray-800" : "bg-gray-50 border border-gray-200"} rounded-xl p-3`}>
                    <p className="text-sm font-medium">{r.agent?.name || "Agent"}</p>
                    <p className={`${isDark ? "text-gray-500" : "text-gray-400"} text-xs mt-1`}>
                      {new Date(r.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
        <button
          onClick={() => navigate("/create-agent")}
          className="mb-8 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition"
        >
          + Yeni Agent Oluştur
        </button>
        <button
          onClick={fetchWeeklySummary}
          className={`mb-8 ml-3 ${isDark ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"} px-6 py-3 rounded-xl font-semibold transition`}
        >
          📰 Haftalık Özeti Gör
        </button>

        {showWeeklySummary && (
          <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} rounded-2xl p-6 border mb-8`}>
            <div className="flex justify-between items-center mb-3">
              <p className="font-semibold text-indigo-400">📰 Haftalık Özet</p>
              <button
                onClick={() => setShowWeeklySummary(false)}
                className={isDark ? "text-gray-500 hover:text-white" : "text-gray-400 hover:text-gray-700"}
              >
                ✕
              </button>
            </div>
            {weeklySummary ? (
              <>
                <p className={`${isDark ? "text-gray-300" : "text-gray-700"} text-sm leading-relaxed mb-3`}>
                  {weeklySummary.summary}
                </p>
                <p className={`${isDark ? "text-gray-500" : "text-gray-400"} text-xs`}>
                  {weeklySummary.reportCount} rapor baz alındı · {new Date(weeklySummary.weekStart).toLocaleDateString("tr-TR")} - {new Date(weeklySummary.weekEnd).toLocaleDateString("tr-TR")}
                </p>
              </>
            ) : (
              <p className={isDark ? "text-gray-400" : "text-gray-500"}>Yükleniyor...</p>
            )}
          </div>
        )}

        {agents.length === 0 ? (
          <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} rounded-2xl p-8 text-center border`}>
            <p className={`${isDark ? "text-gray-400" : "text-gray-500"} text-lg`}>Henüz bir agent yok</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {agents.map((agent) => {
              const agentReports = getAgentReports(agent._id);
              const lastRun = agentReports.length
                ? agentReports.reduce((latest, r) => (new Date(r.createdAt) > new Date(latest.createdAt) ? r : latest))
                : null;
              const liveStatus = agentStatuses[agent._id];

              return (
                <div key={agent._id} className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} rounded-2xl p-6 border`}>
                  <div className="flex justify-between items-start mb-4">
<div className="flex-1">
                      {editingAgent === agent._id ? (
                        <div className="space-y-2 mb-2">
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className={`w-full ${isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"} px-3 py-2 rounded-lg text-lg font-bold outline-none focus:ring-2 focus:ring-indigo-500`}
                            placeholder="Agent adı"
                          />
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className={`w-full ${isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"} px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500`}
                            placeholder="Açıklama"
                            rows={2}
                          />
                          <input
                            type="text"
                            value={editForm.topics}
                            onChange={(e) => setEditForm({ ...editForm, topics: e.target.value })}
                            className={`w-full ${isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"} px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500`}
                            placeholder="Konular (virgülle ayır)"
                          />
                          <div className="flex items-center gap-2">
                            <label className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm`}>Çalışma saati:</label>
                            <select
                              value={editForm.scheduledHour}
                              onChange={(e) => setEditForm({ ...editForm, scheduledHour: e.target.value })}
                              className={`${isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"} px-2 py-1 rounded-lg text-sm outline-none`}
                            >
                              {Array.from({ length: 24 }, (_, i) => (
                                <option key={i} value={i}>{i.toString().padStart(2, "0")}:00</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEditing(agent._id)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm transition"
                            >
                              Kaydet
                            </button>
                            <button
                              onClick={cancelEditing}
                              className={`${isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"} px-4 py-1.5 rounded-lg text-sm transition`}
                            >
                              İptal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold">{agent.name}</h3>
                            <button
                              onClick={() => startEditing(agent)}
                              className={`${isDark ? "text-gray-500 hover:text-white" : "text-gray-400 hover:text-gray-700"} text-sm transition`}
                              title="Düzenle"
                            >
                              ✏️
                            </button>
                          </div>
                          <p className={`${isDark ? "text-gray-400" : "text-gray-500"} mt-1`}>{agent.description}</p>
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {agent.topics.map((topic, i) => (
                              <span key={i} className="bg-indigo-900 text-indigo-300 px-3 py-1 rounded-full text-sm">
                                {topic}
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-4 mt-3 text-sm flex-wrap">
                            <span className={isDark ? "text-gray-500" : "text-gray-400"}>
                              📋 {agentReports.length} rapor
                            </span>
                            <span className={isDark ? "text-gray-500" : "text-gray-400"}>
                              🕐 Son çalışma: {lastRun ? formatLastRun(lastRun.createdAt) : "Henüz çalışmadı"}
                            </span>
                            <span className={isDark ? "text-gray-500" : "text-gray-400"}>
                              ⏰ Çalışma saati: {(agent.scheduledHour ?? 7).toString().padStart(2, "0")}:00
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <button
                        onClick={() => toggleAgent(agent._id)}
                        className={`px-3 py-1 rounded-full text-sm transition ${agent.isActive ? "bg-green-900 text-green-300 hover:bg-green-800" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                      >
                        {agent.isActive ? "Aktif" : "Pasif"}
                      </button>
                      <button
                        onClick={() => runAgent(agent._id)}
                        disabled={!!liveStatus && liveStatus.status !== "done" && liveStatus.status !== "error" && liveStatus.status !== "failed"}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm transition"
                      >
                        ▶ Çalıştır
                      </button>
                      <button
                        onClick={() => deleteAgent(agent._id, agent.name)}
                        className="text-red-400 hover:text-red-300 text-sm transition"
                      >
                        Sil
                      </button>
                    </div>
                  </div>

                  {liveStatus && (
                    <div className={`${isDark ? "bg-indigo-950 border-indigo-800" : "bg-indigo-50 border-indigo-200"} rounded-xl p-3 mb-4 border`}>
                      <p className="text-sm font-medium">
                        {statusLabels[liveStatus.status] || liveStatus.message}
                      </p>
                    </div>
                  )}

                  <div className={`border-t ${isDark ? "border-gray-800" : "border-gray-200"} pt-4`}>
                    <p className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm mb-2`}>Kaynaklar:</p>
                    {agent.sources.length === 0 ? (
                      <p className={`${isDark ? "text-gray-600" : "text-gray-400"} text-sm`}>Henüz kaynak eklenmemiş</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {agent.sources.map((source, i) => (
                          <span key={i} className={`${isDark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"} px-3 py-1 rounded-full text-sm`}>
                            {source}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-4">
                      <button
                        onClick={() => navigate(`/agent/${agent._id}/sources`)}
                        className="text-indigo-400 hover:text-indigo-300 text-sm transition"
                      >
                        + Kaynak Ekle
                      </button>
                      <button
                        onClick={() => navigate(`/agent/${agent._id}/reports`)}
                        className="text-indigo-400 hover:text-indigo-300 text-sm transition"
                      >
                        📋 Tüm Raporları Gör
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
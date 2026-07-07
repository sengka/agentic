import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../ThemeContext";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [agents, setAgents] = useState([]);
  const navigate = useNavigate();
  const { isDark, setIsDark } = useTheme();

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

    axios
      .get("http://localhost:5000/api/agents", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAgents(res.data));
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
      alert("Agent çalıştırıldı! Raporlar sayfasını kontrol et.");
    } catch (err) {
      alert("Hata oluştu");
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
      <nav className={`${isDark ? "bg-gray-900" : "bg-white border-b border-gray-200"} px-8 py-4 flex justify-between items-center`}>
        <h1 className="text-xl font-bold text-indigo-500">Agentic</h1>
        <div className="flex gap-4 items-center">
          <button onClick={() => navigate("/reports")} className={`${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition`}>
            Raporlar
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

        <button
          onClick={() => navigate("/create-agent")}
          className="mb-8 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition"
        >
          + Yeni Agent Oluştur
        </button>

        {agents.length === 0 ? (
          <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} rounded-2xl p-8 text-center border`}>
            <p className={`${isDark ? "text-gray-400" : "text-gray-500"} text-lg`}>Henüz bir agent yok</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {agents.map((agent) => (
              <div key={agent._id} className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} rounded-2xl p-6 border`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{agent.name}</h3>
                    <p className={`${isDark ? "text-gray-400" : "text-gray-500"} mt-1`}>{agent.description}</p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {agent.topics.map((topic, i) => (
                        <span key={i} className="bg-indigo-900 text-indigo-300 px-3 py-1 rounded-full text-sm">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span className={`px-3 py-1 rounded-full text-sm ${agent.isActive ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-400"}`}>
                      {agent.isActive ? "Aktif" : "Pasif"}
                    </span>
                    <button
                      onClick={() => runAgent(agent._id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm transition"
                    >
                      ▶ Çalıştır
                    </button>
                  </div>
                </div>

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
                  <button
                    onClick={() => navigate(`/agent/${agent._id}/sources`)}
                    className="text-indigo-400 hover:text-indigo-300 text-sm transition"
                  >
                    + Kaynak Ekle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
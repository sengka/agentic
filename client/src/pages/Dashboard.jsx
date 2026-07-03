import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [agents, setAgents] = useState([]);
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-400">Agentic</h1>
        <button onClick={handleLogout} className="text-gray-400 hover:text-white transition">
          Çıkış Yap
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <h2 className="text-3xl font-bold mb-2">Hoş geldin 👋</h2>
        <p className="text-gray-400 mb-8">Agent'larını oluştur ve yönet</p>

        <button
          onClick={() => navigate("/create-agent")}
          className="mb-8 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition"
        >
          + Yeni Agent Oluştur
        </button>

        {agents.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-800">
            <p className="text-gray-400 text-lg">Henüz bir agent yok</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {agents.map((agent) => (
  <div key={agent._id} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-xl font-bold text-white">{agent.name}</h3>
        <p className="text-gray-400 mt-1">{agent.description}</p>
        <div className="flex gap-2 mt-3 flex-wrap">
          {agent.topics.map((topic, i) => (
            <span key={i} className="bg-indigo-900 text-indigo-300 px-3 py-1 rounded-full text-sm">
              {topic}
            </span>
          ))}
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-sm ${agent.isActive ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-400"}`}>
        {agent.isActive ? "Aktif" : "Pasif"}
      </span>
    </div>

    <div className="border-t border-gray-800 pt-4">
      <p className="text-gray-400 text-sm mb-2">Kaynaklar:</p>
      {agent.sources.length === 0 ? (
        <p className="text-gray-600 text-sm">Henüz kaynak eklenmemiş</p>
      ) : (
        <div className="flex flex-wrap gap-2 mb-3">
          {agent.sources.map((source, i) => (
            <span key={i} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
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
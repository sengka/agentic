import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CreateAgent() {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!userInput.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/agents",
        { userInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-400">Agentic</h1>
        <button onClick={() => navigate("/dashboard")} className="text-gray-400 hover:text-white">
          Geri
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-12">
        <h2 className="text-3xl font-bold mb-2">Yeni Agent Oluştur</h2>
        <p className="text-gray-400 mb-8">Agent'ının ne yapmasını istediğini doğal dille anlat</p>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Örnek: Her gün yapay zeka haberlerini ve GitHub trend projelerini takip et, Türkçe özet çıkar"
            rows={5}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <button
            onClick={handleCreate}
            disabled={loading}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
          >
            {loading ? "AI analiz ediyor..." : "Agent Oluştur"}
          </button>
        </div>
      </div>
    </div>
  );
}

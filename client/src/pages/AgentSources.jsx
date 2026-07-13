import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function AgentSources() {
  const { id } = useParams();
  const [agent, setAgent] = useState(null);
  const [newSource, setNewSource] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/api/agents", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const found = res.data.find((a) => a._id === id);
        setAgent(found);
      });
  }, [id]);

  const handleAddSource = async () => {
    if (!newSource.trim()) return;
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        `http://localhost:5000/api/agents/${id}/sources`,
        { source: newSource },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAgent(res.data.agent);
      setNewSource("");
      setTestResult(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestSource = async () => {
    if (!newSource.trim()) return;
    const token = localStorage.getItem("token");
    setTesting(true);
    setTestResult(null);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/agents/test-source`,
        { source: newSource },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTestResult(res.data);
    } catch (err) {
      setTestResult({ success: false, message: "Test sırasında hata oluştu" });
    } finally {
      setTesting(false);
    }
  };

  const handleRemoveSource = async (source) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/agents/${id}/sources`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { source }
        }
      );
      setAgent(res.data.agent);
    } catch (err) {
      console.error(err);
    }
  };

  if (!agent) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-400">Agentic</h1>
        <button onClick={() => navigate("/dashboard")} className="text-gray-400 hover:text-white">
          Geri
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-12">
        <h2 className="text-3xl font-bold mb-2">{agent.name}</h2>
        <p className="text-gray-400 mb-8">Kaynak Yönetimi</p>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="https://techcrunch.com"
              value={newSource}
              onChange={(e) => {
                setNewSource(e.target.value);
                setTestResult(null);
              }}
              className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleTestSource}
              disabled={testing || !newSource.trim()}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-semibold transition"
            >
              {testing ? "Test ediliyor..." : "Test Et"}
            </button>
            <button
              onClick={handleAddSource}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Ekle
            </button>
          </div>

          {testResult && (
            <div className={`mt-4 rounded-xl p-4 text-sm ${testResult.success ? "bg-green-950 border border-green-800 text-green-300" : "bg-red-950 border border-red-800 text-red-300"}`}>
              <p className="font-semibold mb-1">{testResult.success ? "✅ " : "❌ "}{testResult.message}</p>
              {testResult.sample && (
                <ul className="mt-2 space-y-1 text-gray-300">
                  {testResult.sample.map((title, i) => (
                    <li key={i}>• {title}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {agent.sources.length === 0 ? (
            <p className="text-gray-500 text-center">Henüz kaynak eklenmemiş</p>
          ) : (
            agent.sources.map((source, i) => (
              <div key={i} className="bg-gray-900 rounded-xl px-5 py-4 flex justify-between items-center border border-gray-800">
                <span className="text-gray-300">{source}</span>
                <button
                  onClick={() => handleRemoveSource(source)}
                  className="text-red-400 hover:text-red-300 transition"
                >
                  Sil
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
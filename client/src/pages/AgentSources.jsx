import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ConfirmModal from "../components/ConfirmModal";

export default function AgentSources() {
  const { id } = useParams();
  const [agent, setAgent] = useState(null);
  const [newSource, setNewSource] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("https://agentic-468i.onrender.com/api/agents", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const found = res.data.find((a) => a._id === id);
        setAgent(found);
      });
  }, [id]);

  const handleAddSource = async () => {
    if (!newSource.trim()) return;
    setAdding(true);
    setAddError("");
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        `https://agentic-468i.onrender.com/api/agents/${id}/sources`,
        { source: newSource },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAgent(res.data.agent);
      setNewSource("");
      setTestResult(null);
    } catch (err) {
      setAddError(err.response?.data?.message || "Kaynak eklenirken bir hata oluştu.");
    } finally {
      setAdding(false);
    }
  };

  const handleTestSource = async () => {
    if (!newSource.trim()) return;
    const token = localStorage.getItem("token");
    setTesting(true);
    setTestResult(null);
    try {
      const res = await axios.post(
        `https://agentic-468i.onrender.com/api/agents/test-source`,
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

  const handleRemoveSource = (source) => {
    setRemoveTarget(source);
  };

  const confirmRemoveSource = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.delete(
        `https://agentic-468i.onrender.com/api/agents/${id}/sources`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { source: removeTarget },
        }
      );
      setAgent(res.data.agent);
      setRemoveTarget(null);
    } catch (err) {
      setAddError("Kaynak silinirken bir hata oluştu.");
    } finally {
      setRemoving(false);
    }
  };

  if (!agent) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 px-8 py-4 flex justify-between items-center">
        <button onClick={() => navigate("/dashboard")} className="text-xl font-bold text-indigo-500 hover:text-indigo-400 transition">
          Agentic
        </button>
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
                setAddError("");
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
              disabled={adding || !newSource.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              {adding ? "Ekleniyor..." : "Ekle"}
            </button>
          </div>

          {addError && (
            <p className="text-red-400 text-sm mt-3">⚠️ {addError}</p>
          )}

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

      <ConfirmModal
        open={!!removeTarget}
        title="Kaynağı sil"
        message={`"${removeTarget}" kaynağını kaldırmak istediğine emin misin?`}
        confirmLabel="Sil"
        loading={removing}
        isDark={true}
        onConfirm={confirmRemoveSource}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
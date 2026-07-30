import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EXAMPLES = [
  "Her gün yapay zeka haberlerini ve GitHub trend projelerini takip et, Türkçe özet çıkar",
  "Ekonomi ve döviz kurlarıyla ilgili gelişmeleri her sabah özetle",
  "Voleybol ve basketbol ile ilgili Türkiye gündemini takip et",
  "Deprem ve doğal afetlerle ilgili son dakika haberlerini izle",
];

export default function CreateAgent() {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!userInput.trim()) {
      setError("Lütfen agent'ının ne yapmasını istediğini yazın.");
      return;
    }
    if (userInput.trim().length < 10) {
      setError("Biraz daha detay verir misin? En az birkaç kelimelik bir açıklama gerekiyor.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://agentic-468i.onrender.com/api/agents",
        { userInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Agent oluşturulurken bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

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
        <h2 className="text-3xl font-bold mb-2">Yeni Agent Oluştur</h2>
        <p className="text-gray-400 mb-8">Agent'ının ne yapmasını istediğini doğal dille anlat</p>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <textarea
            value={userInput}
            onChange={(e) => {
              setUserInput(e.target.value);
              if (error) setError("");
            }}
            placeholder="Örnek: Her gün yapay zeka haberlerini ve GitHub trend projelerini takip et, Türkçe özet çıkar"
            rows={5}
            className={`w-full bg-gray-800 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 resize-none ${
              error ? "ring-2 ring-red-500" : "focus:ring-indigo-500"
            }`}
          />

          {error && (
            <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
              ⚠️ {error}
            </p>
          )}

          <button
            onClick={handleCreate}
            disabled={loading}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {loading ? "AI analiz ediyor..." : "Agent Oluştur"}
          </button>
        </div>

        <div className="mt-6">
          <p className="text-gray-500 text-sm mb-3">Fikir mi lazım? Birini seç:</p>
          <div className="flex flex-col gap-2">
            {EXAMPLES.map((example, i) => (
              <button
                key={i}
                onClick={() => {
                  setUserInput(example);
                  setError("");
                }}
                className="text-left bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 hover:text-white transition"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../ThemeContext";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const navigate = useNavigate();
  const { isDark, setIsDark } = useTheme();

  const handleSearch = async () => {
    if (!query.trim()) return;
    const token = localStorage.getItem("token");
    setLoading(true);
    setSearched(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/reports/search",
        { query },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResults(res.data.results || []);
    } catch (err) {
      console.error("Arama hatası:", err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

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
          <button onClick={() => navigate("/reports")} className={`${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition`}>
            Raporlar
          </button>
          <button onClick={() => setIsDark(!isDark)} className={`${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition`}>
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-8 py-12">
        <h2 className="text-3xl font-bold mb-2">🔍 Akıllı Arama</h2>
        <p className={`${isDark ? "text-gray-400" : "text-gray-500"} mb-8`}>
          Geçmiş raporlarında doğal dille arama yap — örneğin "yapay zeka regülasyonları hakkında ne vardı?"
        </p>

        <div className="flex gap-3 mb-10">
          <input
            type="text"
            placeholder="Ne aramak istiyorsun?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`flex-1 ${isDark ? "bg-gray-900 text-white border-gray-800" : "bg-white text-gray-900 border-gray-200"} border px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            {loading ? "Aranıyor..." : "Ara"}
          </button>
        </div>

        {searched && !loading && results.length === 0 && (
          <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} rounded-2xl p-8 text-center border`}>
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>Sonuç bulunamadı</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`block ${isDark ? "bg-gray-900 border-gray-800 hover:bg-gray-800" : "bg-white border-gray-200 hover:bg-gray-50"} rounded-2xl p-5 border transition`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <span className="bg-indigo-900 text-indigo-300 px-2 py-1 rounded-full text-xs whitespace-nowrap ml-3">
                    %{Math.round(item.score * 100)} eşleşme
                  </span>
                </div>
                {item.summary && (
                  <p className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm mb-3 line-clamp-2`}>
                    {item.summary}
                  </p>
                )}
                <div className={`flex gap-4 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  <span>🤖 {item.agentName}</span>
                  <span>📅 {new Date(item.publishedAt).toLocaleDateString("tr-TR")}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
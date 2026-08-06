import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../ThemeContext";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [agents, setAgents] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isDark, setIsDark } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, agentsRes, reportsRes] = await Promise.all([
          axios.get("https://agentic-468i.onrender.com/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://agentic-468i.onrender.com/api/agents", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://agentic-468i.onrender.com/api/reports", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUser(userRes.data.user);
        setAgents(agentsRes.data);
        setReports(reportsRes.data);
      } catch (err) {
        console.error("Profil verisi çekilemedi:", err);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"} flex items-center justify-center`}>
        Yükleniyor...
      </div>
    );
  }

  const activeAgents = agents.filter((a) => a.isActive).length;
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Bilinmiyor";

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Navigation */}
      <nav className={`${isDark ? "bg-gray-900" : "bg-white border-b border-gray-200"} px-8 py-4 flex justify-between items-center`}>
        <button onClick={() => navigate("/dashboard")} className="text-xl font-bold text-indigo-500 hover:text-indigo-400 transition">
          Agentic
        </button>
        <div className="flex gap-4 items-center">
          <button onClick={() => navigate("/dashboard")} className={`${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition font-semibold text-sm`}>
            Dashboard
          </button>
          <button onClick={() => navigate("/reports")} className={`${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition font-semibold text-sm`}>
            Raporlar
          </button>
          <button onClick={() => navigate("/search")} className={`${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition font-semibold text-sm`}>
            Arama
          </button>
          <button onClick={() => setIsDark(!isDark)} className={`${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition`}>
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="max-w-3xl mx-auto px-8 py-12">
        <h2 className="text-3xl font-bold mb-1">👤 Profil & Ayarlar</h2>
        <p className={`${isDark ? "text-gray-400" : "text-gray-500"} mb-8`}>Hesap detaylarınız ve genel sistem istatistikleriniz</p>

        {/* Profile Card */}
        <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} border rounded-3xl p-6 mb-8`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-black">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold">{user?.name}</h3>
              <p className={isDark ? "text-gray-400" : "text-gray-500"}>{user?.email}</p>
            </div>
          </div>
          <div className={`pt-4 border-t ${isDark ? "border-gray-800" : "border-gray-200"} flex justify-between text-sm`}>
            <span className={isDark ? "text-gray-500" : "text-gray-400"}>Hesap Oluşturma Tarihi</span>
            <span className="font-semibold">{joinDate}</span>
          </div>
        </div>

        {/* Statistics Panel */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} border rounded-2xl p-5 text-center`}>
            <p className="text-indigo-400 text-3xl font-black mb-1">{agents.length}</p>
            <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"} uppercase font-bold`}>Toplam Ajan</p>
          </div>
          <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} border rounded-2xl p-5 text-center`}>
            <p className="text-emerald-400 text-3xl font-black mb-1">{activeAgents}</p>
            <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"} uppercase font-bold`}>Aktif Ajan</p>
          </div>
          <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} border rounded-2xl p-5 text-center`}>
            <p className="text-violet-400 text-3xl font-black mb-1">{reports.length}</p>
            <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"} uppercase font-bold`}>Toplam Rapor</p>
          </div>
        </div>

        {/* Action Panel */}
        <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} border rounded-3xl p-6`}>
          <h4 className="font-semibold text-lg mb-4">Sistem Tercihleri</h4>
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="font-semibold text-sm">Görünüm Teması</p>
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"} mt-0.5`}>Arayüzün açık veya koyu modda görünmesini ayarlar.</p>
            </div>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                isDark ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }`}
            >
              {isDark ? "Koyu Mod" : "Açık Mod"}
            </button>
          </div>

          <div className={`pt-6 border-t ${isDark ? "border-gray-800" : "border-gray-200"} flex justify-between items-center`}>
            <div>
              <p className="font-semibold text-sm text-red-400">Çıkış Yap</p>
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"} mt-0.5`}>Mevcut oturumu sonlandırarak giriş sayfasına yönlendirir.</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-900/20 text-red-400 border border-red-950 hover:bg-red-900/40 px-4 py-2 rounded-xl text-sm font-semibold transition"
            >
              Oturumu Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

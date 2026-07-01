import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const [user, setUser] = useState(null);
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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-400">Agentic</h1>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-white transition"
        >
          Çıkış Yap
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <h2 className="text-3xl font-bold mb-2">
          Hoş geldin 👋
        </h2>
        <p className="text-gray-400 mb-12">
          Agent'larını oluştur ve yönet
        </p>

        <div className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-800">
          <p className="text-gray-400 text-lg mb-4">Henüz bir agent yok</p>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition">
            + Yeni Agent Oluştur
          </button>
        </div>
      </div>
    </div>
  );
}
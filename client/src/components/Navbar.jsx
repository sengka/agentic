import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { useTheme } from "../ThemeContext";

export default function Navbar() {
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isDark, setIsDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const socket = io("https://agentic-468i.onrender.com");

    socket.on("agentStatus", (data) => {
      // We only notify on final status transitions
      if (data.status === "done" || data.status === "error" || data.status === "failed") {
        let msg = "";
        if (data.status === "done") {
          msg = `✅ Rapor hazır! Ajan çalışmasını tamamladı.`;
        } else if (data.status === "failed") {
          msg = `⚠️ İçerik bulunamadı. Ajan çalıştı fakat yeni haber bulamadı.`;
        } else {
          msg = `❌ Hata oluştu! Ajan çalışırken bir sorunla karşılaştı.`;
        }

        setNotifications((prev) => [
          {
            id: Date.now(),
            message: msg,
            time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
            status: data.status,
          },
          ...prev,
        ]);
        setHasUnread(true);
      }
    });

    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      socket.disconnect();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [token]);

  if (!token) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
    setHasUnread(false);
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Raporlar", path: "/reports" },
    { name: "Arama", path: "/search" },
    { name: "Profil", path: "/profile" },
  ];

  return (
    <nav className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-b border-gray-200"} px-8 py-4 flex justify-between items-center relative z-40`}>
      {/* Brand Logo */}
      <button onClick={() => navigate("/dashboard")} className="text-xl font-bold text-indigo-500 hover:text-indigo-400 transition">
        Agentic
      </button>

      {/* Nav Links & Utilities */}
      <div className="flex gap-5 items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`text-sm font-semibold transition ${
                isActive
                  ? "text-indigo-400"
                  : isDark
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {item.name}
            </button>
          );
        })}

        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className={`text-lg p-1.5 rounded-full transition relative ${
              isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            🔔
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isDropdownOpen && (
            <div className={`absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl border p-4 ${
              isDark ? "bg-gray-900 border-gray-850 text-white" : "bg-white border-gray-200 text-gray-900"
            }`}>
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-850">
                <span className="font-bold text-xs text-indigo-400 uppercase tracking-wider">Aktivite Bildirimleri</span>
                {notifications.length > 0 && (
                  <button
                    onClick={() => setNotifications([])}
                    className="text-[10px] text-gray-500 hover:text-gray-300"
                  >
                    Temizle
                  </button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-center text-gray-500 py-6">Yeni bildirim bulunmuyor.</p>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className={`p-2.5 rounded-xl border ${
                      isDark ? "bg-gray-850 border-gray-800" : "bg-gray-50 border-gray-150"
                    }`}>
                      <p className="text-xs leading-relaxed">{notif.message}</p>
                      <span className="text-[9px] text-gray-500 block mt-1">{notif.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className={`text-sm p-1.5 rounded-full transition ${
            isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {isDark ? "☀️" : "🌙"}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
            isDark
              ? "border-red-950 bg-red-900/10 text-red-400 hover:bg-red-900/25"
              : "border-red-100 bg-red-50/50 text-red-500 hover:bg-red-50"
          }`}
        >
          Çıkış Yap
        </button>
      </div>
    </nav>
  );
}

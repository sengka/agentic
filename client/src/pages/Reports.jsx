import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get("http://localhost:5000/api/reports", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setReports(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      Yükleniyor...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-400">Agentic</h1>
        <button onClick={() => navigate("/dashboard")} className="text-gray-400 hover:text-white">
          Dashboard
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <h2 className="text-3xl font-bold mb-2">Raporlar</h2>
        <p className="text-gray-400 mb-8">Agent'larının oluşturduğu günlük özetler</p>

        {reports.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-800">
            <p className="text-gray-400">Henüz rapor yok</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <div key={report._id} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {report.agent?.name || "Agent"}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(report.createdAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-4 mb-4">
                  <p className="text-gray-300 text-sm leading-relaxed">{report.dailySummary}</p>
                </div>

                <div className="space-y-2">
                  {report.items.map((item, i) => (
                    <a
                      key={i}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-gray-800 hover:bg-gray-700 rounded-xl px-4 py-3 transition"
                    >
                      <p className="text-white text-sm">{item.title}</p>
                      <p className="text-gray-500 text-xs mt-1">{item.source}</p>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default function AgentComparison({ agents, reports, isDark }) {
  if (agents.length < 2) return null;

  const getStats = (agentId) => {
    const agentReports = reports.filter((r) => (r.agent?._id || r.agent) === agentId);
    const likes = agentReports.filter((r) => r.feedback === "like").length;
    const dislikes = agentReports.filter((r) => r.feedback === "dislike").length;
    const rated = likes + dislikes;
    const likeRatio = rated > 0 ? Math.round((likes / rated) * 100) : null;
    return { total: agentReports.length, likes, dislikes, likeRatio };
  };

  return (
    <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} rounded-2xl p-5 border mb-8 overflow-x-auto`}>
      <p className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm mb-4 font-semibold`}>⚖️ Agent Karşılaştırması</p>
      <table className="w-full text-sm">
        <thead>
          <tr className={`text-left border-b ${isDark ? "border-gray-800 text-gray-500" : "border-gray-200 text-gray-400"}`}>
            <th className="pb-2 pr-4">Agent</th>
            <th className="pb-2 pr-4">Rapor</th>
            <th className="pb-2 pr-4">Beğeni Oranı</th>
            <th className="pb-2 pr-4">Kaynak Sayısı</th>
            <th className="pb-2">Durum</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => {
            const stats = getStats(agent._id);
            return (
              <tr key={agent._id} className={`border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                <td className="py-3 pr-4 font-medium">{agent.name}</td>
                <td className="py-3 pr-4">{stats.total}</td>
                <td className="py-3 pr-4">
                  {stats.likeRatio !== null ? (
                    <span className={stats.likeRatio >= 50 ? "text-green-400" : "text-red-400"}>
                      %{stats.likeRatio} ({stats.likes}👍 {stats.dislikes}👎)
                    </span>
                  ) : (
                    <span className={isDark ? "text-gray-600" : "text-gray-400"}>Henüz oy yok</span>
                  )}
                </td>
                <td className="py-3 pr-4">{agent.sources.length}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${agent.isActive ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-400"}`}>
                    {agent.isActive ? "Aktif" : "Pasif"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
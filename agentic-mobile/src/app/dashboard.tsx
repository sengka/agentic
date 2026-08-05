import { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Alert, SafeAreaView } from "react-native";
import { router } from "expo-router";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";

interface Agent {
  _id: string;
  name: string;
  description?: string;
  topics: string[];
  isActive: boolean;
  scheduledHour?: number;
}

interface Report {
  _id: string;
  agent: string | { _id: string; name: string };
  createdAt: string;
}

interface AgentLiveStatus {
  agentId: string;
  status: "scraping" | "embedding" | "summarizing" | "done" | "error" | "failed";
  message: string;
}

const statusLabels: Record<string, string> = {
  scraping: "🔍 Kaynaklar taranıyor...",
  embedding: "🧠 Embedding oluşturuluyor...",
  summarizing: "✍️ Özet yazılıyor...",
  done: "✅ Rapor hazır!",
  error: "❌ Hata oluştu",
  failed: "⚠️ İçerik bulunamadı",
};

export default function DashboardScreen() {
  const { user, token, logout, loading } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentLiveStatus>>({});
  const [refreshing, setRefreshing] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      setRefreshing(true);
      const [agentsRes, reportsRes] = await Promise.all([
        axios.get(`${API_URL}/api/agents`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/reports`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setAgents(agentsRes.data);
      setReports(reportsRes.data);
    } catch (err) {
      console.error("Dashboard veri çekme hatası:", err);
      Alert.alert("Hata", "Veriler yüklenirken bir hata oluştu.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (loading) return; // Wait until authentication load is complete

    if (!token) {
      router.replace("/login");
      return;
    }

    fetchDashboardData();

    // Socket.io Connection
    const socket = io(API_URL);
    socketRef.current = socket;

    socket.on("agentStatus", (data: AgentLiveStatus) => {
      setAgentStatuses((prev) => ({ ...prev, [data.agentId]: data }));

      if (data.status === "done") {
        fetchDashboardData();
        setTimeout(() => {
          setAgentStatuses((prev) => {
            const updated = { ...prev };
            delete updated[data.agentId];
            return updated;
          });
        }, 4000);
      }
      if (data.status === "error" || data.status === "failed") {
        setTimeout(() => {
          setAgentStatuses((prev) => {
            const updated = { ...prev };
            delete updated[data.agentId];
            return updated;
          });
        }, 4000);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token, loading]);

  if (loading) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const handleLogout = async () => {
    Alert.alert("Çıkış Yap", "Hesabınızdan çıkış yapmak istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Çıkış",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const handleToggleActive = async (agentId: string) => {
    if (!token) return;
    try {
      const res = await axios.patch(
        `${API_URL}/api/agents/${agentId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAgents((prev) => prev.map((a) => (a._id === agentId ? res.data.agent : a)));
    } catch (err) {
      console.error("Agent aktif/pasif değiştirilemedi:", err);
      Alert.alert("Hata", "Durum değiştirilemedi.");
    }
  };

  const handleRunAgent = async (agentId: string) => {
    if (!token) return;
    try {
      // Set initial status to show starting state
      setAgentStatuses((prev) => ({
        ...prev,
        [agentId]: { agentId, status: "scraping", message: "Ajan başlatılıyor..." },
      }));
      await axios.post(
        `${API_URL}/api/agents/${agentId}/run`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Agent çalıştırılamadı:", err);
      Alert.alert("Hata", "Ajan çalıştırma işlemi başlatılamadı.");
      setAgentStatuses((prev) => {
        const updated = { ...prev };
        delete updated[agentId];
        return updated;
      });
    }
  };

  const getAgentReportCount = (agentId: string) => {
    return reports.filter((r) => {
      const id = typeof r.agent === "string" ? r.agent : r.agent?._id;
      return id === agentId;
    }).length;
  };

  const formatLastRun = (agentId: string) => {
    const agentReports = reports.filter((r) => {
      const id = typeof r.agent === "string" ? r.agent : r.agent?._id;
      return id === agentId;
    });

    if (agentReports.length === 0) return "Henüz çalışmadı";

    // Find latest
    const latest = agentReports.reduce((latest, r) =>
      new Date(r.createdAt) > new Date(latest.createdAt) ? r : latest
    );

    const date = new Date(latest.createdAt);
    return date.toLocaleDateString("tr-TR") + " " + date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  };

  const activeAgentsCount = agents.filter((a) => a.isActive).length;

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-6 pb-4 border-b border-slate-900 bg-slate-950/80">
        <View>
          <Text className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Hoş geldin</Text>
          <Text className="text-white text-xl font-bold">{user?.name} 👋</Text>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-slate-900 px-4 py-2 rounded-full border border-slate-800"
        >
          <Text className="text-red-400 text-xs font-semibold">Çıkış Yap</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {/* Statistics Cards */}
        <View className="flex-row justify-between mb-6">
          <View className="flex-1 bg-slate-900/50 p-4 rounded-2xl border border-slate-900 mr-2 items-center">
            <Text className="text-indigo-400 text-2xl font-black">{agents.length}</Text>
            <Text className="text-gray-400 text-[10px] uppercase font-semibold mt-1">Toplam Ajan</Text>
          </View>
          <View className="flex-1 bg-slate-900/50 p-4 rounded-2xl border border-slate-900 mx-1 items-center">
            <Text className="text-emerald-400 text-2xl font-black">{activeAgentsCount}</Text>
            <Text className="text-gray-400 text-[10px] uppercase font-semibold mt-1">Aktif Ajan</Text>
          </View>
          <View className="flex-1 bg-slate-900/50 p-4 rounded-2xl border border-slate-900 ml-2 items-center">
            <Text className="text-violet-400 text-2xl font-black">{reports.length}</Text>
            <Text className="text-gray-400 text-[10px] uppercase font-semibold mt-1">Rapor Arşivi</Text>
          </View>
        </View>

        {/* Section Title */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-lg font-bold">Takip Ajanlarım</Text>
          {refreshing ? (
            <ActivityIndicator size="small" color="#6366f1" />
          ) : (
            <TouchableOpacity onPress={fetchDashboardData}>
              <Text className="text-indigo-400 text-xs font-semibold">Yenile</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Agent Cards List */}
        {agents.length === 0 ? (
          <View className="bg-slate-900/30 border border-dashed border-slate-900 rounded-3xl p-8 items-center justify-center my-4">
            <Text className="text-gray-500 text-sm text-center">Henüz bir takip ajanı oluşturmadınız.</Text>
            <Text className="text-indigo-400/80 text-xs mt-2 font-medium">Web arayüzünden yeni ajanlar ekleyebilirsiniz.</Text>
          </View>
        ) : (
          agents.map((agent) => {
            const reportsCount = getAgentReportCount(agent._id);
            const lastRunStr = formatLastRun(agent._id);
            const liveStatus = agentStatuses[agent._id];
            const isRunning = liveStatus && liveStatus.status !== "done" && liveStatus.status !== "error" && liveStatus.status !== "failed";

            return (
              <View
                key={agent._id}
                style={{ opacity: agent.isActive ? 1 : 0.6 }}
                className={`bg-slate-900/60 border ${
                  isRunning ? "border-indigo-500/50 shadow-lg shadow-indigo-500/20" : "border-slate-900"
                } rounded-3xl p-5 mb-4 overflow-hidden`}
              >
                {/* Agent Header info */}
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 pr-4">
                    <Text className="text-white text-base font-bold tracking-tight">{agent.name}</Text>
                    {agent.description ? (
                      <Text className="text-gray-400 text-xs mt-1 leading-relaxed" numberOfLines={2}>
                        {agent.description}
                      </Text>
                    ) : null}
                  </View>
                  <View className="flex-row items-center">
                    <Switch
                      trackColor={{ false: "#1e293b", true: "#065f46" }}
                      thumbColor={agent.isActive ? "#10b981" : "#64748b"}
                      ios_backgroundColor="#1e293b"
                      onValueChange={() => handleToggleActive(agent._id)}
                      value={agent.isActive}
                    />
                  </View>
                </View>

                {/* Badge Topics */}
                <View className="flex-row flex-wrap gap-1.5 mb-4">
                  {agent.topics.map((topic, i) => (
                    <View key={i} className="bg-indigo-950/80 border border-indigo-900/50 px-2.5 py-1 rounded-full">
                      <Text className="text-indigo-300 text-[10px] font-semibold">{topic}</Text>
                    </View>
                  ))}
                </View>

                {/* Metadata & Actions */}
                <View className="flex-row justify-between items-center pt-3 border-t border-slate-900">
                  <View className="flex-1">
                    <Text className="text-gray-500 text-[10px] font-medium">📋 {reportsCount} Rapor · ⏰ {agent.scheduledHour ?? 7}:00</Text>
                    <Text className="text-gray-500 text-[10px] font-medium mt-0.5" numberOfLines={1}>
                      🕐 Son: {lastRunStr}
                    </Text>
                  </View>

                  <TouchableOpacity
                    disabled={isRunning || !agent.isActive}
                    onPress={() => handleRunAgent(agent._id)}
                    className={`${
                      isRunning
                        ? "bg-slate-800"
                        : agent.isActive
                        ? "bg-indigo-600 active:bg-indigo-700"
                        : "bg-slate-800"
                    } px-4 py-2.5 rounded-xl items-center flex-row`}
                  >
                    {isRunning ? (
                      <ActivityIndicator size="small" color="#6366f1" className="mr-1.5" />
                    ) : null}
                    <Text className={`text-xs font-semibold ${agent.isActive && !isRunning ? "text-white" : "text-gray-500"}`}>
                      {isRunning ? "Çalışıyor" : "▶ Çalıştır"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Live Socket Status Details */}
                {liveStatus ? (
                  <View className="mt-4 bg-indigo-950/40 border border-indigo-900/30 rounded-2xl p-3">
                    <Text className="text-indigo-300 text-xs font-bold">
                      {statusLabels[liveStatus.status] || "Ajan İşlemi"}
                    </Text>
                    {liveStatus.message ? (
                      <Text className="text-gray-400 text-[10px] mt-1 font-medium leading-relaxed">
                        {liveStatus.message}
                      </Text>
                    ) : null}
                  </View>
                ) : null}
              </View>
            );
          })
        )}
        {/* Extra space for scrolling */}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
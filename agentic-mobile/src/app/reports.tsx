import { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Linking, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";
import BottomNav from "../components/BottomNav";

interface ReportItem {
  title: string;
  source: string;
  link: string;
}

interface Report {
  _id: string;
  agent: string | { _id: string; name: string };
  dailySummary: string;
  feedback: "like" | "dislike" | null;
  items: ReportItem[];
  createdAt: string;
}

const cleanText = (text: string) => {
  if (!text) return "";
  return text.replace(/\*\*/g, "").replace(/\*/g, "").trim();
};

export default function ReportsScreen() {
  const { token } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  const fetchReports = async (showLoading = true) => {
    if (!token) return;
    if (showLoading) setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data);
    } catch (err) {
      console.error("Raporlar yüklenemedi:", err);
      Alert.alert("Hata", "Rapor arşivi yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleShareReport = async (agentName: string, summary: string) => {
    try {
      await Share.share({
        message: `🤖 Agentic AI - ${agentName} Rapor Özeti:\n\n${cleanText(summary)}`,
      });
    } catch (err) {
      console.error("Paylaşım hatası:", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [token]);

  const handleFeedback = async (reportId: string, currentFeedback: string | null, newFeedback: string) => {
    if (!token) return;
    const finalFeedback = currentFeedback === newFeedback ? null : newFeedback;
    try {
      const res = await axios.patch(
        `${API_URL}/api/reports/${reportId}/feedback`,
        { feedback: finalFeedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReports((prev) =>
        prev.map((r) => (r._id === reportId ? { ...r, feedback: res.data.feedback } : r))
      );
    } catch (err) {
      console.error("Geri bildirim kaydedilemedi:", err);
      Alert.alert("Hata", "Geri bildirim kaydedilemedi.");
    }
  };

  const handleOpenLink = (url: string) => {
    if (!url) return;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert("Hata", "Bu bağlantı açılamıyor.");
        }
      })
      .catch((err) => console.error("Link açma hatası:", err));
  };

  const renderReportCard = ({ item }: { item: Report }) => {
    const agentName = typeof item.agent === "string" ? "Ajan" : item.agent?.name || "Ajan";
    const isExpanded = expandedReportId === item._id;
    const date = new Date(item.createdAt);
    const dateStr = date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) + 
                    " " + date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

    return (
      <View className="bg-slate-900 border border-slate-900 rounded-3xl p-5 mb-4 overflow-hidden">
        {/* Card Header */}
        <TouchableOpacity
          onPress={() => setExpandedReportId(isExpanded ? null : item._id)}
          activeOpacity={0.7}
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-1 pr-2">
              <Text className="text-white text-base font-bold tracking-tight">{agentName}</Text>
              <Text className="text-gray-500 text-[10px] font-semibold mt-0.5">{dateStr}</Text>
            </View>
            <Text className="text-gray-400 text-xs">{isExpanded ? "▲ Kapat" : "▼ Oku"}</Text>
          </View>
        </TouchableOpacity>

        {/* Expanded Content */}
        {isExpanded ? (
          <View className="mt-4 pt-4 border-t border-slate-800">
            {/* Daily Summary */}
            <View className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-4">
              <Text className="text-indigo-400 text-xs font-bold mb-2">📋 Günlük Özet</Text>
              <Text className="text-gray-300 text-xs leading-relaxed">
                {cleanText(item.dailySummary)}
              </Text>
            </View>

            {/* Feedback & Share Buttons */}
            <View className="flex-row gap-2 mb-4">
              <TouchableOpacity
                onPress={() => handleFeedback(item._id, item.feedback, "like")}
                className={`flex-row items-center justify-center px-4 py-2 rounded-xl border ${
                  item.feedback === "like"
                    ? "bg-emerald-950 border-emerald-800"
                    : "bg-slate-950 border-slate-800"
                }`}
              >
                <Text className="text-xs mr-1">👍</Text>
                <Text className={`text-[10px] font-semibold ${item.feedback === "like" ? "text-emerald-400" : "text-gray-400"}`}>
                  Beğendim
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleFeedback(item._id, item.feedback, "dislike")}
                className={`flex-row items-center justify-center px-4 py-2 rounded-xl border ${
                  item.feedback === "dislike"
                    ? "bg-red-950 border-red-900"
                    : "bg-slate-950 border-slate-800"
                }`}
              >
                <Text className="text-xs mr-1">👎</Text>
                <Text className={`text-[10px] font-semibold ${item.feedback === "dislike" ? "text-red-400" : "text-gray-400"}`}>
                  Beğenmedim
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleShareReport(agentName, item.dailySummary)}
                className="flex-row items-center justify-center px-4 py-2 rounded-xl border bg-slate-950 border-slate-800"
              >
                <Text className="text-xs mr-1">📤</Text>
                <Text className="text-[10px] font-semibold text-indigo-400">
                  Paylaş
                </Text>
              </TouchableOpacity>
            </View>

            {/* Scraped Articles List */}
            {item.items && item.items.length > 0 ? (
              <View>
                <Text className="text-gray-400 text-xs font-bold mb-2.5">📰 Kaynak Haberler</Text>
                <View className="flex-col gap-2">
                  {item.items.map((newsItem, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleOpenLink(newsItem.link)}
                      className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex-row justify-between items-center"
                    >
                      <View className="flex-1 pr-3">
                        <Text className="text-white text-xs font-semibold leading-relaxed" numberOfLines={2}>
                          {newsItem.title}
                        </Text>
                        <Text className="text-gray-500 text-[10px] font-semibold mt-1">
                          {newsItem.source}
                        </Text>
                      </View>
                      <Text className="text-indigo-400 text-xs font-black">🔗</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        ) : (
          /* Preview of daily summary */
          <Text className="text-gray-400 text-xs mt-3 leading-relaxed" numberOfLines={2}>
            {cleanText(item.dailySummary)}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="flex-1 px-6 pt-6">
        <Text className="text-white text-2xl font-bold mb-1">Rapor Arşivi</Text>
        <Text className="text-gray-400 text-xs mb-5">
          Takip ajanlarınızın oluşturduğu günlük özet ve haber akışı arşivi.
        </Text>

        {loading && !refreshing ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        ) : (
          <FlatList
            data={reports}
            keyExtractor={(item) => item._id}
            renderItem={renderReportCard}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchReports(false);
            }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="bg-slate-900 border border-dashed border-slate-900 rounded-3xl p-8 items-center justify-center my-4">
                <Text className="text-gray-500 text-sm text-center">Henüz oluşturulmuş bir rapor bulunmuyor.</Text>
                <Text className="text-indigo-400/80 text-xs mt-2 font-medium">Ajanlarınızı çalıştırarak ilk raporları üretebilirsiniz.</Text>
              </View>
            }
          />
        )}
      </View>
      <BottomNav />
    </SafeAreaView>
  );
}

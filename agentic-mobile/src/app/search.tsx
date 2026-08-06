import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";
import BottomNav from "../components/BottomNav";

interface SearchResult {
  title: string;
  summary?: string;
  agentName: string;
  publishedAt: string;
  link: string;
  score: number;
}

export default function SearchScreen() {
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/reports/search`,
        { query },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResults(res.data.results || []);
    } catch (err: any) {
      console.error("Arama hatası:", err);
      Alert.alert("Hata", "Arama gerçekleştirilirken bir hata oluştu.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLink = (url: string) => {
    if (!url) return;
    Linking.openURL(url).catch((err) => console.error("Link açma hatası:", err));
  };

  const renderResultItem = ({ item }: { item: SearchResult }) => {
    const matchScore = Math.round(item.score * 100);
    const date = new Date(item.publishedAt);
    const dateStr = date.toLocaleDateString("tr-TR");

    return (
      <TouchableOpacity
        onPress={() => handleOpenLink(item.link)}
        activeOpacity={0.8}
        className="bg-slate-900 border border-slate-900 rounded-3xl p-5 mb-4"
      >
        <View className="flex-row justify-between items-start mb-2.5">
          <Text className="text-white text-sm font-bold flex-1 pr-3" numberOfLines={2}>
            {item.title}
          </Text>
          <View className="bg-indigo-950 border border-indigo-950 px-2 py-1 rounded-full">
            <Text className="text-indigo-400 text-[9px] font-black">%{matchScore} Eşleşme</Text>
          </View>
        </View>

        {item.summary ? (
          <Text className="text-gray-400 text-xs leading-relaxed mb-3" numberOfLines={3}>
            {item.summary}
          </Text>
        ) : null}

        <View className="flex-row justify-between items-center pt-3 border-t border-slate-950">
          <View className="flex-row gap-3">
            <Text className="text-gray-500 text-[10px] font-semibold">🤖 {item.agentName}</Text>
            <Text className="text-gray-500 text-[10px] font-semibold">📅 {dateStr}</Text>
          </View>
          <Text className="text-indigo-400 text-xs font-black">Oku 🔗</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="flex-1 px-6 pt-6">
        <Text className="text-white text-2xl font-bold mb-1">🔍 Akıllı Arama</Text>
        <Text className="text-gray-400 text-xs mb-6">
          Geçmiş raporlarınızda doğal dille arama yapın (RAG yapay zeka araması).
        </Text>

        {/* Search Input Bar */}
        <View className="flex-row bg-slate-900 border border-slate-900 rounded-2xl p-2 items-center mb-6">
          <TextInput
            placeholder="Ne aramak istiyorsunuz? (Örn: AI regülasyonu)"
            placeholderTextColor="#64748b"
            value={query}
            onChangeText={(text) => setQuery(text)}
            onSubmitEditing={handleSearch}
            className="flex-1 text-white px-3 py-2 text-sm"
          />
          <TouchableOpacity
            onPress={handleSearch}
            disabled={loading || !query.trim()}
            className="bg-indigo-600 active:bg-indigo-700 disabled:opacity-50 px-4 py-2.5 rounded-xl items-center justify-center"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-xs">Ara</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Results list */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderResultItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              searched ? (
                <View className="bg-slate-900 border border-dashed border-slate-900 rounded-3xl p-8 items-center justify-center my-4">
                  <Text className="text-gray-500 text-sm text-center">Herhangi bir eşleşen sonuç bulunamadı.</Text>
                  <Text className="text-gray-500 text-xs mt-1 text-center">Farklı anahtar kelimelerle arama yapmayı deneyin.</Text>
                </View>
              ) : (
                <View className="bg-slate-900/30 border border-dashed border-slate-900 rounded-3xl p-8 items-center justify-center my-4">
                  <Text className="text-gray-500 text-sm text-center">Doğal dille sormak istediğiniz konuyu yazın.</Text>
                  <Text className="text-indigo-400/80 text-xs mt-2 font-medium">Örn: "Döviz kurları hakkında en son ne özetlendi?"</Text>
                </View>
              )
            }
          />
        )}
      </View>
      <BottomNav />
    </SafeAreaView>
  );
}

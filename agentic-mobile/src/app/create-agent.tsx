import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";
import BottomNav from "../components/BottomNav";

const EXAMPLES = [
  "Her gün yapay zeka haberlerini ve GitHub trend projelerini takip et, Türkçe özet çıkar",
  "Ekonomi ve döviz kurlarıyla ilgili gelişmeleri her sabah özetle",
  "Voleybol ve basketbol ile ilgili Türkiye gündemini takip et",
  "Deprem ve doğal afetlerle ilgili son dakika haberlerini izle",
];

export default function CreateAgentScreen() {
  const { token } = useAuth();
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState("");

  const handleEnhancePrompt = async () => {
    if (!userInput.trim()) {
      setError("Önce geliştirmek istediğiniz kısa bir fikir yazın.");
      return;
    }
    setError("");
    setEnhancing(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/agents/enhance-prompt`,
        { prompt: userInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserInput(res.data.enhancedPrompt);
    } catch (err: any) {
      console.error("AI prompt geliştirme hatası:", err);
      setError("AI zenginleştirme sırasında bir hata oluştu.");
    } finally {
      setEnhancing(false);
    }
  };

  const handleCreate = async () => {
    if (!userInput.trim()) {
      setError("Lütfen agent'ının ne yapmasını istediğini yazın.");
      return;
    }
    if (userInput.trim().length < 10) {
      setError("Biraz daha detay verir misin? En az 10 karakter gerekiyor.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/agents`,
        { userInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Başarılı", "AI Ajanınız başarıyla oluşturuldu!", [
        { text: "Tamam", onPress: () => router.replace("/dashboard") },
      ]);
    } catch (err: any) {
      console.error("Ajan oluşturma hatası:", err);
      setError(
        err.response?.data?.message ||
          "Ajan oluşturulurken bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
          <Text className="text-white text-2xl font-bold mb-1">Yeni Ajan Oluştur</Text>
          <Text className="text-gray-400 text-xs mb-6">
            Ajanınızın ne yapmasını istediğinizi doğal dille anlatın, gerisini yapay zeka halletsin.
          </Text>

          {/* Form Container */}
          <View className="bg-slate-900 border border-slate-900 rounded-3xl p-5 mb-6">
            <TextInput
              multiline
              numberOfLines={5}
              value={userInput}
              onChangeText={(text) => {
                setUserInput(text);
                if (error) setError("");
              }}
              placeholder="Örn: Her gün yapay zeka gelişmelerini takip edip bana özetle."
              placeholderTextColor="#64748b"
              style={{ textAlignVertical: "top" }}
              className={`w-full bg-slate-950 text-white p-4 rounded-2xl min-h-[120px] text-sm leading-relaxed border ${
                error ? "border-red-500" : "border-slate-800 focus:border-indigo-500"
              }`}
            />

            {error ? (
              <Text className="text-red-400 text-xs mt-2 font-semibold">⚠️ {error}</Text>
            ) : null}

            <TouchableOpacity
              onPress={handleEnhancePrompt}
              disabled={enhancing || loading || !userInput.trim()}
              className="mt-3 w-full bg-slate-950 border border-slate-800 active:bg-slate-900 py-3 rounded-2xl items-center flex-row justify-center"
            >
              {enhancing ? (
                <ActivityIndicator size="small" color="#6366f1" className="mr-2" />
              ) : null}
              <Text className="text-indigo-400 font-bold text-xs">
                {enhancing ? "AI Zenginleştiriyor..." : "✨ AI Geliştir (Gelişmiş Prompt)"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCreate}
              disabled={loading || enhancing}
              className="mt-4 w-full bg-indigo-600 active:bg-indigo-700 disabled:opacity-50 py-3 rounded-2xl items-center flex-row justify-center"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
              ) : null}
              <Text className="text-white font-bold text-sm">
                {loading ? "AI Analiz Ediyor..." : "Ajan Oluştur"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Examples */}
          <Text className="text-gray-400 text-xs font-semibold mb-3">Fikir mi lazım? Birini seçin:</Text>
          <View className="flex-col gap-2 mb-8">
            {EXAMPLES.map((example, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  setUserInput(example);
                  setError("");
                }}
                className="bg-slate-900/60 border border-slate-900 active:bg-slate-900 rounded-2xl p-4"
              >
                <Text className="text-gray-300 text-xs leading-relaxed">{example}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {/* Reusable Bottom Navigation */}
      <BottomNav />
    </SafeAreaView>
  );
}

import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from "react-native";
import { router } from "expo-router";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";
import BottomNav from "../components/BottomNav";

interface Agent {
  _id: string;
  isActive: boolean;
}

interface Report {
  _id: string;
  feedback?: "like" | "dislike" | null;
}

export default function ProfileScreen() {
  const { user, token, logout, loading: authLoading } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [agentsRes, reportsRes] = await Promise.all([
        axios.get(`${API_URL}/api/agents`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/reports`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setAgents(agentsRes.data);
      setReports(reportsRes.data);
    } catch (err) {
      console.error("Profil verisi yüklenemedi:", err);
      Alert.alert("Hata", "Profil verileri yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }
    fetchProfileData();
  }, [token]);

  const handleLogout = () => {
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

  if (authLoading || (loading && agents.length === 0)) {
    return (
      <SafeAreaView className="flex-1 bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  const activeAgents = agents.filter((a) => a.isActive).length;
  const likedReports = reports.filter((r) => r.feedback === "like").length;

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text className="text-white text-2xl font-bold mb-6">Profil & Ayarlar</Text>

        {/* Profile Card */}
        <View className="bg-slate-900 border border-slate-900 rounded-3xl p-5 mb-6 items-center flex-row">
          <View className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center mr-4">
            <Text className="text-white text-xl font-black">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-white text-base font-bold">{user?.name}</Text>
            <Text className="text-gray-400 text-xs mt-0.5">{user?.email}</Text>
          </View>
        </View>

        {/* Statistics Grid */}
        <Text className="text-gray-400 text-xs font-semibold mb-3">Hesap Özetiniz</Text>
        <View className="flex-row justify-between mb-6">
          <View className="flex-1 bg-slate-900 border border-slate-900 p-4 rounded-2xl mr-2 items-center">
            <Text className="text-indigo-400 text-xl font-black">{agents.length}</Text>
            <Text className="text-gray-500 text-[9px] uppercase font-bold mt-1">Toplam Ajan</Text>
          </View>
          <View className="flex-1 bg-slate-900 border border-slate-900 p-4 rounded-2xl mx-1 items-center">
            <Text className="text-emerald-400 text-xl font-black">{activeAgents}</Text>
            <Text className="text-gray-500 text-[9px] uppercase font-bold mt-1">Aktif Ajan</Text>
          </View>
          <View className="flex-1 bg-slate-900 border border-slate-900 p-4 rounded-2xl ml-2 items-center">
            <Text className="text-violet-400 text-xl font-black">{likedReports}</Text>
            <Text className="text-gray-500 text-[9px] uppercase font-bold mt-1">Beğenilen</Text>
          </View>
        </View>

        {/* System Settings list */}
        <Text className="text-gray-400 text-xs font-semibold mb-3">Sistem Tercihleri</Text>
        <View className="bg-slate-900 border border-slate-900 rounded-3xl p-5 mb-10">
          <View className="flex-row justify-between items-center mb-5 pb-5 border-b border-slate-950">
            <View>
              <Text className="text-white text-sm font-semibold">Görünüm Teması</Text>
              <Text className="text-gray-500 text-[10px] mt-0.5">Sistem teması koyu mod olarak ayarlanmıştır.</Text>
            </View>
            <View className="bg-indigo-950 border border-indigo-900 px-3 py-1.5 rounded-xl">
              <Text className="text-indigo-300 text-xs font-bold">Koyu</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row justify-between items-center"
          >
            <View>
              <Text className="text-red-400 text-sm font-semibold">Oturumu Kapat</Text>
              <Text className="text-gray-500 text-[10px] mt-0.5">Güvenli bir şekilde hesabınızdan çıkış yapın.</Text>
            </View>
            <Text className="text-red-400 text-lg font-black">❯</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

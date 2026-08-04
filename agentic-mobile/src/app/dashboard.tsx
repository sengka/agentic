import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function DashboardScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <View className="flex-1 bg-gray-950 px-8 pt-16">
      <Text className="text-2xl font-bold text-white mb-1">Hoş geldin, {user?.name} 👋</Text>
      <Text className="text-gray-400 mb-8">Agent listesi yarın buraya gelecek.</Text>

      <TouchableOpacity onPress={handleLogout} className="bg-gray-800 py-3 rounded-xl items-center">
        <Text className="text-white">Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}
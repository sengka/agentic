import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { token, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      router.replace(token ? "/dashboard" : "/login");
    }
  }, [loading, token]);

  return (
    <View className="flex-1 bg-gray-950 items-center justify-center">
      <ActivityIndicator color="#6366f1" />
    </View>
  );
}
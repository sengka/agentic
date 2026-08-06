import { View, Text, TouchableOpacity } from "react-native";
import { router, usePathname } from "expo-router";

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { name: "Ajanlar", path: "/dashboard", icon: "🤖" },
    { name: "Yeni Ekle", path: "/create-agent", icon: "➕" },
    { name: "Raporlar", path: "/reports", icon: "📋" },
    { name: "Arama", path: "/search", icon: "🔍" },
  ];

  return (
    <View className="flex-row bg-slate-900 border-t border-slate-800 py-2.5 px-4 justify-around items-center">
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <TouchableOpacity
            key={tab.path}
            onPress={() => router.replace(tab.path as any)}
            className="items-center justify-center py-1 flex-1"
          >
            <Text className="text-lg mb-0.5">{tab.icon}</Text>
            <Text
              className={`text-[10px] font-bold tracking-tight ${
                isActive ? "text-indigo-400" : "text-gray-500"
              }`}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

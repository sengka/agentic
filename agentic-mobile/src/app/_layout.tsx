import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
// @ts-ignore
import "../global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
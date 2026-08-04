import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email ve şifre gerekli.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Giriş yapılırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-gray-950 justify-center px-8"
    >
      <Text className="text-3xl font-bold text-white mb-2">Agentic</Text>
      <Text className="text-gray-400 mb-8">Hesabına giriş yap</Text>

      <TextInput
        value={email}
        onChangeText={(t) => { setEmail(t); setError(""); }}
        placeholder="Email"
        placeholderTextColor="#6b7280"
        autoCapitalize="none"
        keyboardType="email-address"
        className="bg-gray-800 text-white px-4 py-3 rounded-xl mb-3"
      />
      <TextInput
        value={password}
        onChangeText={(t) => { setPassword(t); setError(""); }}
        placeholder="Şifre"
        placeholderTextColor="#6b7280"
        secureTextEntry
        className="bg-gray-800 text-white px-4 py-3 rounded-xl mb-3"
      />

      {error ? <Text className="text-red-400 text-sm mb-3">⚠️ {error}</Text> : null}

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        className="bg-indigo-600 py-3 rounded-xl items-center mb-4"
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Giriş Yap</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text className="text-gray-400 text-center">Hesabın yok mu? <Text className="text-indigo-400">Kayıt ol</Text></Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

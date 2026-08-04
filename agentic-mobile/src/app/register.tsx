import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Tüm alanları doldurun.");
      return;
    }
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Kayıt olurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-gray-950 justify-center px-8"
    >
      <Text className="text-3xl font-bold text-white mb-2">Hesap Oluştur</Text>
      <Text className="text-gray-400 mb-8">Agentic'e katıl</Text>

      <TextInput
        value={name}
        onChangeText={(t) => { setName(t); setError(""); }}
        placeholder="Ad Soyad"
        placeholderTextColor="#6b7280"
        className="bg-gray-800 text-white px-4 py-3 rounded-xl mb-3"
      />
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
        onPress={handleRegister}
        disabled={loading}
        className="bg-indigo-600 py-3 rounded-xl items-center mb-4"
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Kayıt Ol</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text className="text-gray-400 text-center">Zaten hesabın var mı? <Text className="text-indigo-400">Giriş yap</Text></Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
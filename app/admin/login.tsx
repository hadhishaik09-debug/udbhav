import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

export default function AdminLoginScreen() {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert("Missing Fields", "Please enter admin credentials.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace("/admin/dashboard");
    }, 1000);
  };

  return (
    <View style={[styles.container, { paddingBottom: Platform.OS === "web" ? 34 : 0 }]}>
      <LinearGradient
        colors={["#8B5CF6", "#6D28D9"]}
        style={[styles.headerGradient, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="shield-checkmark" size={44} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <Text style={styles.headerSubtitle}>Restricted access — Authorized personnel only</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.warningCard}>
          <Ionicons name="warning-outline" size={18} color={Colors.amber} />
          <Text style={styles.warningText}>This section is restricted to Aushadhara platform administrators only.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Admin Username</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter admin username"
              placeholderTextColor={Colors.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter admin password"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient colors={["#8B5CF6", "#6D28D9"]} style={styles.loginBtnGradient}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
              <Text style={styles.loginBtnText}>{loading ? "Authenticating..." : "Access Admin Panel"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.demoHint}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.demoText}>Demo: Any credentials will work</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerGradient: { paddingBottom: 36, paddingHorizontal: 20 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerContent: { alignItems: "center", marginTop: 12, gap: 8 },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#fff" },
  headerSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", textAlign: "center" },
  scrollView: { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  warningCard: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: Colors.amberLight,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.amber + "44",
  },
  warningText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, lineHeight: 19 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary, marginBottom: 8 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: Colors.background,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.textPrimary },
  eyeBtn: { padding: 4 },
  loginBtn: { marginTop: 24, borderRadius: 14, overflow: "hidden" },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnGradient: { height: 54, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  loginBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  demoHint: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  demoText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
});

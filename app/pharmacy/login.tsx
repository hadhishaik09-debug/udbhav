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

export default function PharmacyLoginScreen() {
  const insets = useSafeAreaInsets();
  const [licenseNo, setLicenseNo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!licenseNo || !password) {
      Alert.alert("Missing Fields", "Please enter your credentials.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace("/pharmacy/dashboard");
    }, 1000);
  };

  return (
    <View style={[styles.container, { paddingBottom: Platform.OS === "web" ? 34 : 0 }]}>
      <LinearGradient
        colors={["#10B981", "#059669"]}
        style={[styles.headerGradient, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="storefront" size={44} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Pharmacy Login</Text>
          <Text style={styles.headerSubtitle}>Manage your pharmacy dashboard</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.label}>License Number</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="document-text-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Your pharmacy license no."
              placeholderTextColor={Colors.textMuted}
              value={licenseNo}
              onChangeText={setLicenseNo}
            />
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter password"
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
            <LinearGradient colors={["#10B981", "#059669"]} style={styles.loginBtnGradient}>
              <Ionicons name="log-in-outline" size={20} color="#fff" />
              <Text style={styles.loginBtnText}>{loading ? "Signing in..." : "Sign In"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => router.push("/pharmacy/register")}
        >
          <View style={styles.registerCard}>
            <Ionicons name="storefront-outline" size={22} color={Colors.emerald} />
            <View>
              <Text style={styles.registerTitle}>New Pharmacy?</Text>
              <Text style={styles.registerSubtitle}>Register your pharmacy on Aushadhara</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.emerald} />
          </View>
        </TouchableOpacity>

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
  headerSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  scrollView: { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
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
  registerLink: { marginTop: 4 },
  registerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.emeraldLight,
  },
  registerTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.textPrimary },
  registerSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  demoHint: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  demoText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
});

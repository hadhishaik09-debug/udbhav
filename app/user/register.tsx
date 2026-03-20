import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useApp } from "@/context/AppContext";

export default function UserRegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register: appRegister, sendOtp: appSendOtp } = useApp();
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otpCode: "",
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSendOtp = async () => {
    if (!form.email || !form.email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    setOtpLoading(true);
    const result = await appSendOtp(form.email);
    setOtpLoading(false);
    
    if (result.success) {
      setOtpSent(true);
      setCountdown(60);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Real-Time Update", result.intimation || "We have sent a 6-digit OTP code to your inbox.");
    } else {
      Alert.alert("System Update", result.intimation || "Failed to send OTP. This email may already be registered.");
    }
  };

  const handleRegister = async () => {
    const { name, email, password, confirmPassword, otpCode } = form;

    if (!name || !email || !password || !confirmPassword || !otpCode) {
      Alert.alert("Required Fields", "Please fill in all mandatory fields including the OTP.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    const result = await appRegister(name, email, password, otpCode);
    setLoading(false);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Verification Successful!",
        result.message || "Your account has been successfully created. Welcome to Aushadhara!",
        [{ text: "OK", onPress: () => router.replace("/user/login") }]
      );
    } else {
      Alert.alert("Verification Error", result.message || "Invalid or expired OTP. Please request a new one.");
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: Platform.OS === "web" ? 34 : 0 }]}>
      <LinearGradient
        colors={["#1A73E8", "#0D47A1"]}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="mail-unread" size={40} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Email Verification</Text>
          <Text style={styles.headerSubtitle}>Proving real-time ownership</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="e.g. Rahul Sharma" placeholderTextColor={Colors.textMuted} value={form.name} onChangeText={(v) => update("name", v)} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="rahul@example.com" placeholderTextColor={Colors.textMuted} value={form.email} onChangeText={(v) => update("email", v)} keyboardType="email-address" autoCapitalize="none" editable={!otpSent} />
                {!otpSent ? (
                  <TouchableOpacity onPress={handleSendOtp} disabled={otpLoading} style={styles.verifyBtn}>
                    <Text style={styles.verifyBtnText}>{otpLoading ? "..." : "SEND OTP"}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => setOtpSent(false)} style={styles.changeEmail}>
                    <Ionicons name="create-outline" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {otpSent && (
              <View style={styles.formGroup}>
                <View style={styles.otpHeader}>
                  <Text style={styles.label}>OTP Verification Code</Text>
                  {countdown > 0 ? (
                    <Text style={styles.resendTimer}>Resend in {countdown}s</Text>
                  ) : (
                    <TouchableOpacity onPress={handleSendOtp}>
                      <Text style={styles.resendLink}>Resend OTP</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={[styles.inputContainer, styles.otpContainer]}>
                  <Ionicons name="keypad-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
                  <TextInput style={[styles.input, styles.otpInput]} placeholder="000000" placeholderTextColor={Colors.textMuted} value={form.otpCode} onChangeText={(v) => update("otpCode", v)} keyboardType="numeric" maxLength={6} />
                </View>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Create password" placeholderTextColor={Colors.textMuted} value={form.password} onChangeText={(v) => update("password", v)} secureTextEntry={!showPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="shield-checkmark-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Repeat password" placeholderTextColor={Colors.textMuted} value={form.confirmPassword} onChangeText={(v) => update("confirmPassword", v)} secureTextEntry={!showPassword} />
              </View>
            </View>
          </View>

          <TouchableOpacity style={[styles.submitBtn, (!otpSent || loading) && styles.submitBtnDisabled]} onPress={handleRegister} disabled={!otpSent || loading}>
            <LinearGradient colors={["#10B981", "#059669"]} style={styles.submitGradient}>
              {loading ? (
                <Text style={styles.submitText}>Verifying Code...</Text>
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
                  <Text style={styles.submitText}>Verify & Create Account</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
            <Text style={styles.loginLinkText}>Already part of our journey? Sign In</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 32 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerContent: { alignItems: "center", gap: 6, marginTop: 4 },
  headerIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_800ExtraBold", color: "#fff" },
  headerSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  scrollView: { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  card: { backgroundColor: Colors.white, borderRadius: 24, padding: 24, gap: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 15, elevation: 4 },
  formGroup: { gap: 8 },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary },
  inputContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, height: 52, backgroundColor: Colors.background },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.textPrimary },
  verifyBtn: { backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  verifyBtnText: { color: "#fff", fontSize: 10, fontFamily: "Inter_800ExtraBold" },
  changeEmail: { padding: 4 },
  eyeBtn: { padding: 10 },
  otpHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  otpContainer: { borderColor: Colors.primary, backgroundColor: "#F0F9FF" },
  otpInput: { fontFamily: "Inter_700Bold", letterSpacing: 6, textAlign: "center", color: Colors.primary },
  resendTimer: { fontSize: 12, color: Colors.textMuted },
  resendLink: { fontSize: 12, color: Colors.primary, fontFamily: "Inter_700Bold" },
  submitBtn: { borderRadius: 16, overflow: "hidden", marginTop: 8 },
  submitBtnDisabled: { opacity: 0.5 },
  submitGradient: { height: 58, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  submitText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  loginLink: { alignItems: "center", paddingVertical: 10 },
  loginLinkText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.primary },
});

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useApp } from "@/context/AppContext";

export default function UserLoginScreen() {
  const insets = useSafeAreaInsets();
  const { login: appLogin, loginWithOtp: appLoginWithOtp, requestLoginOtp, requestForgotOtp, resetPassword } = useApp();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");
  const [otpSent, setOtpSent] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot Password States
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleLogin = async () => {
    if (!email) {
      Alert.alert("Input Required", "Enter your email address first.");
      return;
    }

    setLoading(true);
    if (loginMode === "password") {
      const result = await appLogin(email, password);
      setLoading(false);
      if (result.success) {
        router.replace("/user/dashboard");
      } else {
        if (result.status === 404) {
          Alert.alert("Real-Time Check", result.intimation || "Account not found.", [
            { text: "Cancel" },
            { text: "Go to Sign-Up", onPress: () => router.push("/user/register") }
          ]);
        } else {
          Alert.alert("Login Error", result.message || "Invalid credentials.");
        }
      }
    } else {
      if (!otpSent) {
        const result = await requestLoginOtp(email);
        setLoading(false);
        if (result.success) {
          setOtpSent(true);
          Alert.alert("System Intimation", result.intimation || "A secure login code has been sent.");
        } else {
          Alert.alert("Verification Error", result.intimation || "Failed to send OTP.");
        }
      } else {
        const result = await appLoginWithOtp(email, otpCode);
        setLoading(false);
        if (result.success) {
          router.replace("/user/dashboard");
        } else {
          Alert.alert("Failed", result.message || "Invalid OTP code.");
        }
      }
    }
  };

  const handleForgotRequest = async () => {
    if (!forgotEmail) {
      Alert.alert("Required", "Please enter your email.");
      return;
    }
    setLoading(true);
    const result = await requestForgotOtp(forgotEmail);
    setLoading(false);
    if (result.success) {
      setForgotStep(2);
      Alert.alert("Intimation", result.intimation || "Check your mail for the reset code.");
    } else {
      Alert.alert("Account Check", result.intimation || "This email is not registered.");
    }
  };

  const handleReset = async () => {
    if (!forgotOtp || !newPassword) {
      Alert.alert("Required", "Complete all fields.");
      return;
    }
    setLoading(true);
    const result = await resetPassword(forgotEmail, forgotOtp, newPassword);
    setLoading(false);
    if (result.success) {
      Alert.alert("Success", "Your password has been reset! Please sign in again.", [
        { text: "OK", onPress: () => { setForgotModal(false); setForgotStep(1); } }
      ]);
    } else {
      Alert.alert("Failed", result.message || "Invalid reset code.");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === "web" ? 67 : 0, paddingBottom: Platform.OS === "web" ? 34 : 0 }]}>
      <LinearGradient colors={["#1A73E8", "#0D47A1"]} style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name={loginMode === "otp" ? "lock-open" : "shield-checkmark"} size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>{loginMode === "otp" ? "Express Login" : "Secure Login"}</Text>
          <Text style={styles.headerSubtitle}>Real-time account validation</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.modeTabs}>
            <TouchableOpacity 
              style={[styles.modeTab, loginMode === "password" && styles.modeTabActive]} 
              onPress={() => { setLoginMode("password"); setOtpSent(false); }}
            >
              <Text style={[styles.modeTabText, loginMode === "password" && styles.modeTabTextActive]}>PASSWORD</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modeTab, loginMode === "otp" && styles.modeTabActive]} 
              onPress={() => setLoginMode("otp")}
            >
              <Text style={[styles.modeTabText, loginMode === "otp" && styles.modeTabTextActive]}>OTP MAIL</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Registered Email</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Enter your email" placeholderTextColor={Colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!otpSent} />
          </View>

          {loginMode === "password" ? (
            <>
              <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="••••••••" placeholderTextColor={Colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </>
          ) : otpSent ? (
            <>
              <Text style={[styles.label, { marginTop: 16 }]}>Verfication Code</Text>
              <View style={[styles.inputContainer, { borderColor: Colors.primary }]}>
                <Ionicons name="keypad" size={20} color={Colors.primary} style={styles.inputIcon} />
                <TextInput style={[styles.input, { letterSpacing: 8, fontWeight: "bold", textAlign: "center" }]} placeholder="000000" value={otpCode} onChangeText={setOtpCode} keyboardType="numeric" maxLength={6} />
              </View>
            </>
          ) : null}

          <TouchableOpacity style={styles.forgotPassword} onPress={() => setForgotModal(true)}>
            <Text style={styles.forgotText}>Lost your password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.loginBtn, loading && styles.loginBtnDisabled]} onPress={handleLogin} disabled={loading}>
            <LinearGradient colors={["#1A73E8", "#0D47A1"]} style={styles.loginBtnGradient}>
              <Text style={styles.loginBtnText}>
                {loading ? "CHECKING SYSTEM..." : (loginMode === "otp" && !otpSent ? "SEND ACCESS OTP" : "LOGIN NOW")}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.registerBtn} onPress={() => router.push("/user/register")}>
          <Text style={styles.registerBtnText}>Join Aushadhara (Sign-Up)</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Forgot Password Modal */}
      <Modal visible={forgotModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Recover Account</Text>
              <TouchableOpacity onPress={() => setForgotModal(false)}>
                <Ionicons name="close-circle" size={28} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            {forgotStep === 1 ? (
              <View style={styles.modalBody}>
                <Text style={styles.modalSubtitle}>We will send a 5-minute reset code to your email.</Text>
                <TextInput style={styles.modalInput} placeholder="Registered Email" value={forgotEmail} onChangeText={setForgotEmail} autoCapitalize="none" />
                <TouchableOpacity style={styles.modalBtn} onPress={handleForgotRequest} disabled={loading}>
                  <Text style={styles.modalBtnText}>{loading ? "VERIFYING..." : "SEND VERIFICATION CODE"}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.modalBody}>
                <Text style={styles.modalSubtitle}>Proof ownership & set new password.</Text>
                <TextInput style={styles.modalInput} placeholder="6-Digit Code" value={forgotOtp} onChangeText={setForgotOtp} keyboardType="numeric" />
                <TextInput style={styles.modalInput} placeholder="Choose New Password" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
                <TouchableOpacity style={styles.modalBtn} onPress={handleReset} disabled={loading}>
                  <Text style={styles.modalBtnText}>{loading ? "UPDATING..." : "RESET PASSWORD NOW"}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerGradient: { paddingBottom: 36, paddingHorizontal: 20 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerContent: { alignItems: "center", marginTop: 12, gap: 8 },
  headerIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  headerSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  scrollView: { flex: 1 },
  formContainer: { padding: 20, gap: 16, paddingBottom: 40 },
  card: { backgroundColor: Colors.white, borderRadius: 20, padding: 24, elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10 },
  modeTabs: { flexDirection: "row", marginBottom: 20, backgroundColor: "#F1F5F9", borderRadius: 12, padding: 4 },
  modeTab: { flex: 1, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  modeTabActive: { backgroundColor: Colors.white, elevation: 3 },
  modeTabText: { fontSize: 12, fontFamily: "Inter_800ExtraBold", color: "#64748B" },
  modeTabTextActive: { color: Colors.primary },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary, marginBottom: 8 },
  inputContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 14, paddingHorizontal: 14, height: 56, backgroundColor: Colors.white },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: "#1E293B" },
  eyeBtn: { padding: 4 },
  forgotPassword: { alignSelf: "flex-end", marginTop: 14, marginBottom: 8 },
  forgotText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.primary },
  loginBtn: { marginTop: 10, borderRadius: 16, overflow: "hidden" },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnGradient: { height: 58, alignItems: "center", justifyContent: "center" },
  loginBtnText: { fontSize: 16, fontFamily: "Inter_800ExtraBold", color: "#FFFFFF" },
  registerBtn: { height: 58, borderRadius: 16, borderWidth: 2, borderColor: Colors.primary, alignItems: "center", justifyContent: "center", marginTop: 12 },
  registerBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.primary },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "#fff", borderRadius: 24, padding: 24 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_800ExtraBold" },
  modalSubtitle: { fontSize: 14, color: "#64748B", marginBottom: 15, lineHeight: 20 },
  modalBody: { gap: 14 },
  modalInput: { height: 54, borderWidth: 2, borderColor: "#E2E8F0", borderRadius: 14, paddingHorizontal: 16, fontSize: 15, fontFamily: "Inter_500Medium" },
  modalBtn: { height: 56, backgroundColor: Colors.primary, borderRadius: 16, alignItems: "center", justifyContent: "center", marginTop: 10 },
  modalBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_800ExtraBold" },
});

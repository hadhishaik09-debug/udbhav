import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

export default function PharmacyRegisterScreen() {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({
    pharmacyName: "",
    ownerName: "",
    address: "",
    contact: "",
    licenseNumber: "",
  });
  const [licenseUploaded, setLicenseUploaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleRegister = () => {
    if (!form.pharmacyName || !form.ownerName || !form.address || !form.contact || !form.licenseNumber) {
      Alert.alert("Incomplete Form", "Please fill in all required fields.");
      return;
    }
    if (!licenseUploaded) {
      Alert.alert("License Required", "Please upload your pharmacy license.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace("/pharmacy/pending");
    }, 1200);
  };

  const fields: Array<{ key: keyof typeof form; label: string; placeholder: string; icon: string; keyboard?: "default" | "phone-pad" }> = [
    { key: "pharmacyName", label: "Pharmacy Name", placeholder: "e.g. LifeCare Pharmacy", icon: "storefront-outline" },
    { key: "ownerName", label: "Owner Name", placeholder: "Full name of owner", icon: "person-outline" },
    { key: "address", label: "Full Address", placeholder: "Shop no., Street, City, State", icon: "location-outline" },
    { key: "contact", label: "Contact Number", placeholder: "+91 XXXXX XXXXX", icon: "call-outline", keyboard: "phone-pad" },
    { key: "licenseNumber", label: "License Number", placeholder: "Pharmacy license registration no.", icon: "document-text-outline" },
  ];

  return (
    <View style={[styles.container, { paddingBottom: Platform.OS === "web" ? 34 : 0 }]}>
      <LinearGradient
        colors={["#10B981", "#059669"]}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="storefront" size={44} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Pharmacy Registration</Text>
          <Text style={styles.headerSubtitle}>Register to join our healthcare network</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {fields.map((field) => (
            <View key={field.key} style={styles.formGroup}>
              <Text style={styles.label}>{field.label}</Text>
              <View style={styles.inputContainer}>
                <Ionicons name={field.icon as any} size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  placeholderTextColor={Colors.textMuted}
                  value={form[field.key]}
                  onChangeText={(v) => update(field.key, v)}
                  keyboardType={field.keyboard || "default"}
                />
              </View>
            </View>
          ))}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Pharmacy License Image</Text>
            <TouchableOpacity
              style={[styles.uploadArea, licenseUploaded && styles.uploadAreaSuccess]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setLicenseUploaded(true);
              }}
            >
              <Ionicons
                name={licenseUploaded ? "checkmark-circle" : "cloud-upload-outline"}
                size={36}
                color={licenseUploaded ? Colors.emerald : Colors.textMuted}
              />
              <Text style={[styles.uploadText, licenseUploaded && styles.uploadTextSuccess]}>
                {licenseUploaded ? "License Uploaded Successfully" : "Tap to upload license image"}
              </Text>
              <Text style={styles.uploadSubtext}>JPG, PNG, or PDF accepted</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
          <Text style={styles.infoText}>
            Your registration will be reviewed by our admin team. You&apos;ll be able to log in once your pharmacy is verified (typically within 24 hours).
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <LinearGradient colors={["#10B981", "#059669"]} style={styles.submitGradient}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.submitText}>{loading ? "Submitting..." : "Submit Registration"}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLink} onPress={() => router.push("/pharmacy/login")}>
          <Text style={styles.loginLinkText}>Already registered? Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 28 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerContent: { alignItems: "center", gap: 8, marginTop: 8 },
  headerIcon: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  headerSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  scrollView: { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  formGroup: { gap: 8 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    backgroundColor: Colors.background,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.background,
  },
  uploadAreaSuccess: { borderColor: Colors.emerald, backgroundColor: Colors.emeraldLight },
  uploadText: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.textMuted, textAlign: "center" },
  uploadTextSuccess: { color: Colors.emerald, fontFamily: "Inter_600SemiBold" },
  uploadSubtext: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  infoCard: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    padding: 14,
  },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, lineHeight: 19 },
  submitBtn: { borderRadius: 16, overflow: "hidden" },
  submitBtnDisabled: { opacity: 0.7 },
  submitGradient: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  submitText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  loginLink: { alignItems: "center", paddingVertical: 8 },
  loginLinkText: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.primary },
});

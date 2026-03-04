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

type VehicleType = "bicycle" | "motorcycle" | "scooter" | "car";

const vehicleOptions: Array<{ key: VehicleType; label: string; icon: string }> = [
  { key: "bicycle", label: "Bicycle", icon: "bicycle-outline" },
  { key: "motorcycle", label: "Motorcycle", icon: "speedometer-outline" },
  { key: "scooter", label: "Scooter", icon: "speedometer-outline" },
  { key: "car", label: "Car", icon: "car-outline" },
];

export default function DeliveryRegisterScreen() {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({ name: "", phone: "", vehicleNumber: "" });
  const [vehicleType, setVehicleType] = useState<VehicleType>("motorcycle");
  const [idUploaded, setIdUploaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleRegister = () => {
    if (!form.name || !form.phone || !form.vehicleNumber) {
      Alert.alert("Incomplete Form", "Please fill in all required fields.");
      return;
    }
    if (!idUploaded) {
      Alert.alert("ID Required", "Please upload your ID proof.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace("/delivery/pending");
    }, 1200);
  };

  return (
    <View style={[styles.container, { paddingBottom: Platform.OS === "web" ? 34 : 0 }]}>
      <LinearGradient
        colors={["#F59E0B", "#D97706"]}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="bicycle" size={44} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Delivery Registration</Text>
          <Text style={styles.headerSubtitle}>Join our delivery network</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {[
            { key: "name" as const, label: "Full Name", placeholder: "Your full name", icon: "person-outline" },
            { key: "phone" as const, label: "Phone Number", placeholder: "+91 XXXXX XXXXX", icon: "call-outline" },
            { key: "vehicleNumber" as const, label: "Vehicle Number", placeholder: "e.g. KA 01 AB 1234", icon: "car-outline" },
          ].map((field) => (
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
                />
              </View>
            </View>
          ))}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Vehicle Type</Text>
            <View style={styles.vehicleOptions}>
              {vehicleOptions.map((v) => (
                <TouchableOpacity
                  key={v.key}
                  style={[styles.vehicleOption, vehicleType === v.key && styles.vehicleOptionActive]}
                  onPress={() => setVehicleType(v.key)}
                >
                  <Ionicons name={v.icon as any} size={20} color={vehicleType === v.key ? Colors.amber : Colors.textMuted} />
                  <Text style={[styles.vehicleOptionText, vehicleType === v.key && styles.vehicleOptionTextActive]}>
                    {v.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>ID Proof</Text>
            <TouchableOpacity
              style={[styles.uploadArea, idUploaded && styles.uploadAreaSuccess]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIdUploaded(true); }}
            >
              <Ionicons
                name={idUploaded ? "checkmark-circle" : "cloud-upload-outline"}
                size={36}
                color={idUploaded ? Colors.emerald : Colors.textMuted}
              />
              <Text style={[styles.uploadText, idUploaded && styles.uploadTextSuccess]}>
                {idUploaded ? "ID Uploaded Successfully" : "Tap to upload Aadhaar / PAN / DL"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
          <Text style={styles.infoText}>
            Your registration will be reviewed by admin. You can start delivering once your account is approved.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <LinearGradient colors={["#F59E0B", "#D97706"]} style={styles.submitGradient}>
            <Text style={styles.submitText}>{loading ? "Submitting..." : "Submit Registration"}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLink} onPress={() => router.push("/delivery/login")}>
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
  input: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textPrimary },
  vehicleOptions: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  vehicleOption: {
    flex: 1,
    minWidth: "45%",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    gap: 6,
  },
  vehicleOptionActive: { borderColor: Colors.amber, backgroundColor: Colors.amberLight },
  vehicleOptionText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  vehicleOptionTextActive: { color: Colors.amber, fontFamily: "Inter_700Bold" },
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
  uploadText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textMuted, textAlign: "center" },
  uploadTextSuccess: { color: Colors.emerald, fontFamily: "Inter_600SemiBold" },
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
  submitGradient: { height: 56, alignItems: "center", justifyContent: "center" },
  submitText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  loginLink: { alignItems: "center", paddingVertical: 8 },
  loginLinkText: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.primary },
});

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const steps = [
  { label: "Registration Submitted", done: true, icon: "checkmark-circle" },
  { label: "Documents Under Review", done: true, icon: "document-text" },
  { label: "Admin Verification", done: false, icon: "shield-checkmark" },
  { label: "Account Activated", done: false, icon: "storefront" },
];

export default function PharmacyPendingScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0), paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.illustrationContainer}>
          <LinearGradient
            colors={["#FEF3C7", "#FDE68A"]}
            style={styles.illustration}
          >
            <Ionicons name="hourglass-outline" size={60} color={Colors.amber} />
          </LinearGradient>
        </View>

        <Text style={styles.title}>Verification Pending</Text>
        <Text style={styles.subtitle}>
          Your pharmacy registration has been submitted successfully. Our admin team is reviewing your documents.
        </Text>

        <View style={styles.statusCard}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Under Review</Text>
          </View>
          <Text style={styles.statusNote}>Typically takes 24-48 hours</Text>
        </View>

        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>Verification Progress</Text>
          {steps.map((step, index) => (
            <View key={step.label} style={styles.stepRow}>
              <View style={styles.stepLeft}>
                <View style={[styles.stepIcon, step.done && styles.stepIconDone]}>
                  <Ionicons
                    name={step.done ? "checkmark" : (step.icon as any)}
                    size={14}
                    color={step.done ? "#fff" : Colors.textMuted}
                  />
                </View>
                {index < steps.length - 1 && (
                  <View style={[styles.stepLine, step.done && styles.stepLineDone]} />
                )}
              </View>
              <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>
                {step.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="mail-outline" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            You will receive an email notification once your pharmacy account is approved. Please ensure your contact details are correct.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace("/role-select")}
        >
          <Ionicons name="arrow-back" size={18} color={Colors.textSecondary} />
          <Text style={styles.backBtnText}>Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/pharmacy/dashboard")} style={styles.skipBtn}>
          <Text style={styles.skipText}>Preview Dashboard (Demo)</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    padding: 24,
    alignItems: "center",
    gap: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  illustrationContainer: {
    marginTop: 20,
    marginBottom: 8,
  },
  illustration: {
    width: 130,
    height: 130,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: Colors.textPrimary, textAlign: "center" },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 23,
    paddingHorizontal: 10,
  },
  statusCard: {
    backgroundColor: Colors.amberLight,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    width: "100%",
    borderWidth: 1.5,
    borderColor: Colors.amber + "66",
  },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.amber },
  statusText: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.amber },
  statusNote: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  stepsCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    width: "100%",
    gap: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  stepsTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.textPrimary, marginBottom: 16 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  stepLeft: { alignItems: "center" },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepIconDone: { backgroundColor: Colors.emerald },
  stepLine: { width: 2, height: 28, backgroundColor: Colors.border },
  stepLineDone: { backgroundColor: Colors.emerald },
  stepLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textMuted, paddingTop: 6 },
  stepLabelDone: { color: Colors.textPrimary, fontFamily: "Inter_600SemiBold" },
  infoCard: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    padding: 14,
    width: "100%",
  },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, lineHeight: 19 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  backBtnText: { fontSize: 15, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  skipBtn: { paddingVertical: 8 },
  skipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.primary },
});

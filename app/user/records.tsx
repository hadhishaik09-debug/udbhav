import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

type Tab = "records" | "qr" | "history";

const MOCK_RECORDS = [
  { id: "1", name: "Blood Test Report", date: "Mar 12, 2026", type: "PDF", size: "1.2 MB" },
  { id: "2", name: "Vaccination Certificate", date: "Jan 05, 2026", type: "Image", size: "850 KB" },
  { id: "3", name: "Cardiology Clearance", date: "Dec 20, 2025", type: "PDF", size: "2.1 MB" },
];

const MOCK_HISTORY = [
  { id: "h1", recipient: "MedPlus Pharmacy", status: "Active", expires: "2h 15m left", accessedAt: "10 mins ago" },
  { id: "h2", recipient: "Dr. Aditya (City Hosp)", status: "Active", expires: "14h 30m left", accessedAt: "Never" },
  { id: "h3", recipient: "Apollo Labs", status: "Expired", expires: "Expired", accessedAt: "Yesterday" },
];

export default function HealthRecords() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>("records");
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  const toggleDocSelection = (id: string) => {
    Haptics.selectionAsync();
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const renderRecords = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Documents</Text>
        <TouchableOpacity style={styles.uploadBtn}>
          <Ionicons name="cloud-upload" size={18} color={Colors.primary} />
          <Text style={styles.uploadText}>Upload</Text>
        </TouchableOpacity>
      </View>
      {MOCK_RECORDS.map((record) => (
        <TouchableOpacity
          key={record.id}
          style={[styles.recordCard, selectedDocs.includes(record.id) && styles.recordCardSelected]}
          onPress={() => toggleDocSelection(record.id)}
        >
          <View style={styles.recordIcon}>
            <Ionicons name={record.type === "PDF" ? "document-text" : "image"} size={24} color={Colors.primary} />
          </View>
          <View style={styles.recordInfo}>
            <Text style={styles.recordName}>{record.name}</Text>
            <Text style={styles.recordMeta}>{record.date} • {record.size}</Text>
          </View>
          <Ionicons
            name={selectedDocs.includes(record.id) ? "checkbox" : "square-outline"}
            size={22}
            color={selectedDocs.includes(record.id) ? Colors.primary : Colors.textMuted}
          />
        </TouchableOpacity>
      ))}
      
      {selectedDocs.length > 0 && (
        <TouchableOpacity style={styles.shareFab} onPress={() => setActiveTab("history")}>
          <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.fabGradient}>
            <Text style={styles.fabText}>Share {selectedDocs.length} Documents</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderQR = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Permanent Access QR</Text>
      <Text style={styles.sectionSubtitle}>Scan this QR to view your complete medical profile securely.</Text>
      
      <View style={styles.qrContainer}>
        <View style={styles.qrPlaceholder}>
          <Ionicons name="qr-code" size={160} color={Colors.textPrimary} />
          <View style={styles.qrLogoOverlay}>
            <Ionicons name="medical" size={24} color={Colors.primary} />
          </View>
        </View>
        <TouchableOpacity style={styles.regenerateBtn}>
          <Ionicons name="refresh" size={16} color={Colors.textSecondary} />
          <Text style={styles.regenerateText}>Regenerate Token</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.infoCard}>
        <Ionicons name="shield-checkmark" size={20} color={Colors.emerald} />
        <Text style={styles.infoText}>This QR is for your self-access. Keep it private unless sharing in person.</Text>
      </View>
    </View>
  );

  const renderHistory = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Share History & Tracking</Text>
      <Text style={styles.sectionSubtitle}>Monitor who has accessed your shared links and revoke access anytime.</Text>
      {MOCK_HISTORY.map((item) => (
        <View key={item.id} style={styles.historyCard}>
          <View style={styles.historyInfo}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyRecipient}>{item.recipient}</Text>
              <View style={[styles.statusBadge, item.status === "Expired" ? styles.statusExpired : styles.statusActive]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.trackingDetail}>
              <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.trackingText}>Expires: {item.expires}</Text>
            </View>
            <View style={styles.trackingDetail}>
              <Ionicons name="eye-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.trackingText}>Last Accessed: {item.accessedAt || "Never"}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.revokeBtn} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              // In real app: call /api/patient/share/revoke
            }}
          >
            <Ionicons name="close-circle" size={20} color={Colors.red} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#1A73E8", "#0D47A1"]} style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Health Records</Text>
          <TouchableOpacity style={styles.backBtn}>
            <Ionicons name="settings-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.tabBar}>
          {(["records", "qr", "history"] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, activeTab === t && styles.activeTab]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(t);
              }}
            >
              <Text style={[styles.tabLabel, activeTab === t && styles.activeTabLabel]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === "records" && renderRecords()}
        {activeTab === "qr" && renderQR()}
        {activeTab === "history" && renderHistory()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  tabBar: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  activeTab: { backgroundColor: "#fff" },
  tabLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.7)" },
  activeTabLabel: { color: Colors.primary, fontFamily: "Inter_700Bold" },
  content: { padding: 20, paddingBottom: 100 },
  section: { gap: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.textPrimary },
  sectionSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textSecondary, lineHeight: 20 },
  uploadBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: Colors.primaryLight, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  uploadText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.primary },
  recordCard: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "transparent", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, gap: 12 },
  recordCardSelected: { borderColor: Colors.primary, backgroundColor: "#F0F7FF" },
  recordIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: "center", justifyContent: "center" },
  recordInfo: { flex: 1 },
  recordName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary },
  recordMeta: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
  shareFab: { position: "absolute", bottom: -60, left: 0, right: 0, height: 56, borderRadius: 28, overflow: "hidden", shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  fabGradient: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  fabText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  qrContainer: { alignItems: "center", paddingVertical: 30, gap: 20 },
  qrPlaceholder: { backgroundColor: Colors.white, padding: 24, borderRadius: 32, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 12, position: "relative" },
  qrLogoOverlay: { position: "absolute", top: "50%", left: "50%", marginTop: -20, marginLeft: -20, backgroundColor: "#fff", padding: 8, borderRadius: 12 },
  regenerateBtn: { flexDirection: "row", alignItems: "center", gap: 6, padding: 10 },
  regenerateText: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  infoCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: Colors.emeraldLight, padding: 16, borderRadius: 16, marginTop: 10 },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: "#065F46", lineHeight: 18 },
  historyCard: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, padding: 16, borderRadius: 18, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  historyInfo: { flex: 1, gap: 8 },
  historyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  historyRecipient: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusActive: { backgroundColor: Colors.emeraldLight },
  statusExpired: { backgroundColor: Colors.redLight },
  statusText: { fontSize: 10, fontFamily: "Inter_700Bold", color: Colors.textPrimary, textTransform: "uppercase" },
  trackingDetail: { flexDirection: "row", alignItems: "center", gap: 6 },
  trackingText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  revokeBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
});

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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

type VerificationStatus = "pending" | "approved" | "rejected";

interface PharmacyRequest {
  id: string;
  name: string;
  owner: string;
  licenseNo: string;
  address: string;
  contact: string;
  status: VerificationStatus;
  submittedAt: string;
}

interface DeliveryRequest {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNo: string;
  status: VerificationStatus;
  submittedAt: string;
}

const mockPharmacies: PharmacyRequest[] = [
  { id: "PH001", name: "CityMed Pharmacy", owner: "Ramesh Gupta", licenseNo: "KA/PHR/2024/001", address: "12, Brigade Road, Bengaluru", contact: "+91-9876543210", status: "pending", submittedAt: "2 hours ago" },
  { id: "PH002", name: "HealthFirst Pharmacy", owner: "Meera Nair", licenseNo: "KA/PHR/2024/002", address: "45, Koramangala, Bengaluru", contact: "+91-9876543211", status: "pending", submittedAt: "4 hours ago" },
  { id: "PH003", name: "QuickMeds", owner: "Suresh Patil", licenseNo: "KA/PHR/2024/003", address: "78, JP Nagar, Bengaluru", contact: "+91-9876543212", status: "approved", submittedAt: "1 day ago" },
  { id: "PH004", name: "MedZone Pharmacy", owner: "Priya Rao", licenseNo: "KA/PHR/2024/004", address: "90, HSR Layout, Bengaluru", contact: "+91-9876543213", status: "rejected", submittedAt: "2 days ago" },
];

const mockDeliveries: DeliveryRequest[] = [
  { id: "DL001", name: "Arun Kumar", phone: "+91-9876543220", vehicleType: "Motorcycle", vehicleNo: "KA 01 AB 1234", status: "pending", submittedAt: "1 hour ago" },
  { id: "DL002", name: "Vijay Singh", phone: "+91-9876543221", vehicleType: "Bicycle", vehicleNo: "N/A", status: "pending", submittedAt: "3 hours ago" },
  { id: "DL003", name: "Ravi Sharma", phone: "+91-9876543222", vehicleType: "Scooter", vehicleNo: "KA 02 CD 5678", status: "approved", submittedAt: "1 day ago" },
];

type TabType = "pharmacies" | "deliveries";

const statusConfig: Record<VerificationStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: Colors.amberLight, text: Colors.amber, label: "Pending" },
  approved: { bg: Colors.emeraldLight, text: Colors.emerald, label: "Approved" },
  rejected: { bg: Colors.redLight, text: Colors.red, label: "Rejected" },
};

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("pharmacies");
  const [pharmacies, setPharmacies] = useState<PharmacyRequest[]>(mockPharmacies);
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>(mockDeliveries);

  const updatePharmacyStatus = (id: string, status: VerificationStatus) => {
    Haptics.notificationAsync(status === "approved" ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
    setPharmacies((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
  };

  const updateDeliveryStatus = (id: string, status: VerificationStatus) => {
    Haptics.notificationAsync(status === "approved" ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
    setDeliveries((prev) => prev.map((d) => d.id === id ? { ...d, status } : d));
  };

  const pendingPharmacies = pharmacies.filter((p) => p.status === "pending").length;
  const pendingDeliveries = deliveries.filter((d) => d.status === "pending").length;

  const stats = [
    { label: "Pending Pharmacies", value: String(pendingPharmacies), icon: "storefront-outline", color: Colors.amber },
    { label: "Pending Deliveries", value: String(pendingDeliveries), icon: "bicycle-outline", color: Colors.primary },
    { label: "Total Approved", value: String(pharmacies.filter((p) => p.status === "approved").length + deliveries.filter((d) => d.status === "approved").length), icon: "checkmark-circle-outline", color: Colors.emerald },
    { label: "Platform Users", value: "1.2K", icon: "people-outline", color: "#8B5CF6" },
  ];

  return (
    <View style={[styles.container, { paddingBottom: Platform.OS === "web" ? 34 : 0 }]}>
      <LinearGradient
        colors={["#8B5CF6", "#6D28D9"]}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Admin Dashboard</Text>
            <Text style={styles.adminName}>Aushadhara Admin</Text>
          </View>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#fff" />
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${s.color}33` }]}>
                <Ionicons name={s.icon as any} size={14} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel} numberOfLines={2}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.tabs}>
        {(["pharmacies", "deliveries"] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => { setActiveTab(tab); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <Ionicons
              name={tab === "pharmacies" ? "storefront-outline" : "bicycle-outline"}
              size={18}
              color={activeTab === tab ? "#8B5CF6" : Colors.textMuted}
            />
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === "pharmacies" ? "Pharmacies" : "Delivery Partners"}
            </Text>
            {(tab === "pharmacies" ? pendingPharmacies : pendingDeliveries) > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>
                  {tab === "pharmacies" ? pendingPharmacies : pendingDeliveries}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === "pharmacies" ? (
          <View style={styles.list}>
            {pharmacies.map((pharmacy) => {
              const cfg = statusConfig[pharmacy.status];
              return (
                <View key={pharmacy.id} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <View style={styles.requestHeaderLeft}>
                      <View style={styles.requestIcon}>
                        <Ionicons name="storefront-outline" size={20} color="#8B5CF6" />
                      </View>
                      <View>
                        <Text style={styles.requestName}>{pharmacy.name}</Text>
                        <Text style={styles.requestSub}>{pharmacy.owner}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
                    </View>
                  </View>

                  <View style={styles.requestDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="document-text-outline" size={13} color={Colors.textMuted} />
                      <Text style={styles.detailText}>{pharmacy.licenseNo}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
                      <Text style={styles.detailText} numberOfLines={1}>{pharmacy.address}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="call-outline" size={13} color={Colors.textMuted} />
                      <Text style={styles.detailText}>{pharmacy.contact}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
                      <Text style={styles.detailText}>Submitted {pharmacy.submittedAt}</Text>
                    </View>
                  </View>

                  {pharmacy.status === "pending" && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => updatePharmacyStatus(pharmacy.id, "rejected")}
                      >
                        <Ionicons name="close" size={16} color={Colors.red} />
                        <Text style={styles.rejectBtnText}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.approveBtn}
                        onPress={() => updatePharmacyStatus(pharmacy.id, "approved")}
                      >
                        <LinearGradient colors={["#8B5CF6", "#6D28D9"]} style={styles.approveGradient}>
                          <Ionicons name="checkmark" size={16} color="#fff" />
                          <Text style={styles.approveBtnText}>Approve</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.list}>
            {deliveries.map((delivery) => {
              const cfg = statusConfig[delivery.status];
              return (
                <View key={delivery.id} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <View style={styles.requestHeaderLeft}>
                      <View style={[styles.requestIcon, { backgroundColor: "#FEF3C7" }]}>
                        <Ionicons name="bicycle-outline" size={20} color={Colors.amber} />
                      </View>
                      <View>
                        <Text style={styles.requestName}>{delivery.name}</Text>
                        <Text style={styles.requestSub}>{delivery.phone}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
                    </View>
                  </View>

                  <View style={styles.requestDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="car-outline" size={13} color={Colors.textMuted} />
                      <Text style={styles.detailText}>{delivery.vehicleType} — {delivery.vehicleNo}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
                      <Text style={styles.detailText}>Submitted {delivery.submittedAt}</Text>
                    </View>
                  </View>

                  {delivery.status === "pending" && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => updateDeliveryStatus(delivery.id, "rejected")}
                      >
                        <Ionicons name="close" size={16} color={Colors.red} />
                        <Text style={styles.rejectBtnText}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.approveBtn}
                        onPress={() => updateDeliveryStatus(delivery.id, "approved")}
                      >
                        <LinearGradient colors={["#8B5CF6", "#6D28D9"]} style={styles.approveGradient}>
                          <Ionicons name="checkmark" size={16} color="#fff" />
                          <Text style={styles.approveBtnText}>Approve</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace("/role-select")}>
        <Ionicons name="log-out-outline" size={18} color={Colors.textSecondary} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  adminName: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff", marginTop: 2 },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  adminBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff" },
  statsGrid: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  statLabel: { fontSize: 9, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)", textAlign: "center" },
  tabs: { flexDirection: "row", padding: 12, gap: 10 },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  tabActive: { borderColor: "#8B5CF6", backgroundColor: "#EDE9FE" },
  tabText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  tabTextActive: { color: "#8B5CF6", fontFamily: "Inter_700Bold" },
  tabBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.red,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff" },
  scrollView: { flex: 1 },
  content: { padding: 12, paddingTop: 4, paddingBottom: 16 },
  list: { gap: 14 },
  requestCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  requestHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  requestHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  requestIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
  },
  requestName: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.textPrimary },
  requestSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  requestDetails: { gap: 6 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, flex: 1 },
  actionRow: { flexDirection: "row", gap: 10 },
  rejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.red,
    backgroundColor: Colors.redLight,
  },
  rejectBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.red },
  approveBtn: { flex: 2, borderRadius: 12, overflow: "hidden" },
  approveGradient: { height: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  approveBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    margin: 12,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  logoutText: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
});

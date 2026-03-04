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

type DeliveryStatus = "assigned" | "picked_up" | "out_for_delivery" | "delivered";

interface DeliveryOrder {
  id: string;
  customer: string;
  pharmacy: string;
  address: string;
  distance: string;
  items: number;
  earnings: number;
  status: DeliveryStatus;
  timeSlot: string;
}

const statusConfig: Record<DeliveryStatus, { label: string; bg: string; text: string; next?: string; nextLabel?: string }> = {
  assigned: { label: "Assigned", bg: Colors.primaryLight, text: Colors.primary, next: "picked_up", nextLabel: "Mark Picked Up" },
  picked_up: { label: "Picked Up", bg: Colors.amberLight, text: Colors.amber, next: "out_for_delivery", nextLabel: "Out for Delivery" },
  out_for_delivery: { label: "Out for Delivery", bg: "#EDE9FE", text: "#8B5CF6", next: "delivered", nextLabel: "Mark Delivered" },
  delivered: { label: "Delivered", bg: Colors.emeraldLight, text: Colors.emerald },
};

const mockDeliveries: DeliveryOrder[] = [
  {
    id: "DEL001",
    customer: "Priya Sharma",
    pharmacy: "LifeCare Pharmacy",
    address: "42, Indiranagar 1st Stage, Bengaluru",
    distance: "1.4 km",
    items: 3,
    earnings: 40,
    status: "assigned",
    timeSlot: "10:00–10:45 AM",
  },
  {
    id: "DEL002",
    customer: "Karan Mehta",
    pharmacy: "Apollo Pharmacy",
    address: "7, MG Road, Bengaluru",
    distance: "2.1 km",
    items: 1,
    earnings: 45,
    status: "picked_up",
    timeSlot: "11:00–11:45 AM",
  },
  {
    id: "DEL003",
    customer: "Anjali Singh",
    pharmacy: "MedPlus Pharmacy",
    address: "99, Koramangala 6th Block, Bengaluru",
    distance: "3.0 km",
    items: 5,
    earnings: 55,
    status: "delivered",
    timeSlot: "09:00–09:45 AM",
  },
];

export default function DeliveryDashboard() {
  const insets = useSafeAreaInsets();
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(mockDeliveries);
  const [isOnline, setIsOnline] = useState(true);

  const updateStatus = (id: string, newStatus: DeliveryStatus) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDeliveries((prev) => prev.map((d) => d.id === id ? { ...d, status: newStatus } : d));
  };

  const totalEarnings = deliveries.filter((d) => d.status === "delivered").reduce((sum, d) => sum + d.earnings, 0);
  const pendingCount = deliveries.filter((d) => d.status !== "delivered").length;

  return (
    <View style={[styles.container, { paddingBottom: Platform.OS === "web" ? 34 : 0 }]}>
      <LinearGradient
        colors={["#F59E0B", "#D97706"]}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Delivery Dashboard</Text>
            <Text style={styles.driverName}>Suresh Raju</Text>
          </View>
          <TouchableOpacity
            style={[styles.onlineToggle, !isOnline && styles.offlineToggle]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setIsOnline(!isOnline); }}
          >
            <View style={[styles.onlineDot, !isOnline && styles.offlineDot]} />
            <Text style={styles.onlineText}>{isOnline ? "Online" : "Offline"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="cube-outline" size={18} color={Colors.amber} />
            <Text style={styles.statValue}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={18} color={Colors.emerald} />
            <Text style={styles.statValue}>{deliveries.filter((d) => d.status === "delivered").length}</Text>
            <Text style={styles.statLabel}>Delivered</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cash-outline" size={18} color="#fff" />
            <Text style={styles.statValue}>₹{totalEarnings}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star-outline" size={18} color="#fff" />
            <Text style={styles.statValue}>4.7</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>My Deliveries</Text>

        {deliveries.map((delivery) => {
          const cfg = statusConfig[delivery.status];
          return (
            <View key={delivery.id} style={styles.deliveryCard}>
              <View style={styles.deliveryHeader}>
                <View>
                  <Text style={styles.deliveryId}>{delivery.id}</Text>
                  <Text style={styles.deliveryCustomer}>{delivery.customer}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                  <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
                </View>
              </View>

              <View style={styles.deliveryInfo}>
                <View style={styles.infoRow}>
                  <Ionicons name="storefront-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.infoText}>{delivery.pharmacy}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.infoText} numberOfLines={1}>{delivery.address}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.infoText}>{delivery.timeSlot}</Text>
                </View>
              </View>

              <View style={styles.deliveryMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="navigate-outline" size={12} color={Colors.textMuted} />
                  <Text style={styles.metaText}>{delivery.distance}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="cube-outline" size={12} color={Colors.textMuted} />
                  <Text style={styles.metaText}>{delivery.items} items</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="cash-outline" size={12} color={Colors.emerald} />
                  <Text style={[styles.metaText, { color: Colors.emerald, fontFamily: "Inter_700Bold" }]}>₹{delivery.earnings}</Text>
                </View>
              </View>

              {delivery.status !== "delivered" && cfg.next && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => updateStatus(delivery.id, cfg.next as DeliveryStatus)}
                >
                  <LinearGradient colors={["#F59E0B", "#D97706"]} style={styles.actionGradient}>
                    <Text style={styles.actionBtnText}>{cfg.nextLabel}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
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
  driverName: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff", marginTop: 2 },
  onlineToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  offlineToggle: { backgroundColor: "rgba(0,0,0,0.2)" },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.emerald },
  offlineDot: { backgroundColor: Colors.textMuted },
  onlineText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)", textAlign: "center" },
  scrollView: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.textPrimary },
  deliveryCard: {
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
  deliveryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  deliveryId: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  deliveryCustomer: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.textPrimary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  deliveryInfo: { gap: 6 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, flex: 1 },
  deliveryMeta: { flexDirection: "row", gap: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  actionBtn: { borderRadius: 12, overflow: "hidden" },
  actionGradient: { height: 44, alignItems: "center", justifyContent: "center" },
  actionBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
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

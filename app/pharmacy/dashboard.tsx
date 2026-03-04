import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

const mockOrders = [
  { id: "ORD001", customer: "Priya Sharma", items: 3, total: 184, status: "new", time: "5 min ago" },
  { id: "ORD002", customer: "Karan Mehta", items: 1, total: 98, status: "preparing", time: "18 min ago" },
  { id: "ORD003", customer: "Anjali Singh", items: 4, total: 312, status: "ready", time: "32 min ago" },
  { id: "ORD004", customer: "Rohit Kumar", items: 2, total: 145, status: "delivered", time: "1 hr ago" },
];

const mockInventory = [
  { name: "Paracetamol 500mg", stock: 245, unit: "Strips", status: "good" },
  { name: "Azithromycin 500mg", stock: 12, unit: "Strips", status: "low" },
  { name: "Pantoprazole 40mg", stock: 0, unit: "Strips", status: "out" },
  { name: "Metformin 500mg", stock: 89, unit: "Strips", status: "good" },
  { name: "Cetirizine 10mg", stock: 8, unit: "Strips", status: "low" },
];

const orderStatusColors: Record<string, { bg: string; text: string; label: string }> = {
  new: { bg: Colors.primaryLight, text: Colors.primary, label: "New Order" },
  preparing: { bg: Colors.amberLight, text: Colors.amber, label: "Preparing" },
  ready: { bg: Colors.emeraldLight, text: Colors.emerald, label: "Ready" },
  delivered: { bg: Colors.border, text: Colors.textMuted, label: "Delivered" },
};

const stockStatusColors: Record<string, { color: string; label: string }> = {
  good: { color: Colors.emerald, label: "In Stock" },
  low: { color: Colors.amber, label: "Low Stock" },
  out: { color: Colors.red, label: "Out of Stock" },
};

type TabType = "orders" | "inventory";

export default function PharmacyDashboard() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("orders");

  const stats = [
    { label: "Today's Orders", value: "8", icon: "cube-outline", color: Colors.primary },
    { label: "Revenue", value: "₹2.4K", icon: "cash-outline", color: Colors.emerald },
    { label: "Low Stock", value: "2", icon: "warning-outline", color: Colors.amber },
    { label: "Rating", value: "4.8", icon: "star-outline", color: "#F59E0B" },
  ];

  return (
    <View style={[styles.container, { paddingBottom: Platform.OS === "web" ? 34 : 0 }]}>
      <LinearGradient
        colors={["#10B981", "#059669"]}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Pharmacy Dashboard</Text>
            <Text style={styles.pharmName}>LifeCare Pharmacy</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#fff" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Ionicons name={s.icon as any} size={18} color={s.color} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.tabs}>
        {(["orders", "inventory"] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => { setActiveTab(tab); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <Ionicons
              name={tab === "orders" ? "cube-outline" : "list-outline"}
              size={18}
              color={activeTab === tab ? Colors.emerald : Colors.textMuted}
            />
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === "orders" ? "Orders" : "Inventory"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === "orders" ? (
          <View style={styles.list}>
            {mockOrders.map((order) => {
              const status = orderStatusColors[order.status];
              return (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={styles.orderId}>{order.id}</Text>
                      <Text style={styles.orderCustomer}>{order.customer}</Text>
                    </View>
                    <View style={[styles.orderStatusBadge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.orderStatusText, { color: status.text }]}>{status.label}</Text>
                    </View>
                  </View>
                  <View style={styles.orderMeta}>
                    <View style={styles.orderMetaItem}>
                      <Ionicons name="cube-outline" size={13} color={Colors.textMuted} />
                      <Text style={styles.orderMetaText}>{order.items} items</Text>
                    </View>
                    <View style={styles.orderMetaItem}>
                      <Ionicons name="cash-outline" size={13} color={Colors.textMuted} />
                      <Text style={styles.orderMetaText}>₹{order.total}</Text>
                    </View>
                    <View style={styles.orderMetaItem}>
                      <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
                      <Text style={styles.orderMetaText}>{order.time}</Text>
                    </View>
                  </View>
                  {order.status === "new" && (
                    <View style={styles.orderActions}>
                      <TouchableOpacity style={styles.rejectBtn}>
                        <Text style={styles.rejectBtnText}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.acceptBtn}>
                        <LinearGradient colors={["#10B981", "#059669"]} style={styles.acceptGradient}>
                          <Text style={styles.acceptBtnText}>Accept Order</Text>
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
            {mockInventory.map((item) => {
              const status = stockStatusColors[item.status];
              return (
                <View key={item.name} style={styles.inventoryCard}>
                  <View style={styles.inventoryIcon}>
                    <Ionicons name="medical" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.inventoryInfo}>
                    <Text style={styles.inventoryName}>{item.name}</Text>
                    <Text style={styles.inventoryStock}>
                      {item.stock} {item.unit}
                    </Text>
                  </View>
                  <View style={[styles.inventoryBadge, { backgroundColor: `${status.color}22` }]}>
                    <Text style={[styles.inventoryBadgeText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>
              );
            })}
            <TouchableOpacity style={styles.addInventoryBtn}>
              <Ionicons name="add" size={20} color={Colors.emerald} />
              <Text style={styles.addInventoryText}>Add Medicine</Text>
            </TouchableOpacity>
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
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  pharmName: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff", marginTop: 2 },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verifiedText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff" },
  statsGrid: { flexDirection: "row", gap: 10 },
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
  tabActive: { borderColor: Colors.emerald, backgroundColor: Colors.emeraldLight },
  tabText: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  tabTextActive: { color: Colors.emerald, fontFamily: "Inter_700Bold" },
  scrollView: { flex: 1 },
  content: { padding: 12, paddingTop: 4, paddingBottom: 16 },
  list: { gap: 12 },
  orderCard: {
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
  orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  orderId: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  orderCustomer: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.textPrimary, marginTop: 2 },
  orderStatusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  orderStatusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  orderMeta: { flexDirection: "row", gap: 16 },
  orderMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  orderMetaText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  orderActions: { flexDirection: "row", gap: 10 },
  rejectBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectBtnText: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  acceptBtn: { flex: 2, borderRadius: 12, overflow: "hidden" },
  acceptGradient: { height: 40, alignItems: "center", justifyContent: "center" },
  acceptBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
  inventoryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  inventoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  inventoryInfo: { flex: 1 },
  inventoryName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary },
  inventoryStock: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
  inventoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  inventoryBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  addInventoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.emerald,
    backgroundColor: Colors.emeraldLight,
  },
  addInventoryText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.emerald },
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

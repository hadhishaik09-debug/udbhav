import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  unit: string;
  status: "good" | "low" | "out";
  expiryDate: string; // Format: YYYY-MM-DD
}

interface OrderItem {
  name: string;
  qty: number;
}

interface Order {
  id: string;
  customer: string;
  items: OrderItem[];
  total: number;
  status: "new" | "preparing" | "ready" | "delivered";
  time: string;
}

const initialOrders: Order[] = [
  {
    id: "ORD001",
    customer: "Priya Sharma",
    items: [
      { name: "Paracetamol 500mg", qty: 2 },
      { name: "Cetirizine 10mg", qty: 1 }
    ],
    total: 184,
    status: "new",
    time: "5 min ago"
  },
  {
    id: "ORD002",
    customer: "Karan Mehta",
    items: [
      { name: "Azithromycin 500mg", qty: 1 }
    ],
    total: 98,
    status: "preparing",
    time: "18 min ago"
  },
];

const initialInventory: InventoryItem[] = [
  { id: "1", name: "Paracetamol 500mg", stock: 245, unit: "Strips", status: "good", expiryDate: "2026-12-20" },
  { id: "2", name: "Azithromycin 500mg", stock: 12, unit: "Strips", status: "low", expiryDate: "2026-04-15" },
  { id: "3", name: "Pantoprazole 40mg", stock: 0, unit: "Strips", status: "out", expiryDate: "2025-11-10" },
  { id: "4", name: "Metformin 500mg", stock: 89, unit: "Strips", status: "good", expiryDate: "2027-01-05" },
  { id: "5", name: "Cetirizine 10mg", stock: 8, unit: "Strips", status: "low", expiryDate: "2026-03-25" },
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
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [modalVisible, setModalVisible] = useState(false);

  // States for inventory form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newExpiry, setNewExpiry] = useState("");

  const getStockStatus = (stock: number): "good" | "low" | "out" => {
    if (stock <= 0) return "out";
    if (stock < 15) return "low";
    return "good";
  };

  const checkExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: "Expired", color: Colors.red, urgent: true };
    if (diffDays <= 30) return { label: "Expiring in " + diffDays + " days", color: Colors.amber, urgent: true };
    return null;
  };

  const handleAcceptOrder = (orderId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const orderToAccept = orders.find(o => o.id === orderId);
    if (!orderToAccept) return;

    const updatedInventory = inventory.map(item => {
      const orderItem = orderToAccept.items.find(oi => oi.name === item.name);
      if (orderItem) {
        const newCount = Math.max(0, item.stock - orderItem.qty);
        return { ...item, stock: newCount, status: getStockStatus(newCount) };
      }
      return item;
    });

    setInventory(updatedInventory);
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: "preparing" as const } : o));
    Alert.alert("Order Accepted", "The inventory has been automatically updated.");
  };

  const openAddModal = () => {
    setEditingId(null);
    setNewName("");
    setNewStock("");
    setNewExpiry("");
    setModalVisible(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingId(item.id);
    setNewName(item.name);
    setNewStock(item.stock.toString());
    setNewExpiry(item.expiryDate);
    setModalVisible(true);
  };

  const handleSaveStock = () => {
    if (!newName || !newStock || !newExpiry) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const qty = parseInt(newStock);
    if (isNaN(qty)) return;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(newExpiry)) {
      Alert.alert("Invalid Date", "Please use YYYY-MM-DD format");
      return;
    }

    if (editingId) {
      // Update existing
      setInventory(inventory.map(item =>
        item.id === editingId
          ? { ...item, name: newName, stock: qty, expiryDate: newExpiry, status: getStockStatus(qty) }
          : item
      ));
      Alert.alert("Success", "Stock updated successfully");
    } else {
      // Add new or update by name match
      const existingIndex = inventory.findIndex(i => i.name.toLowerCase() === newName.toLowerCase());
      if (existingIndex !== -1) {
        const updated = [...inventory];
        updated[existingIndex].stock += qty;
        updated[existingIndex].expiryDate = newExpiry;
        updated[existingIndex].status = getStockStatus(updated[existingIndex].stock);
        setInventory(updated);
      } else {
        setInventory([...inventory, {
          id: Math.random().toString(),
          name: newName,
          stock: qty,
          unit: "Strips",
          status: getStockStatus(qty),
          expiryDate: newExpiry
        }]);
      }
    }

    setModalVisible(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert("Confirm Delete", "Remove this item from inventory?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => setInventory(inventory.filter(i => i.id !== id)) }
    ]);
  };

  const stats = [
    { label: "Orders", value: orders.length.toString(), icon: "cube-outline", color: Colors.primary },
    { label: "Revenue", value: "₹" + orders.reduce((acc, o) => acc + o.total, 0), icon: "cash-outline", color: Colors.emerald },
    { label: "Expiring", value: inventory.filter(i => checkExpiryStatus(i.expiryDate)?.urgent).length.toString(), icon: "time-outline", color: Colors.red },
    { label: "Low Stock", value: inventory.filter(i => i.status !== "good").length.toString(), icon: "warning-outline", color: Colors.amber },
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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {activeTab === "orders" ? (
          <View style={styles.list}>
            {orders.map((order) => {
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
                  <View style={styles.itemsPreview}>
                    {order.items.map((it, idx) => (
                      <Text key={idx} style={styles.itemText}>• {it.name} (x{it.qty})</Text>
                    ))}
                  </View>
                  {order.status === "new" && (
                    <View style={styles.orderActions}>
                      <TouchableOpacity style={styles.rejectBtn}><Text style={styles.rejectBtnText}>Reject</Text></TouchableOpacity>
                      <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAcceptOrder(order.id)}>
                        <LinearGradient colors={["#10B981", "#059669"]} style={styles.acceptGradient}><Text style={styles.acceptBtnText}>Accept Order</Text></LinearGradient>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.list}>
            {inventory.map((item) => {
              const status = stockStatusColors[item.status];
              const expiryInfo = checkExpiryStatus(item.expiryDate);
              return (
                <View key={item.id} style={styles.inventoryCard}>
                  <View style={styles.inventoryIcon}><Ionicons name="medical" size={20} color={Colors.emerald} /></View>
                  <View style={styles.inventoryInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.inventoryName}>{item.name}</Text>
                      <View style={styles.actionIcons}>
                        <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconBtn}>
                          <Ionicons name="pencil-outline" size={18} color={Colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteItem(item.id)} style={styles.iconBtn}>
                          <Ionicons name="trash-outline" size={18} color={Colors.red} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.inventoryStock}>{item.stock} Strips</Text>
                      <Text style={[styles.expiryText, expiryInfo?.urgent && { color: expiryInfo.color, fontWeight: "700" }]}>Exp: {item.expiryDate}</Text>
                    </View>
                    {expiryInfo && (
                      <View style={[styles.expiryBadge, { backgroundColor: expiryInfo.color + "15" }]}>
                        <Text style={[styles.expiryBadgeText, { color: expiryInfo.color }]}>{expiryInfo.label}</Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.inventoryBadge, { backgroundColor: status.color + "22" }]}><Text style={[styles.inventoryBadgeText, { color: status.color }]}>{status.label}</Text></View>
                </View>
              );
            })}
            <TouchableOpacity style={styles.addInventoryBtn} onPress={openAddModal}>
              <Ionicons name="add" size={20} color={Colors.emerald} />
              <Text style={styles.addInventoryText}>Enter New Stock</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? "Edit Stock" : "Enter New Stock"}</Text>
            <TextInput style={styles.modalInput} placeholder="Medicine Name" value={newName} onChangeText={setNewName} />
            <TextInput style={styles.modalInput} placeholder="Quantity" value={newStock} onChangeText={setNewStock} keyboardType="numeric" />
            <TextInput style={styles.modalInput} placeholder="Expiry Date (YYYY-MM-DD)" value={newExpiry} onChangeText={setNewExpiry} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalCancel]} onPress={() => setModalVisible(false)}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalSubmit]} onPress={handleSaveStock}><Text style={styles.modalSubmitText}>Save Stock</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace("/role-select")}><Ionicons name="log-out-outline" size={18} color={Colors.textSecondary} /><Text style={styles.logoutText}>Sign Out</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  greeting: { fontSize: 13, color: "rgba(255,255,255,0.8)" },
  pharmName: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  verifiedText: { fontSize: 12, fontWeight: "600", color: "#fff" },
  statsGrid: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14, padding: 12, alignItems: "center", gap: 4 },
  statValue: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  statLabel: { fontSize: 9, color: "rgba(255,255,255,0.75)", textAlign: "center" },
  tabs: { flexDirection: "row", padding: 12, gap: 10 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 14, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border },
  tabActive: { borderColor: Colors.emerald, backgroundColor: Colors.emeraldLight },
  tabText: { fontSize: 14, color: Colors.textMuted },
  tabTextActive: { color: Colors.emerald, fontWeight: "bold" },
  scrollView: { flex: 1 },
  content: { padding: 12, paddingBottom: 16 },
  list: { gap: 12 },
  orderCard: { backgroundColor: Colors.white, borderRadius: 18, padding: 16, gap: 12, elevation: 3 },
  orderHeader: { flexDirection: "row", justifyContent: "space-between" },
  orderId: { fontSize: 12, color: Colors.textMuted },
  orderCustomer: { fontSize: 16, fontWeight: "bold", color: Colors.textPrimary },
  orderStatusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  orderStatusText: { fontSize: 12, fontWeight: "600" },
  itemsPreview: { backgroundColor: "#f9fafb", padding: 10, borderRadius: 10 },
  itemText: { fontSize: 13, color: Colors.textSecondary },
  orderActions: { flexDirection: "row", gap: 10 },
  rejectBtn: { flex: 1, height: 40, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  rejectBtnText: { color: Colors.textSecondary },
  acceptBtn: { flex: 2, borderRadius: 12, overflow: "hidden" },
  acceptGradient: { height: 40, alignItems: "center", justifyContent: "center" },
  acceptBtnText: { color: "#fff", fontWeight: "bold" },
  inventoryCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, elevation: 2 },
  inventoryIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.emeraldLight, alignItems: "center", justifyContent: "center" },
  inventoryInfo: { flex: 1, gap: 4 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  inventoryName: { fontSize: 14, fontWeight: "600", color: Colors.textPrimary },
  actionIcons: { flexDirection: "row", gap: 8 },
  iconBtn: { padding: 4 },
  metaRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  inventoryStock: { fontSize: 12, color: Colors.textSecondary },
  expiryText: { fontSize: 11, color: Colors.textMuted },
  expiryBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: "flex-start" },
  expiryBadgeText: { fontSize: 10, fontWeight: "bold" },
  inventoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  inventoryBadgeText: { fontSize: 11, fontWeight: "600" },
  addInventoryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 16, borderWidth: 2, borderStyle: "dashed", borderColor: Colors.emerald, backgroundColor: Colors.emeraldLight },
  addInventoryText: { fontSize: 14, fontWeight: "600", color: Colors.emerald },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, margin: 12, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: Colors.border },
  logoutText: { fontSize: 14, color: Colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "#fff", borderRadius: 24, padding: 24, gap: 16 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: Colors.textPrimary, marginBottom: 8 },
  modalInput: { height: 50, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, fontSize: 15 },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 8 },
  modalBtn: { flex: 1, height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  modalCancel: { backgroundColor: "#f1f5f9" },
  modalCancelText: { color: Colors.textSecondary, fontWeight: "600" },
  modalSubmit: { flex: 2, backgroundColor: Colors.emerald },
  modalSubmitText: { color: "#fff", fontWeight: "700" },
});

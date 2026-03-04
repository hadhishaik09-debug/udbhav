import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useApp, CartItem } from "@/context/AppContext";
import * as Haptics from "expo-haptics";

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { cart, updateQuantity, removeFromCart } = useApp();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cart.length > 0 ? 30 : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/user/checkout");
  };

  return (
    <View style={[styles.container, { paddingBottom: Platform.OS === "web" ? 34 : 0 }]}>
      <LinearGradient
        colors={["#8B5CF6", "#6D28D9"]}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>My Cart</Text>
          <Text style={styles.headerSubtitle}>{cart.length} item{cart.length !== 1 ? "s" : ""}</Text>
        </View>
      </LinearGradient>

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="cart-outline" size={52} color={Colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Search for medicines and add them here</Text>
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => router.push("/user/medicine-search")}
          >
            <Ionicons name="search-outline" size={18} color="#fff" />
            <Text style={styles.searchBtnText}>Find Medicines</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }: { item: CartItem }) => (
              <View style={styles.cartCard}>
                <View style={styles.cartItemIcon}>
                  <Ionicons name="medical" size={22} color={Colors.primary} />
                </View>
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName}>{item.name}</Text>
                  <Text style={styles.cartItemPharmacy}>{item.pharmacy}</Text>
                  <Text style={styles.cartItemUnit}>{item.unit}</Text>
                </View>
                <View style={styles.cartItemRight}>
                  <Text style={styles.cartItemPrice}>₹{(item.price * item.quantity).toFixed(0)}</Text>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        updateQuantity(item.id, item.quantity - 1);
                      }}
                    >
                      <Ionicons name="remove" size={16} color={Colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        updateQuantity(item.id, item.quantity + 1);
                      }}
                    >
                      <Ionicons name="add" size={16} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    removeFromCart(item.id);
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.red} />
                </TouchableOpacity>
              </View>
            )}
          />

          <View style={[styles.summaryCard, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{subtotal.toFixed(0)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>₹{deliveryFee}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{total.toFixed(0)}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
              <LinearGradient
                colors={["#8B5CF6", "#6D28D9"]}
                style={styles.checkoutGradient}
              >
                <Ionicons name="card-outline" size={20} color="#fff" />
                <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  headerSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 40 },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.textPrimary },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textMuted, textAlign: "center" },
  searchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.primary,
  },
  searchBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  list: { padding: 16, gap: 12, paddingBottom: 16 },
  cartCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cartItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary, lineHeight: 19 },
  cartItemPharmacy: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  cartItemUnit: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  cartItemRight: { alignItems: "flex-end", gap: 6 },
  cartItemPrice: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.primary },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.textPrimary, minWidth: 20, textAlign: "center" },
  removeBtn: { padding: 8 },
  summaryCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    gap: 10,
  },
  summaryTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.textPrimary, marginBottom: 4 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  summaryValue: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.textPrimary },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    marginTop: 4,
  },
  totalLabel: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.textPrimary },
  totalValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.primary },
  checkoutBtn: { marginTop: 8, borderRadius: 14, overflow: "hidden" },
  checkoutGradient: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  checkoutBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
});

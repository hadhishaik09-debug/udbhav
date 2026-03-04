import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "@/context/AppContext";
import * as Haptics from "expo-haptics";

type DeliveryType = "home" | "takeaway";
type PaymentType = "upi" | "card" | "cod";

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const { cart, clearCart, addOrder } = useApp();
  const [address, setAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("home");
  const [paymentType, setPaymentType] = useState<PaymentType>("upi");
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = deliveryType === "home" ? 30 : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    if (deliveryType === "home" && !address.trim()) {
      Alert.alert("Address Required", "Please enter your delivery address.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(true);
    setTimeout(() => {
      const orderId = "ORD" + Date.now().toString().slice(-6);
      addOrder({
        id: orderId,
        items: [...cart],
        total,
        address: deliveryType === "home" ? address : "Takeaway",
        deliveryType,
        pharmacy: cart[0]?.pharmacy || "Pharmacy",
        status: "confirmed",
        estimatedTime: deliveryType === "home" ? "30-45 min" : "15-20 min",
      });
      clearCart();
      setLoading(false);
      router.replace({ pathname: "/user/order-confirmation", params: { orderId } });
    }, 1500);
  };

  return (
    <View style={[styles.container, { paddingBottom: Platform.OS === "web" ? 34 : 0 }]}>
      <LinearGradient
        colors={["#1A73E8", "#0D47A1"]}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Method</Text>
          <View style={styles.deliveryOptions}>
            {(["home", "takeaway"] as DeliveryType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.deliveryOption, deliveryType === type && styles.deliveryOptionActive]}
                onPress={() => { setDeliveryType(type); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              >
                <Ionicons
                  name={type === "home" ? "home-outline" : "storefront-outline"}
                  size={24}
                  color={deliveryType === type ? Colors.primary : Colors.textMuted}
                />
                <Text style={[styles.deliveryOptionText, deliveryType === type && styles.deliveryOptionTextActive]}>
                  {type === "home" ? "Home Delivery" : "Takeaway"}
                </Text>
                {type === "home" && <Text style={styles.deliveryFeeTag}>+₹30</Text>}
                {type === "takeaway" && <Text style={[styles.deliveryFeeTag, { color: Colors.emerald }]}>Free</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {deliveryType === "home" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressInput}>
              <Ionicons name="location-outline" size={20} color={Colors.textMuted} />
              <TextInput
                style={styles.addressField}
                placeholder="Enter your full delivery address..."
                placeholderTextColor={Colors.textMuted}
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentOptions}>
            {([
              { key: "upi", label: "UPI Payment", icon: "phone-portrait-outline" },
              { key: "card", label: "Credit / Debit Card", icon: "card-outline" },
              { key: "cod", label: "Cash on Delivery", icon: "cash-outline" },
            ] as { key: PaymentType; label: string; icon: string }[]).map((p) => (
              <TouchableOpacity
                key={p.key}
                style={[styles.paymentOption, paymentType === p.key && styles.paymentOptionActive]}
                onPress={() => { setPaymentType(p.key); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              >
                <Ionicons name={p.icon as any} size={22} color={paymentType === p.key ? Colors.primary : Colors.textMuted} />
                <Text style={[styles.paymentOptionText, paymentType === p.key && styles.paymentOptionTextActive]}>
                  {p.label}
                </Text>
                {paymentType === p.key && (
                  <View style={styles.radioSelected}>
                    <View style={styles.radioDot} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            {cart.map((item) => (
              <View key={item.id} style={styles.summaryItem}>
                <Text style={styles.summaryItemName} numberOfLines={1}>{item.name} x{item.quantity}</Text>
                <Text style={styles.summaryItemPrice}>₹{(item.price * item.quantity).toFixed(0)}</Text>
              </View>
            ))}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={styles.summaryValue}>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</Text>
            </View>
            <View style={[styles.summaryItem, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{total.toFixed(0)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.placeOrderBtn, loading && styles.placeOrderBtnDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <LinearGradient colors={["#10B981", "#059669"]} style={styles.placeOrderGradient}>
            <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
            <Text style={styles.placeOrderText}>{loading ? "Placing Order..." : `Place Order • ₹${total}`}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  scrollView: { flex: 1 },
  content: { padding: 16, gap: 20, paddingBottom: 24 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.textPrimary },
  deliveryOptions: { flexDirection: "row", gap: 12 },
  deliveryOption: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: "center",
    gap: 8,
  },
  deliveryOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  deliveryOptionText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textSecondary, textAlign: "center" },
  deliveryOptionTextActive: { color: Colors.primary, fontFamily: "Inter_700Bold" },
  deliveryFeeTag: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  addressInput: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
  },
  addressField: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    lineHeight: 22,
    minHeight: 60,
  },
  paymentOptions: { gap: 10 },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  paymentOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  paymentOptionText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  paymentOptionTextActive: { color: Colors.primary, fontFamily: "Inter_600SemiBold" },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryItemName: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, flex: 1 },
  summaryItemPrice: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textPrimary },
  summaryDivider: { height: 1, backgroundColor: Colors.border },
  summaryLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  summaryValue: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.textPrimary },
  totalRow: { borderTopWidth: 0, paddingTop: 4 },
  totalLabel: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.textPrimary },
  totalValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.primary },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  placeOrderBtn: { borderRadius: 16, overflow: "hidden" },
  placeOrderBtnDisabled: { opacity: 0.7 },
  placeOrderGradient: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  placeOrderText: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
});

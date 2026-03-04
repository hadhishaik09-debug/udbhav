import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "@/context/AppContext";
import * as Haptics from "expo-haptics";

const steps = [
  { label: "Order Confirmed", icon: "checkmark-circle", done: true },
  { label: "Pharmacy Preparing", icon: "medkit", done: true },
  { label: "Out for Delivery", icon: "bicycle", done: false },
  { label: "Delivered", icon: "home", done: false },
];

export default function OrderConfirmationScreen() {
  const insets = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { orders } = useApp();
  const order = orders.find((o) => o.id === orderId) || orders[0];
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(checkScale, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
        Animated.timing(checkOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { paddingBottom: Platform.OS === "web" ? 34 : 0 }]}>
      <LinearGradient
        colors={["#10B981", "#059669"]}
        style={[styles.successBanner, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
      >
        <Animated.View style={[styles.checkCircle, { opacity: checkOpacity, transform: [{ scale: checkScale }] }]}>
          <Ionicons name="checkmark-circle" size={80} color="#FFFFFF" />
        </Animated.View>
        <Text style={styles.successTitle}>Order Placed!</Text>
        <Text style={styles.orderId}>#{orderId}</Text>
        <Text style={styles.successSubtitle}>
          {order?.deliveryType === "home"
            ? `Estimated delivery in ${order?.estimatedTime}`
            : `Ready for pickup in ${order?.estimatedTime}`}
        </Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.trackingCard}>
          <Text style={styles.cardTitle}>Track Your Order</Text>
          <View style={styles.stepsContainer}>
            {steps.map((step, index) => (
              <View key={step.label} style={styles.stepRow}>
                <View style={styles.stepLeft}>
                  <View style={[styles.stepIconCircle, step.done && styles.stepIconCircleDone]}>
                    <Ionicons
                      name={step.icon as any}
                      size={16}
                      color={step.done ? "#fff" : Colors.textMuted}
                    />
                  </View>
                  {index < steps.length - 1 && (
                    <View style={[styles.stepLine, step.done && styles.stepLineDone]} />
                  )}
                </View>
                <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>{step.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {order && (
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>Order Details</Text>
            {order.items.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.orderItemIcon}>
                  <Ionicons name="medical" size={16} color={Colors.primary} />
                </View>
                <Text style={styles.orderItemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.orderItemQty}>x{item.quantity}</Text>
                <Text style={styles.orderItemPrice}>₹{item.price * item.quantity}</Text>
              </View>
            ))}
            <View style={styles.detailsDivider} />
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color={Colors.textMuted} />
              <Text style={styles.detailText}>{order.address}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="storefront-outline" size={16} color={Colors.textMuted} />
              <Text style={styles.detailText}>{order.pharmacy}</Text>
            </View>
            <View style={[styles.detailRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalValue}>₹{order.total.toFixed(0)}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace("/user/dashboard")}
        >
          <LinearGradient colors={["#1A73E8", "#0D47A1"]} style={styles.homeBtnGradient}>
            <Ionicons name="home-outline" size={20} color="#fff" />
            <Text style={styles.homeBtnText}>Back to Dashboard</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => router.push("/user/medicine-search")}
        >
          <Text style={styles.continueBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  successBanner: {
    alignItems: "center",
    paddingBottom: 36,
    paddingHorizontal: 24,
    gap: 8,
  },
  checkCircle: { marginBottom: 8 },
  successTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff" },
  orderId: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.85)" },
  successSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.85)", textAlign: "center" },
  scrollView: { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 36 },
  trackingCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    gap: 16,
  },
  cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.textPrimary },
  stepsContainer: { gap: 0 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  stepLeft: { alignItems: "center" },
  stepIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepIconCircleDone: { backgroundColor: Colors.emerald },
  stepLine: { width: 2, height: 32, backgroundColor: Colors.border },
  stepLineDone: { backgroundColor: Colors.emerald },
  stepLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textMuted, paddingTop: 8 },
  stepLabelDone: { color: Colors.textPrimary, fontFamily: "Inter_600SemiBold" },
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    gap: 12,
  },
  orderItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  orderItemIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  orderItemName: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textPrimary },
  orderItemQty: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  orderItemPrice: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.primary },
  detailsDivider: { height: 1, backgroundColor: Colors.border },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  detailText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, flex: 1 },
  totalRow: { borderTopWidth: 0, paddingTop: 4 },
  totalLabel: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.textPrimary, flex: 1 },
  totalValue: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.primary },
  homeBtn: { borderRadius: 16, overflow: "hidden" },
  homeBtnGradient: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  homeBtnText: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  continueBtn: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  continueBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.primary },
});

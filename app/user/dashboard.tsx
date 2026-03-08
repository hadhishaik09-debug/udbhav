import React from "react";
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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "@/context/AppContext";
import * as Haptics from "expo-haptics";

const features = [
  {
    id: "ai",
    title: "AI Health Assistant",
    subtitle: "Symptom checker",
    icon: "brain-outline" as const,
    iconLib: "Ionicons",
    color: "#1A73E8",
    bg: "#E8F0FE",
    route: "/user/ai-assistant",
  },
  {
    id: "medicines",
    title: "Find Medicines",
    subtitle: "Search & order",
    icon: "search-outline" as const,
    iconLib: "Ionicons",
    color: "#10B981",
    bg: "#D1FAE5",
    route: "/user/medicine-search",
  },
  {
    id: "reminders",
    title: "Medicine Reminders",
    subtitle: "Never miss a dose",
    icon: "alarm-outline" as const,
    iconLib: "Ionicons",
    color: "#F59E0B",
    bg: "#FEF3C7",
    route: "/user/reminders",
  },
  {
    id: "cart",
    title: "My Cart",
    subtitle: "View & checkout",
    icon: "cart-outline" as const,
    iconLib: "Ionicons",
    color: "#8B5CF6",
    bg: "#EDE9FE",
    route: "/user/cart",
  },
  {
    id: "records",
    title: "Health Records",
    subtitle: "Medical history",
    icon: "document-text-outline" as const,
    iconLib: "Ionicons",
    color: "#0891B2",
    bg: "#E0F2FE",
    route: "/user/records" as any,
  },
  {
    id: "scanner",
    title: "Medicine Scanner",
    subtitle: "Identify by photo",
    icon: "camera-outline" as const,
    iconLib: "Ionicons",
    color: "#4F46E5",
    bg: "#EEF2FF",
    route: "/user/medicine-scanner",
  },
  {
    id: "orders",
    title: "My Orders",
    subtitle: "Track deliveries",
    icon: "cube-outline" as const,
    iconLib: "Ionicons",
    color: "#DC2626",
    bg: "#FEE2E2",
    route: "/user/orders" as any,
  },
];

const quickStats = [
  { label: "Reminders Today", value: "3", icon: "alarm", color: "#F59E0B" },
  { label: "Active Orders", value: "1", icon: "cube", color: "#1A73E8" },
  { label: "Saved Meds", value: "12", icon: "bookmark", color: "#10B981" },
];

export default function UserDashboard() {
  const insets = useSafeAreaInsets();
  const { cart } = useApp();

  const handleFeature = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <View style={[styles.container, { paddingBottom: Platform.OS === "web" ? 34 : 0 }]}>
      <LinearGradient
        colors={["#1A73E8", "#0D47A1"]}
        style={[styles.headerGradient, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.userName}>Rohit Kumar</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => router.push("/user/cart")}>
              <Ionicons name="cart-outline" size={22} color="#fff" />
              {cart.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cart.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons name="notifications-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          {quickStats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${s.color}22` }]}>
                <Ionicons name={s.icon as any} size={16} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.sosCard}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            router.push("/user/sos");
          }}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#EF4444", "#B91C1C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sosGradient}
          >
            <View style={styles.sosPulse}>
              <Ionicons name="alert-circle" size={32} color="#fff" />
            </View>
            <View style={styles.sosText}>
              <Text style={styles.sosTitle}>Emergency SOS</Text>
              <Text style={styles.sosSubtitle}>Tap for immediate medical assistance</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Your Health Tools</Text>

        <View style={styles.grid}>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={styles.featureCard}
              onPress={() => handleFeature(feature.route)}
              activeOpacity={0.85}
            >
              <View style={[styles.featureIcon, { backgroundColor: feature.bg }]}>
                <Ionicons name={feature.icon as any} size={28} color={feature.color} />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.healthTipCard}>
          <View style={styles.healthTipHeader}>
            <Ionicons name="bulb-outline" size={20} color={Colors.primary} />
            <Text style={styles.healthTipTitle}>Health Tip of the Day</Text>
          </View>
          <Text style={styles.healthTipText}>
            Stay hydrated! Drinking 8 glasses of water daily helps maintain blood pressure, supports kidney function, and improves your energy levels.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => router.replace("/role-select")}
        >
          <Ionicons name="log-out-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
  },
  userName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.red,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  sosCard: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  sosGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 14,
  },
  sosPulse: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  sosText: {
    flex: 1,
  },
  sosTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  sosSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  featureCard: {
    width: "47%",
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 10,
  },
  featureIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  featureSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  healthTipCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 18,
    padding: 18,
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  healthTipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  healthTipTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
  healthTipText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
});

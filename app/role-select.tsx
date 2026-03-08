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
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const roles = [
  {
    id: "user",
    title: "Patient / User",
    subtitle: "Search medicines, AI health assistant, reminders & emergency SOS",
    icon: "person-circle-outline" as const,
    iconLib: "Ionicons",
    gradient: ["#1A73E8", "#0D47A1"] as [string, string],
    route: "/user/login",
  },
  {
    id: "pharmacy",
    title: "Pharmacy",
    subtitle: "Manage your pharmacy, inventory, and incoming orders",
    icon: "storefront-outline" as const,
    iconLib: "Ionicons",
    gradient: ["#10B981", "#059669"] as [string, string],
    route: "/pharmacy/login",
  },
  {
    id: "delivery",
    title: "Delivery Partner",
    subtitle: "Accept delivery tasks and update delivery status",
    icon: "bicycle-outline" as const,
    iconLib: "Ionicons",
    gradient: ["#F59E0B", "#D97706"] as [string, string],
    route: "/delivery/login",
  },
  // Admin role is hidden from the public role selection portal
];

export default function RoleSelectScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0), paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) }]}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.appName}>Aushadhara</Text>
        <Text style={styles.subtitle}>Select your role to continue</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
      >
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={styles.card}
            onPress={() => router.push(role.route as any)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={role.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={styles.cardIconContainer}>
                <Ionicons name={role.icon as any} size={36} color="#FFFFFF" />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{role.title}</Text>
                <Text style={styles.cardSubtitle}>{role.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.7)" />
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Text style={styles.footerText}>Aushadhara — Trusted Healthcare Platform</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  welcomeText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  appName: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    marginTop: 6,
  },
  scrollView: {
    flex: 1,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 14,
  },
  card: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  cardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
    lineHeight: 16,
  },
  footer: {
    alignItems: "center",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
});

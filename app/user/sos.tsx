import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Animated,
  Linking,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

const nearbyHospitals = [
  { name: "Apollo Hospitals", distance: "0.8 km", phone: "+91-9876543210", type: "Multi-Specialty" },
  { name: "St. John's Medical Centre", distance: "1.4 km", phone: "+91-9876543211", type: "Emergency Care" },
  { name: "Manipal Hospital", distance: "2.1 km", phone: "+91-9876543212", type: "Multi-Specialty" },
  { name: "Fortis Healthcare", distance: "3.0 km", phone: "+91-9876543213", type: "Critical Care" },
];

const emergencyContacts = [
  { label: "Ambulance", number: "108", icon: "fitness-outline", color: "#EF4444" },
  { label: "Police", number: "100", icon: "shield-outline", color: "#1A73E8" },
  { label: "Fire", number: "101", icon: "flame-outline", color: "#F59E0B" },
  { label: "Women Help", number: "1091", icon: "person-outline", color: "#8B5CF6" },
];

export default function SOSScreen() {
  const insets = useSafeAreaInsets();
  const [sosActivated, setSosActivated] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => {
      pulse.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const activateSOS = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setSosActivated(true);
    let count = 5;
    timerRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        callNumber("108"); // Call ambulance by default when SOS completes
      }
    }, 1000);
  };

  const cancelSOS = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (timerRef.current) clearInterval(timerRef.current);
    setSosActivated(false);
    setCountdown(5);
  };

  const callNumber = (number: string) => {
    let phoneNumber = number;
    if (Platform.OS !== 'android') {
      phoneNumber = `telprompt:${number}`;
    } else {
      phoneNumber = `tel:${number}`;
    }
    Linking.canOpenURL(phoneNumber)
      .then(supported => {
        if (!supported) {
          Alert.alert('Error', 'Direct calling is not supported on this device');
        } else {
          return Linking.openURL(phoneNumber);
        }
      })
      .catch(err => console.error('An error occurred', err));
  };

  return (
    <View style={[styles.container, { paddingBottom: Platform.OS === "web" ? 34 : 0 }]}>
      <LinearGradient
        colors={["#EF4444", "#B91C1C"]}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Emergency SOS</Text>
          <Text style={styles.headerSubtitle}>Immediate medical assistance</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sosSection}>
          <View style={styles.sosBg}>
            <Animated.View style={[styles.sosRing1, { transform: [{ scale: pulseAnim }] }]} />
            <Animated.View style={[styles.sosRing2, { transform: [{ scale: pulseAnim }] }]} />
            <TouchableOpacity
              style={[styles.sosButton, sosActivated && styles.sosButtonActive]}
              onPress={activateSOS}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={sosActivated ? ["#B91C1C", "#7F1D1D"] : ["#EF4444", "#DC2626"]}
                style={styles.sosButtonGradient}
              >
                <Ionicons name="alert-circle" size={44} color="#fff" />
                {sosActivated ? (
                  <Text style={styles.sosCountdown}>{countdown}</Text>
                ) : (
                  <Text style={styles.sosLabel}>SOS</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {sosActivated ? (
            <View style={styles.sosActiveInfo}>
              <Text style={styles.sosActiveTitle}>Calling Emergency Services...</Text>
              <Text style={styles.sosActiveSubtitle}>
                {countdown > 0
                  ? `Cancelling in ${countdown} seconds`
                  : "Emergency services contacted!"}
              </Text>
              {countdown > 0 && (
                <TouchableOpacity style={styles.cancelBtn} onPress={cancelSOS}>
                  <Text style={styles.cancelBtnText}>Cancel SOS</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.sosInfo}>
              <Text style={styles.sosInfoTitle}>Tap the button for emergency help</Text>
              <Text style={styles.sosInfoSubtitle}>Ambulance and nearby hospitals will be notified. Your location will be shared.</Text>
            </View>
          )}
        </View>

        <View style={styles.emergencyGrid}>
          {emergencyContacts.map((contact) => (
            <TouchableOpacity
              key={contact.number}
              style={styles.emergencyCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                callNumber(contact.number);
              }}
            >
              <View style={[styles.emergencyIcon, { backgroundColor: `${contact.color}22` }]}>
                <Ionicons name={contact.icon as any} size={24} color={contact.color} />
              </View>
              <Text style={styles.emergencyLabel}>{contact.label}</Text>
              <Text style={[styles.emergencyNumber, { color: contact.color }]}>{contact.number}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Nearest Hospitals</Text>

        {nearbyHospitals.map((h) => (
          <View key={h.name} style={styles.hospitalCard}>
            <View style={styles.hospitalIcon}>
              <Ionicons name="medkit" size={22} color={Colors.red} />
            </View>
            <View style={styles.hospitalInfo}>
              <Text style={styles.hospitalName}>{h.name}</Text>
              <Text style={styles.hospitalType}>{h.type}</Text>
              <View style={styles.hospitalMeta}>
                <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
                <Text style={styles.hospitalDist}>{h.distance}</Text>
              </View>
            </View>
            <View style={styles.hospitalActions}>
              <TouchableOpacity 
                style={styles.callBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  callNumber(h.phone);
                }}
              >
                <Ionicons name="call" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn}>
                <Ionicons name="navigate-outline" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
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
  scrollView: { flex: 1 },
  content: { padding: 20, gap: 20, paddingBottom: 40 },
  sosSection: { alignItems: "center", paddingVertical: 10 },
  sosBg: { width: 220, height: 220, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  sosRing1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(239,68,68,0.12)",
  },
  sosRing2: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(239,68,68,0.2)",
  },
  sosButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  sosButtonActive: { opacity: 0.9 },
  sosButtonGradient: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4 },
  sosLabel: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 4 },
  sosCountdown: { fontSize: 36, fontFamily: "Inter_700Bold", color: "#fff" },
  sosActiveInfo: { alignItems: "center", gap: 8 },
  sosActiveTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.red, textAlign: "center" },
  sosActiveSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textSecondary, textAlign: "center" },
  cancelBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.red,
  },
  cancelBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.red },
  sosInfo: { alignItems: "center", gap: 8, paddingHorizontal: 20 },
  sosInfoTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary, textAlign: "center" },
  sosInfoSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted, textAlign: "center", lineHeight: 19 },
  emergencyGrid: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  emergencyCard: {
    width: "47%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  emergencyIcon: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  emergencyLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textPrimary },
  emergencyNumber: { fontSize: 20, fontFamily: "Inter_700Bold" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.textPrimary },
  hospitalCard: {
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
  hospitalIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: Colors.redLight,
    alignItems: "center",
    justifyContent: "center",
  },
  hospitalInfo: { flex: 1, gap: 2 },
  hospitalName: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.textPrimary },
  hospitalType: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  hospitalMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  hospitalDist: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  hospitalActions: { flexDirection: "row", gap: 8 },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.red,
    alignItems: "center",
    justifyContent: "center",
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
});

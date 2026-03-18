import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "@/context/AppContext";
import * as Haptics from "expo-haptics";

interface Medicine {
  id: string;
  name: string;
  generic: string;
  price: number;
  pharmacy: string;
  distance: string;
  address: string;
  inStock: boolean;
  category: string;
  unit: string;
}

const mockMedicines: Medicine[] = [
  { id: "m1", name: "Paracetamol 500mg", generic: "Paracetamol", price: 32, pharmacy: "LifeCare Pharmacy", distance: "0.4 km", address: "12, MG Road, Bengaluru", inStock: true, category: "Analgesic", unit: "Strip of 10" },
  { id: "m2", name: "Azithromycin 500mg", generic: "Azithromycin", price: 98, pharmacy: "Apollo Pharmacy", distance: "0.8 km", address: "45, Brigade Road, Bengaluru", inStock: true, category: "Antibiotic", unit: "Strip of 3" },
  { id: "m3", name: "Metformin 500mg", generic: "Metformin HCl", price: 45, pharmacy: "MedPlus Pharmacy", distance: "1.2 km", address: "78, Indiranagar, Bengaluru", inStock: true, category: "Antidiabetic", unit: "Strip of 10" },
  { id: "m4", name: "Pantoprazole 40mg", generic: "Pantoprazole", price: 62, pharmacy: "LifeCare Pharmacy", distance: "0.4 km", address: "12, MG Road, Bengaluru", inStock: false, category: "Antacid", unit: "Strip of 10" },
  { id: "m5", name: "Cetirizine 10mg", generic: "Cetirizine HCl", price: 28, pharmacy: "Wellness Pharma", distance: "1.6 km", address: "90, Koramangala, Bengaluru", inStock: true, category: "Antihistamine", unit: "Strip of 10" },
  { id: "m6", name: "Atorvastatin 10mg", generic: "Atorvastatin", price: 74, pharmacy: "Apollo Pharmacy", distance: "0.8 km", address: "45, Brigade Road, Bengaluru", inStock: true, category: "Statin", unit: "Strip of 10" },
  { id: "m7", name: "Amoxicillin 500mg", generic: "Amoxicillin", price: 85, pharmacy: "MedPlus Pharmacy", distance: "1.2 km", address: "78, Indiranagar, Bengaluru", inStock: true, category: "Antibiotic", unit: "Strip of 10" },
  { id: "m8", name: "Losartan 50mg", generic: "Losartan Potassium", price: 110, pharmacy: "Wellness Pharma", distance: "1.6 km", address: "90, Koramangala, Bengaluru", inStock: true, category: "Antihypertensive", unit: "Strip of 10" },
];

const pharmacyColors: Record<string, string> = {
  "LifeCare Pharmacy": "#1A73E8",
  "Apollo Pharmacy": "#10B981",
  "MedPlus Pharmacy": "#F59E0B",
  "Wellness Pharma": "#8B5CF6",
};

function PharmacyPin({ pharmacy, color }: { pharmacy: string; color: string }) {
  return (
    <View style={[styles.pin, { backgroundColor: color }]}>
      <Ionicons name="medical" size={12} color="#fff" />
    </View>
  );
}

function MapView({ medicines }: { medicines: Medicine[] }) {
  const uniquePharmacies = [...new Set(medicines.map((m) => m.pharmacy))];
  return (
    <View style={styles.mapContainer}>
      <LinearGradient
        colors={["#E8F5E9", "#E3F2FD"]}
        style={styles.mapBg}
      >
        <View style={styles.mapGrid}>
          {[...Array(6)].map((_, i) => (
            <View key={i} style={styles.mapGridLine} />
          ))}
        </View>
        {uniquePharmacies.map((p, i) => {
          const positions = [
            { top: "20%", left: "25%" },
            { top: "45%", left: "60%" },
            { top: "65%", left: "30%" },
            { top: "30%", left: "70%" },
          ];
          const pos = positions[i % positions.length];
          return (
            <View key={p} style={[styles.pinContainer, { top: pos.top as any, left: pos.left as any }]}>
              <PharmacyPin pharmacy={p} color={pharmacyColors[p] || Colors.primary} />
              <Text style={[styles.pinLabel, { color: pharmacyColors[p] || Colors.primary }]} numberOfLines={1}>
                {p.split(" ")[0]}
              </Text>
            </View>
          );
        })}
        <View style={[styles.userPin]}>
          <View style={styles.userPinInner} />
          <View style={styles.userPinRing} />
        </View>
        <View style={styles.mapOverlay}>
          <Ionicons name="map-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.mapOverlayText}>Live pharmacy map</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

export default function MedicineSearchScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [search, setSearch] = useState((params.query as string) || "");
  const [showMap, setShowMap] = useState(false);
  const { addToCart, cart } = useApp();

  const filtered = mockMedicines.filter(
    (m) =>
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.generic.toLowerCase().includes(search.toLowerCase()) ||
      m.pharmacy.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToCart = (med: Medicine) => {
    if (!med.inStock) {
      Alert.alert("Out of Stock", "This medicine is currently unavailable.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addToCart({
      id: med.id,
      name: med.name,
      price: med.price,
      quantity: 1,
      pharmacy: med.pharmacy,
      unit: med.unit,
    });
    Alert.alert("Added to Cart", `${med.name} has been added to your cart.`);
  };

  return (
    <View style={[styles.container, { paddingBottom: Platform.OS === "web" ? 34 : 0 }]}>
      <LinearGradient
        colors={["#10B981", "#059669"]}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Find Medicines</Text>
          <Text style={styles.headerSubtitle}>Search across nearby pharmacies</Text>
        </View>
        <TouchableOpacity
          style={[styles.mapToggle, showMap && styles.mapToggleActive]}
          onPress={() => setShowMap(!showMap)}
        >
          <Ionicons name={showMap ? "list-outline" : "map-outline"} size={20} color={showMap ? Colors.emerald : "#fff"} />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search medicines, generics..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {showMap && <MapView medicines={filtered} />}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No medicines found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.medicineCard}>
            <View style={styles.medicineHeader}>
              <View style={styles.medicineInfo}>
                <Text style={styles.medicineName}>{item.name}</Text>
                <Text style={styles.medicineGeneric}>{item.generic}</Text>
              </View>
              <View style={styles.priceBlock}>
                <Text style={styles.price}>₹{item.price}</Text>
                <Text style={styles.priceUnit}>{item.unit}</Text>
              </View>
            </View>

            <View style={styles.categoryRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
              <View style={[styles.stockBadge, { backgroundColor: item.inStock ? Colors.emeraldLight : Colors.redLight }]}>
                <Ionicons
                  name={item.inStock ? "checkmark-circle" : "close-circle"}
                  size={12}
                  color={item.inStock ? Colors.emerald : Colors.red}
                />
                <Text style={[styles.stockText, { color: item.inStock ? Colors.emerald : Colors.red }]}>
                  {item.inStock ? "In Stock" : "Out of Stock"}
                </Text>
              </View>
            </View>

            <View style={styles.pharmacyRow}>
              <View style={[styles.pharmacyDot, { backgroundColor: pharmacyColors[item.pharmacy] || Colors.primary }]} />
              <Text style={styles.pharmacyName}>{item.pharmacy}</Text>
              <Text style={styles.pharmacyDist}>{item.distance}</Text>
            </View>
            <Text style={styles.pharmacyAddress}>{item.address}</Text>

            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.mapBtn}>
                <Ionicons name="navigate-outline" size={16} color={Colors.primary} />
                <Text style={styles.mapBtnText}>Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addBtn, !item.inStock && styles.addBtnDisabled]}
                onPress={() => handleAddToCart(item)}
                disabled={!item.inStock}
              >
                <Ionicons name="cart-outline" size={16} color="#fff" />
                <Text style={styles.addBtnText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
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
  mapToggle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  mapToggleActive: { backgroundColor: "#fff" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: Colors.white,
    borderRadius: 14,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
  },
  mapContainer: {
    height: 180,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapBg: { flex: 1, position: "relative" },
  mapGrid: { ...StyleSheet.absoluteFillObject, flexDirection: "row", justifyContent: "space-between" },
  mapGridLine: { width: 1, backgroundColor: "rgba(0,0,0,0.05)", height: "100%" },
  pinContainer: { position: "absolute", alignItems: "center" },
  pin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pinLabel: { fontSize: 9, fontFamily: "Inter_600SemiBold", marginTop: 2 },
  userPin: { position: "absolute", top: "50%", left: "48%", alignItems: "center", justifyContent: "center" },
  userPinInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary },
  userPinRing: { position: "absolute", width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.primary, opacity: 0.4 },
  mapOverlay: {
    position: "absolute",
    bottom: 8,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mapOverlayText: { fontSize: 10, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  list: { paddingHorizontal: 16, paddingBottom: 32, gap: 14 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  medicineCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 10,
  },
  medicineHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  medicineInfo: { flex: 1 },
  medicineName: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.textPrimary },
  medicineGeneric: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
  priceBlock: { alignItems: "flex-end" },
  price: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.primary },
  priceUnit: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  categoryRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  categoryBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  categoryText: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.primary },
  stockBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  stockText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  pharmacyRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  pharmacyDot: { width: 8, height: 8, borderRadius: 4 },
  pharmacyName: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary, flex: 1 },
  pharmacyDist: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  pharmacyAddress: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  cardActions: { flexDirection: "row", gap: 10 },
  mapBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  mapBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.primary },
  addBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  addBtnDisabled: { opacity: 0.5 },
  addBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },
});

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
  Alert,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useApp, Reminder } from "@/context/AppContext";
import * as Haptics from "expo-haptics";
import * as DocumentPicker from 'expo-document-picker';

const dosageTypeLabels = {
  half_tablet: "Half Tablet",
  full_tablet: "Full Tablet",
  syrup: "Syrup",
};

const dosageIcons = {
  half_tablet: "medical-outline",
  full_tablet: "medical",
  syrup: "beaker-outline",
};

const statusColors = {
  pending: { bg: Colors.primaryLight, text: Colors.primary, label: "Pending" },
  taken: { bg: Colors.emeraldLight, text: Colors.emerald, label: "Taken" },
  snoozed: { bg: Colors.amberLight, text: Colors.amber, label: "Snoozed" },
  skipped: { bg: Colors.border, text: Colors.textMuted, label: "Skipped" },
};

const timeOptions = ["06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM", "08:00 PM", "09:00 PM", "10:00 PM"];

const alarmSounds = [
  { id: "default", name: "Default Chime", icon: "musical-notes-outline" },
  { id: "zen", name: "Zen Bowl", icon: "sunny-outline" },
  { id: "pulse", name: "Echo Pulse", icon: "pulse-outline" },
  { id: "birds", name: "Forest Birds", icon: "leaf-outline" },
  { id: "harp", name: "Gentle Harp", icon: "infinite-outline" },
];

export default function RemindersScreen() {
  const insets = useSafeAreaInsets();
  const { reminders, addReminder, updateReminderStatus, deleteReminder } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [medicineName, setMedicineName] = useState("");
  const [selectedTime, setSelectedTime] = useState("08:00 AM");
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState("");
  const [selectedSound, setSelectedSound] = useState(alarmSounds[0]);
  const [isCustomSound, setIsCustomSound] = useState(false);
  const [customSound, setCustomSound] = useState("");
  const [customAudioUri, setCustomAudioUri] = useState<string | null>(null);
  const [dosageType, setDosageType] = useState<Reminder["dosageType"]>("full_tablet");
  const [dosageAmount, setDosageAmount] = useState("1");

  const handleAdd = () => {
    if (!medicineName.trim()) {
      Alert.alert("Required", "Please enter medicine name.");
      return;
    }
    const finalTime = isCustomTime ? customTime || "12:00 PM" : selectedTime;
    const finalSound = isCustomSound ? (customSound || "Custom Sound") : selectedSound.name;
    const finalSoundUri = isCustomSound ? customAudioUri : null;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addReminder({
      id: Date.now().toString(),
      medicineName: medicineName.trim(),
      time: finalTime,
      dosageType,
      dosageAmount,
      status: "pending",
      alarmSound: finalSound,
      alarmSoundUri: finalSoundUri as any, // Ad-hoc extension for now
    });
    setMedicineName("");
    setSelectedTime("08:00 AM");
    setIsCustomTime(false);
    setCustomTime("");
    setSelectedSound(alarmSounds[0]);
    setIsCustomSound(false);
    setCustomSound("");
    setCustomAudioUri(null);
    setDosageType("full_tablet");
    setDosageAmount("1");
    setShowAddModal(false);
  };
  
  const pickCustomAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setCustomSound(asset.name);
        setCustomAudioUri(asset.uri);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Error picking audio:', error);
      Alert.alert('Error', 'Failed to pick audio file.');
    }
  };

  const ReminderCard = ({ item }: { item: Reminder }) => {
    const status = statusColors[item.status];
    return (
      <View style={styles.reminderCard}>
        <View style={styles.reminderLeft}>
          <View style={[styles.reminderDosageIcon, { backgroundColor: Colors.primaryLight }]}>
            <Ionicons name={dosageIcons[item.dosageType] as any} size={22} color={Colors.primary} />
          </View>
          <View style={styles.reminderInfo}>
            <Text style={styles.reminderName}>{item.medicineName}</Text>
            <Text style={styles.reminderDosage}>
              {dosageTypeLabels[item.dosageType]} — {item.dosageAmount}
              {item.dosageType === "syrup" ? " ml" : " tab"}
            </Text>
            <View style={styles.reminderMetaRow}>
              <View style={styles.reminderTimeRow}>
                <Ionicons name="alarm-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.reminderTime}>{item.time}</Text>
              </View>
              {item.alarmSound && (
                <View style={[styles.reminderTimeRow, { marginLeft: 10 }]}>
                  <Ionicons 
                    name={item.alarmSoundUri ? "folder-open-outline" : "musical-note"} 
                    size={14} 
                    color={Colors.textMuted} 
                  />
                  <Text style={styles.reminderTime}>
                    {item.alarmSoundUri ? `File: ${item.alarmSound}` : item.alarmSound}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.reminderRight}>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
          </View>

          {item.status === "pending" && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Colors.emeraldLight }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateReminderStatus(item.id, "taken"); }}
              >
                <Ionicons name="checkmark" size={14} color={Colors.emerald} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Colors.amberLight }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateReminderStatus(item.id, "snoozed"); }}
              >
                <Ionicons name="time-outline" size={14} color={Colors.amber} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Colors.border }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateReminderStatus(item.id, "skipped"); }}
              >
                <Ionicons name="close" size={14} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); deleteReminder(item.id); }}>
            <Ionicons name="trash-outline" size={18} color={Colors.red} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const pendingCount = reminders.filter((r) => r.status === "pending").length;

  return (
    <View style={[styles.container, { paddingBottom: Platform.OS === "web" ? 34 : 0 }]}>
      <LinearGradient
        colors={["#F59E0B", "#D97706"]}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Medicine Reminders</Text>
          <Text style={styles.headerSubtitle}>{pendingCount} pending today</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="alarm-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Reminders Set</Text>
            <Text style={styles.emptySubtitle}>Add medicine reminders to never miss a dose</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowAddModal(true)}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.emptyBtnText}>Add Reminder</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => <ReminderCard item={item} />}
      />

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Reminder</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 600 }}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Medicine Name</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Paracetamol 500mg"
                  placeholderTextColor={Colors.textMuted}
                  value={medicineName}
                  onChangeText={setMedicineName}
                />
              </View>

              <View style={styles.formGroup}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={styles.formLabel}>Reminder Time</Text>
                  <TouchableOpacity onPress={() => setIsCustomTime(!isCustomTime)}>
                    <Text style={{ fontSize: 13, color: Colors.primary, fontFamily: 'Inter_600SemiBold' }}>
                      {isCustomTime ? "Use presets" : "Enter custom"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {isCustomTime ? (
                  <View style={styles.customTimeRow}>
                    <Ionicons name="time-outline" size={20} color={Colors.textMuted} style={{ marginRight: 10 }} />
                    <TextInput
                      style={{ flex: 1, height: 50, fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.textPrimary }}
                      placeholder="e.g. 05:45 PM"
                      placeholderTextColor={Colors.textMuted}
                      value={customTime}
                      onChangeText={setCustomTime}
                    />
                  </View>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
                    {timeOptions.map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[styles.timeChip, selectedTime === t && styles.timeChipActive]}
                        onPress={() => setSelectedTime(t)}
                      >
                        <Text style={[styles.timeChipText, selectedTime === t && styles.timeChipTextActive]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              <View style={styles.formGroup}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={styles.formLabel}>Alarm Sound</Text>
                  <TouchableOpacity onPress={() => setIsCustomSound(!isCustomSound)}>
                    <Text style={{ fontSize: 13, color: Colors.primary, fontFamily: 'Inter_600SemiBold' }}>
                      {isCustomSound ? "Use presets" : "Enter custom"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {isCustomSound ? (
                  <View style={{ gap: 8 }}>
                    <View style={styles.customTimeRow}>
                      <Ionicons name="musical-notes-outline" size={20} color={Colors.textMuted} style={{ marginRight: 10 }} />
                      <TextInput
                        style={{ flex: 1, height: 50, fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.textPrimary }}
                        placeholder="e.g. Morning Zen"
                        placeholderTextColor={Colors.textMuted}
                        value={customSound}
                        onChangeText={setCustomSound}
                      />
                    </View>
                    <TouchableOpacity 
                      style={[styles.emptyBtn, { backgroundColor: Colors.emeraldLight, borderColor: Colors.emerald, borderWidth: 1, height: 44, paddingVertical: 0 }]} 
                      onPress={pickCustomAudio}
                    >
                      <Ionicons name="cloud-upload-outline" size={18} color={Colors.emerald} />
                      <Text style={[styles.emptyBtnText, { color: Colors.emerald, fontSize: 13 }]}>
                        {customAudioUri ? "Change file from device" : "Pick audio from device"}
                      </Text>
                    </TouchableOpacity>
                    {customAudioUri && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 4 }}>
                        <Ionicons name="attach" size={12} color={Colors.emerald} />
                        <Text style={{ fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.emerald }} numberOfLines={1}>
                          File selected: {customSound}
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
                    {alarmSounds.map((sound) => (
                      <TouchableOpacity
                        key={sound.id}
                        style={[styles.soundChip, selectedSound.id === sound.id && styles.soundChipActive]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setSelectedSound(sound);
                        }}
                      >
                        <Ionicons name={sound.icon as any} size={16} color={selectedSound.id === sound.id ? Colors.white : Colors.textSecondary} />
                        <Text style={[styles.soundChipText, selectedSound.id === sound.id && styles.soundChipTextActive]}>{sound.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Dosage Type</Text>
                <View style={styles.dosageOptions}>
                  {(["half_tablet", "full_tablet", "syrup"] as Reminder["dosageType"][]).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.dosageOption, dosageType === type && styles.dosageOptionActive]}
                      onPress={() => setDosageType(type)}
                    >
                      <Ionicons name={dosageIcons[type] as any} size={18} color={dosageType === type ? Colors.amber : Colors.textMuted} />
                      <Text style={[styles.dosageOptionText, dosageType === type && styles.dosageOptionTextActive]}>
                        {dosageTypeLabels[type]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={[styles.formGroup, { marginBottom: 20 }]}>
                <Text style={styles.formLabel}>
                  {dosageType === "syrup" ? "Amount (ml)" : "Quantity (tablets)"}
                </Text>
                <View style={styles.qtyInputRow}>
                  <TouchableOpacity
                    style={styles.qtyCtrl}
                    onPress={() => setDosageAmount((v) => String(Math.max(0.5, parseFloat(v) - 0.5)))}
                  >
                    <Ionicons name="remove" size={20} color={Colors.amber} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.qtyInput}
                    value={dosageAmount}
                    onChangeText={setDosageAmount}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={styles.qtyCtrl}
                    onPress={() => setDosageAmount((v) => String(parseFloat(v) + 0.5))}
                  >
                    <Ionicons name="add" size={20} color={Colors.amber} />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
                <LinearGradient colors={["#F59E0B", "#D97706"]} style={styles.saveBtnGradient}>
                  <Text style={styles.saveBtnText}>Add Reminder</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  list: { padding: 16, gap: 14, paddingBottom: 40 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.textPrimary },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textMuted, textAlign: "center", paddingHorizontal: 30 },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: Colors.amber,
  },
  emptyBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  reminderCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  reminderLeft: { flexDirection: "row", gap: 12, flex: 1 },
  reminderDosageIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  reminderInfo: { flex: 1, gap: 3 },
  reminderName: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.textPrimary },
  reminderDosage: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  reminderTimeRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  reminderMetaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  reminderTime: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.textMuted },
  reminderRight: { alignItems: "flex-end", gap: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  actions: { flexDirection: "row", gap: 6 },
  actionBtn: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    gap: 20,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: "center" },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.textPrimary },
  formGroup: { gap: 10 },
  formLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary },
  formInput: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  customTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 14,
    paddingLeft: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  timeChipActive: { borderColor: Colors.amber, backgroundColor: Colors.amberLight },
  timeChipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  timeChipTextActive: { color: Colors.amber, fontFamily: "Inter_700Bold" },
  soundChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  soundChipActive: { 
    borderColor: Colors.primary, 
    backgroundColor: Colors.primary,
  },
  soundChipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  soundChipTextActive: { color: "#fff", fontFamily: "Inter_600SemiBold" },
  dosageOptions: { flexDirection: "row", gap: 10 },
  dosageOption: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    gap: 6,
  },
  dosageOptionActive: { borderColor: Colors.amber, backgroundColor: Colors.amberLight },
  dosageOptionText: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.textMuted, textAlign: "center" },
  dosageOptionTextActive: { color: Colors.amber, fontFamily: "Inter_700Bold" },
  qtyInputRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  qtyCtrl: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.amberLight,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    textAlign: "center",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
  },
  modalActions: { flexDirection: "row", gap: 12 },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.textSecondary },
  saveBtn: { flex: 2, borderRadius: 14, overflow: "hidden" },
  saveBtnGradient: { height: 50, alignItems: "center", justifyContent: "center" },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});

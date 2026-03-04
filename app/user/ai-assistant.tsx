import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

type Severity = "mild" | "moderate" | "severe" | null;

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  severity?: Severity;
  suggestions?: string[];
}

const severityConfig = {
  mild: { label: "Mild", color: "#10B981", bg: "#D1FAE5", icon: "checkmark-circle" },
  moderate: { label: "Moderate", color: "#F59E0B", bg: "#FEF3C7", icon: "warning" },
  severe: { label: "Severe", color: "#EF4444", bg: "#FEE2E2", icon: "alert-circle" },
};

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Hello! I'm your AI Health Assistant. Please describe your symptoms and I'll help assess your condition.",
    sender: "bot",
  },
];

const autoReplies: Array<{ keywords: string[]; reply: Message }> = [
  {
    keywords: ["headache", "head pain", "migraine"],
    reply: {
      id: "",
      text: "Based on your symptoms, this appears to be a tension headache or possible migraine. Please note any severity, duration, and other symptoms like nausea or light sensitivity.",
      sender: "bot",
      severity: "mild",
      suggestions: ["Rest in a dark, quiet room", "Stay hydrated", "Take OTC pain reliever (if not allergic)", "Consult doctor if pain is severe or recurring"],
    },
  },
  {
    keywords: ["fever", "temperature", "hot", "chills"],
    reply: {
      id: "",
      text: "A fever indicates your body is fighting an infection. Monitor your temperature. Seek immediate care if fever exceeds 103°F or is accompanied by severe symptoms.",
      sender: "bot",
      severity: "moderate",
      suggestions: ["Take temperature regularly", "Stay hydrated with fluids", "Use fever-reducing medication", "Visit a doctor if fever persists > 3 days"],
    },
  },
  {
    keywords: ["chest pain", "chest", "heart", "breathing difficulty", "breathless"],
    reply: {
      id: "",
      text: "Chest pain or difficulty breathing can be serious. These symptoms may indicate a cardiac or respiratory emergency. Please seek immediate medical attention.",
      sender: "bot",
      severity: "severe",
      suggestions: ["Call emergency services immediately", "Do NOT drive yourself to hospital", "Use SOS feature for immediate help", "Sit upright if breathing is difficult"],
    },
  },
  {
    keywords: ["cold", "cough", "runny nose", "sneezing"],
    reply: {
      id: "",
      text: "Your symptoms suggest a common cold or upper respiratory infection. These typically resolve within 7-10 days with proper rest and hydration.",
      sender: "bot",
      severity: "mild",
      suggestions: ["Get plenty of rest", "Drink warm fluids", "Try saline nasal drops", "Consider OTC cold medications"],
    },
  },
  {
    keywords: ["stomach", "stomach pain", "nausea", "vomiting", "abdomen"],
    reply: {
      id: "",
      text: "Gastrointestinal symptoms can have various causes. Monitor for signs of dehydration. Seek care if pain is severe or accompanied by blood.",
      sender: "bot",
      severity: "moderate",
      suggestions: ["Eat light, bland foods (BRAT diet)", "Stay hydrated with ORS", "Avoid spicy/fatty foods", "See a doctor if vomiting persists > 24hrs"],
    },
  },
];

function getAutoReply(text: string): Message {
  const lower = text.toLowerCase();
  const match = autoReplies.find((r) => r.keywords.some((k) => lower.includes(k)));
  if (match) return { ...match.reply, id: Date.now().toString() };
  return {
    id: Date.now().toString(),
    text: "Thank you for describing your symptoms. I'd like to ask a few more questions to better assess your condition. How long have you been experiencing these symptoms? On a scale of 1-10, how would you rate the discomfort?",
    sender: "bot",
    severity: null,
  };
}

function SeverityBadge({ severity }: { severity: Severity }) {
  if (!severity) return null;
  const cfg = severityConfig[severity];
  return (
    <View style={[styles.severityBadge, { backgroundColor: cfg.bg }]}>
      <Ionicons name={cfg.icon as any} size={14} color={cfg.color} />
      <Text style={[styles.severityText, { color: cfg.color }]}>{cfg.label} Condition</Text>
    </View>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isBot = msg.sender === "bot";
  return (
    <View style={[styles.messageWrapper, isBot ? styles.botWrapper : styles.userWrapper]}>
      {isBot && (
        <View style={styles.botAvatar}>
          <Ionicons name="medical" size={14} color={Colors.primary} />
        </View>
      )}
      <View style={[styles.bubble, isBot ? styles.botBubble : styles.userBubble]}>
        <Text style={[styles.bubbleText, isBot ? styles.botText : styles.userText]}>
          {msg.text}
        </Text>
        {msg.severity && <SeverityBadge severity={msg.severity} />}
        {msg.suggestions && msg.suggestions.length > 0 && (
          <View style={styles.suggestions}>
            <Text style={styles.suggestionsTitle}>Recommendations:</Text>
            {msg.suggestions.map((s, i) => (
              <View key={i} style={styles.suggestionItem}>
                <View style={styles.bullet} />
                <Text style={styles.suggestionText}>{s}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

export default function AIAssistantScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<FlatList>(null);

  const quickSymptoms = ["Headache", "Fever", "Chest Pain", "Cough", "Stomach Pain"];

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const reply = getAutoReply(text);
      setMessages((prev) => [...prev, reply]);
      setTyping(false);
    }, 1200);
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
        <View style={styles.headerTitle}>
          <View style={styles.headerIconBg}>
            <Ionicons name="medical" size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitleText}>AI Health Assistant</Text>
            <Text style={styles.headerSubtitle}>Online • Powered by AI</Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble msg={item} />}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            typing ? (
              <View style={styles.typingIndicator}>
                <View style={styles.botAvatar}>
                  <Ionicons name="medical" size={14} color={Colors.primary} />
                </View>
                <View style={styles.typingBubble}>
                  <Text style={styles.typingText}>Analyzing symptoms...</Text>
                </View>
              </View>
            ) : null
          }
        />

        <View style={styles.quickSymptomsRow}>
          {quickSymptoms.map((s) => (
            <TouchableOpacity
              key={s}
              style={styles.quickChip}
              onPress={() => sendMessage(s)}
            >
              <Text style={styles.quickChipText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.textInput}
            placeholder="Describe your symptoms..."
            placeholderTextColor={Colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  headerTitle: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  headerIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  headerSubtitle: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)" },
  messageList: { padding: 16, gap: 12, paddingBottom: 8 },
  messageWrapper: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 4 },
  botWrapper: { justifyContent: "flex-start" },
  userWrapper: { justifyContent: "flex-end", flexDirection: "row-reverse" },
  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: { maxWidth: "78%", borderRadius: 18, padding: 14 },
  botBubble: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  botText: { color: Colors.textPrimary },
  userText: { color: "#fff" },
  severityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  severityText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  suggestions: { marginTop: 12, gap: 6 },
  suggestionsTitle: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary, marginBottom: 4 },
  suggestionItem: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 6 },
  suggestionText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textSecondary, flex: 1, lineHeight: 18 },
  typingIndicator: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 4, paddingHorizontal: 16 },
  typingBubble: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  typingText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted, fontStyle: "italic" },
  quickSymptomsRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    flexWrap: "nowrap",
  },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary + "33",
  },
  quickChipText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.primary },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 10,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: Colors.background,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.4 },
});

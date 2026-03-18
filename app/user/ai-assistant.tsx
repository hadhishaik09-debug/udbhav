import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Svg, { G, Circle } from 'react-native-svg';

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  type: 'message' | 'question' | 'assessment';
  intent?: 'MEDICINE_ADVICE' | 'DOCUMENT_ANALYSIS' | 'SYMPTOM_CHECK' | 'MEDICINE_INFO' | 'MEDICINE_PLAN' | 'GENERAL';
  data?: any;
}

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Hello! I'm Aushadhara AI, your intelligent healthcare assistant. I can help you by understanding text, voice, or images of your prescriptions and symptoms. How can I assist you today?",

    sender: "bot",
    type: 'message',
    intent: 'GENERAL'
  },
];

const RiskIndicator = ({ level, percentage, color }: { level: string; percentage: number; color: string }) => {
  const getBadgeColor = () => {
    if (color === 'red') return Colors.red;
    if (color === 'yellow') return Colors.amber;
    return Colors.emerald;
  };

  const getBgColor = () => {
    if (color === 'red') return Colors.redLight;
    if (color === 'yellow') return Colors.amberLight;
    return Colors.emeraldLight;
  };

  return (
    <View style={styles.riskHeader}>
      <View style={[styles.riskBadge, { backgroundColor: getBgColor() }]}>
        <View style={[styles.dot, { backgroundColor: getBadgeColor() }]} />
        <Text style={[styles.riskLevelText, { color: getBadgeColor() }]}>{level} Risk</Text>
      </View>
      <Text style={styles.riskPercentage}>{percentage}% Reliability Score</Text>
    </View>
  );
};

const SimplePieChart = ({ data }: { data: { label: string; value: number }[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  
  return (
    <View style={styles.chartContainer}>
      <Svg height="100" width="100" viewBox="0 0 100 100">
        <G rotation="-90" origin="50, 50">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const strokeDasharray = `${percentage} ${100 - percentage}`;
            const rotation = (currentAngle / total) * 360;
            currentAngle += item.value;
            const colors = [Colors.primary, Colors.amber, Colors.emerald, Colors.red];
            
            return (
              <Circle
                key={index}
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke={colors[index % colors.length]}
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset="0"
                transform={`rotate(${rotation}, 50, 50)`}
              />
            );
          })}
        </G>
      </Svg>
      <View style={styles.legend}>
        {data.slice(0, 3).map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: [Colors.primary, Colors.amber, Colors.emerald, Colors.red][index % 4] }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function AIAssistantScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sessionState, setSessionState] = useState<any>({});
  const listRef = useRef<FlatList>(null);

  const detectIntent = (text: string): Message['intent'] => {
    const t = text.toLowerCase();
    
    // Medicine Advisor (taking medicines)
    if (t.includes('taking') || t.includes('take medicine') || t.includes('took')) return 'MEDICINE_ADVICE';
    
    // Prescription Analysis (prescription or report)
    if (t.includes('prescription') || t.includes('report')) return 'DOCUMENT_ANALYSIS';
    
    // Scan Medicine (asks about a medicine)
    if (t.includes('what is') || t.includes('about') || t.includes('tell me about')) return 'MEDICINE_INFO';
    
    // Symptom Checker (mentions symptoms)
    if (t.includes('symptom') || t.includes('fever') || t.includes('headache') || t.includes('pain')) return 'SYMPTOM_CHECK';
    
    return 'GENERAL';
  };


  const handleImageCapture = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const mockImageMsg: Message = { 
      id: Date.now().toString(), 
      text: "📷 Image captured/uploaded successfully.", 
      sender: "user", 
      type: 'message' 
    };
    setMessages(prev => [...prev, mockImageMsg]);
    setTyping(true);
    
    setTimeout(() => {
       setMessages(prev => [...prev, {
         id: (Date.now()+1).toString(),
         text: "I've received your image. Is this a prescription or a medicine?",
         sender: "bot",
         type: 'message'
       }]);
       setSessionState({ activeFlow: 'IMAGE_FLOW', step: 1 });
       setTyping(false);
    }, 800);
  };

  const handleVoiceCapture = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTyping(true);
    // Simulate "Listening..."
    setTimeout(() => {
       const simulatedText = "Can I take medicine for my cough?";
       setMessages(prev => [...prev, { 
         id: Date.now().toString(), 
         text: `🎤 Voice captured: "${simulatedText}"`, 
         sender: "user", 
         type: 'message' 
       }]);
       
       // Simulate "Did you mean" confirmation if needed (50% chance for demo)
       if (Math.random() > 0.5) {
         setMessages(prev => [...prev, {
           id: (Date.now()+1).toString(),
           text: `Did you mean: "${simulatedText}"?`,
           sender: "bot",
           type: 'message'
         }]);
         setSessionState({ activeFlow: 'VOICE_CONFIRM', step: 1, collectedData: { voiceText: simulatedText } });
         setTyping(false);
       } else {
         sendMessage(simulatedText);
       }
    }, 1500);
  };



  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      type: 'message'
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setTyping(true);

    try {
      let currentFlow = sessionState.activeFlow || 'NONE';
      let currentStep = sessionState.step || 0;
      let collectedData = sessionState.collectedData || {};

      // 0. Logic for IMAGE_FLOW
      if (currentFlow === 'IMAGE_FLOW' && currentStep === 1) {
        const t = text.toLowerCase();
        if (t.includes('prescription')) {
          setMessages(prev => [...prev, { id: Date.now().toString(), text: "Great. Please provide the text or a description of your prescription for analysis.", sender: "bot", type: 'message' }]);
          setSessionState({ activeFlow: 'PRESCRIPTION_FLOW', step: 1 });
          setTyping(false); return;
        } else if (t.includes('medicine')) {
          setMessages(prev => [...prev, { id: Date.now().toString(), text: "I'll identify it. Which medicine is shown in the image?", sender: "bot", type: 'message' }]);
          setSessionState({ activeFlow: 'NONE', step: 0 }); // Fallthrough to scan-medicine
          setTyping(false); return;
        } else {
          setMessages(prev => [...prev, { id: Date.now().toString(), text: "Image is unclear. Could you please upload a clearer image or specify if it's a medicine or prescription?", sender: "bot", type: 'message' }]);
          setTyping(false); return;
        }
      }

      // 0.1 Logic for VOICE_CONFIRM

      if (currentFlow === 'VOICE_CONFIRM' && currentStep === 1) {
        const t = text.toLowerCase();
        if (t.includes('yes') || t === 'y' || t.includes('correct')) {
          const confirmedText = sessionState.collectedData?.voiceText;
          setSessionState({ activeFlow: 'NONE', step: 0 });
          sendMessage(confirmedText);
          return;
        } else {
          setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            text: "My apologies for the misunderstanding. Please type your health concern below for precision.", 
            sender: "bot", 
            type: 'message' 
          }]);
          setSessionState({ activeFlow: 'NONE', step: 0 });
          setTyping(false); return;
        }
      }


      // 1. Logic for MEDICINE_ADVICE Multi-turn
      if (currentFlow === 'MEDICINE_ADVICE' || (currentFlow === 'NONE' && detectIntent(text) === 'MEDICINE_ADVICE')) {
        const t = text.toLowerCase();
        
        if (currentFlow === 'NONE') {
          // Attempt to extract info from initial message (Simple keyword extraction)
          const takenMatch = text.match(/took\s+([A-Za-z]+)/i);
          const timeMatch = text.match(/at\s+([0-9\s:APM,]+)/i);
          const newMatch = text.match(/take\s+([A-Za-z]+)/i);

          if (takenMatch) collectedData.taken_medicine = takenMatch[1];
          if (timeMatch) collectedData.taken_time = timeMatch[1];
          if (newMatch) collectedData.new_medicine = newMatch[1];

          if (!collectedData.taken_medicine) {
            setMessages(prev => [...prev, { id: Date.now().toString(), text: "Which medicine did you take?", sender: "bot", type: 'message' }]);
            setSessionState({ activeFlow: 'MEDICINE_ADVICE', step: 1, collectedData: {} });
            setTyping(false); return;
          } else if (!collectedData.taken_time) {
            setMessages(prev => [...prev, { id: Date.now().toString(), text: "At what time did you take it?", sender: "bot", type: 'message' }]);
            setSessionState({ activeFlow: 'MEDICINE_ADVICE', step: 2, collectedData });
            setTyping(false); return;
          } else if (!collectedData.new_medicine) {
            setMessages(prev => [...prev, { id: Date.now().toString(), text: "Which medicine do you want to take?", sender: "bot", type: 'message' }]);
            setSessionState({ activeFlow: 'MEDICINE_ADVICE', step: 3, collectedData });
            setTyping(false); return;
          }
          currentFlow = 'MEDICINE_ADVICE';
          currentStep = 3;
        } else {
           if (currentStep === 1) collectedData.taken_medicine = text;
           else if (currentStep === 2) collectedData.taken_time = text;
           else if (currentStep === 3) collectedData.new_medicine = text;

           if (!collectedData.taken_time && currentStep < 2) {
              setMessages(prev => [...prev, { id: Date.now().toString(), text: "At what time did you take it?", sender: "bot", type: 'message' }]);
              setSessionState({ ...sessionState, step: 2, collectedData });
              setTyping(false); return;
           } else if (!collectedData.new_medicine && currentStep < 3) {
              setMessages(prev => [...prev, { id: Date.now().toString(), text: "Which medicine do you want to take?", sender: "bot", type: 'message' }]);
              setSessionState({ ...sessionState, step: 3, collectedData });
              setTyping(false); return;
           }
        }

        if (collectedData.taken_medicine && collectedData.taken_time && collectedData.new_medicine) {
          setMessages(prev => [...prev, { id: Date.now().toString(), text: "READY_FOR_API", sender: "bot", type: 'message' }]);
          const response = await fetch("http://localhost:5200/api/medicine-advisor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(collectedData),
          });
          const data = await response.json();
          if (data.success) {
            setMessages(prev => [...prev, {
              id: (Date.now() + 1).toString(),
              text: data.advice || "Advice ready.",
              sender: "bot",
              type: 'message',
              intent: 'MEDICINE_ADVICE',
              data: data
            }]);
            setSessionState({ activeFlow: 'NONE', step: 0, collectedData: {} });
          }
          setTyping(false);
          return;
        }
      }

      // 2. Logic for Prescription -> Smart Plan Flow
      if (currentFlow === 'PRESCRIPTION_FLOW' || (currentFlow === 'NONE' && detectIntent(text) === 'DOCUMENT_ANALYSIS')) {
        if (currentFlow === 'NONE' && text.length < 20 && !text.includes('\n')) {
          setMessages(prev => [...prev, {
            id: (Date.now()).toString(),
            text: "Please upload your prescription (image/PDF) or provide the content from your report for analysis.",
            sender: "bot",
            type: 'message'
          }]);
          setSessionState({ activeFlow: 'PRESCRIPTION_FLOW', step: 1 });
          setTyping(false);
          return;
        }


        // Logic to analyze and then generate plan
        const analysisRes = await fetch("http://localhost:5200/api/analyze-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text }),
        });
        const analysisData = await analysisRes.json();
        
        if (analysisData.success) {
          setMessages(prev => [...prev, { id: Date.now().toString(), text: "READY_FOR_ANALYSIS", sender: "bot", type: 'message' }]);
          
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            text: "I've analyzed your prescription. Now generating your smart medicine plan...",
            sender: "bot",
            type: 'message'
          }]);
          
          // Call generate-plan with analysis context
          const planRes = await fetch("http://localhost:5200/api/generate-plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              messages: [{ role: 'user', content: `Generate a schedule for these medicines: ${JSON.stringify(analysisData.medicines || analysisData.data?.medicines)}` }] 
            }),
          });
          const planData = await planRes.json();
          
          setMessages(prev => [...prev, {
            id: (Date.now() + 2).toString(),
            text: planData.content || "Here is your generated medicine plan.",
            sender: "bot",
            type: 'message',
            intent: 'MEDICINE_PLAN'
          }]);
          setSessionState({ activeFlow: 'NONE', step: 0 });
        }
        setTyping(false);
        return;
      }

      // 3. Logic for Symptom Checker with Duration
      if (currentFlow === 'SYMPTOM_FLOW' || (currentFlow === 'NONE' && detectIntent(text) === 'SYMPTOM_CHECK')) {
          if (currentFlow === 'NONE') {
             setMessages(prev => [...prev, {
               id: Date.now().toString(),
               text: "I'll help you assess these symptoms. How long have you been experiencing them? (e.g. 2 days, since morning)",
               sender: "bot",
               type: 'message'
             }]);
             setSessionState({ activeFlow: 'SYMPTOM_FLOW', step: 1, collectedData: { symptoms: text } });
             setTyping(false);
             return;
          }
          
          const symptoms = sessionState.collectedData?.symptoms;
          const duration = text;
          
          setMessages(prev => [...prev, { id: Date.now().toString(), text: "READY_FOR_API", sender: "bot", type: 'message' }]);

          const response = await fetch("http://localhost:5200/api/symptom-checker", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: [{ role: 'user', content: `I have ${symptoms} for ${duration}` }] }),
          });
          const data = await response.json();
          if (data.success) {
            setMessages(prev => [...prev, {
              id: (Date.now() + 1).toString(),
              text: data.content || "Assessment complete.",
              sender: "bot",
              type: data.type || 'message',
              intent: 'SYMPTOM_CHECK',
              data: data.data || data
            }]);
            setSessionState({ activeFlow: 'NONE', step: 0 });
          }
          setTyping(false);
          return;
      }

      // 4. Default Routing for other intents
      const intent = detectIntent(text);
      let endpoint = "http://localhost:5200/api/chat";
      let body: any = { messages: newMessages.map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text })), state: sessionState };

      if (intent === 'MEDICINE_INFO') {
        endpoint = "http://localhost:5200/api/scan-medicine";
        body = { query: text };
        setMessages(prev => [...prev, { id: Date.now().toString(), text: "READY_FOR_API", sender: "bot", type: 'message' }]);
      }


      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        setSessionState(data.state || {});
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: data.content || data.advice || "Response received.",
          sender: "bot",
          type: data.type || 'message',
          intent: data.intent || intent,
          data: data.data || data
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "I'm having trouble connecting to the Aushadhara server. Please ensure the backend is running on port 5200.",
        sender: "bot",
        type: 'message'
      }]);
    } finally {

      setTyping(false);
    }
  };


  const renderMessageContent = (item: Message) => {
    const isBot = item.sender === "bot";
    
    // 1. Medicine Advice Intent
    if (item.intent === 'MEDICINE_ADVICE' && item.data) {
      const d = item.data;
      const isNotSafe = d.safety?.toLowerCase().includes('not safe') || d.advice?.toLowerCase().includes('not safe');
      
      return (
        <View style={styles.richCard}>
          <Text style={styles.intentTag}>Medicine Safety Advisor</Text>
          
          <View style={styles.adviceSection}>
            <View style={styles.adviceRow}>
              <Text style={[styles.adviceValue, { fontSize: 16, fontFamily: 'Inter_700Bold', color: isNotSafe ? Colors.red : Colors.emerald }]}>
                ✅ Safety: {isNotSafe ? 'Not Safe' : 'Safe'}
              </Text>
            </View>
            
            <View style={styles.adviceRow}>
               <View style={{ flex: 1 }}>
                 <Text style={styles.adviceValue}>⏱ When to Take: {d.timing}</Text>
               </View>
            </View>
            
            <View style={styles.adviceRow}>
               <View style={{ flex: 1 }}>
                 <Text style={styles.adviceValue}>⚠ Warnings: {d.safety}</Text>
               </View>
            </View>

            <View style={styles.adviceRow}>
               <View style={{ flex: 1 }}>
                 <Text style={styles.adviceValue}>💡 Advice: {d.advice}</Text>
               </View>
            </View>
          </View>

          <View style={styles.missedDoseBox}>
            <Text style={styles.missedDoseTitle}>MISSED DOSE:</Text>
            <Text style={styles.missedDoseText}>• Take as soon as you remember</Text>
            <Text style={styles.missedDoseText}>• If next dose is near → skip</Text>
            <Text style={styles.missedDoseText}>• Do NOT double dose</Text>
          </View>

          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>{d.disclaimer}</Text>
          </View>
        </View>
      );
    }

    // 2. Smart Medication Plan Intent
    if (item.intent === 'MEDICINE_PLAN' && item.data) {
      const d = item.data;
      const plans = d.plans || [d]; // Handle both array and single object
      
      return (
        <View style={styles.richCard}>
          <Text style={styles.intentTag}>Your Medicine Plan</Text>
          <Text style={styles.medTitle}>📅 Medication Schedule</Text>
          
          <View style={styles.adviceSection}>
             {plans.map((p: any, idx: number) => (
               <View key={idx} style={styles.planItem}>
                  <Text style={styles.planMedTitle}>💊 {p.medicine_name} ({p.dosage})</Text>
                  <Text style={styles.planTimeText}>- Morning: {p.morning}</Text>
                  <Text style={styles.planTimeText}>- Afternoon: {p.afternoon}</Text>
                  <Text style={styles.planTimeText}>- Night: {p.night}</Text>
                  <Text style={styles.planTimeText}>- Duration: {p.duration}</Text>
               </View>
             ))}
          </View>

          <View style={styles.recomBox}>
            <Ionicons name="notifications" size={16} color={Colors.primary} />
            <Text style={[styles.recomValue, { fontSize: 14 }]}>⏰ Reminders: Enabled</Text>
          </View>

          <View style={styles.adviceSection}>
            <Text style={styles.bodyTextSmall}>⚠ Precautions: {d.precautions}</Text>
            <Text style={styles.bodyTextSmall}>💡 Advice: {d.advice}</Text>
          </View>


          <View style={styles.missedDoseBox}>
            <Text style={styles.missedDoseTitle}>MISSED DOSE TIPS:</Text>
            <Text style={styles.missedDoseText}>• Take as soon as you remember</Text>
            <Text style={styles.missedDoseText}>• If next dose is near → skip</Text>
            <Text style={styles.missedDoseText}>• Do NOT double dose</Text>
          </View>
        </View>
      );
    }




    // 3. Medicine Info Intent
    if (item.intent === 'MEDICINE_INFO' && item.data) {
      const d = item.data;
      return (
        <View style={styles.richCard}>
          <Text style={styles.intentTag}>Medicine Information</Text>
          <View style={styles.adviceSection}>
            <Text style={styles.adviceValue}>💊 Medicine: {d.medicine_name || d.name}</Text>
            <Text style={styles.adviceValue}>📌 Uses: {d.uses}</Text>
            <Text style={styles.adviceValue}>⚠ Side Effects: {d.side_effects}</Text>
            <Text style={styles.adviceValue}>💡 Advice: {d.advice}</Text>
          </View>
          <View style={styles.missedDoseBox}>
            <Text style={styles.missedDoseTitle}>MISSED DOSE:</Text>
            <Text style={styles.missedDoseText}>• Take as soon as you remember</Text>
            <Text style={styles.missedDoseText}>• If next dose is near → skip</Text>
            <Text style={styles.missedDoseText}>• Do NOT double dose</Text>
          </View>
        </View>
      );
    }

    // 3. Document Analysis Intent
    if (item.intent === 'DOCUMENT_ANALYSIS' && item.data) {
      const d = item.data;
      return (
        <View style={styles.richCard}>
          <Text style={styles.intentTag}>Report Analysis</Text>
          <Text style={styles.bubbleText}>{item.text}</Text>
          <View style={styles.summaryBox}><Text style={styles.bodyTextSmall}>{d.summary}</Text></View>
          <Text style={styles.sectionTitle}>Clinical Findings</Text>
          <Text style={styles.bodyTextSmall}>{d.report_analysis}</Text>
          {d.medicines?.length > 0 && (
             <>
               <Text style={styles.sectionTitle}>Prescribed Meds</Text>
               {d.medicines.map((m: any, i: number) => (
                 <Text key={i} style={styles.bulletItem}>• {m.name} ({m.dosage}) - {m.timing}</Text>
               ))}
             </>
          )}
        </View>
      );
    }

    // 4. Symptom Assessment Result
    if ((item.type === 'assessment' || item.intent === 'SYMPTOM_CHECK') && item.data) {
      const d = item.data;
      return (
        <View style={styles.richCard}>
           <Text style={styles.intentTag}>Health Assessment</Text>
           <View style={styles.adviceSection}>
             <Text style={styles.adviceValue}>🩺 Possible Condition: {d.condition || d.possible_condition || d.riskLevel}</Text>
             <Text style={styles.adviceValue}>💊 Suggested Care: {d.care || d.suggested_care || d.recommendation}</Text>
             <Text style={styles.adviceValue}>⚠ Warning Signs: {d.warning_signs || d.warnings || "Consult doctor if worsening"}</Text>
             <Text style={styles.adviceValue}>👨⚕️ When to see a doctor: {d.consultation || d.when_to_see_doctor || "Urgent if severe"}</Text>
           </View>
           <TouchableOpacity style={[styles.newChatBtn, { marginTop: 20 }]} onPress={() => { setMessages(initialMessages); setSessionState({}); }}>
              <Text style={styles.newChatText}>Start New Session</Text>
           </TouchableOpacity>
        </View>
      );
    }


    // Default Bubble
    return (
      <View style={[styles.bubble, isBot ? styles.botBubble : styles.userBubble]}>
        <Text style={[styles.bubbleText, isBot ? styles.botText : styles.userText]}>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#6366F1", "#4338CA"]} style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 20 : 10) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.iconBg}><Ionicons name="pulse" size={22} color={Colors.primary} /></View>
          <View><Text style={styles.headerTitle}>Aushadhara AI</Text><Text style={styles.headerStatus}>• Intelligent Assistant Active</Text></View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.msgWrapper, item.sender === 'user' ? styles.userMsg : styles.botMsg]}>
              {item.sender === 'bot' && <View style={styles.botAvatar}><Ionicons name="medical" size={14} color={Colors.primary} /></View>}
              {renderMessageContent(item)}
            </View>
          )}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={typing ? (
            <View style={styles.msgWrapper}>
              <View style={styles.botAvatar}><Ionicons name="medical" size={14} color={Colors.primary} /></View>
              <View style={styles.typingBox}><ActivityIndicator size="small" color={Colors.textMuted} /><Text style={styles.typingText}>Thinking...</Text></View>
            </View>
          ) : null}
        />

        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity style={styles.inputActionBtn} onPress={handleImageCapture}><Ionicons name="camera" size={20} color={Colors.textMuted} /></TouchableOpacity>
          <TouchableOpacity style={styles.inputActionBtn} onPress={handleVoiceCapture}><Ionicons name="mic" size={20} color={Colors.textMuted} /></TouchableOpacity>
          <TextInput style={styles.input} placeholder="Symptoms or medicine names..." placeholderTextColor={Colors.textMuted} value={input} onChangeText={setInput} multiline />
          <TouchableOpacity style={[styles.sendBtn, !input.trim() && styles.disabled]} onPress={() => sendMessage(input)} disabled={!input.trim()}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center", gap: 15 },
  backBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center", backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14 },
  headerInfo: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  headerStatus: { fontSize: 11, color: "rgba(255,255,255,0.8)" },

  listContent: { padding: 16, gap: 16 },
  msgWrapper: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  userMsg: { justifyContent: "flex-end", flexDirection: "row-reverse" },
  botMsg: { justifyContent: "flex-start" },
  botAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primaryLight, alignItems: "center", justifyContent: "center" },
  bubble: { maxWidth: "80%", borderRadius: 20, padding: 16 },
  botBubble: { backgroundColor: Colors.white, borderBottomLeftRadius: 4, elevation: 1 },
  userBubble: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  botText: { color: Colors.textPrimary },
  userText: { color: "#fff" },

  richCard: { backgroundColor: Colors.white, padding: 18, borderRadius: 24, maxWidth: '85%', elevation: 3 },
  intentTag: { fontSize: 10, fontFamily: 'Inter_700Bold', color: Colors.primary, textTransform: 'uppercase', marginBottom: 10, backgroundColor: Colors.primaryLight, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  adviceSection: { marginTop: 15, gap: 12 },
  adviceRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  adviceIconBg: { width: 34, height: 34, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  adviceLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', color: Colors.textMuted, textTransform: 'uppercase', marginBottom: 2 },
  adviceValue: { fontSize: 13, color: Colors.textPrimary, fontFamily: 'Inter_600SemiBold', lineHeight: 18 },
  disclaimerBox: { marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  disclaimerText: { fontSize: 10, color: Colors.textMuted, fontStyle: 'italic' },
  
  medTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.textPrimary },
  medSubtitle: { fontSize: 13, color: Colors.primary, fontFamily: 'Inter_600SemiBold', marginBottom: 5 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  sectionTitle: { fontSize: 13, fontFamily: 'Inter_700Bold', color: Colors.textPrimary, marginBottom: 8, marginTop: 10 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  tagText: { fontSize: 12, color: '#475569' },
  bodyTextSmall: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  warningBox: { flexDirection: 'row', gap: 8, backgroundColor: '#FEF2F2', padding: 10, borderRadius: 12, marginTop: 15 },
  warningText: { fontSize: 11, color: Colors.red, flex: 1, fontFamily: 'Inter_500Medium' },
  bulletItem: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  summaryBox: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginBottom: 10 },

  assessmentContainer: { width: '100%', marginTop: 5 },
  assessmentCard: { borderRadius: 28, padding: 22, elevation: 5 },
  reportHeader: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.textPrimary, marginBottom: 15, textAlign: 'center' },
  riskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  riskBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  riskLevelText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  riskPercentage: { fontSize: 12, color: Colors.textMuted },
  chartContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginVertical: 10 },
  legend: { gap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: Colors.textSecondary },
  flexRow: { flexDirection: 'row', gap: 15, marginTop: 10 },
  infoColumn: { flex: 1, paddingLeft: 10 },
  columnTitle: { fontSize: 13, fontFamily: 'Inter_700Bold', color: Colors.textPrimary, marginBottom: 5 },
  colText: { fontSize: 12, color: Colors.textSecondary, marginBottom: 2 },
  doDontRow: { flexDirection: 'row', gap: 12, marginVertical: 20 },
  ddBox: { flex: 1, padding: 12, borderRadius: 18 },
  doBg: { backgroundColor: '#F0FDF4' },
  dontBg: { backgroundColor: '#FEF2F2' },
  ddTitleDo: { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#166534', marginBottom: 6 },
  ddTitleDont: { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#991B1B', marginBottom: 6 },
  ddText: { fontSize: 12, color: Colors.textPrimary, marginBottom: 3 },
  recomBox: { flexDirection: 'row', backgroundColor: '#EFF6FF', padding: 16, borderRadius: 20, alignItems: 'center', gap: 12 },
  recomTitle: { fontSize: 11, color: Colors.primary, fontFamily: 'Inter_700Bold', textTransform: 'uppercase' },
  recomValue: { fontSize: 14, color: Colors.primary, fontFamily: 'Inter_700Bold' },
  botDisclaimer: { fontSize: 10, color: Colors.textMuted, fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
  newChatBtn: { marginTop: 15, alignSelf: 'center', padding: 10 },
  newChatText: { color: Colors.primary, fontSize: 14, fontFamily: 'Inter_600SemiBold' },

  typingBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.white, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 18, elevation: 1 },
  typingText: { fontSize: 13, color: Colors.textMuted },
  inputContainer: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 16, paddingVertical: 12, gap: 12, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
  input: { flex: 1, minHeight: 46, maxHeight: 120, backgroundColor: Colors.background, borderRadius: 23, paddingHorizontal: 20, paddingVertical: 12, fontSize: 15, color: Colors.textPrimary, borderWidth: 1, borderColor: '#E2E8F0' },
  sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  disabled: { opacity: 0.4 },
  
  missedDoseBox: { marginTop: 15, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 12, borderLeftWidth: 3, borderLeftColor: Colors.amber },
  missedDoseTitle: { fontSize: 11, fontFamily: 'Inter_700Bold', color: '#92400E', textTransform: 'uppercase', marginBottom: 5 },
  missedDoseText: { fontSize: 12, color: Colors.textSecondary, marginBottom: 2, lineHeight: 18 },
  planItem: { backgroundColor: '#F1F5F9', padding: 12, borderRadius: 14, marginTop: 5 },
  planMedTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: Colors.textPrimary, marginBottom: 6 },
  planTimeText: { fontSize: 13, color: Colors.textSecondary, marginBottom: 3 },
  inputActionBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});



import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

interface Medicine {
  name: string;
  dosage: string;
  timing: string;
  clickable: boolean;
}

interface AnalysisResult {
  summary: string;
  medicines: Medicine[];
  instructions: string;
  report_analysis: string;
  certificate_details: string;
}

export default function DocumentAnalyzerScreen() {
  const insets = useSafeAreaInsets();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const handleFileUpload = async (event: any) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(URL.createObjectURL(file));
    setIsAnalyzing(true);
    setResult(null);

    const formData = new FormData();
    formData.append("document", file);

    try {
      const response = await fetch("http://localhost:5200/api/analyze-document", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.analysis);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert("Analysis Failed", data.message || "Could not analyze document.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Could not connect to medical analysis server.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMedicineClick = (name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Redirect to medicine search with the name
    router.push({
      pathname: "/user/medicine-search",
      params: { query: name }
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, "#0D47A1"]}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 20 : 10) }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Medical Document Analyzer</Text>
          <Text style={styles.headerSubtitle}>AI-powered insights for reports & prescriptions</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Upload Section */}
        <View style={styles.uploadCard}>
          {!selectedFile ? (
            <TouchableOpacity 
              style={styles.dropZone}
              onPress={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*,application/pdf';
                input.onchange = handleFileUpload;
                input.click();
              }}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="cloud-upload-outline" size={42} color={Colors.primary} />
              </View>
              <Text style={styles.uploadText}>Upload Prescription or Lab Report</Text>
              <Text style={styles.uploadSubtext}>Supports JPG, PNG and PDF</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.previewContainer}>
              <Image source={{ uri: selectedFile }} style={styles.previewImage} resizeMode="contain" />
              <TouchableOpacity 
                style={styles.retakeBtn}
                onPress={() => {
                  setSelectedFile(null);
                  setResult(null);
                }}
              >
                <Ionicons name="refresh" size={16} color="#fff" />
                <Text style={styles.retakeText}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}

          {isAnalyzing && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loaderText}>Extracting text & AI Analysis...</Text>
            </View>
          )}
        </View>

        {/* Results Section */}
        {result && (
          <View style={styles.resultContainer}>
            {/* Summary */}
            <View style={styles.resultCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="reader-outline" size={20} color={Colors.primary} />
                <Text style={styles.cardTitle}>Document Summary</Text>
              </View>
              <Text style={styles.cardText}>{result.summary}</Text>
            </View>

            {/* Medicines List */}
            {result.medicines && result.medicines.length > 0 && (
              <View style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons name="pill" size={20} color={Colors.emerald} />
                  <Text style={styles.cardTitle}>Detected Medicines</Text>
                </View>
                <View style={styles.medList}>
                  {result.medicines.map((med, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={styles.medItem}
                      onPress={() => handleMedicineClick(med.name)}
                    >
                      <View style={styles.medInfo}>
                        <Text style={styles.medName}>{med.name}</Text>
                        <Text style={styles.medDosage}>{med.dosage} • {med.timing}</Text>
                      </View>
                      <View style={styles.clickBadge}>
                        <Text style={styles.clickText}>Details</Text>
                        <Ionicons name="chevron-forward" size={12} color={Colors.primary} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Instructions */}
            <View style={styles.resultCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="information-circle-outline" size={20} color={Colors.amber} />
                <Text style={styles.cardTitle}>Doctor's Instructions</Text>
              </View>
              <Text style={styles.cardText}>{result.instructions}</Text>
            </View>

            {/* Lab / Certificate Details */}
            {(result.report_analysis !== "N/A" || result.certificate_details !== "N/A") && (
              <View style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="flask-outline" size={20} color={Colors.red} />
                  <Text style={styles.cardTitle}>Detailed Analysis</Text>
                </View>
                {result.report_analysis !== "N/A" && (
                  <Text style={styles.cardText}>{result.report_analysis}</Text>
                )}
                {result.certificate_details !== "N/A" && (
                  <Text style={[styles.cardText, { marginTop: 10 }]}>{result.certificate_details}</Text>
                )}
              </View>
            )}

            {/* Disclaimer */}
            <View style={styles.disclaimerBox}>
              <Ionicons name="warning" size={16} color={Colors.textMuted} />
              <Text style={styles.disclaimerText}>
                This is AI-generated information for educational purposes. Please consult a qualified doctor before making any medical decisions.
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
  },
  scrollContent: {
    padding: 20,
  },
  uploadCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    minHeight: 200,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    position: "relative",
  },
  dropZone: {
    alignItems: "center",
    padding: 30,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    borderRadius: 18,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F7FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  uploadText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  uploadSubtext: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 5,
  },
  previewContainer: {
    height: 250,
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  previewImage: {
    flex: 1,
  },
  retakeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: "center",
    gap: 5,
  },
  retakeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
  },
  loaderText: {
    marginTop: 15,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
  },
  resultContainer: {
    marginTop: 25,
    gap: 15,
  },
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
  },
  cardText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  medList: {
    gap: 12,
  },
  medItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
  },
  medDosage: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  clickBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  clickText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
  disclaimerBox: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    gap: 10,
    marginTop: 10,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    fontStyle: "italic",
    lineHeight: 16,
  },
});

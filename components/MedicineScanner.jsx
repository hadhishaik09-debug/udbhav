import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    ScrollView,
    Dimensions,
    Alert,
    Platform,
} from 'react-native';
import Webcam from 'react-webcam';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { scanMedicineImage } from '@/lib/api/scanMedicine';
import { Colors } from '@/constants/colors';

const { width } = Dimensions.get('window');

/**
 * MedicineScanner Component (JSX version)
 * Requirements:
 * - Use react-webcam for browser-based camera access
 * - Show camera preview & loading states
 * - Display extensive medicine results (Name, Uses, Dosage, Side Effects, Warnings, Precautions, Interactions)
 * - Modern Rounded-2xl design
 */
const MedicineScanner = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [result, setResult] = useState(null);
    const webcamRef = useRef(null);

    const capturePhoto = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            setCapturedImage(imageSrc);
            setResult(null);
        }
    };

    const handleUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setCapturedImage(e.target.result);
                setResult(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const runScan = async () => {
        if (!capturedImage) return;

        setIsScanning(true);
        try {
            const data = await scanMedicineImage(capturedImage);
            if (data.success && data.medicine) {
                setResult(data.medicine);
            } else {
                alert(data.message || "Could not identify medicine.");
            }
        } catch (error) {
            console.error("Scan error:", error);
            alert("Connection error. Please ensure the backend server is running.");
        } finally {
            setIsScanning(false);
        }
    };

    const resetScan = () => {
        setCapturedImage(null);
        setResult(null);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* Header / Title */}
            <View style={styles.header}>
                <Text style={styles.title}>Scan Medicine Strip</Text>
                <Text style={styles.subtitle}>Get detailed medical information by scanning your tablet strip.</Text>
            </View>

            {/* Main Scanner Card */}
            <View style={styles.scannerCard}>
                {!capturedImage ? (
                    <View style={styles.cameraWrapper}>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: "environment" }}
                            style={styles.webcam}
                        />
                        <View style={styles.overlay}>
                            <View style={styles.captureFrame} />
                        </View>
                        <View style={styles.controls}>
                            <TouchableOpacity style={styles.captureBtn} onPress={capturePhoto}>
                                <View style={styles.captureBtnInner} />
                            </TouchableOpacity>

                            {/* Hidden Input for File Upload button emulation */}
                            <label style={styles.uploadLabel}>
                                <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
                                <View style={styles.uploadBtn}>
                                    <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
                                </View>
                            </label>
                        </View>
                    </View>
                ) : (
                    <View style={styles.previewWrapper}>
                        <Image source={{ uri: capturedImage }} style={styles.previewImage} resizeMode="contain" />

                        {isScanning && (
                            <View style={styles.loadingOverlay}>
                                <ActivityIndicator size="large" color="#fff" />
                                <Text style={styles.loadingText}>Analyzing strip with AI...</Text>
                            </View>
                        )}

                        {!isScanning && !result && (
                            <View style={styles.actionRow}>
                                <TouchableOpacity style={[styles.btn, styles.secondaryBtn]} onPress={resetScan}>
                                    <Text style={styles.secondaryBtnText}>Retake</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.btn, styles.primaryBtn]} onPress={runScan}>
                                    <Text style={styles.primaryBtnText}>Scan Image</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </View>

            {/* Result Display */}
            {result && (
                <View style={styles.resultContainer}>
                    <View style={styles.resultCard}>
                        <LinearGradient colors={['#fff', '#f0f9ff']} style={styles.gradientHeader}>
                            <MaterialCommunityIcons name="pill" size={32} color={Colors.primary} />
                            <View>
                                <Text style={styles.resName}>{result.medicine_name}</Text>
                                <Text style={styles.resBrand}>{result.brand_name || 'Verified Medication'}</Text>
                            </View>
                        </LinearGradient>

                        <View style={styles.content}>
                            {/* Uses Section */}
                            <Text style={styles.sectionLabel}>Uses & Purpose</Text>
                            <View style={styles.tagGrid}>
                                {result.uses.map((use, idx) => (
                                    <View key={idx} style={styles.useTag}>
                                        <Text style={styles.useTagText}>{use}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Dosage Section */}
                            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Typical Dosage</Text>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoText}>{result.dosage}</Text>
                            </View>

                            {/* Side Effects & Warnings */}
                            <View style={styles.warningRow}>
                                <View style={[styles.warningBox, { backgroundColor: '#fff7ed', borderColor: '#f97316' }]}>
                                    <Text style={[styles.boxTitle, { color: '#c2410c' }]}>Side Effects</Text>
                                    {result.side_effects.slice(0, 3).map((s, i) => (
                                        <Text key={i} style={styles.bulletText}>• {s}</Text>
                                    ))}
                                </View>
                                <View style={[styles.warningBox, { backgroundColor: '#fef2f2', borderColor: '#ef4444' }]}>
                                    <Text style={[styles.boxTitle, { color: '#b91c1c' }]}>Warnings</Text>
                                    {result.warnings.slice(0, 3).map((w, i) => (
                                        <Text key={i} style={styles.bulletText}>• {w}</Text>
                                    ))}
                                </View>
                            </View>

                            {/* Precautions & Interactions */}
                            <Text style={styles.sectionLabel}>Precautions</Text>
                            {result.precautions.map((p, i) => (
                                <Text key={i} style={styles.listItem}>• {p}</Text>
                            ))}

                            <Text style={[styles.sectionLabel, { marginTop: 15 }]}>Drug Interactions</Text>
                            <Text style={styles.interactionText}>{result.drug_interactions.join(", ")}</Text>

                            <View style={styles.metaRow}>
                                <View style={styles.metaCol}>
                                    <Text style={styles.metaLabel}>Manufacturer</Text>
                                    <Text style={styles.metaVal}>{result.manufacturer}</Text>
                                </View>
                                <View style={styles.metaCol}>
                                    <Text style={styles.metaLabel}>Storage</Text>
                                    <Text style={styles.metaVal}>{result.storage}</Text>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.doneBtn} onPress={resetScan}>
                            <Text style={styles.doneBtnText}>Scan Another</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    scrollContent: { padding: 20 },
    header: { marginBottom: 20 },
    title: { fontSize: 28, fontFamily: 'Inter_700Bold', color: '#1e293b' },
    subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },

    scannerCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        height: 480,
    },
    cameraWrapper: { flex: 1, position: 'relative', backgroundColor: '#000' },
    webcam: { width: '100%', height: '100%', objectFit: 'cover' },
    overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
    captureFrame: {
        width: 250,
        height: 150,
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 20,
        borderStyle: 'dashed',
    },
    controls: {
        position: 'absolute',
        bottom: 30,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 30,
    },
    captureBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.3)',
        padding: 5,
    },
    captureBtnInner: {
        flex: 1,
        borderRadius: 30,
        backgroundColor: '#fff',
    },
    uploadLabel: { cursor: 'pointer' },
    uploadBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    previewWrapper: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
    previewImage: { width: '100%', height: '100%' },
    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#fff', marginTop: 15, fontSize: 16, fontFamily: 'Inter_600SemiBold' },
    actionRow: { position: 'absolute', bottom: 30, width: '100%', flexDirection: 'row', paddingHorizontal: 20, gap: 15 },
    btn: { flex: 1, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    primaryBtn: { backgroundColor: Colors.primary },
    secondaryBtn: { backgroundColor: 'rgba(255,255,255,0.8)', borderWidth: 1, borderColor: '#ccc' },
    primaryBtnText: { color: '#fff', fontWeight: 'bold' },
    secondaryBtnText: { color: '#333', fontWeight: 'bold' },

    resultContainer: { marginTop: 30 },
    resultCard: { backgroundColor: '#fff', borderRadius: 28, overflow: 'hidden', shadowColor: Colors.primary, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
    gradientHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, padding: 25, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    resName: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    resBrand: { fontSize: 14, color: Colors.primary, fontWeight: '600' },

    content: { padding: 20 },
    sectionLabel: { fontSize: 12, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
    tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    useTag: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    useTagText: { fontSize: 13, color: '#475569' },

    infoBox: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#e2e8f0' },
    infoText: { fontSize: 14, color: '#334155', lineHeight: 20 },

    warningRow: { flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 20 },
    warningBox: { flex: 1, padding: 12, borderRadius: 15, borderWidth: 1 },
    boxTitle: { fontSize: 14, fontWeight: '700', marginBottom: 5 },
    bulletText: { fontSize: 12, color: '#444', marginBottom: 2 },

    listItem: { fontSize: 14, color: '#475569', marginBottom: 5 },
    interactionText: { fontSize: 14, color: '#334155', fontStyle: 'italic' },

    metaRow: { flexDirection: 'row', gap: 20, marginTop: 25, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    metaCol: { flex: 1 },
    metaLabel: { fontSize: 11, color: '#94a3b8', fontWeight: 'bold' },
    metaVal: { fontSize: 13, color: '#1e293b', marginTop: 2 },

    doneBtn: { margin: 20, height: 50, backgroundColor: Colors.primary, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    doneBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default MedicineScanner;

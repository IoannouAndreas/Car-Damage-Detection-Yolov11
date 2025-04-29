import React, { useState, useEffect } from "react";
import { 
  Alert, 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet, 
  Image, 
  ScrollView, 
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useLanguage } from "@/contexts/LanguageContext";
import MediaCapture from "@/components/MediaCapture";
import { MaterialIcons } from "@expo/vector-icons";
import ResultsDisplay from "@/components/ResultsDisplay";
import { API_BASE_URL } from "@/utils/api";

const ANALYSIS_TYPES = {
  parts: "car.parts.detection",
  damage: "damage.detection",
  full: "full.scan",
} as const;

const mapToUIAnalysisType = {
  "car.parts.detection": "parts",
  "damage.detection": "damage",
  "full.scan": "full",
} as const;

type AnalysisType = keyof typeof ANALYSIS_TYPES;

export type Detection = {
  part: string;
  display_text: string;
  confidence: number;
  box?: number[];
};


// Build the full detect endpoint URL
const getAPIUrl = () => {
  const url = `${API_BASE_URL}/detect/`;
  console.log("📡 Using API URL:", url);
  return url;
};

const PhotoAnalysis: React.FC = () => {
  const params = useLocalSearchParams();
  const type: AnalysisType = (Array.isArray(params.type)
    ? params.type[0]
    : params.type || "parts") as AnalysisType;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingAPI, setLoadingAPI] = useState<boolean>(true);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null);
  const [API_URL, setAPI_URL] = useState<string>("");

  const { t } = useLanguage();
  const titleKey = ANALYSIS_TYPES[type] || "analysis";

  useEffect(() => {
    const fetchAPIUrl = async () => {
      try {
        const url = await getAPIUrl();
        console.log("📡 Using API URL:", url);
        setAPI_URL(url);
      } catch (err) {
        console.error("❌ Failed to get API URL", err);
        Alert.alert("Error", "Failed to get server URL.");
      } finally {
        setLoadingAPI(false);
      }
    };
    fetchAPIUrl();
  }, []);

  const handleCapture = (file: { uri: string }) => {
    setSelectedImage(file.uri);
    setDetections([]);
    setAnnotatedImage(null);
  };

  const handleClear = () => {
    setSelectedImage(null);
    setDetections([]);
    setAnnotatedImage(null);
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert("Error", "Please select an image first.");
      return;
    }

    if (!API_URL) {
      Alert.alert("Error", "API URL is not ready yet.");
      return;
    }

    setLoading(true);
    setDetections([]);
    setAnnotatedImage(null);

    try {
      console.log(`📡 Connecting to API at: ${API_URL}`);
      const formData = new FormData();
      formData.append("file", {
        uri: selectedImage,
        name: "upload.jpg",
        type: "image/jpeg",
      } as any);
      formData.append("analysis_type", ANALYSIS_TYPES[type]);

      console.log("📤 Sending FormData to:", API_URL);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setDetections(Array.isArray(data.detections) ? data.detections : []);
      setAnnotatedImage(data.annotated_image || null);
    } catch (error) {
      console.error("🚨 Error analyzing image:", error);
      Alert.alert("Error", "Scanning failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t(titleKey)}</Text>
      <Text style={styles.subtitle}>{t("upload.capture.photo")}</Text>
      <MediaCapture
        mediaType="photo"
        onCapture={handleCapture}
        onClear={handleClear}
        isLoading={loading}
        capturedMedia={selectedImage}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={analyzeImage}
          disabled={!selectedImage || loading || loadingAPI}
        >
          {loading || loadingAPI ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="camera" size={20} color="#fff" />
              <Text style={styles.buttonText}>{t("analyze.image")}</Text>
            </>
          )}
        </TouchableOpacity>

        {detections.length > 0 && (
          <TouchableOpacity style={[styles.button, styles.outlineButton]} onPress={handleClear}>
            <MaterialIcons name="refresh" size={20} color="#D32F2F" />
            <Text style={[styles.buttonText, { color: "#D32F2F" }]}>{t("reset")}</Text>
          </TouchableOpacity>
        )}
      </View>

      {annotatedImage && (
        <View style={styles.annotatedContainer}>
          <Text style={styles.resultsTitle}>Annotated Image:</Text>
          <Image
            source={{ uri: `data:image/jpeg;base64,${annotatedImage}` }}
            style={styles.annotatedImage}
          />
        </View>
      )}

      {detections.length > 0 && (
        <ResultsDisplay
          detections={detections}
          analysisType={mapToUIAnalysisType[ANALYSIS_TYPES[type]]}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 16,
    gap: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#D32F2F",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#fff",
  },
  results: {
    width: "100%",
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
  },
  annotatedContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  annotatedImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
});

export default PhotoAnalysis;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Video from "react-native-video";
import PageTransition from "@/components/PageTransition";
import MediaCapture from "@/components/MediaCapture";
import ResultsDisplay from "@/components/ResultsDisplay";
import { API_BASE_URL } from "@/utils/api";

const ANALYSIS_TYPES = {
  parts: "Parts Detection",
  damage: "Damage Detection",
  full: "Full Scan",
} as const;

type AnalysisType = keyof typeof ANALYSIS_TYPES;

interface Detection {
  part?: string;
  damage?: string;
  confidence: number;
  display_text?: string;
}

const getAPIUrl = () => {
  const url = `${API_BASE_URL}`;
  console.log("📡 Using API URL:", url);
  return url;
};

const VideoAnalysis: React.FC = () => {
  const params = useLocalSearchParams();
  const type: AnalysisType = (Array.isArray(params.type)
    ? params.type[0]
    : params.type || "parts") as AnalysisType;

  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [annotatedVideoUrl, setAnnotatedVideoUrl] = useState<string | null>(null);
  const [API_URL, setAPI_URL] = useState<string>("");
  const [averageConfidence, setAverageConfidence] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    const fetchAPIUrl = async () => {
      const url = await getAPIUrl();
      console.log("📡 Using API URL:", url);
      setAPI_URL(url);
    };
    fetchAPIUrl();
  }, []);

  const handleCapture = (file: { uri: string }) => {
    if (!file.uri) {
      console.error("🚨 Capture failed, no file URI!");
      return;
    }

    console.log("📹 Captured Video URI:", file.uri);
    setSelectedVideo(file.uri);
    setDetections([]);
    setAnnotatedVideoUrl(null);
    setAverageConfidence(null);
  };

  const handleClear = () => {
    setSelectedVideo(null);
    setDetections([]);
    setAnnotatedVideoUrl(null);
    setAverageConfidence(null);
  };

  const analyzeVideo = async () => {
    if (!selectedVideo) {
      Alert.alert("Error", "Please select a video first.");
      return;
    }

    setLoading(true);
    setDetections([]);
    setAnnotatedVideoUrl(null);
    setAverageConfidence(null);

    try {
      console.log(`📡 Connecting to API at: ${API_URL}/detect_video/`);

      const formData = new FormData();
      formData.append("file", {
        uri: selectedVideo,
        name: "video.mp4",
        type: "video/mp4",
      } as any);
      formData.append("analysis_type", type);

      const response = await fetch(`${API_URL}/detect_video/`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ API Response:", data);

      setDetections(Array.isArray(data.detections) ? data.detections : []);
      setAverageConfidence(data.average_confidence || null);

      if (data.annotated_video_url) {
        const processedVideoURL = `${API_URL}${data.annotated_video_url.replace(
          "/detect_video",
          ""
        )}`;
        setAnnotatedVideoUrl(processedVideoURL);
        console.log("📺 Processed Video URL:", processedVideoURL);
      }
    } catch (error) {
      console.error("🚨 Error analyzing video:", error);
      Alert.alert("Error", "Video analysis failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <PageTransition>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>{ANALYSIS_TYPES[type]} Selected Video</Text>

          {selectedVideo ? (
            <View style={styles.videoContainer}>
              <Text style={styles.videoTitle}>Preview Video</Text>
              <Video
                source={{ uri: selectedVideo }}
                style={styles.videoPlayer}
                controls
                resizeMode="contain"
                onError={(error) => console.error("🚨 Preview Video Error:", error)}
              />
            </View>
          ) : (
            <View style={styles.captureContainer}>
              <MediaCapture
                key="media-capture"
                mediaType="video"
                onCapture={handleCapture}
                onClear={handleClear}
                isLoading={loading}
                capturedMedia={selectedVideo}
              />
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={analyzeVideo}
              disabled={!selectedVideo || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <MaterialIcons name="videocam" size={20} color="#fff" />
              )}
              <Text style={styles.buttonText}>Analyze Video</Text>
            </TouchableOpacity>

            {detections.length > 0 && (
              <TouchableOpacity
                style={[styles.button, styles.outlineButton]}
                onPress={handleClear}
              >
                <MaterialIcons name="refresh" size={20} color="#D32F2F" />
                <Text style={[styles.buttonText, { color: "#D32F2F" }]}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>

          <ResultsDisplay
            detections={detections}
            annotatedVideo={annotatedVideoUrl}
            analysisType={type}
            average_confidence={averageConfidence ?? undefined}
          />
        </View>
      </ScrollView>
    </PageTransition>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  captureContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    height: 350,
    backgroundColor: "#f0f0f0",
    marginBottom: 20,
    borderRadius: 10,
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
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#fff",
  },
  videoContainer: {
    marginTop: 20,
    alignItems: "center",
    borderRadius: 10,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  videoPlayer: {
    width: 350,
    height: 280,
    borderRadius: 10,
    backgroundColor: "#000",
  },
});

export default VideoAnalysis;

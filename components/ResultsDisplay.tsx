import React from "react";
import { View, Text, Image, FlatList, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Video from "react-native-video";

export interface Detection {
  part?: string;
  damage?: string;
  confidence: number;
  display_text?: string;
  box?: number[];
}

interface ResultsDisplayProps {
  detections: Detection[];
  average_confidence?: Record<string, number>;
  annotatedImage?: string | null;
  annotatedVideo?: string | null;
  analysisType: "parts" | "damage" | "full";
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  detections,
  average_confidence,
  annotatedImage,
  annotatedVideo,
  analysisType,
}) => {
  if (!detections.length && !annotatedImage && !annotatedVideo && !average_confidence) {
    return null;
  }

  const formatConfidence = (confidence: number) => {
    return `${(confidence * 1).toFixed(1)}%`;
  };

  const getTitle = () => {
    switch (analysisType) {
      case "parts":
        return "Car Parts Detected";
      case "damage":
        return "Damage Detected";
      case "full":
      default:
        return "Full Scan Results";
    }
  };

  return (
    <View style={styles.container}>
      {(annotatedImage || annotatedVideo) && (
        <View style={styles.previewWrapper}>
          {annotatedImage ? (
            <Image source={{ uri: annotatedImage }} style={styles.image} resizeMode="contain" />
          ) : (
            <Video
              source={{ uri: annotatedVideo! }}
              style={styles.video}
              controls
              resizeMode="contain"
              onError={(e) => console.error("📹 Video Error", e)}
            />
          )}
        </View>
      )}

      <View style={styles.resultCard}>
        <View style={styles.header}>
          <Icon name="information" size={20} color="#4F46E5" />
          <Text style={styles.headerText}>{getTitle()}</Text>
        </View>

        {detections.length > 0 ? (
          <FlatList
            data={detections}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.detectionItem,
                  item.damage ? styles.damageItem : styles.partItem,
                ]}
              >
                <View style={styles.detectionLabel}>
                  <Icon
                    name={item.damage ? "alert-circle" : "check-circle"}
                    size={18}
                    color={item.damage ? "#EF4444" : "#22C55E"}
                  />
                  <Text style={styles.detectionText}>
                    {item.display_text ||
                      (item.part && item.damage
                        ? `${item.part} - ${item.damage}`
                        : item.part || item.damage || "Unknown")}
                  </Text>
                </View>
                <Text style={styles.confidence}>{formatConfidence(item.confidence)}</Text>
              </View>
            )}
          />
        ) : (
          (!average_confidence || Object.keys(average_confidence).length === 0) && (
            <Text style={styles.noDetections}>
              No detections found. Please try a different file.
            </Text>
          )
        )}
      </View>

      {/* Average Confidence Table (Only for Parts Analysis) */}
      {analysisType === "parts" && average_confidence && Object.keys(average_confidence).length > 0 && (
        <View style={styles.resultCard}>
          <Text style={styles.headerText}>Average Confidence:</Text>
          {Object.entries(average_confidence).map(([label, val]) => (
            <View key={label} style={styles.detectionItem}>
              <View style={styles.detectionLabel}>
                <Icon name="car-cog" size={18} color="#4B5563" />
                <Text style={styles.detectionText}>{label}</Text>
              </View>
              <Text style={styles.confidence}>{(val * 100).toFixed(1)}%</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 10,
  },
  imageWrapper: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f3f3f3",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  video: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  previewWrapper: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f3f3f3",
    marginBottom: 10,
  },
  resultCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  detectionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  partItem: {
    backgroundColor: "#f0f9ff",
  },
  damageItem: {
    backgroundColor: "#fee2e2",
  },
  detectionLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  detectionText: {
    fontSize: 14,
    marginLeft: 6,
  },
  confidence: {
    fontSize: 12,
    fontFamily: "monospace",
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  noDetections: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 10,
  },
});

export default ResultsDisplay;

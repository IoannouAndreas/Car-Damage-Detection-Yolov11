import React from "react";
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import PageTransition from "@/components/PageTransition";
import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";

const VideoRecognition = () => {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <PageTransition>
      <View style={styles.container}>
        <Header title={t("video.recognition")} subtitle={t("select.analysis.type")} showBackButton />
        
        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.card} onPress={() => router.push("/VideoAnalysis?type=parts")}> 
            <MaterialIcons name="build" size={32} color="#007AFF" />
            <Text style={styles.cardTitle}>{t("car.parts")}</Text>
            <Text style={styles.cardDescription}>{t("car.parts.description")}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.card} onPress={() => router.push("/VideoAnalysis?type=damage")}> 
            <MaterialIcons name="security" size={32} color="#007AFF" />
            <Text style={styles.cardTitle}>{t("damage.detection")}</Text>
            <Text style={styles.cardDescription}>{t("damage.detection.description")}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.card} onPress={() => router.push("/VideoAnalysis?type=full")}> 
            <MaterialIcons name="qr-code-scanner" size={32} color="#007AFF" />
            <Text style={styles.cardTitle}>{t("full.scan")}</Text>
            <Text style={styles.cardDescription}>{t("full.scan.description")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </PageTransition>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  cardContainer: {
    marginTop: 20,
    gap: 16,
  },
  card: {
    backgroundColor: "#E6F0FF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    textAlign: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
});

export default VideoRecognition;

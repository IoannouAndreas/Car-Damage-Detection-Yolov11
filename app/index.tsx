import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "@/contexts/LanguageContext"; 
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { IconButton } from "react-native-paper";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";

const Index: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useLanguage();

  return (
    <PageTransition>
      <View style={styles.container}>
        <Header title={t("app.title")} subtitle={t("app.subtitle")} />
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View style={styles.card} entering={FadeInDown.delay(200).springify()}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <IconButton icon="information-outline" size={24} iconColor="#007AFF" />
              </View>
              <Text style={styles.title}>{t("how.works")}</Text>
            </View>
            <Text style={styles.description}>{t("how.works.description")}</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).springify()}>
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => navigation.navigate("PhotoRecognition" as never)} 
            >
              <IconButton icon="camera" size={24} iconColor="#007AFF" />
              <Text style={styles.optionTitle}>{t("photo.recognition")}</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(600).springify()}>
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => navigation.navigate("VideoRecognition" as never)} 
            >
              <IconButton icon="video" size={24} iconColor="#007AFF" />
              <Text style={styles.optionTitle}>{t("video.recognition")}</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    </PageTransition>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconContainer: {
    backgroundColor: "#007AFF10",
    padding: 6,
    borderRadius: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  description: {
    color: "#666",
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f0ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default Index;

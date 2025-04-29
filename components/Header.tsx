import React from "react";
import { useRouter, usePathname } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, showBackButton = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();

  const goBack = () => {
    if (pathname.includes("/PhotoAnalysis") || pathname.includes("/VideoAnalysis")) {
      router.push(pathname.includes("/PhotoAnalysis") ? "/PhotoRecognition" : "/VideoRecognition");
    } else if (pathname === "/PhotoRecognition" || pathname === "/VideoRecognition") {
      router.push("/");
    } else {
      router.back();
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "el" : "en");
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.leftContainer}>
          {showBackButton && (
            <TouchableOpacity style={styles.backButton} onPress={goBack}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>

        <TouchableOpacity style={styles.languageButton} onPress={toggleLanguage}>
          <MaterialIcons name="language" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#222",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 10,
    padding: 8,
    backgroundColor: "#444",
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#bbb",
  },
  languageButton: {
    padding: 8,
    backgroundColor: "#444",
    borderRadius: 20,
  },
});

export default Header;

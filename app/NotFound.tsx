import React, { useEffect } from "react";
import { useRouter, usePathname } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import PageTransition from "@/components/PageTransition";

const NotFound = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <PageTransition>
      <View style={styles.container}>
        <View style={styles.content}>
          <Animated.View entering={FadeIn.springify()} style={styles.iconContainer}>
            <MaterialIcons name="error-outline" size={40} color="#D32F2F" />
          </Animated.View>
          
          <Animated.Text entering={FadeInUp.delay(100).springify()} style={styles.title}>
            404
          </Animated.Text>
          
          <Animated.Text entering={FadeInUp.delay(200).springify()} style={styles.subtitle}>
            Oops! Page not found
          </Animated.Text>
          
          <Animated.View entering={FadeInUp.delay(300).springify()}>
            <TouchableOpacity style={styles.button} onPress={() => router.push("/")}> 
              <MaterialIcons name="arrow-back" size={20} color="#fff" />
              <Text style={styles.buttonText}>Return to Home</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </PageTransition>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  content: {
    maxWidth: 320,
    width: "100%",
    alignItems: "center",
    textAlign: "center",
  },
  iconContainer: {
    backgroundColor: "#FFEBEE",
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D32F2F",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default NotFound;

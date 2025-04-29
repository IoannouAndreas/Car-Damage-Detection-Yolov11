import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface OptionCardProps {
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
  onClick: () => void;
  className?: string;
}

const OptionCard: React.FC<OptionCardProps> = ({
  icon,
  titleKey,
  descriptionKey,
  onClick,
  className,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onClick}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{titleKey}</Text>
        <Text style={styles.description}>{descriptionKey}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#444",
    marginBottom: 12,
  },
  iconContainer: {
    marginBottom: 8,
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  description: {
    fontSize: 14,
    color: "#bbb",
    textAlign: "center",
    marginTop: 4,
  },
});

export default OptionCard;

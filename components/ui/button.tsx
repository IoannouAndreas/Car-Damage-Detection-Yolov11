import React, { forwardRef } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
} from "react-native";

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  children: React.ReactNode;
}

const buttonVariants: Record<ButtonVariant, object> = {
  default: { backgroundColor: "#007bff" },
  destructive: { backgroundColor: "#dc3545" },
  outline: { borderWidth: 1, borderColor: "#007bff", backgroundColor: "transparent" },
  secondary: { backgroundColor: "#6c757d" },
  ghost: { backgroundColor: "transparent" },
  link: { backgroundColor: "transparent" },
};

const buttonSizes: Record<ButtonSize, object> = {
  default: { height: 40, paddingHorizontal: 16 },
  sm: { height: 36, paddingHorizontal: 12 },
  lg: { height: 44, paddingHorizontal: 20 },
  icon: { width: 40, height: 40 },
};

const Button = forwardRef<React.ElementRef<typeof TouchableOpacity>, ButtonProps>(
  ({ variant = "default", size = "default", asChild = false, children, style, ...props }, ref) => {
    const buttonStyle = [
      styles.base,
      buttonVariants[variant],
      buttonSizes[size],
      style,
    ];

    return (
      <TouchableOpacity ref={ref} style={buttonStyle} {...props}>
        {typeof children === "string" ? <Text style={styles.text}>{children}</Text> : children}
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  text: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});

export { Button };

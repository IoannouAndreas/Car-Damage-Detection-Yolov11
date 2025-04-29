// app/_layout.tsx
import React from 'react';
import { Slot } from 'expo-router';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { View, StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <LanguageProvider>
      <View style={styles.container}>
        <Slot />
      </View>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

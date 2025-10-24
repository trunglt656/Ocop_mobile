import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function FavoritesScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Sản phẩm yêu thích' }} />
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Sản phẩm yêu thích</ThemedText>
        <ThemedText style={styles.message}>
          Tính năng đang được phát triển. Vui lòng quay lại sau!
        </ThemedText>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});

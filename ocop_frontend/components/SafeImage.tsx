import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image, ImageProps } from 'expo-image';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';

interface SafeImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string };
  fallbackIcon?: string;
}

export function SafeImage({ source, style, fallbackIcon = 'photo', ...props }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !source.uri) {
    return (
      <View style={[style, styles.fallbackContainer]}>
        <IconSymbol name={fallbackIcon} size={32} color="#CBD5E1" />
        <ThemedText style={styles.fallbackText}>Không có ảnh</ThemedText>
      </View>
    );
  }

  return (
    <Image
      {...props}
      source={source}
      style={style}
      onError={() => {
        setHasError(true);
      }}
    />
  );
}

const styles = StyleSheet.create({
  fallbackContainer: {
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fallbackText: {
    fontSize: 11,
    color: '#94A3B8',
  },
});

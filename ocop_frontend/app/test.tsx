import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function TestScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 OCOP Test Screen</Text>
      <Text style={styles.subtitle}>Ứng dụng đang hoạt động!</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/')}>
        <Text style={styles.buttonText}>Về trang chủ</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/product/1')}>
        <Text style={styles.buttonText}>Xem sản phẩm mẫu</Text>
      </TouchableOpacity>

      <Text style={styles.info}>
        ✅ Frontend React Native/Expo hoạt động{'\n'}
        ✅ API Integration sẵn sàng{'\n'}
        ✅ AsyncStorage tokens{'\n'}
        ✅ Fallback mock data{'\n'}
        ✅ 10 sản phẩm OCOP với hình ảnh
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    marginTop: 32,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
  },
});

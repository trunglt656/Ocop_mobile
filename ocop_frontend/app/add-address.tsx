import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { addressService, CreateAddressRequest } from '@/services/addressService';
import { Colors } from '@/constants/theme';

export default function AddAddressScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateAddressRequest>({
    name: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    province: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof CreateAddressRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddAddress = async () => {
    try {
      setLoading(true);
      const response = await addressService.createAddress(formData);
      if (response.success) {
        Alert.alert('Thành công', 'Đã thêm địa chỉ mới', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể thêm địa chỉ');
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Thêm địa chỉ mới' }} />
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <ThemedText style={styles.label}>Họ và tên</ThemedText>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
            placeholder="Nguyễn Văn A"
          />

          <ThemedText style={styles.label}>Số điện thoại</ThemedText>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => handleInputChange('phone', text)}
            placeholder="09xxxxxxxx"
            keyboardType="phone-pad"
          />

          <ThemedText style={styles.label}>Địa chỉ</ThemedText>
          <TextInput
            style={styles.input}
            value={formData.address}
            onChangeText={(text) => handleInputChange('address', text)}
            placeholder="Số nhà, tên đường"
          />

          <ThemedText style={styles.label}>Phường/Xã</ThemedText>
          <TextInput
            style={styles.input}
            value={formData.ward}
            onChangeText={(text) => handleInputChange('ward', text)}
            placeholder="Phường 1"
          />

          <ThemedText style={styles.label}>Quận/Huyện</ThemedText>
          <TextInput
            style={styles.input}
            value={formData.district}
            onChangeText={(text) => handleInputChange('district', text)}
            placeholder="Quận 1"
          />

          <ThemedText style={styles.label}>Tỉnh/Thành phố</ThemedText>
          <TextInput
            style={styles.input}
            value={formData.province}
            onChangeText={(text) => handleInputChange('province', text)}
            placeholder="TP. Hồ Chí Minh"
          />

          <TouchableOpacity style={styles.button} onPress={handleAddAddress} disabled={loading}>
            <ThemedText style={styles.buttonText}>{loading ? 'Đang lưu...' : 'Lưu địa chỉ'}</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AssetIcon } from '@/components/ui/asset-icon';
import { shopService } from '@/services';
import type { Shop } from '@/services/shopService';

export default function ShopSettingsScreen() {
  const router = useRouter();
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (shopId) {
      loadShop();
    }
  }, [shopId]);

  const loadShop = async () => {
    try {
      setLoading(true);
      const shopData = await shopService.getShop(shopId);
      setShop(shopData);
      setFormData({
        name: shopData.name,
        description: shopData.description || '',
        address: shopData.address,
        phone: shopData.contact.phone,
        email: shopData.contact.email,
      });
    } catch (error: any) {
      console.error('Error loading shop:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin shop');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Lỗi', 'Tên shop không được để trống');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Lỗi', 'Số điện thoại không được để trống');
      return;
    }

    try {
      setSaving(true);
      await shopService.updateShop(shopId, {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        contact: {
          phone: formData.phone,
          email: formData.email,
        },
      });
      Alert.alert('Thành công', 'Đã cập nhật thông tin shop');
      router.back();
    } catch (error: any) {
      console.error('Error updating shop:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin shop');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Cài đặt Shop</ThemedText>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Shop Name */}
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>
              Tên Shop <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <View style={styles.inputWrapper}>
              <AssetIcon name="shop" size={18} color="#64748B" />
              <TextInput
                style={styles.input}
                placeholder="Nhập tên shop"
                placeholderTextColor="#94A3B8"
                value={formData.name}
                onChangeText={(value) => setFormData({ ...formData, name: value })}
                editable={!saving}
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Mô tả</ThemedText>
            <View style={styles.textAreaWrapper}>
              <TextInput
                style={styles.textArea}
                placeholder="Mô tả về shop của bạn..."
                placeholderTextColor="#94A3B8"
                value={formData.description}
                onChangeText={(value) => setFormData({ ...formData, description: value })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!saving}
              />
            </View>
          </View>

          {/* Address */}
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>
              Địa chỉ <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <View style={styles.inputWrapper}>
              <IconSymbol name="mappin.circle.fill" size={18} color="#64748B" />
              <TextInput
                style={styles.input}
                placeholder="Địa chỉ shop"
                placeholderTextColor="#94A3B8"
                value={formData.address}
                onChangeText={(value) => setFormData({ ...formData, address: value })}
                editable={!saving}
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>
              Số điện thoại <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <View style={styles.inputWrapper}>
              <IconSymbol name="phone.fill" size={18} color="#64748B" />
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại liên hệ"
                placeholderTextColor="#94A3B8"
                value={formData.phone}
                onChangeText={(value) => setFormData({ ...formData, phone: value })}
                keyboardType="phone-pad"
                editable={!saving}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <View style={styles.inputWrapper}>
              <IconSymbol name="envelope.fill" size={18} color="#64748B" />
              <TextInput
                style={styles.input}
                placeholder="Email liên hệ"
                placeholderTextColor="#94A3B8"
                value={formData.email}
                onChangeText={(value) => setFormData({ ...formData, email: value })}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!saving}
              />
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <IconSymbol name="info.circle.fill" size={24} color="#2563EB" />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoText}>
                Thông tin shop sẽ được hiển thị cho khách hàng khi họ xem sản phẩm của bạn.
              </ThemedText>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <ThemedText style={styles.saveButtonText}>Đang lưu...</ThemedText>
              </>
            ) : (
              <>
                <IconSymbol name="checkmark.circle.fill" size={20} color="#FFFFFF" />
                <ThemedText style={styles.saveButtonText}>Lưu thay đổi</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#0F172A',
  },
  textAreaWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textArea: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#0F172A',
    minHeight: 80,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoContent: {
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#1E40AF',
    lineHeight: 18,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
});

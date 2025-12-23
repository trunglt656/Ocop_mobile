import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

import { useAuth } from '@/contexts/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { authService } from '@/services/authService';
import { uploadService } from '@/services/uploadService';
import { getImageUrl } from '@/utils/imageHelper';

const FALLBACK_AVATAR = 'https://ui-avatars.com/api/?name=User&background=4C6FFF&color=fff&size=200';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Validate form
  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
      return false;
    }

    if (name.trim().length < 2) {
      Alert.alert('Lỗi', 'Họ tên phải có ít nhất 2 ký tự');
      return false;
    }

    if (!phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return false;
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone.trim())) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ (10-11 số)');
      return false;
    }

    return true;
  };

  // Pick image from library
  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Thông báo', 'Ứng dụng cần quyền truy cập thư viện ảnh');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploadingImage(true);
        
        try {
          const selectedImage = result.assets[0];
          
          // Upload to server
          const uploadResult = await uploadService.uploadImage({
            uri: selectedImage.uri,
            name: `avatar_${Date.now()}.jpg`,
            type: 'image/jpeg',
          });

          // Get full URL
          const fullUrl = uploadService.getFileUrl(uploadResult.url);
          setAvatar(fullUrl);
          
          Alert.alert('Thành công', 'Đã chọn ảnh đại diện mới');
        } catch (uploadError: any) {
          console.error('Upload error:', uploadError);
          Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại');
        } finally {
          setIsUploadingImage(false);
        }
      }
    } catch (error) {
      setIsUploadingImage(false);
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại');
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Thông báo', 'Ứng dụng cần quyền truy cập camera');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploadingImage(true);
        
        try {
          const photo = result.assets[0];
          
          // Upload to server
          const uploadResult = await uploadService.uploadImage({
            uri: photo.uri,
            name: `avatar_${Date.now()}.jpg`,
            type: 'image/jpeg',
          });

          // Get full URL
          const fullUrl = uploadService.getFileUrl(uploadResult.url);
          setAvatar(fullUrl);
          
          Alert.alert('Thành công', 'Đã chụp ảnh đại diện mới');
        } catch (uploadError: any) {
          console.error('Upload error:', uploadError);
          Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại');
        } finally {
          setIsUploadingImage(false);
        }
      }
    } catch (error) {
      setIsUploadingImage(false);
      console.error('Error taking photo:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại');
    }
  };

  // Show image picker options
  const showImageOptions = () => {
    Alert.alert(
      'Chọn ảnh đại diện',
      'Bạn muốn chọn ảnh từ đâu?',
      [
        {
          text: 'Thư viện',
          onPress: pickImage,
        },
        {
          text: 'Chụp ảnh',
          onPress: takePhoto,
        },
        {
          text: 'Hủy',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  // Handle save profile
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        avatar: avatar,
      });

      if (response.success && response.data) {
        // Update user in context
        updateUser(response.data);
        
        Alert.alert('Thành công', 'Cập nhật hồ sơ thành công', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể cập nhật hồ sơ';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (name !== user?.name || phone !== user?.phone || avatar !== user?.avatar) {
      Alert.alert(
        'Xác nhận',
        'Bạn có thay đổi chưa lưu. Bạn có chắc muốn hủy?',
        [
          {
            text: 'Tiếp tục chỉnh sửa',
            style: 'cancel',
          },
          {
            text: 'Hủy thay đổi',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
          <IconSymbol name="chevron.left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Chỉnh sửa hồ sơ</ThemedText>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: getImageUrl(avatar) || FALLBACK_AVATAR }}
              style={styles.avatar}
              contentFit="cover"
            />
            {isUploadingImage && (
              <View style={styles.avatarLoading}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.changeAvatarButton}
            onPress={showImageOptions}
            disabled={isUploadingImage}
          >
            <IconSymbol name="camera.fill" size={18} color="#4C6FFF" />
            <ThemedText style={styles.changeAvatarText}>Thay đổi ảnh đại diện</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Email (Read-only) */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>
              Email <ThemedText style={styles.readonly}>(không thể thay đổi)</ThemedText>
            </ThemedText>
            <View style={[styles.input, styles.readonlyInput]}>
              <IconSymbol name="envelope.fill" size={20} color="#9CA3AF" />
              <ThemedText style={styles.readonlyText}>{user?.email}</ThemedText>
            </View>
          </View>

          {/* Name */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>
              Họ và tên <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <View style={styles.input}>
              <IconSymbol name="person.fill" size={20} color="#6B7280" />
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Nhập họ và tên"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                maxLength={50}
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>
              Số điện thoại <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <View style={styles.input}>
              <IconSymbol name="phone.fill" size={20} color="#6B7280" />
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="Nhập số điện thoại"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={11}
              />
            </View>
          </View>

          {/* Role (Read-only) */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Vai trò</ThemedText>
            <View style={[styles.input, styles.readonlyInput]}>
              <IconSymbol name="shield.fill" size={20} color="#9CA3AF" />
              <ThemedText style={styles.readonlyText}>
                {user?.role === 'admin' && 'Quản trị viên'}
                {(user?.role as string) === 'shop_owner' && 'Chủ cửa hàng'}
                {(user?.role as string) === 'shop_admin' && 'Quản lý cửa hàng'}
                {(user?.role as string) === 'shop_staff' && 'Nhân viên cửa hàng'}
                {user?.role === 'user' && 'Khách hàng'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Change Password Link */}
        <TouchableOpacity
          style={styles.changePasswordLink}
          onPress={() => router.push('/change-password')}
        >
          <IconSymbol name="lock.fill" size={20} color="#4C6FFF" />
          <ThemedText style={styles.changePasswordText}>Đổi mật khẩu</ThemedText>
          <IconSymbol name="chevron.right" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          disabled={isLoading}
        >
          <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
              <ThemedText style={styles.saveButtonText}>Lưu thay đổi</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E5E7EB',
  },
  avatarLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
  },
  changeAvatarText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4C6FFF',
  },
  formSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  required: {
    color: '#EF4444',
  },
  readonly: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  readonlyInput: {
    backgroundColor: '#F3F4F6',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  readonlyText: {
    flex: 1,
    fontSize: 15,
    color: '#6B7280',
  },
  changePasswordLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    marginTop: 16,
  },
  changePasswordText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#4C6FFF',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#4C6FFF',
    borderRadius: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

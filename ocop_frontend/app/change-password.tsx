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
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { authService } from '@/services/authService';

export default function ChangePasswordScreen() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validate form
  const validateForm = () => {
    if (!currentPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu hiện tại');
      return false;
    }

    if (!newPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu mới');
      return false;
    }

    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return false;
    }

    if (newPassword === currentPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải khác mật khẩu hiện tại');
      return false;
    }

    if (!confirmPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng xác nhận mật khẩu mới');
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return false;
    }

    return true;
  };

  // Handle change password
  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.changePassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });

      if (response.success) {
        Alert.alert('Thành công', 'Đổi mật khẩu thành công', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể đổi mật khẩu';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (currentPassword || newPassword || confirmPassword) {
      Alert.alert(
        'Xác nhận',
        'Bạn có chắc muốn hủy?',
        [
          {
            text: 'Tiếp tục',
            style: 'cancel',
          },
          {
            text: 'Hủy',
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
          <IconSymbol name="chevron.left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Đổi mật khẩu</ThemedText>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <IconSymbol name="info.circle.fill" size={24} color="#3B82F6" />
          <View style={styles.infoBannerContent}>
            <ThemedText style={styles.infoBannerTitle}>Bảo mật tài khoản</ThemedText>
            <ThemedText style={styles.infoBannerText}>
              Để đảm bảo an toàn, mật khẩu nên có ít nhất 6 ký tự và kết hợp chữ, số.
            </ThemedText>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Current Password */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>
              Mật khẩu hiện tại <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <View style={styles.input}>
              <IconSymbol name="lock.fill" size={20} color="#6B7280" />
              <TextInput
                style={styles.textInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Nhập mật khẩu hiện tại"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                style={styles.eyeButton}
              >
                <IconSymbol
                  name={showCurrentPassword ? 'eye.slash.fill' : 'eye.fill'}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>
              Mật khẩu mới <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <View style={styles.input}>
              <IconSymbol name="lock.fill" size={20} color="#6B7280" />
              <TextInput
                style={styles.textInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeButton}
              >
                <IconSymbol
                  name={showNewPassword ? 'eye.slash.fill' : 'eye.fill'}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
            
            {/* Password strength indicator */}
            {newPassword.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthFill,
                      {
                        width: `${Math.min((newPassword.length / 12) * 100, 100)}%`,
                        backgroundColor:
                          newPassword.length < 6
                            ? '#EF4444'
                            : newPassword.length < 8
                            ? '#F59E0B'
                            : '#10B981',
                      },
                    ]}
                  />
                </View>
                <ThemedText
                  style={[
                    styles.strengthText,
                    {
                      color:
                        newPassword.length < 6
                          ? '#EF4444'
                          : newPassword.length < 8
                          ? '#F59E0B'
                          : '#10B981',
                    },
                  ]}
                >
                  {newPassword.length < 6
                    ? 'Yếu'
                    : newPassword.length < 8
                    ? 'Trung bình'
                    : 'Mạnh'}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>
              Xác nhận mật khẩu mới <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <View style={styles.input}>
              <IconSymbol name="lock.fill" size={20} color="#6B7280" />
              <TextInput
                style={styles.textInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                <IconSymbol
                  name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
            
            {/* Match indicator */}
            {confirmPassword.length > 0 && (
              <View style={styles.matchContainer}>
                {newPassword === confirmPassword ? (
                  <>
                    <IconSymbol name="checkmark.circle.fill" size={16} color="#10B981" />
                    <ThemedText style={styles.matchText}>Mật khẩu khớp</ThemedText>
                  </>
                ) : (
                  <>
                    <IconSymbol name="xmark.circle.fill" size={16} color="#EF4444" />
                    <ThemedText style={[styles.matchText, { color: '#EF4444' }]}>
                      Mật khẩu không khớp
                    </ThemedText>
                  </>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Security Tips */}
        <View style={styles.tipsSection}>
          <ThemedText style={styles.tipsTitle}>💡 Mẹo bảo mật</ThemedText>
          <View style={styles.tip}>
            <ThemedText style={styles.tipBullet}>•</ThemedText>
            <ThemedText style={styles.tipText}>Sử dụng mật khẩu dài ít nhất 8-12 ký tự</ThemedText>
          </View>
          <View style={styles.tip}>
            <ThemedText style={styles.tipBullet}>•</ThemedText>
            <ThemedText style={styles.tipText}>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</ThemedText>
          </View>
          <View style={styles.tip}>
            <ThemedText style={styles.tipBullet}>•</ThemedText>
            <ThemedText style={styles.tipText}>Không sử dụng thông tin cá nhân dễ đoán</ThemedText>
          </View>
          <View style={styles.tip}>
            <ThemedText style={styles.tipBullet}>•</ThemedText>
            <ThemedText style={styles.tipText}>Thay đổi mật khẩu định kỳ</ThemedText>
          </View>
        </View>
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
          onPress={handleChangePassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <IconSymbol name="checkmark.shield.fill" size={20} color="#fff" />
              <ThemedText style={styles.saveButtonText}>Đổi mật khẩu</ThemedText>
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
  infoBanner: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  infoBannerContent: {
    flex: 1,
    gap: 4,
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
  },
  infoBannerText: {
    fontSize: 13,
    color: '#3B82F6',
    lineHeight: 18,
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
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  eyeButton: {
    padding: 4,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 70,
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '500',
  },
  tipsSection: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 12,
    gap: 12,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  tip: {
    flexDirection: 'row',
    gap: 8,
  },
  tipBullet: {
    fontSize: 14,
    color: '#D97706',
    fontWeight: 'bold',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
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

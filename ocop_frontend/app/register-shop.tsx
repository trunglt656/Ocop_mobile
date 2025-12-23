import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AssetIcon } from '@/components/ui/asset-icon';
import { shopService, ShopRegistrationData, uploadService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterShopScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<ShopRegistrationData>({
    name: '',
    contact: {
      phone: '',
      email: user?.email || '',
    },
    address: '',
    description: '',
    logo: '',
    banner: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ShopRegistrationData | 'phone' | 'email', string>>>({});
  
  // Image picker states
  const [logoImage, setLogoImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [bannerImage, setBannerImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Request permissions on mount
  React.useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền truy cập',
          'Cần quyền truy cập thư viện ảnh để chọn logo và banner cho shop.'
        );
      }
    })();
  }, []);

  // Pick logo image
  const pickLogoImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setLogoImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking logo:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  // Pick banner image
  const pickBannerImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setBannerImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking banner:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  // Upload images before submitting form
  const uploadImages = async (): Promise<boolean> => {
    try {
      // Upload logo if selected
      if (logoImage) {
        setUploadingLogo(true);
        const logoFile = {
          uri: logoImage.uri,
          name: `logo_${Date.now()}.${logoImage.uri.split('.').pop()}`,
          type: `image/${logoImage.uri.split('.').pop()}`,
        };
        const logoResponse = await uploadService.uploadImage(logoFile);
        formData.logo = logoResponse.url;
      }

      // Upload banner if selected
      if (bannerImage) {
        setUploadingBanner(true);
        const bannerFile = {
          uri: bannerImage.uri,
          name: `banner_${Date.now()}.${bannerImage.uri.split('.').pop()}`,
          type: `image/${bannerImage.uri.split('.').pop()}`,
        };
        const bannerResponse = await uploadService.uploadImage(bannerFile);
        formData.banner = bannerResponse.url;
      }

      return true;
    } catch (error) {
      console.error('Error uploading images:', error);
      Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại.');
      return false;
    } finally {
      setUploadingLogo(false);
      setUploadingBanner(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên shop không được để trống';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Tên shop phải có ít nhất 3 ký tự';
    }

    if (!formData.contact.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10,11}$/.test(formData.contact.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10-11 chữ số)';
    }

    if (!formData.contact.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.contact.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ không được để trống';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả không được để trống';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Mô tả phải có ít nhất 20 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin đã nhập');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload images first if any selected
      const imagesUploaded = await uploadImages();
      if (!imagesUploaded) {
        return;
      }

      const response = await shopService.registerShop(formData);
      
      Alert.alert(
        'Đăng ký thành công! 🎉',
        'Shop của bạn đang chờ được duyệt. Chúng tôi sẽ thông báo qua email khi có kết quả.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Shop registration error:', error);
      
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Đăng ký shop thất bại. Vui lòng thử lại sau.';
      
      Alert.alert('Đăng ký thất bại', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    if (field === 'phone' || field === 'email') {
      setFormData(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
    
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      [field]: undefined,
    }));
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <IconSymbol name="chevron.left" size={24} color="#0F172A" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <ThemedText style={styles.title}>Đăng ký mở Shop</ThemedText>
              <ThemedText style={styles.subtitle}>
                Trở thành nhà cung cấp sản phẩm OCOP
              </ThemedText>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <IconSymbol name="info.circle.fill" size={24} color="#2563EB" />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoTitle}>
                Quy trình đăng ký
              </ThemedText>
              <ThemedText style={styles.infoText}>
                • Điền đầy đủ thông tin shop{'\n'}
                • Chờ admin xét duyệt (1-3 ngày){'\n'}
                • Nhận thông báo qua email{'\n'}
                • Bắt đầu bán hàng
              </ThemedText>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Shop Name */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>
                Tên Shop <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                <AssetIcon name="shop" size={18} color="#64748B" />
                <TextInput
                  style={styles.input}
                  placeholder="VD: Shop OCOP Đồng Nai"
                  placeholderTextColor="#94A3B8"
                  value={formData.name}
                  onChangeText={(value) => updateFormData('name', value)}
                  editable={!isSubmitting}
                />
              </View>
              {errors.name && (
                <ThemedText style={styles.errorText}>{errors.name}</ThemedText>
              )}
            </View>

            {/* Phone */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>
                Số điện thoại <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <View style={[styles.inputWrapper, errors.phone && styles.inputError]}>
                <IconSymbol name="phone.fill" size={18} color="#64748B" />
                <TextInput
                  style={styles.input}
                  placeholder="VD: 0909123456"
                  placeholderTextColor="#94A3B8"
                  value={formData.contact.phone}
                  onChangeText={(value) => updateFormData('phone', value)}
                  keyboardType="phone-pad"
                  editable={!isSubmitting}
                />
              </View>
              {errors.phone && (
                <ThemedText style={styles.errorText}>{errors.phone}</ThemedText>
              )}
            </View>

            {/* Email */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>
                Email <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                <IconSymbol name="envelope.fill" size={18} color="#64748B" />
                <TextInput
                  style={styles.input}
                  placeholder="VD: shop@ocop.vn"
                  placeholderTextColor="#94A3B8"
                  value={formData.contact.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isSubmitting}
                />
              </View>
              {errors.email && (
                <ThemedText style={styles.errorText}>{errors.email}</ThemedText>
              )}
            </View>

            {/* Address */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>
                Địa chỉ <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <View style={[styles.inputWrapper, errors.address && styles.inputError]}>
                <IconSymbol name="mappin.circle.fill" size={18} color="#64748B" />
                <TextInput
                  style={styles.input}
                  placeholder="VD: 123 Đường ABC, TP. Biên Hòa"
                  placeholderTextColor="#94A3B8"
                  value={formData.address}
                  onChangeText={(value) => updateFormData('address', value)}
                  editable={!isSubmitting}
                />
              </View>
              {errors.address && (
                <ThemedText style={styles.errorText}>{errors.address}</ThemedText>
              )}
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>
                Mô tả Shop <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <View style={[styles.textAreaWrapper, errors.description && styles.inputError]}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Giới thiệu về shop của bạn, các sản phẩm chủ lực, cam kết chất lượng..."
                  placeholderTextColor="#94A3B8"
                  value={formData.description}
                  onChangeText={(value) => updateFormData('description', value)}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  editable={!isSubmitting}
                />
              </View>
              <ThemedText style={styles.charCount}>
                {formData.description.length} ký tự (tối thiểu 20)
              </ThemedText>
              {errors.description && (
                <ThemedText style={styles.errorText}>{errors.description}</ThemedText>
              )}
            </View>

            {/* Logo Image Picker */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>
                Logo Shop <ThemedText style={styles.optional}>(Tùy chọn)</ThemedText>
              </ThemedText>
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={pickLogoImage}
                disabled={isSubmitting || uploadingLogo}
              >
                {logoImage ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: logoImage.uri }} style={styles.logoPreview} />
                    <View style={styles.imageOverlay}>
                      <IconSymbol name="pencil.circle.fill" size={32} color="#FFFFFF" />
                    </View>
                  </View>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <View style={styles.uploadIconContainer}>
                      <IconSymbol name="photo.fill" size={32} color="#2563EB" />
                    </View>
                    <ThemedText style={styles.imagePlaceholderText}>
                      Chọn logo (vuông, 1:1)
                    </ThemedText>
                    <ThemedText style={styles.imagePlaceholderHint}>
                      PNG, JPG - Tối đa 5MB
                    </ThemedText>
                  </View>
                )}
              </TouchableOpacity>
              {uploadingLogo && (
                <View style={styles.uploadingIndicator}>
                  <ActivityIndicator size="small" color="#2563EB" />
                  <ThemedText style={styles.uploadingText}>Đang tải logo...</ThemedText>
                </View>
              )}
            </View>

            {/* Banner Image Picker */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>
                Banner Shop <ThemedText style={styles.optional}>(Tùy chọn)</ThemedText>
              </ThemedText>
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={pickBannerImage}
                disabled={isSubmitting || uploadingBanner}
              >
                {bannerImage ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: bannerImage.uri }} style={styles.bannerPreview} />
                    <View style={styles.imageOverlay}>
                      <IconSymbol name="pencil.circle.fill" size={32} color="#FFFFFF" />
                    </View>
                  </View>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <View style={styles.uploadIconContainer}>
                      <IconSymbol name="photo.on.rectangle.fill" size={32} color="#2563EB" />
                    </View>
                    <ThemedText style={styles.imagePlaceholderText}>
                      Chọn banner (ngang, 16:9)
                    </ThemedText>
                    <ThemedText style={styles.imagePlaceholderHint}>
                      PNG, JPG - Tối đa 5MB
                    </ThemedText>
                  </View>
                )}
              </TouchableOpacity>
              {uploadingBanner && (
                <View style={styles.uploadingIndicator}>
                  <ActivityIndicator size="small" color="#2563EB" />
                  <ThemedText style={styles.uploadingText}>Đang tải banner...</ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsCard}>
            <ThemedText style={styles.benefitsTitle}>
              🎁 Quyền lợi khi mở shop
            </ThemedText>
            <View style={styles.benefitItem}>
              <IconSymbol name="checkmark.circle.fill" size={20} color="#22C55E" />
              <ThemedText style={styles.benefitText}>
                Tiếp cận hàng nghìn khách hàng tiềm năng
              </ThemedText>
            </View>
            <View style={styles.benefitItem}>
              <IconSymbol name="checkmark.circle.fill" size={20} color="#22C55E" />
              <ThemedText style={styles.benefitText}>
                Quản lý đơn hàng và sản phẩm dễ dàng
              </ThemedText>
            </View>
            <View style={styles.benefitItem}>
              <IconSymbol name="checkmark.circle.fill" size={20} color="#22C55E" />
              <ThemedText style={styles.benefitText}>
                Hỗ trợ marketing và quảng bá miễn phí
              </ThemedText>
            </View>
            <View style={styles.benefitItem}>
              <IconSymbol name="checkmark.circle.fill" size={20} color="#22C55E" />
              <ThemedText style={styles.benefitText}>
                Chi phí hoa hồng cạnh tranh chỉ 10%
              </ThemedText>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <ThemedText style={styles.submitButtonText}>Đang gửi...</ThemedText>
              </>
            ) : (
              <>
                <IconSymbol name="checkmark.circle.fill" size={20} color="#FFFFFF" />
                <ThemedText style={styles.submitButtonText}>Đăng ký mở Shop</ThemedText>
              </>
            )}
          </TouchableOpacity>

          {/* Terms */}
          <ThemedText style={styles.termsText}>
            Bằng việc đăng ký, bạn đồng ý với{' '}
            <ThemedText style={styles.termsLink}>Điều khoản dịch vụ</ThemedText>
            {' '}và{' '}
            <ThemedText style={styles.termsLink}>Chính sách bán hàng</ThemedText>
            {' '}của chúng tôi.
          </ThemedText>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    marginTop: 4,
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E40AF',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#1E40AF',
    lineHeight: 20,
  },
  form: {
    paddingHorizontal: 20,
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  required: {
    color: '#EF4444',
  },
  optional: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'Poppins-Regular',
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
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
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
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#94A3B8',
    textAlign: 'right',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#EF4444',
  },
  benefitsCard: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  benefitsTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#15803D',
    marginBottom: 4,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#15803D',
  },
  submitButton: {
    marginHorizontal: 20,
    marginTop: 32,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  termsText: {
    marginHorizontal: 20,
    marginTop: 16,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#2563EB',
    fontFamily: 'Poppins-SemiBold',
  },
  // Image picker styles
  imagePickerButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
  },
  logoPreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  bannerPreview: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  imagePlaceholderText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  imagePlaceholderHint: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#94A3B8',
  },
  uploadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  uploadingText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#2563EB',
  },
  helperText: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#94A3B8',
    marginTop: 4,
  },
});

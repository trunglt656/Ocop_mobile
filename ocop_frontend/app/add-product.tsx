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
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { productService, categoryService, uploadService } from '@/services';

interface Category {
  _id: string;
  name: string;
}

export default function AddProductScreen() {
  const router = useRouter();
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    images: [] as string[],
  });
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5 - selectedImages.length,
      });

      if (!result.canceled) {
        const newImages = result.assets.map(asset => asset.uri);
        setSelectedImages([...selectedImages, ...newImages]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (selectedImages.length === 0) return [];

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const imageUri of selectedImages) {
        // Extract filename from URI
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        const response = await uploadService.uploadImage({
          uri: imageUri,
          name: filename,
          type: type,
        });
        uploadedUrls.push(response.url);
      }
      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Lỗi', 'Tên sản phẩm không được để trống');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Lỗi', 'Giá sản phẩm phải lớn hơn 0');
      return;
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      Alert.alert('Lỗi', 'Số lượng không hợp lệ');
      return;
    }

    if (!formData.category) {
      Alert.alert('Lỗi', 'Vui lòng chọn danh mục');
      return;
    }

    if (selectedImages.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng thêm ít nhất 1 ảnh sản phẩm');
      return;
    }

    try {
      setLoading(true);

      // Upload images
      const imageUrls = await uploadImages();

      // Convert image URLs to proper format
      const formattedImages = imageUrls.map((url, index) => ({
        url,
        alt: formData.name,
        isPrimary: index === 0
      }));

      // Create product
      await productService.createProduct({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        shop: shopId,
        images: formattedImages,
      });

      Alert.alert('Thành công', 'Đã thêm sản phẩm mới', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error creating product:', error);
      Alert.alert('Lỗi', error.message || 'Không thể thêm sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Thêm sản phẩm</ThemedText>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Images */}
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>
              Ảnh sản phẩm <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <View style={styles.imagesContainer}>
              {selectedImages.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image 
                    source={{ uri }} 
                    style={styles.productImage}
                    contentFit="cover"
                    transition={200}
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <IconSymbol name="xmark.circle.fill" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
              {selectedImages.length < 5 && (
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={pickImages}
                >
                  <IconSymbol name="photo.badge.plus" size={32} color="#94A3B8" />
                  <ThemedText style={styles.addImageText}>Thêm ảnh</ThemedText>
                </TouchableOpacity>
              )}
            </View>
            <ThemedText style={styles.hint}>Tối đa 5 ảnh</ThemedText>
          </View>

          {/* Product Name */}
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>
              Tên sản phẩm <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <View style={styles.inputWrapper}>
              <IconSymbol name="cube.box.fill" size={18} color="#64748B" />
              <TextInput
                style={styles.input}
                placeholder="Nhập tên sản phẩm"
                placeholderTextColor="#94A3B8"
                value={formData.name}
                onChangeText={(value) => setFormData({ ...formData, name: value })}
                editable={!loading}
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Mô tả</ThemedText>
            <View style={styles.textAreaWrapper}>
              <TextInput
                style={styles.textArea}
                placeholder="Mô tả chi tiết về sản phẩm..."
                placeholderTextColor="#94A3B8"
                value={formData.description}
                onChangeText={(value) => setFormData({ ...formData, description: value })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!loading}
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>
              Danh mục <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat._id}
                  style={[
                    styles.categoryChip,
                    formData.category === cat._id && styles.categoryChipActive
                  ]}
                  onPress={() => setFormData({ ...formData, category: cat._id })}
                  disabled={loading}
                >
                  <ThemedText
                    style={[
                      styles.categoryChipText,
                      formData.category === cat._id && styles.categoryChipTextActive
                    ]}
                  >
                    {cat.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price */}
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>
              Giá bán <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <View style={styles.inputWrapper}>
              <IconSymbol name="banknote.fill" size={18} color="#64748B" />
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                value={formData.price}
                onChangeText={(value) => setFormData({ ...formData, price: value })}
                keyboardType="numeric"
                editable={!loading}
              />
              <ThemedText style={styles.unit}>đ</ThemedText>
            </View>
          </View>

          {/* Stock */}
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>
              Số lượng <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <View style={styles.inputWrapper}>
              <IconSymbol name="number.square.fill" size={18} color="#64748B" />
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                value={formData.stock}
                onChangeText={(value) => setFormData({ ...formData, stock: value })}
                keyboardType="numeric"
                editable={!loading}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, (loading || uploading) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading || uploading}
            activeOpacity={0.8}
          >
            {(loading || uploading) ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <ThemedText style={styles.submitButtonText}>
                  {uploading ? 'Đang tải ảnh...' : 'Đang xử lý...'}
                </ThemedText>
              </>
            ) : (
              <>
                <IconSymbol name="checkmark.circle.fill" size={20} color="#FFFFFF" />
                <ThemedText style={styles.submitButtonText}>Thêm sản phẩm</ThemedText>
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
  unit: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#64748B',
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
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 12,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addImageText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#94A3B8',
  },
  hint: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    marginTop: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryChipText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    marginTop: 8,
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
});

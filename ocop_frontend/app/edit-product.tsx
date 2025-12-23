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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { productService, categoryService, uploadService } from '@/services';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
}

export default function EditProductScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, shopId } = useLocalSearchParams<{ id: string; shopId: string }>();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productData, categoriesData] = await Promise.all([
        productService.getProduct(id),
        categoryService.getCategories(),
      ]);

      setProduct(productData);
      setCategories(categoriesData.data || []);
      setFormData({
        name: productData.name,
        description: productData.description || '',
        price: productData.price.toString(),
        stock: productData.stock.toString(),
        category: productData.category,
      });
      // Convert ProductImage[] to string[] URLs
      const imageUrls = Array.isArray(productData.images) 
        ? productData.images.map(img => typeof img === 'string' ? img : img.url)
        : [];
      setExistingImages(imageUrls);
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const pickImages = async () => {
    try {
      const totalImages = existingImages.length + newImages.length;
      if (totalImages >= 5) {
        Alert.alert('Thông báo', 'Tối đa 5 ảnh');
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5 - totalImages,
      });

      if (!result.canceled) {
        const images = result.assets.map(asset => asset.uri);
        setNewImages([...newImages, ...images]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const uploadNewImages = async () => {
    if (newImages.length === 0) return [];

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const imageUri of newImages) {
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

    if (existingImages.length + newImages.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng thêm ít nhất 1 ảnh sản phẩm');
      return;
    }

    try {
      setSaving(true);

      // Upload new images
      const uploadedUrls = await uploadNewImages();

      // Combine existing and new images with proper format
      const existingFormatted = existingImages.map((url, index) => ({
        url,
        alt: formData.name,
        isPrimary: index === 0
      }));
      
      const newFormatted = uploadedUrls.map(url => ({
        url,
        alt: formData.name,
        isPrimary: false
      }));

      const allImages = [...existingFormatted, ...newFormatted];

      // Update product
      await productService.updateProduct(id, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        images: allImages,
      });

      Alert.alert('Thành công', 'Đã cập nhật sản phẩm', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error updating product:', error);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const totalImages = existingImages.length + newImages.length;

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
          <ThemedText style={styles.title}>Sửa sản phẩm</ThemedText>
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
              {/* Existing Images */}
              {existingImages.map((uri, index) => (
                <View key={`existing-${index}`} style={styles.imageWrapper}>
                  <Image 
                    source={{ uri }} 
                    style={styles.productImage}
                    contentFit="cover"
                    transition={200}
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeExistingImage(index)}
                  >
                    <IconSymbol name="xmark.circle.fill" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
              
              {/* New Images */}
              {newImages.map((uri, index) => (
                <View key={`new-${index}`} style={styles.imageWrapper}>
                  <Image 
                    source={{ uri }} 
                    style={styles.productImage}
                    contentFit="cover"
                    transition={200}
                  />
                  <View style={styles.newBadge}>
                    <ThemedText style={styles.newBadgeText}>Mới</ThemedText>
                  </View>
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeNewImage(index)}
                  >
                    <IconSymbol name="xmark.circle.fill" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
              
              {/* Add Button */}
              {totalImages < 5 && (
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={pickImages}
                >
                  <IconSymbol name="photo.badge.plus" size={32} color="#94A3B8" />
                  <ThemedText style={styles.addImageText}>Thêm ảnh</ThemedText>
                </TouchableOpacity>
              )}
            </View>
            <ThemedText style={styles.hint}>
              {totalImages}/5 ảnh
            </ThemedText>
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
                placeholder="Mô tả chi tiết về sản phẩm..."
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
                  disabled={saving}
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
                editable={!saving}
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
                editable={!saving}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, (saving || uploading) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={saving || uploading}
            activeOpacity={0.8}
          >
            {(saving || uploading) ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <ThemedText style={styles.submitButtonText}>
                  {uploading ? 'Đang tải ảnh...' : 'Đang lưu...'}
                </ThemedText>
              </>
            ) : (
              <>
                <IconSymbol name="checkmark.circle.fill" size={20} color="#FFFFFF" />
                <ThemedText style={styles.submitButtonText}>Lưu thay đổi</ThemedText>
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
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
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
  newBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
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

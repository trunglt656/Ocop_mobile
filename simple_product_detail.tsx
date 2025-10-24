import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { productService, Product } from '@/services';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProduct(id as string);
      if (response.data) {
        setProduct(response.data);
      } else {
        setError('Product not found');
      }
    } catch (error: any) {
      console.error('Error loading product:', error);
      setError(error.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Đang tải sản phẩm...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !product) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>{error || 'Không tìm thấy sản phẩm'}</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Quay lại</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const handleAddToCart = () => {
    Alert.alert('Thành công', `Đã thêm ${quantity} ${product.unit} ${product.name} vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    Alert.alert('Đặt hàng ngay', `Bạn có muốn đặt ${quantity} ${product.unit} ${product.name}?`);
  };

  return (
    <>
      <Stack.Screen options={{ title: product.name }} />
      <ScrollView style={styles.container}>
        <View style={styles.imageSection}>
          <Image
            source={{ uri: product.images[0]?.url || 'https://via.placeholder.com/400x300' }}
            style={styles.image}
          />
        </View>

        <View style={styles.infoSection}>
          <ThemedText style={styles.productName}>{product.name}</ThemedText>
          <ThemedText style={styles.price}>{product.price.toLocaleString('vi-VN')}₫</ThemedText>
          <ThemedText style={styles.description}>{product.description}</ThemedText>

          {product.isOCOP && (
            <View style={styles.ocopBadge}>
              <ThemedText style={styles.ocopText}>OCOP {product.ocopLevel}</ThemedText>
            </View>
          )}

          <View style={styles.quantitySection}>
            <ThemedText>Số lượng: {quantity}</ThemedText>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                <ThemedText>-</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.min(99, quantity + 1))}>
                <ThemedText>+</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <ThemedText style={styles.addToCartText}>Thêm vào giỏ</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
          <ThemedText style={styles.buyNowText}>Mua ngay</ThemedText>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  imageSection: { backgroundColor: '#fff', padding: 16 },
  image: { width: '100%', height: 300 },
  infoSection: { backgroundColor: '#fff', padding: 16, marginTop: 8 },
  productName: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  price: { fontSize: 28, fontWeight: 'bold', color: '#007AFF', marginBottom: 12 },
  description: { fontSize: 14, color: '#666', marginBottom: 16 },
  ocopBadge: { backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginBottom: 16, alignSelf: 'flex-start' },
  ocopText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  quantitySection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  quantityControls: { flexDirection: 'row', gap: 16 },
  quantityButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  bottomActions: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  addToCartButton: { flex: 1, backgroundColor: '#007AFF', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginRight: 12 },
  addToCartText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  buyNowButton: { flex: 1, backgroundColor: '#28a745', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  buyNowText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  errorText: { fontSize: 18, color: '#666', marginBottom: 24, textAlign: 'center' },
  backButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

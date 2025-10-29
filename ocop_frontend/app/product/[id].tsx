import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { productService, Product, cartService } from '@/services'; // Import cartService

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct();
    } else {
      setError('Không tìm thấy ID sản phẩm.');
      setLoading(false);
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      // Ensure id is a string before passing
      const response = await productService.getProduct(id as string);
      if (response.data) {
        setProduct(response.data);
      } else {
        setError('Không tìm thấy sản phẩm');
      }
    } catch (error: any) {
      console.error('Error loading product:', error);
      setError(error.message || 'Lỗi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || isAddingToCart) return;

    setIsAddingToCart(true);
    try {
      await cartService.addToCart({ productId: product._id, quantity });
      Alert.alert('Thành công', `Đã thêm ${quantity} ${product.unit || 'sản phẩm'} ${product.name} vào giỏ hàng!`);
    } catch (err) {
      console.error('Error adding to cart:', err);
      Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    // For now, just an alert. In a real app, this would navigate to checkout.
    Alert.alert('Đặt hàng ngay', `Chức năng này sẽ chuyển bạn đến trang thanh toán với ${quantity} ${product.unit || 'sản phẩm'} ${product.name}.`);
    // Example navigation:
    // router.push({ pathname: '/checkout', params: { productId: product._id, quantity } });
  };

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" />
        <ThemedText>Đang tải sản phẩm...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !product) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText style={styles.errorText}>{error || 'Không tìm thấy sản phẩm'}</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Quay lại</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: product.name }} />
      <ScrollView style={styles.container}>
        <View style={styles.imageSection}>
          <Image
            source={{ uri: product.images[0]?.url || 'https://via.placeholder.com/400x300' }}
            style={styles.image}
            contentFit="cover"
          />
        </View>

        <View style={styles.infoSection}>
          <ThemedText style={styles.productName}>{product.name}</ThemedText>
          <ThemedText style={styles.price}>{product.price.toLocaleString('vi-VN')}₫ / {product.unit || 'sản phẩm'}</ThemedText>
          
          {product.isOCOP && (
            <View style={styles.ocopBadge}>
              <ThemedText style={styles.ocopText}>⭐ OCOP {product.ocopLevel} SAO</ThemedText>
            </View>
          )}

          <ThemedText style={styles.descriptionTitle}>Mô tả sản phẩm</ThemedText>
          <ThemedText style={styles.description}>{product.description}</ThemedText>

          <View style={styles.quantitySection}>
            <ThemedText style={styles.quantityLabel}>Số lượng</ThemedText>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                <ThemedText style={styles.quantityButtonText}>-</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.quantityValue}>{quantity}</ThemedText>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}>
                <ThemedText style={styles.quantityButtonText}>+</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.addToCartButton]} 
          onPress={handleAddToCart}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.actionButtonText}>Thêm vào giỏ</ThemedText>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.buyNowButton]} 
          onPress={handleBuyNow}
        >
          <ThemedText style={styles.actionButtonText}>Mua ngay</ThemedText>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 16 
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  imageSection: { 
    backgroundColor: '#fff' 
  },
  image: { 
    width: '100%', 
    height: 350 
  },
  infoSection: { 
    backgroundColor: '#fff', 
    padding: 20, 
    marginTop: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  productName: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    marginBottom: 8 
  },
  price: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#e63946', 
    marginBottom: 16 
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: { 
    fontSize: 16, 
    color: '#495057', 
    lineHeight: 24,
    marginBottom: 24 
  },
  ocopBadge: { 
    backgroundColor: '#ffc107', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8, 
    marginBottom: 16, 
    alignSelf: 'flex-start' 
  },
  ocopText: { 
    color: '#000', 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
  quantitySection: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef'
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  quantityControls: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 12 
  },
  quantityButton: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#e9ecef', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#495057'
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center'
  },
  bottomActions: { 
    flexDirection: 'row', 
    padding: 16, 
    backgroundColor: '#fff', 
    borderTopWidth: 1, 
    borderTopColor: '#e9ecef',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartButton: { 
    backgroundColor: '#007AFF',
  },
  buyNowButton: { 
    backgroundColor: '#28a745',
  },
  actionButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  errorText: { 
    fontSize: 18, 
    color: '#6c757d', 
    marginBottom: 24, 
    textAlign: 'center' 
  },
  backButton: { 
    backgroundColor: '#007AFF', 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 8 
  },
  backButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600' 
  },
});

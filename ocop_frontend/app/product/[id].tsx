import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Stack } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { productService, Product } from '@/services';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerButton: {
    marginRight: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageSection: {
    backgroundColor: '#fff',
    paddingBottom: 16,
  },
  mainImage: {
    width: '100%',
    height: 300,
  },
  imageDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  imageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  selectedImageDot: {
    backgroundColor: '#007AFF',
  },
  infoSection: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 12,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  originText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  inStock: {
    color: '#28a745',
  },
  outOfStock: {
    color: '#dc3545',
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    marginRight: 12,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Đang tải sản phẩm...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !product) {
    return (
      <ThemedView style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle" size={64} color="#ff4444" />
        <ThemedText style={styles.errorText}>
          {error || 'Không tìm thấy sản phẩm'}
        </ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Quay lại</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const handleAddToCart = () => {
    Alert.alert(
      'Thành công',
      `Đã thêm ${quantity} ${product.unit} ${product.name} vào giỏ hàng!`,
      [{ text: 'Tiếp tục mua sắm', style: 'default' }, { text: 'Xem giỏ hàng', onPress: () => router.push('/cart') }]
    );
  };

  const handleBuyNow = () => {
    Alert.alert(
      'Đặt hàng ngay',
      `Bạn có muốn đặt ${quantity} ${product.unit} ${product.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đặt hàng', onPress: () => router.push('/checkout') }
      ]
    );
  };

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <IconSymbol key={i} name="star.fill" size={16} color="#ffd700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <IconSymbol key="half" name="star.lefthalf.fill" size={16} color="#ffd700" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <IconSymbol key={`empty-${i}`} name="star" size={16} color="#ddd" />
      );
    }

    return stars;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: product.name,
          headerRight: () => (
            <TouchableOpacity style={styles.headerButton}>
              <IconSymbol name="heart" size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        <View style={styles.imageSection}>
          {product.images.length > 0 && (
            <Image
              source={{ uri: product.images[selectedImageIndex]?.url || product.images[0]?.url }}
              style={styles.mainImage}
            />
          )}
          {product.images.length > 1 && (
            <View style={styles.imageDots}>
              {product.images.map((_, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.imageDot,
                    selectedImageIndex === index && styles.selectedImageDot,
                  ]}
                  onPress={() => setSelectedImageIndex(index)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <ThemedText style={styles.productName}>{product.name}</ThemedText>

          <View style={styles.ratingSection}>
            <View style={styles.starsContainer}>
              {renderStars(product.rating.average)}
            </View>
            <ThemedText style={styles.ratingText}>{product.rating.average}</ThemedText>
            <ThemedText style={styles.reviewText}>({product.rating.count} đánh giá)</ThemedText>
          </View>

          <View style={styles.priceSection}>
            <ThemedText style={styles.currentPrice}>
              {product.price.toLocaleString('vi-VN')}₫
            </ThemedText>
            {product.originalPrice && (
              <ThemedText style={styles.originalPrice}>
                {product.originalPrice.toLocaleString('vi-VN')}₫
              </ThemedText>
            )}
            {product.discount && (
              <View style={styles.discountBadge}>
                <ThemedText style={styles.discountText}>-{product.discount}%</ThemedText>
              </View>
            )}
          </View>

          <ThemedText style={styles.originText}>
            Xuất xứ: {product.origin.province}, {product.origin.district}
          </ThemedText>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <ThemedText style={styles.quantityLabel}>Số lượng:</ThemedText>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(quantity - 1)}>
                <IconSymbol name="minus" size={20} color="#007AFF" />
              </TouchableOpacity>
              <ThemedText style={styles.quantityText}>{quantity}</ThemedText>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(quantity + 1)}>
                <IconSymbol name="plus" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Product Description */}
          <View style={styles.descriptionSection}>
            <ThemedText style={styles.descriptionTitle}>Mô tả sản phẩm</ThemedText>
            <ThemedText style={styles.descriptionText}>{product.description}</ThemedText>
          </View>

          {/* Product Details */}
          <View style={styles.detailsSection}>
            <ThemedText style={styles.detailsTitle}>Thông tin chi tiết</ThemedText>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Đơn vị:</ThemedText>
              <ThemedText style={styles.detailValue}>{product.unit}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Tình trạng:</ThemedText>
              <ThemedText style={[styles.detailValue, product.stock > 0 ? styles.inStock : styles.outOfStock]}>
                {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <IconSymbol name="bag" size={20} color="#fff" />
          <ThemedText style={styles.addToCartText}>Thêm vào giỏ</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
          <ThemedText style={styles.buyNowText}>Mua ngay</ThemedText>
        </TouchableOpacity>
      </View>
    </>
  );
}

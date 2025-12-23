import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Alert, ActivityIndicator, Linking } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Toast } from '@/components/Toast';
import { productService, Product, cartService, favoritesService } from '@/services';
import API_CONFIG from '@/constants/api';
import { getPrimaryImageUrl } from '@/utils/imageHelper';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Check if product is favorited
  const { data: favoriteData } = useQuery({
    queryKey: ['favorite-check', id],
    queryFn: async () => {
      if (!id) return { isFavorite: false };
      try {
        const response = await favoritesService.checkFavorite(id as string);
        return response.data || { isFavorite: false };
      } catch (error) {
        console.log('Favorite check error:', error);
        return { isFavorite: false };
      }
    },
    enabled: !!id,
  });

  const isFavorite = favoriteData?.isFavorite || false;

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: (productId: string) => favoritesService.toggleFavorite(productId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['favorite-check', id] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      const action = response.data?.action;
      Alert.alert(
        'Thành công',
        action === 'added' ? 'Đã thêm vào danh sách yêu thích' : 'Đã xóa khỏi danh sách yêu thích'
      );
    },
    onError: (error: any) => {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật danh sách yêu thích');
    },
  });

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
      // productService.getProduct now returns Product directly
      const productData = await productService.getProduct(id as string);
      setProduct(productData);
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
      setToastMessage(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`);
      setToastType('success');
      setShowToast(true);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setToastMessage('Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    // Navigate to checkout with product info directly
    router.push({
      pathname: '/checkout',
      params: {
        directBuy: 'true',
        productId: product._id,
        productName: product.name,
        productPrice: product.price.toString(),
        productImage: getPrimaryImageUrl(product.images),
        quantity: quantity.toString(),
      }
    });
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
      <Toast 
        visible={showToast} 
        message={toastMessage} 
        type={toastType}
        onHide={() => setShowToast(false)}
      />
      <ScrollView style={styles.container}>
        <View style={styles.imageSection}>
          <Image
            source={{ uri: getPrimaryImageUrl(product.images) }}
            style={styles.image}
            contentFit="cover"
          />
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavoriteMutation.mutate(product._id)}
            disabled={toggleFavoriteMutation.isPending}
          >
            <IconSymbol 
              name={isFavorite ? "heart.fill" : "heart"} 
              size={24} 
              color={isFavorite ? "#FF4D4F" : "#fff"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <ThemedText style={styles.productName}>{product.name}</ThemedText>
          <ThemedText style={styles.price}>{product.price.toLocaleString('vi-VN')}₫</ThemedText>
          {product.producerVerified && (
            <View style={styles.verifiedBadge}>
              <ThemedText style={styles.verifiedText}>✓ Nguồn gốc đã xác thực</ThemedText>
            </View>
          )}
          
          {product.isOCOP && (
            <View style={styles.ocopBadge}>
              <ThemedText style={styles.ocopText}>⭐ OCOP {product.ocopLevel} SAO</ThemedText>
            </View>
          )}

          <ThemedText style={styles.descriptionTitle}>Mô tả sản phẩm</ThemedText>
          <ThemedText style={styles.description}>{product.description}</ThemedText>

          {/* Producer / Origin */}
          <ThemedText style={styles.sectionTitle}>Nguồn & Nhà sản xuất</ThemedText>
          <View style={styles.metaRow}>
            <ThemedText style={styles.metaLabel}>Tỉnh / Huyện:</ThemedText>
            <ThemedText style={styles.metaValue}>{product.origin?.province} / {product.origin?.district}</ThemedText>
          </View>
          <View style={styles.metaRow}>
            <ThemedText style={styles.metaLabel}>Địa chỉ:</ThemedText>
            <ThemedText style={styles.metaValue}>{product.origin?.address}</ThemedText>
          </View>
          <View style={styles.metaRow}>
            <ThemedText style={styles.metaLabel}>Nhà sản xuất:</ThemedText>
            <ThemedText style={styles.metaValue}>{product.producer?.name}</ThemedText>
          </View>
          {product.producer?.phone && (
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${product.producer.phone}`)}>
              <ThemedText style={styles.link}>📞 {product.producer.phone}</ThemedText>
            </TouchableOpacity>
          )}
          {product.producer?.email && (
            <TouchableOpacity onPress={() => Linking.openURL(`mailto:${product.producer.email}`)}>
              <ThemedText style={styles.link}>✉️ {product.producer.email}</ThemedText>
            </TouchableOpacity>
          )}

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <>
              <ThemedText style={styles.sectionTitle}>Thông số kỹ thuật</ThemedText>
              {product.specifications.map((s, idx) => (
                <View key={idx} style={styles.specRow}>
                  <ThemedText style={styles.specName}>{s.name}:</ThemedText>
                  <ThemedText style={styles.specValue}>{s.value}</ThemedText>
                </View>
              ))}
            </>
          )}

          {/* Certificates */}
          <ThemedText style={styles.sectionTitle}>Chứng nhận & Tài liệu</ThemedText>
          {product.certificates && product.certificates.length > 0 ? (
            product.certificates.map((c: any) => (
              <View key={c._id || c.filename || Math.random()} style={styles.certCard}>
                <View style={styles.certRow}>
                  <ThemedText style={styles.certAuthority}>{c.authority || 'Chứng nhận'}</ThemedText>
                  {c.verified ? <ThemedText style={styles.certVerified}>Đã xác thực</ThemedText> : <ThemedText style={styles.certPending}>Chưa xác thực</ThemedText>}
                </View>
                <ThemedText style={styles.certMeta}>Số: {c.number || '-'}</ThemedText>
                <ThemedText style={styles.certMeta}>Ngày cấp: {c.issuedDate ? new Date(c.issuedDate).toLocaleDateString() : '-'}</ThemedText>
                <ThemedText style={styles.certMeta}>Hết hạn: {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : '-'}</ThemedText>
                {c.file?.url && (
                  <TouchableOpacity onPress={() => {
                    const base = API_CONFIG.BASE_URL.replace(/\/api\/?$/,'');
                    const url = `${base}${c.file.url}`;
                    Linking.openURL(url).catch(() => Alert.alert('Lỗi', 'Không thể mở tài liệu'));
                  }}>
                    <ThemedText style={styles.link}>Mở tài liệu</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            ))
          ) : (
            <ThemedText style={styles.metaValue}>Không có chứng nhận kèm theo</ThemedText>
          )}

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
    backgroundColor: '#f8f9fa',
    position: 'relative',
  },
  image: { 
    width: '100%', 
    height: 300 
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  infoSection: { 
    backgroundColor: '#fff', 
    padding: 20, 
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
  verifiedBadge: {
    backgroundColor: '#e6ffed',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  verifiedText: {
    color: '#0a8a3e',
    fontWeight: '600'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  metaLabel: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '600'
  },
  metaValue: {
    fontSize: 14,
    color: '#495057'
  },
  link: {
    color: '#007AFF',
    marginTop: 6,
    fontWeight: '600'
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5'
  },
  specName: {
    fontSize: 14,
    color: '#343a40',
    fontWeight: '600'
  },
  specValue: {
    fontSize: 14,
    color: '#495057'
  },
  certCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 8
  },
  certRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  certAuthority: {
    fontSize: 14,
    fontWeight: '700'
  },
  certVerified: {
    color: '#0a8a3e',
    fontWeight: '700'
  },
  certPending: {
    color: '#6c757d',
    fontWeight: '600'
  },
  certMeta: {
    fontSize: 13,
    color: '#6c757d'
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

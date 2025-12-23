import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AssetIcon } from '@/components/ui/asset-icon';
import { favoritesService, Favorite } from '@/services/favoritesService';
import { getPrimaryImageUrl } from '@/utils/imageHelper';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';

export default function FavoritesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch favorites
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await favoritesService.getFavorites({ limit: 100 });
      return response.data;
    },
  });

  // Remove from favorites mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: (productId: string) => favoritesService.toggleFavorite(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: (error: any) => {
      Alert.alert('Lỗi', error.message || 'Không thể xóa khỏi danh sách yêu thích');
    },
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleRemoveFavorite = useCallback((productId: string, productName: string) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn xóa "${productName}" khỏi danh sách yêu thích?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => removeFavoriteMutation.mutate(productId),
        },
      ]
    );
  }, [removeFavoriteMutation]);

  const handleProductPress = useCallback((productId: string) => {
    router.push(`/product/${productId}`);
  }, [router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const calculateDiscountedPrice = (price: number, discount: number) => {
    return price - (price * discount) / 100;
  };

  const renderFavoriteItem = ({ item }: { item: Favorite }) => {
    const product = item.product;
    const primaryImage = getPrimaryImageUrl(product.images);
    const discountedPrice = product.discount > 0 
      ? calculateDiscountedPrice(product.price, product.discount)
      : product.price;
    const isOutOfStock = product.stock === 0 || product.status !== 'active';

    return (
      <TouchableOpacity
        style={styles.favoriteCard}
        onPress={() => handleProductPress(product._id)}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: primaryImage }}
            style={styles.productImage}
            contentFit="cover"
          />
          {product.discount > 0 && (
            <View style={styles.discountBadge}>
              <ThemedText style={styles.discountText}>-{product.discount}%</ThemedText>
            </View>
          )}
          {isOutOfStock && (
            <View style={styles.outOfStockOverlay}>
              <ThemedText style={styles.outOfStockText}>Hết hàng</ThemedText>
            </View>
          )}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveFavorite(product._id, product.name)}
          >
            <IconSymbol name="heart.fill" size={20} color="#FF4D4F" />
          </TouchableOpacity>
        </View>

        <View style={styles.productInfo}>
          <ThemedText style={styles.productName} numberOfLines={2}>
            {product.name}
          </ThemedText>

          <View style={styles.ratingRow}>
            <AssetIcon name="star" size={14} color="#FACC15" />
            <ThemedText style={styles.ratingText}>
              {product.rating?.average?.toFixed(1) || '0.0'}
            </ThemedText>
            <ThemedText style={styles.ratingCount}>
              ({product.rating?.count || 0})
            </ThemedText>
          </View>

          <View style={styles.priceRow}>
            <View style={styles.priceGroup}>
              <ThemedText style={styles.currentPrice}>
                {formatPrice(discountedPrice)}
              </ThemedText>
              {product.discount > 0 && (
                <ThemedText style={styles.originalPrice}>
                  {formatPrice(product.price)}
                </ThemedText>
              )}
            </View>
          </View>

          {!isOutOfStock && (
            <View style={styles.stockInfo}>
              <ThemedText style={styles.stockText}>
                Còn {product.stock} sản phẩm
              </ThemedText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <AssetIcon name="star" size={64} color="#CBD5E1" />
      <ThemedText style={styles.emptyTitle}>Chưa có sản phẩm yêu thích</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Thêm sản phẩm vào danh sách yêu thích để dễ dàng theo dõi và mua sắm
      </ThemedText>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => router.push('/(tabs)')}
      >
        <AssetIcon name="shop" size={18} color="#fff" />
        <ThemedText style={styles.shopButtonText}>Khám phá sản phẩm</ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#6366F1" />
      <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.centerContainer}>
      <IconSymbol name="exclamationmark.triangle.fill" size={48} color="#EF4444" />
      <ThemedText style={styles.errorTitle}>Không thể tải dữ liệu</ThemedText>
      <ThemedText style={styles.errorMessage}>
        {error?.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.'}
      </ThemedText>
      <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
        <AssetIcon name="refresh" size={18} color="#fff" />
        <ThemedText style={styles.retryButtonText}>Thử lại</ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Sản phẩm yêu thích',
          headerStyle: {
            backgroundColor: '#6366F1',
          },
          headerTintColor: '#fff',
        }} 
      />
      <ThemedView style={styles.container}>
        {isLoading ? (
          renderLoadingState()
        ) : error ? (
          renderErrorState()
        ) : (
          <>
            {data && data.data && data.data.length > 0 && (
              <View style={styles.header}>
                <ThemedText style={styles.countText}>
                  {data.totalCount} sản phẩm yêu thích
                </ThemedText>
              </View>
            )}
            <FlatList
              data={data?.data || []}
              keyExtractor={(item) => item._id}
              renderItem={renderFavoriteItem}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={renderEmptyState}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={['#6366F1']}
                  tintColor="#6366F1"
                />
              }
            />
          </>
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  countText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  listContent: {
    padding: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  favoriteCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
    backgroundColor: '#F1F5F9',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
    marginBottom: 6,
    lineHeight: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  ratingCount: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currentPrice: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#EF4444',
  },
  originalPrice: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  stockInfo: {
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  stockText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#10B981',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
});

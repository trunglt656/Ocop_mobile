import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { productService, categoryService, Product, Category } from '@/services';
import { getPrimaryImageUrl } from '@/utils/imageHelper';

const FALLBACK_PRODUCT_IMAGE = 'https://placehold.co/600x400?text=OCOP';
const FALLBACK_CATEGORY_ICON = '🛍️';

const normalizeText = (value: string) =>
  value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function HomeScreen() {
  const router = useRouter();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const loadHomeData = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      setError(null);
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const [productsResponse, categoriesResponse] = await Promise.all([
        productService.getProducts({ 
          limit: ITEMS_PER_PAGE, 
          page: pageNum,
          featured: true,
          status: 'active'
        }),
        pageNum === 1 ? categoryService.getCategories({ includeProducts: true }) : Promise.resolve({ data: categories })
      ]);

      if (productsResponse.data) {
        let newProducts: Product[] = [];
        
        // Handle different response formats
        if (productsResponse.data.products && Array.isArray(productsResponse.data.products)) {
          newProducts = productsResponse.data.products;
        } else if (Array.isArray(productsResponse.data)) {
          newProducts = productsResponse.data;
        }
        
        if (newProducts.length > 0) {
          if (append) {
            setFeaturedProducts(prev => [...prev, ...newProducts]);
          } else {
            setFeaturedProducts(newProducts);
          }
          
          // Check if there are more pages
          if (productsResponse.data.pagination) {
            const { page: currentPage, pages: totalPages } = productsResponse.data.pagination;
            setHasMore(currentPage < totalPages);
          } else if (productsResponse.currentPage && productsResponse.totalPages) {
            setHasMore(productsResponse.currentPage < productsResponse.totalPages);
          } else {
            setHasMore(newProducts.length === ITEMS_PER_PAGE);
          }
        } else {
          setHasMore(false);
        }
      }

      if (categoriesResponse.data && pageNum === 1) {
        let activeCategories = categoriesResponse.data.filter(category => category.isActive);
        
        // Sort categories: move "Trái cây" and "Dịch vụ" to the end
        activeCategories = activeCategories.sort((a, b) => {
          const aName = normalizeText(a.name);
          const bName = normalizeText(b.name);
          
          const isALast = aName.includes('trai cay') || aName.includes('dich vu');
          const isBLast = bName.includes('trai cay') || bName.includes('dich vu');
          
          if (isALast && !isBLast) return 1;
          if (!isALast && isBLast) return -1;
          return 0;
        });
        
        setCategories(activeCategories);
      }
    } catch (err) {
      console.error('Error loading home data:', err);
      setError('Không thể tải dữ liệu trang chủ. Hãy thử lại sau ít phút.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [categories]);

  useEffect(() => {
    loadHomeData(1, false);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) {
      return featuredProducts;
    }

    const normalizedQuery = normalizeText(query);
    return featuredProducts.filter(product => {
      const matchesName = normalizeText(product.name).includes(normalizedQuery);
      const matchesCategory = normalizeText(product.category?.name ?? '').includes(normalizedQuery);
      const matchesTags = product.tags?.some(tag => normalizeText(tag).includes(normalizedQuery));
      return matchesName || matchesCategory || matchesTags;
    });
  }, [featuredProducts, query]);

  const heroProduct = filteredProducts[0] ?? featuredProducts[0] ?? null;
  const spotlightProducts = filteredProducts.slice(heroProduct ? 1 : 0, heroProduct ? 4 : 3);
  
  // Main products for the scrollable list (exclude hero and spotlight)
  const mainProducts = useMemo(() => {
    const startIndex = heroProduct ? 4 : 3; // Skip hero + 3 spotlight items
    return filteredProducts.slice(startIndex);
  }, [filteredProducts, heroProduct]);
  
  const bestSellerProducts = useMemo(
    () =>
      [...featuredProducts]
        .sort((a, b) => (b.totalSold ?? 0) - (a.totalSold ?? 0))
        .slice(0, 4),
    [featuredProducts]
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    loadHomeData(1, false);
  }, [loadHomeData]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadHomeData(nextPage, true);
    }
  }, [loadingMore, hasMore, loading, page, loadHomeData]);

  const handleCategoryPress = useCallback(
    (categoryName: string) => {
      router.push(`/categories?selected=${encodeURIComponent(categoryName)}`);
    },
    [router]
  );

  const handleProductPress = useCallback(
    (productId: string) => {
      router.push(`/product/${productId}`);
    },
    [router]
  );

  const handleExplorePress = useCallback(() => {
    router.push('/explore');
  }, [router]);

  const handleSearchSubmit = useCallback(() => {
    if (query.trim().length === 0) {
      Alert.alert('Tìm kiếm', 'Nhập từ khóa để tìm sản phẩm OCOP bạn quan tâm.');
      return;
    }
    router.push(`/explore?query=${encodeURIComponent(query)}`);
  }, [query, router]);

  const renderProductCard = (product: Product, variant: 'compact' | 'wide' = 'compact') => {
    const imageUrl = getPrimaryImageUrl(product.images);

    return (
      <TouchableOpacity
        key={product._id}
        style={variant === 'compact' ? styles.productCard : styles.productCardWide}
        activeOpacity={0.88}
        onPress={() => handleProductPress(product._id)}
      >
        <Image
          source={{ uri: imageUrl }}
          style={variant === 'compact' ? styles.productImage : styles.productImageWide}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.productContent}>
          <View style={styles.productHeader}>
            <View style={styles.productBadge}>
              <IconSymbol name="leaf.fill" size={12} color="#22C55E" />
              <ThemedText style={styles.productBadgeText}>OCOP</ThemedText>
            </View>
            {product.discount > 0 && (
              <View style={styles.productDiscount}>
                <IconSymbol name="tag.fill" size={10} color="#F97316" />
                <ThemedText style={styles.productDiscountText}>-{product.discount}%</ThemedText>
              </View>
            )}
          </View>

          <ThemedText style={styles.productName} numberOfLines={2}>
            {product.name}
          </ThemedText>

          <View style={styles.productFooter}>
            <View>
              <ThemedText style={styles.productPrice}>
                {product.price.toLocaleString('vi-VN')} ₫
              </ThemedText>
              {product.originalPrice && product.originalPrice > product.price && (
                <ThemedText style={styles.productOriginalPrice}>
                  {product.originalPrice.toLocaleString('vi-VN')} ₫
                </ThemedText>
              )}
            </View>
            <View style={styles.productRating}>
              <IconSymbol name="star.fill" size={12} color="#FACC15" />
              <ThemedText style={styles.productRatingText}>
                {product.rating?.average?.toFixed(1) ?? '4.5'}
              </ThemedText>
              <ThemedText style={styles.productRatingCount}>
                ({product.rating?.count ?? 0})
              </ThemedText>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryChip = (category: Category) => (
    <TouchableOpacity
      key={category._id}
      style={styles.categoryChip}
      onPress={() => handleCategoryPress(category.name)}
    >
      <ThemedText style={styles.categoryChipIcon}>
        {category.icon || FALLBACK_CATEGORY_ICON}
      </ThemedText>
      <View style={{ flexShrink: 1 }}>
        <ThemedText style={styles.categoryChipName} numberOfLines={1}>
          {category.name}
        </ThemedText>
        <ThemedText style={styles.categoryChipCount}>
          {(category.productCount ?? 0).toLocaleString('vi-VN')} sản phẩm
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  const renderListHeader = () => (
    <>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.greeting}>Xin chào 👋</ThemedText>
          <ThemedText style={styles.subtitle}>
            Đặc sản OCOP Đồng Nai được tuyển chọn cho bạn
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.notifButton} onPress={handleExplorePress}>
          <IconSymbol name="bell.fill" size={18} color="#6366F1" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <IconSymbol name="magnifyingglass" size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm sản phẩm OCOP, danh mục hoặc từ khóa..."
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearchSubmit}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchSubmit}>
          <IconSymbol name="arrow.turn.up.right" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {error && !loading ? (
        <View style={styles.errorCard}>
          <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#F97316" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <IconSymbol name="arrow.clockwise" size={14} color="#FFFFFF" />
            <ThemedText style={styles.retryButtonText}>Thử lại</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {renderHero()}

          {categories.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>Danh mục nổi bật</ThemedText>
                <TouchableOpacity onPress={() => router.push('/categories')}>
                  <ThemedText style={styles.sectionAction}>Xem tất cả</ThemedText>
                </TouchableOpacity>
              </View>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={categories.slice(0, 8)}
                renderItem={({ item }) => renderCategoryChip(item)}
                keyExtractor={item => item._id}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 12, marginTop: 12 }}
              />
            </View>
          )}

          {spotlightProducts.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>Gợi ý dành riêng cho bạn</ThemedText>
                <TouchableOpacity onPress={handleExplorePress}>
                  <ThemedText style={styles.sectionAction}>Xem thêm</ThemedText>
                </TouchableOpacity>
              </View>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={spotlightProducts}
                renderItem={({ item }) => renderProductCard(item)}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Tất cả sản phẩm</ThemedText>
              <ThemedText style={styles.sectionSubtext}>
                {featuredProducts.length} sản phẩm
              </ThemedText>
            </View>
          </View>
        </>
      )}
    </>
  );

  const renderListFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color="#6366F1" />
          <ThemedText style={styles.loadingMoreText}>Đang tải thêm sản phẩm...</ThemedText>
        </View>
      );
    }

    if (!hasMore && mainProducts.length > 0) {
      return (
        <View style={styles.endMessage}>
          <IconSymbol name="checkmark.circle.fill" size={20} color="#10B981" />
          <ThemedText style={styles.endMessageText}>
            Đã hiển thị tất cả {featuredProducts.length} sản phẩm
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.ctaCard}>
        <View style={{ flex: 1, gap: 6 }}>
          <ThemedText style={styles.ctaTitle}>Bạn đang tìm OCOP theo vùng?</ThemedText>
          <ThemedText style={styles.ctaSubtitle}>
            Truy cập bản đồ OCOP để xem sản phẩm theo huyện, xã và kết nối nhà cung cấp gần bạn.
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.ctaButton} onPress={handleExplorePress}>
          <ThemedText style={styles.ctaButtonText}>Xem tin tức</ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productGridItem}>
      {renderProductCard(item, 'wide')}
    </View>
  );

  const renderHero = () => {
    if (loading) {
      return (
        <View style={styles.heroSkeleton}>
          <ActivityIndicator size="large" color="#6366F1" />
          <ThemedText style={styles.heroSkeletonText}>Đang tải sản phẩm nổi bật...</ThemedText>
        </View>
      );
    }

    if (!heroProduct) {
      return (
        <View style={styles.heroEmpty}>
          <IconSymbol name="shippingbox.fill" size={32} color="#CBD5F5" />
          <ThemedText style={styles.heroEmptyTitle}>Chưa có sản phẩm nổi bật</ThemedText>
          <ThemedText style={styles.heroEmptySubtitle}>
            Hãy quay lại sau khi dữ liệu được cập nhật hoặc thử tải lại trang.
          </ThemedText>
        </View>
      );
    }

    const imageUrl = getPrimaryImageUrl(heroProduct.images);

    return (
      <TouchableOpacity
        style={styles.heroCard}
        activeOpacity={0.92}
        onPress={() => handleProductPress(heroProduct._id)}
      >
        <Image source={{ uri: imageUrl }} style={styles.heroImage} contentFit="cover" transition={300} />
        <View style={styles.heroOverlay} />
        <View style={styles.heroTopRow}>
          <View style={styles.heroTag}>
            <IconSymbol name="sparkles" size={14} color="#FACC15" />
            <ThemedText style={styles.heroTagText}>Mới cập nhật</ThemedText>
          </View>
          <TouchableOpacity style={styles.heroBookmark}>
            <IconSymbol name="heart" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.heroContent}>
          <ThemedText style={styles.heroCategory}>
            {heroProduct.category?.name ?? 'OCOP Đồng Nai'}
          </ThemedText>
          <ThemedText style={styles.heroTitle} numberOfLines={2}>
            {heroProduct.name}
          </ThemedText>
          <ThemedText style={styles.heroSubtitle} numberOfLines={2}>
            {heroProduct.shortDescription ??
              'Khám phá đặc sản OCOP chính gốc Đồng Nai với chất lượng được chứng nhận.'}
          </ThemedText>
          <View style={styles.heroFooter}>
            <View style={styles.heroPriceGroup}>
              <ThemedText style={styles.heroPrice}>
                {heroProduct.price.toLocaleString('vi-VN')} ₫
              </ThemedText>
              {heroProduct.originalPrice && heroProduct.originalPrice > heroProduct.price && (
                <ThemedText style={styles.heroOriginalPrice}>
                  {heroProduct.originalPrice.toLocaleString('vi-VN')} ₫
                </ThemedText>
              )}
            </View>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => handleProductPress(heroProduct._id)}
            >
              <ThemedText style={styles.heroButtonText}>Xem chi tiết</ThemedText>
              <IconSymbol name="arrow.right" size={14} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ThemedView style={styles.innerContainer}>
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <ThemedText style={styles.loadingText}>Đang tải sản phẩm OCOP...</ThemedText>
          </View>
        ) : (
          <FlatList
            data={mainProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={renderListHeader}
            ListFooterComponent={renderListFooter}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#6366F1" />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={15}
            windowSize={15}
            initialNumToRender={15}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  innerContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  content: {
    paddingBottom: 32
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A'
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#475569'
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchWrapper: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#0F172A'
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    gap: 12,
    alignItems: 'center'
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#92400E',
    textAlign: 'center'
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F97316'
  },
  retryButtonText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF'
  },
  heroCard: {
    marginTop: 24,
    marginHorizontal: 20,
    height: 320,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#1E293B'
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)'
  },
  heroTopRow: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999
  },
  heroTagText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF'
  },
  heroBookmark: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroContent: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    gap: 12
  },
  heroCategory: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#C7D2FE'
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF'
  },
  heroSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#E2E8F0'
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  heroPriceGroup: {
    gap: 4
  },
  heroPrice: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#FACC15'
  },
  heroOriginalPrice: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#E2E8F0',
    textDecorationLine: 'line-through'
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FACC15'
  },
  heroButtonText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#0F172A'
  },
  heroSkeleton: {
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: 24,
    backgroundColor: '#E0E7FF',
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12
  },
  heroSkeletonText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#4338CA'
  },
  heroEmpty: {
    marginHorizontal: 20,
    marginTop: 32,
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    gap: 8
  },
  heroEmptyTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E1B4B'
  },
  heroEmptySubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#4338CA',
    textAlign: 'center'
  },
  section: {
    marginTop: 28,
    paddingHorizontal: 20
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A'
  },
  sectionAction: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#6366F1'
  },
  horizontalList: {
    paddingVertical: 12,
    gap: 16
  },
  verticalList: {
    marginTop: 16,
    gap: 16
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  categoryChipIcon: {
    fontSize: 20
  },
  categoryChipName: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A'
  },
  categoryChipCount: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#64748B'
  },
  productCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginRight: 16
  },
  productCardWide: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden'
  },
  productImage: {
    width: '100%',
    height: 140
  },
  productImageWide: {
    width: 120,
    height: '100%'
  },
  productContent: {
    padding: 16,
    gap: 12,
    flex: 1
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  productBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999
  },
  productBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#15803D'
  },
  productDiscount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999
  },
  productDiscountText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#C2410C'
  },
  productName: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A'
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  productPrice: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#F97316'
  },
  productOriginalPrice: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#94A3B8',
    textDecorationLine: 'line-through'
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  productRatingText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#0F172A'
  },
  productRatingCount: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#94A3B8'
  },
  ctaCard: {
    marginTop: 32,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  ctaTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E3A8A'
  },
  ctaSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#1D4ED8'
  },
  ctaButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: '#1D4ED8'
  },
  ctaButtonText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    textAlign: 'center'
  },
  loadingMore: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 12
  },
  loadingMoreText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#64748B'
  },
  endMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
    marginHorizontal: 20
  },
  endMessageText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#10B981'
  },
  productGridItem: {
    paddingHorizontal: 20,
    paddingVertical: 8
  },
  sectionSubtext: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#64748B'
  }
});

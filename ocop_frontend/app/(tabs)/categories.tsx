import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SafeImage } from '@/components/SafeImage';
import { categoryService, Category } from '@/services/categoryService';
import { productService, Product } from '@/services/productService';
import { getPrimaryImageUrl } from '@/utils/imageHelper';

type FilterKey = 'all' | 'ocop' | 'discount' | 'popular';

const FALLBACK_CATEGORY_ICON = '🛍️';
const FALLBACK_PRODUCT_IMAGE = 'https://placehold.co/600x400?text=OCOP';

const FILTER_TABS: { id: FilterKey; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'ocop', label: 'OCOP' },
  { id: 'discount', label: 'Ưu đãi' },
  { id: 'popular', label: 'Bán chạy' }
];

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ selected?: string | string[] }>();
  const selectedParam = Array.isArray(params.selected) ? params.selected[0] : params.selected;

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCategoryIdRef = useRef<string | null>(null);

  useEffect(() => {
    selectedCategoryIdRef.current = selectedCategory?._id ?? null;
  }, [selectedCategory]);

  const pickCategory = useCallback(
    (items: Category[]): Category | null => {
      if (!items.length) {
        return null;
      }

      if (selectedParam) {
        const normalizedTarget = normalizeText(selectedParam);
        const byName = items.find(category => normalizeText(category.name) === normalizedTarget);
        if (byName) {
          return byName;
        }

        const byId = items.find(category => category._id === selectedParam);
        if (byId) {
          return byId;
        }
      }

      if (selectedCategoryIdRef.current) {
        const existing = items.find(category => category._id === selectedCategoryIdRef.current);
        if (existing) {
          return existing;
        }
      }

      return items[0];
    },
    [selectedParam]
  );

  const loadCategories = useCallback(
    async (options: { refresh?: boolean } = {}) => {
      try {
        if (options.refresh) {
          setRefreshing(true);
        } else {
          setLoadingCategories(true);
        }

        setError(null);
        const response = await categoryService.getCategories({ includeProducts: true });
        let activeCategories = response.data?.filter(category => category.isActive) ?? [];

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

        const resolvedCategory = pickCategory(activeCategories);
        setSelectedCategory(resolvedCategory);

        if (!resolvedCategory) {
          setProducts([]);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setCategories([]);
        setSelectedCategory(null);
        setProducts([]);
        setError('Không thể tải danh mục. Vui lòng thử lại sau.');
      } finally {
        setLoadingCategories(false);
        setRefreshing(false);
      }
    },
    [pickCategory]
  );

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (!selectedCategory) {
      setProducts([]);
      return;
    }

    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        setError(null);

        const response = await productService.getProducts({
          category: selectedCategory._id,
          limit: 120,
          status: 'active'
        });

        const payload = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
        setProducts(payload);
      } catch (err) {
        console.error(`Failed to fetch products for category ${selectedCategory.name}:`, err);
        setProducts([]);
        setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, [selectedCategory]);

  const filteredCategories = useMemo(() => {
    if (!query.trim()) {
      return categories;
    }

    const normalizedQuery = normalizeText(query);
    return categories.filter(category =>
      normalizeText(category.name).includes(normalizedQuery)
    );
  }, [categories, query]);

  const filteredProducts = useMemo(() => {
    let currentProducts = products;

    if (query.trim()) {
      const normalizedQuery = normalizeText(query);

      currentProducts = currentProducts.filter(product => {
        const nameMatch = normalizeText(product.name).includes(normalizedQuery);
        const shortMatch = normalizeText(product.shortDescription ?? '').includes(normalizedQuery);
        const tagMatch = product.tags?.some(tag => normalizeText(tag).includes(normalizedQuery));

        return nameMatch || shortMatch || tagMatch;
      });
    }

    switch (activeFilter) {
      case 'ocop':
        currentProducts = currentProducts.filter(product => product.isOCOP !== false);
        break;
      case 'discount':
        currentProducts = currentProducts.filter(product => (product.discount ?? 0) > 0);
        break;
      case 'popular':
        currentProducts = [...currentProducts].sort(
          (a, b) => (b.totalSold ?? 0) - (a.totalSold ?? 0)
        );
        break;
      default:
        break;
    }

    return currentProducts;
  }, [activeFilter, products, query]);

  const activeFilterDescription = useMemo(() => {
    switch (activeFilter) {
      case 'ocop':
        return 'Sản phẩm đã được chứng nhận OCOP';
      case 'discount':
        return 'Ưu đãi hấp dẫn đang diễn ra';
      case 'popular':
        return 'Được nhiều người mua và đánh giá cao';
      default:
        return `${filteredProducts.length.toLocaleString('vi-VN')} sản phẩm phù hợp`;
    }
  }, [activeFilter, filteredProducts.length]);

  const handleCategoryPress = useCallback((category: Category) => {
    setSelectedCategory(category);
    setActiveFilter('all');
  }, []);

  const handleRefresh = useCallback(() => {
    loadCategories({ refresh: true });
  }, [loadCategories]);

  const handleBackToHome = useCallback(() => {
    router.push('/');
  }, [router]);

  const renderProductCard = useCallback(
    ({ item }: { item: Product }) => {
      try {
        const imageUrl = getPrimaryImageUrl(item.images);
        const ocopLevel = item.ocopLevel ?? (item.isOCOP === false ? null : 'OCOP');

        return (
          <TouchableOpacity
            style={styles.productCard}
            activeOpacity={0.9}
            onPress={() => router.push(`/product/${item._id}`)}
          >
            <View style={styles.productImageWrapper}>
              <SafeImage
                source={{ uri: imageUrl }}
                style={styles.productImage}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
                recyclingKey={item._id}
                fallbackIcon="photo.fill"
              />
              <View style={styles.productImageOverlay} />
              <View style={styles.productBadgeRow}>
                {ocopLevel ? (
                  <View style={styles.productBadge}>
                    <IconSymbol name="leaf.fill" size={10} color="#22C55E" />
                    <ThemedText style={styles.productBadgeText}>{ocopLevel}</ThemedText>
                  </View>
                ) : (
                  <View style={styles.productBadgeMuted}>
                    <ThemedText style={styles.productBadgeMutedText}>Đặc sản địa phương</ThemedText>
                  </View>
                )}
                {(item.discount ?? 0) > 0 && (
                  <View style={styles.productDiscount}>
                    <IconSymbol name="tag.fill" size={10} color="#C2410C" />
                    <ThemedText style={styles.productDiscountText}>-{item.discount ?? 0}%</ThemedText>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.productMeta}>
              <ThemedText style={styles.productName} numberOfLines={2}>
                {item.name}
              </ThemedText>
              <ThemedText style={styles.productDescription} numberOfLines={2}>
                {item.shortDescription ?? item.description ?? 'Đặc sản OCOP chính hiệu Đồng Nai'}
              </ThemedText>
              <View style={styles.productFooter}>
                <View>
                  <ThemedText style={styles.productPrice}>
                    {(item.price ?? 0).toLocaleString('vi-VN')} ₫
                  </ThemedText>
                  {item.originalPrice && item.originalPrice > (item.price ?? 0) && (
                    <ThemedText style={styles.productOriginalPrice}>
                      {item.originalPrice.toLocaleString('vi-VN')} ₫
                    </ThemedText>
                  )}
                </View>
                <View style={styles.productRating}>
                  <IconSymbol name="star.fill" size={12} color="#FACC15" />
                  <ThemedText style={styles.productRatingValue}>
                    {item.rating?.average?.toFixed(1) ?? '4.5'}
                  </ThemedText>
                  <ThemedText style={styles.productRatingCount}>
                    ({item.rating?.count ?? 0})
                  </ThemedText>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      } catch (error) {
        console.error('Error rendering product card:', error, item);
        return null;
      }
    },
    [router]
  );

  const renderEmptyState = useCallback(
    (title: string, subtitle: string, showButton = false) => (
      <View style={styles.emptyState}>
        <IconSymbol name="square.grid.2x2.fill" size={56} color="#CBD5F5" />
        <ThemedText style={styles.emptyTitle}>{title}</ThemedText>
        <ThemedText style={styles.emptySubtitle}>{subtitle}</ThemedText>
        {showButton && (
          <TouchableOpacity style={styles.emptyButton} onPress={handleBackToHome}>
            <IconSymbol name="arrow.uturn.backward" size={14} color="#FFFFFF" />
            <ThemedText style={styles.emptyButtonText}>Về trang chủ</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    ),
    [handleBackToHome]
  );

  const renderProductEmpty = useCallback(() => {
    if (!selectedCategory) {
      return renderEmptyState(
        'Chọn danh mục để bắt đầu',
        'Các danh mục OCOP được cập nhật mỗi ngày, hãy chọn một danh mục phù hợp.'
      );
    }

    return renderEmptyState(
      'Danh mục chưa có sản phẩm',
      'Danh mục này hiện chưa có sản phẩm mở bán. Hãy quay lại sau nhé!',
      true
    );
  }, [renderEmptyState, selectedCategory]);

  const renderSkeleton = useCallback(() => (
    <View style={styles.skeletonGrid}>
      {Array.from({ length: 4 }).map((_, index) => (
        <View key={`skeleton-${index}`} style={styles.skeletonCard}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonLineShort} />
          <View style={styles.skeletonLineLong} />
        </View>
      ))}
    </View>
  ), []);

  const renderHeader = useCallback(() => (
    <>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.title}>Danh mục OCOP</ThemedText>
          <ThemedText style={styles.subtitle}>
            Tìm đặc sản Đồng Nai phù hợp với nhu cầu của bạn
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.homeButton} onPress={handleBackToHome}>
          <IconSymbol name="house.fill" size={18} color="#6366F1" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <IconSymbol name="magnifyingglass" size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm danh mục hoặc sản phẩm..."
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={() => setQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={16} color="#CBD5F5" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterRow}>
        {FILTER_TABS.map(tab => {
          const isActive = activeFilter === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(tab.id)}
            >
              <ThemedText
                style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
              >
                {tab.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

      <ThemedText style={styles.filterDescription}>{activeFilterDescription}</ThemedText>

      {loadingCategories ? (
        <View style={styles.categorySkeletonRow}>
          {Array.from({ length: 3 }).map((_, index) => (
            <View key={`cat-skeleton-${index}`} style={styles.categorySkeleton} />
          ))}
        </View>
      ) : filteredCategories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {filteredCategories.map(category => (
            <TouchableOpacity
              key={category._id}
              style={[
                styles.categoryPill,
                selectedCategory?._id === category._id && styles.categoryPillActive
              ]}
              onPress={() => handleCategoryPress(category)}
            >
              <ThemedText style={styles.categoryIconSmall}>
                {category.icon || FALLBACK_CATEGORY_ICON}
              </ThemedText>
              <ThemedText
                style={[
                  styles.categoryPillText,
                  selectedCategory?._id === category._id && styles.categoryPillTextActive
                ]}
              >
                {category.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        renderEmptyState(
          'Không tìm thấy danh mục',
          'Thử đổi từ khóa tìm kiếm hoặc làm mới dữ liệu để xem các danh mục mới nhất.'
        )
      )}

      {error && !loadingProducts ? (
        <View style={styles.errorBanner}>
          <IconSymbol name="exclamationmark.triangle.fill" size={22} color="#F97316" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadCategories({ refresh: true })}>
            <IconSymbol name="arrow.clockwise" size={14} color="#FFFFFF" />
            <ThemedText style={styles.retryButtonText}>Thử lại</ThemedText>
          </TouchableOpacity>
        </View>
      ) : null}

      {loadingProducts ? renderSkeleton() : null}
    </>
  ), [
    activeFilter,
    activeFilterDescription,
    error,
    filteredCategories,
    handleBackToHome,
    handleCategoryPress,
    loadCategories,
    loadingCategories,
    loadingProducts,
    query,
    renderEmptyState,
    renderSkeleton
  ]);

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top + 12 }]} edges={['top']}>
      <ThemedView style={styles.container}>
        <FlatList
          data={loadingProducts ? [] : filteredProducts}
          keyExtractor={item => item._id}
          renderItem={renderProductCard}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={<View style={{ height: 32 }} />}
          ListEmptyComponent={!loadingProducts ? renderProductEmpty : null}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#6366F1" />
          }
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A'
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#475569'
  },
  homeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchBar: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#0F172A'
  },
  clearButton: {
    padding: 2
  },
  filterRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#E2E8F0'
  },
  filterChipActive: {
    backgroundColor: '#6366F1'
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#475569'
  },
  filterChipTextActive: {
    color: '#FFFFFF'
  },
  filterDescription: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#64748B'
  },
  categoryRow: {
    marginTop: 16,
    gap: 10
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  categoryPillActive: {
    backgroundColor: '#111827',
    borderColor: '#111827'
  },
  categoryIconSmall: {
    fontSize: 16
  },
  categoryPillText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#1F2937'
  },
  categoryPillTextActive: {
    color: '#FFFFFF'
  },
  categorySkeletonRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10
  },
  categorySkeleton: {
    height: 36,
    width: 110,
    borderRadius: 18,
    backgroundColor: '#E5E7EB'
  },
  errorBanner: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    gap: 10
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F97316',
    borderRadius: 999
  },
  retryButtonText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF'
  },
  skeletonGrid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16
  },
  skeletonCard: {
    width: '48%',
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    padding: 16,
    gap: 10
  },
  skeletonImage: {
    height: 120,
    borderRadius: 14,
    backgroundColor: '#CBD5F5'
  },
  skeletonLineShort: {
    height: 10,
    width: '50%',
    borderRadius: 6,
    backgroundColor: '#CBD5F5'
  },
  skeletonLineLong: {
    height: 10,
    width: '80%',
    borderRadius: 6,
    backgroundColor: '#E2E8F0'
  },
  productRow: {
    justifyContent: 'space-between'
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    marginBottom: 16
  },
  productImageWrapper: {
    position: 'relative',
    height: 150
  },
  productImage: {
    width: '100%',
    height: '100%'
  },
  productImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.18)'
  },
  productBadgeRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  productBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  productBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#15803D'
  },
  productBadgeMuted: {
    backgroundColor: 'rgba(226,232,240,0.7)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  productBadgeMutedText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#1F2937'
  },
  productDiscount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(248,113,113,0.2)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  productDiscountText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#C2410C'
  },
  productMeta: {
    padding: 16,
    gap: 10
  },
  productName: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827'
  },
  productDescription: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280'
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
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
  productRatingValue: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#0F172A'
  },
  productRatingCount: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#94A3B8'
  },
  emptyState: {
    marginTop: 48,
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 32
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A'
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    textAlign: 'center'
  },
  emptyButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#6366F1'
  },
  emptyButtonText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF'
  }
});

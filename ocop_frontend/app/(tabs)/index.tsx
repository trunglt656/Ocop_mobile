import { Image } from 'expo-image';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, FlatList, View, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { productService, categoryService, Product, Category } from '@/services';

export default function HomeScreen() {
  const router = useRouter();

  // State for API data
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load featured products and categories in parallel
      const [productsResponse, categoriesResponse] = await Promise.all([
        productService.getFeaturedProducts({ limit: 8 }),
        categoryService.getCategories({ includeProducts: true }),
      ]);

      if (productsResponse.data) {
        setFeaturedProducts(productsResponse.data);
      }

      if (categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }
    } catch (error: any) {
      console.error('Error loading home data:', error);
      setError(error.message || 'Failed to load data');
      // No fallback data, just show the error.
    } finally {
      setLoading(false);
    }
  };

  const banners = [
    {
      id: '1',
      title: 'Ưu đãi đặc biệt OCOP',
      subtitle: 'Giảm giá đến 50% cho sản phẩm đặc sản Đồng Nai',
      image: require('@/assets/images/buoi.jpg'),
    },
    {
      id: '2',
      title: 'Sản phẩm tươi mới',
      subtitle: 'Hàng ngày cập nhật sản phẩm tươi ngon từ nông dân',
      image: require('@/assets/images/cacao.jpg'),
    },
  ];

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleCategoryPress = (categoryName: string) => {
    router.push(`/categories?selected=${categoryName}`);
  };

  const renderBanner = ({ item }: { item: typeof banners[0] }) => (
    <TouchableOpacity style={styles.banner}>
      <Image source={item.image} style={styles.bannerImage} />
      <View style={styles.bannerOverlay}>
        <ThemedText style={styles.bannerTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.bannerSubtitle}>{item.subtitle}</ThemedText>
        <TouchableOpacity style={styles.bannerButton}>
          <ThemedText style={styles.bannerButtonText}>Khám phá ngay</ThemedText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: Category | { id: string; name: string; icon: string } }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategoryPress(item.name)}>
      <ThemedText style={styles.categoryIcon}>{item.icon}</ThemedText>
      <ThemedText style={styles.categoryName}>{item.name}</ThemedText>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => handleProductPress(item._id)}>
      <Image
        source={item.images[0]?.url}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <ThemedText style={styles.productName} numberOfLines={2}>
          {item.name}
        </ThemedText>
        <View style={styles.priceContainer}>
          <ThemedText style={styles.productPrice}>
            {item.price.toLocaleString('vi-VN')}₫
          </ThemedText>
          {item.originalPrice && item.originalPrice > item.price && (
            <ThemedText style={styles.originalPrice}>
              {item.originalPrice.toLocaleString('vi-VN')}₫
            </ThemedText>
          )}
        </View>
        {item.discount > 0 && (
          <View style={styles.discountBadge}>
            <ThemedText style={styles.discountText}>-{item.discount}%</ThemedText>
          </View>
        )}
        <View style={styles.ratingContainer}>
          <IconSymbol name="star.fill" size={12} color="#ffd700" />
          <ThemedText style={styles.ratingText}>{item.rating.average}</ThemedText>
          <ThemedText style={styles.reviewText}>({item.rating.count})</ThemedText>
        </View>
        {item.isOCOP && (
          <View style={styles.ocopBadge}>
            <ThemedText style={styles.ocopText}>OCOP {item.ocopLevel}</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Đang tải...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText style={{ marginBottom: 16, textAlign: 'center' }}>
          Đã xảy ra lỗi khi tải dữ liệu: {error}
        </ThemedText>
        <Button title="Thử lại" onPress={loadHomeData} />
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <IconSymbol name="location.fill" size={16} color="#007AFF" />
          <ThemedText style={styles.locationText}>Giao đến: Đồng Nai</ThemedText>
          <TouchableOpacity style={styles.notificationButton}>
            <IconSymbol name="bell.fill" size={20} color="#007AFF" />
            <View style={styles.notificationBadge}>
              <ThemedText style={styles.notificationText}>3</ThemedText>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.testButton} onPress={() => router.push('/test')}>
            <IconSymbol name="hammer.fill" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <ThemedText style={styles.welcomeText}>Chào mừng đến với OCOP Đồng Nai</ThemedText>
        <ThemedText style={styles.subtitleText}>
          Khám phá những sản phẩm đặc sản chất lượng cao từ Đồng Nai
        </ThemedText>
      </View>

      {/* Search Bar */}
      <TouchableOpacity style={styles.searchBar}>
        <IconSymbol name="magnifyingglass" size={20} color="#999" />
        <ThemedText style={styles.searchText}>Tìm kiếm sản phẩm OCOP...</ThemedText>
      </TouchableOpacity>

      {/* Banners */}
      <FlatList
        data={banners}
        renderItem={renderBanner}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.bannersList}
        contentContainerStyle={styles.bannersContainer}
      />

      {/* Categories */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Danh mục sản phẩm</ThemedText>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesList}
          contentContainerStyle={styles.categoriesContainer}
        />
      </View>

      {/* Featured Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Sản phẩm nổi bật</ThemedText>
          <TouchableOpacity onPress={() => router.push('/categories')}>
            <ThemedText style={styles.seeAllText}>Xem tất cả</ThemedText>
          </TouchableOpacity>
        </View>

        <FlatList
          data={featuredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.productsList}
          contentContainerStyle={styles.productsContainer}
        />
      </View>

      {/* Promotions */}
      <View style={styles.promotionSection}>
        <View style={styles.promotionCard}>
          <IconSymbol name="gift.fill" size={32} color="#007AFF" />
          <View style={styles.promotionContent}>
            <ThemedText style={styles.promotionTitle}>Miễn phí vận chuyển</ThemedText>
            <ThemedText style={styles.promotionSubtitle}>Đơn hàng từ 200.000₫</ThemedText>
          </View>
        </View>
        <View style={styles.promotionCard}>
          <IconSymbol name="star.circle.fill" size={32} color="#ffd700" />
          <View style={styles.promotionContent}>
            <ThemedText style={styles.promotionTitle}>Điểm thưởng</ThemedText>
            <ThemedText style={styles.promotionSubtitle}>Tích điểm với mỗi đơn hàng</ThemedText>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          2024 OCOP Đồng Nai - Sản phẩm chất lượng từ nông dân Việt Nam
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
    flex: 1,
  },
  testButton: {
    marginLeft: 12,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: '#666',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#999',
  },
  bannersList: {
    maxHeight: 200,
  },
  bannersContainer: {
    paddingHorizontal: 16,
  },
  banner: {
    width: 300,
    height: 180,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  bannerButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
  },
  categoriesList: {
    maxHeight: 100,
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoryItem: {
    alignItems: 'center',
    padding: 12,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  productsList: {
    maxHeight: 280,
  },
  productsContainer: {
    paddingVertical: 8,
  },
  productItem: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
    marginRight: 2,
  },
  reviewText: {
    fontSize: 12,
    color: '#999',
  },
  ocopBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ocopText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  promotionSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  promotionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promotionContent: {
    marginLeft: 12,
  },
  promotionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  promotionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, View, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { productService, Product } from '@/services';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async (query = '') => {
    try {
      setError(null);
      const response = await productService.getProducts({ search: query, limit: 50 });
      if (response.data && response.data.data) {
        setProducts(response.data.data);
      } else {
        setProducts([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      setError('Không thể tải danh sách sản phẩm. Vui lòng kiểm tra lại kết nối.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProducts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts(searchQuery);
  }, [searchQuery]);

  const handleSearch = () => {
    setLoading(true);
    fetchProducts(searchQuery);
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productContainer} onPress={() => router.push(`/product/${item._id}`)}>
      <Image
        source={{ uri: item.images[0]?.url || 'https://via.placeholder.com/150' }}
        style={styles.productImage}
        contentFit="cover"
      />
      <View style={styles.productInfo}>
        <ThemedText style={styles.productName} numberOfLines={2}>{item.name}</ThemedText>
        <ThemedText style={styles.productPrice}>
          {item.price.toLocaleString('vi-VN')}₫
        </ThemedText>
        {item.isOCOP && (
            <View style={styles.ocopBadge}>
              <ThemedText style={styles.ocopText}>⭐ OCOP</ThemedText>
            </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View style={styles.headerContainer}>
        <ThemedText type="title" style={styles.title}>Khám Phá Sản Phẩm</ThemedText>
        <ThemedText style={styles.subtitle}>Đặc sản OCOP từ Đồng Nai</ThemedText>
        <View style={styles.searchContainer}>
            <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <ThemedText style={styles.searchButtonText}>Tìm</ThemedText>
            </TouchableOpacity>
        </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.centerScreen}>
        <ActivityIndicator size="large" />
        <ThemedText>Đang tải sản phẩm...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centerScreen}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchProducts(searchQuery)}>
            <ThemedText style={styles.retryButtonText}>Thử lại</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 20 }}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={() => (
            <ThemedView style={styles.centerScreen}>
                <ThemedText>Không tìm thấy sản phẩm nào.</ThemedText>
            </ThemedView>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  productContainer: {
    flex: 1,
    margin: 8,
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  productImage: {
    width: '100%',
    height: 150,
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    minHeight: 34, // for 2 lines
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e63946',
    marginTop: 4,
  },
  ocopBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ffc107',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  ocopText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  errorText: {
      color: 'red',
      marginBottom: 16,
      textAlign: 'center',
  },
  retryButton: {
      backgroundColor: '#007AFF',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
  },
  retryButtonText: {
      color: '#fff',
      fontWeight: 'bold',
  }
});
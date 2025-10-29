import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { categoryService, Category } from '@/services/categoryService';
import { productService, Product } from '@/services/productService';

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState({ categories: true, products: false });

  // Fetch all categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(prev => ({ ...prev, categories: true }));
        const response = await categoryService.getCategories();
        if (response.data) {
          const activeCategories = response.data.filter(c => c.isActive);
          setCategories(activeCategories);
          // Auto-select the first category
          if (activeCategories.length > 0) {
            setSelectedCategory(activeCategories[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(prev => ({ ...prev, categories: false }));
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when a category is selected
  useEffect(() => {
    if (!selectedCategory) return;

    const fetchProducts = async () => {
      try {
        setLoading(prev => ({ ...prev, products: true }));
        const response = await productService.getProducts({ category: selectedCategory._id, limit: 50 });
        if (response.data && response.data.data) {
          setProducts(response.data.data);
        }
      } catch (error) {
        console.error(`Failed to fetch products for category ${selectedCategory.name}:`, error);
      } finally {
        setLoading(prev => ({ ...prev, products: false }));
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[styles.categoryItem, selectedCategory?._id === item._id && styles.selectedCategoryItem]}
      onPress={() => setSelectedCategory(item)}>
      <ThemedText style={styles.categoryIcon}>{item.icon || '🍽️'}</ThemedText>
      <ThemedText style={[styles.categoryName, selectedCategory?._id === item._id && styles.selectedCategoryName]}>
        {item.name}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productItem} onPress={() => router.push(`/product/${item._id}`)}>
      <Image source={{ uri: item.images[0]?.url }} style={styles.productImage} contentFit="cover" />
      <View style={styles.productInfo}>
        <ThemedText style={styles.productName} numberOfLines={2}>{item.name}</ThemedText>
        <ThemedText style={styles.productPrice}>{item.price.toLocaleString('vi-VN')}₫</ThemedText>
      </View>
      {item.discount > 0 && (
        <View style={styles.discountBadge}><ThemedText style={styles.discountText}>-{item.discount}%</ThemedText></View>
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Danh mục sản phẩm</ThemedText>

      {loading.categories ? (
        <ActivityIndicator style={{ marginVertical: 20 }} />
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesList}
          contentContainerStyle={styles.categoriesContainer}
        />
      )}

      {loading.products ? (
        <View style={styles.placeholderContainer}><ActivityIndicator size="large" /></View>
      ) : products.length > 0 ? (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          style={styles.productsList}
        />
      ) : (
        <View style={styles.placeholderContainer}>
          <IconSymbol name={loading.categories ? "hourglass" : "square.grid.2x2"} size={64} color="#ccc" />
          <ThemedText style={styles.placeholderText}>
            {loading.categories ? 'Đang tải danh mục...' : 'Không có sản phẩm trong danh mục này.'}
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  categoriesList: { maxHeight: 80, flexGrow: 0, marginBottom: 16 },
  categoriesContainer: { paddingHorizontal: 4 },
  categoryItem: { alignItems: 'center', padding: 12, marginRight: 12, borderRadius: 8, backgroundColor: '#fff', minWidth: 80, borderWidth: 1, borderColor: '#eee' },
  selectedCategoryItem: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  categoryIcon: { fontSize: 20, marginBottom: 4 },
  categoryName: { fontSize: 12, textAlign: 'center' },
  selectedCategoryName: { color: '#fff' },
  productsList: { flex: 1 },
  productItem: { flex: 1, margin: 8, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  productImage: { width: '100%', height: 120 },
  productInfo: { padding: 12 },
  productName: { fontSize: 14, fontWeight: '600', marginBottom: 6, minHeight: 34 },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#e63946' },
  discountBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#ff4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  discountText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  placeholderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 16, color: '#999', marginTop: 16, textAlign: 'center' },
});
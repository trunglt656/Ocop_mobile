import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { categories, getProductsByCategory, Product } from '@/constants/products';

// Static imports for images
const productImages = {
  'buoi.jpg': require('@/assets/images/buoi.jpg'),
  'cacao.jpg': require('@/assets/images/cacao.jpg'),
  'dau_phong.jpg': require('@/assets/images/dau_phong.jpg'),
  'keo_sua.jpg': require('@/assets/images/keo_sua.jpg'),
};

export default function CategoriesScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const renderCategory = ({ item }: { item: { id: string; name: string; icon: string } }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategoryItem,
      ]}
      onPress={() => handleCategoryPress(item.id)}>
      <ThemedText style={styles.categoryIcon}>{item.icon}</ThemedText>
      <ThemedText style={[
        styles.categoryName,
        selectedCategory === item.id && styles.selectedCategoryName,
      ]}>
        {item.name}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => handleProductPress(item)}>
      <Image source={productImages[item.image as keyof typeof productImages]} style={styles.productImage} />
      <View style={styles.productInfo}>
        <ThemedText style={styles.productName} numberOfLines={2}>
          {item.name}
        </ThemedText>
        <View style={styles.priceContainer}>
          <ThemedText style={styles.productPrice}>
            {item.price.toLocaleString('vi-VN')}₫
          </ThemedText>
          {item.originalPrice && (
            <ThemedText style={styles.originalPrice}>
              {item.originalPrice.toLocaleString('vi-VN')}₫
            </ThemedText>
          )}
        </View>
        {item.discount && (
          <View style={styles.discountBadge}>
            <ThemedText style={styles.discountText}>-{item.discount}%</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const productsToShow = selectedCategory
    ? getProductsByCategory(categories.find(cat => cat.id === selectedCategory)?.name || '')
    : [];

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Danh mục sản phẩm</ThemedText>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesList}
        contentContainerStyle={styles.categoriesContainer}
      />

      {selectedCategory && (
        <FlatList
          data={productsToShow}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          style={styles.productsList}
          contentContainerStyle={styles.productsContainer}
        />
      )}

      {!selectedCategory && (
        <View style={styles.placeholderContainer}>
          <IconSymbol name="square.grid.2x2" size={64} color="#ccc" />
          <ThemedText style={styles.placeholderText}>
            Chọn một danh mục để xem sản phẩm
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoriesList: {
    maxHeight: 80,
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 4,
  },
  categoryItem: {
    alignItems: 'center',
    padding: 12,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    minWidth: 80,
  },
  selectedCategoryItem: {
    backgroundColor: '#007AFF',
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
  },
  selectedCategoryName: {
    color: '#fff',
  },
  productsList: {
    flex: 1,
  },
  productsContainer: {
    paddingBottom: 20,
  },
  productItem: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
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
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { productService, categoryService, Product, Category } from '@/services';

export default function TestDataScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsResponse, categoriesResponse] = await Promise.all([
        productService.getFeaturedProducts({ limit: 4 }),
        categoryService.getCategories()
      ]);

      if (productsResponse.data) {
        setProducts(productsResponse.data);
      }
      if (categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Lỗi: {error}</Text>
        <TouchableOpacity style={styles.button} onPress={loadData}>
          <Text style={styles.buttonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧪 Test Data Screen</Text>

      <Text style={styles.sectionTitle}>📦 Sản phẩm ({products.length})</Text>
      {products.map(product => (
        <View key={product._id} style={styles.product}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>{product.price.toLocaleString('vi-VN')}₫</Text>
          <Text style={styles.productDesc}>{product.description.substring(0, 50)}...</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>🏷️ Danh mục ({categories.length})</Text>
      {categories.map(category => (
        <View key={category._id} style={styles.category}>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.categoryDesc}>{category.description}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
        <Text style={styles.buttonText}>🔄 Làm mới dữ liệu</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#007AFF',
  },
  product: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 4,
  },
  productDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  category: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

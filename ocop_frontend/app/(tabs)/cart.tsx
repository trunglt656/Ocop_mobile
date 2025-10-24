import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Product } from '@/constants/products';

// Static imports for images
const productImages = {
  'buoi.jpg': require('@/assets/images/buoi.jpg'),
  'cacao.jpg': require('@/assets/images/cacao.jpg'),
  'dau_phong.jpg': require('@/assets/images/dau_phong.jpg'),
  'keo_sua.jpg': require('@/assets/images/keo_sua.jpg'),
};

interface CartItem extends Product {
  quantity: number;
}

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Bưởi da xanh Đồng Nai',
      price: 45000,
      originalPrice: 55000,
      image: 'buoi.jpg',
      category: 'Trái cây',
      description: 'Bưởi da xanh tươi ngon, được trồng tại các vườn bưởi nổi tiếng của Đồng Nai. Giàu vitamin C, vị ngọt thanh, vỏ mỏng dễ bóc.',
      rating: 4.8,
      reviewCount: 124,
      inStock: true,
      discount: 18,
      unit: 'kg',
      origin: 'Đồng Nai',
      quantity: 2,
    },
  ]);

  const router = useRouter();

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng của bạn đang trống!');
      return;
    }
    router.push('/checkout');
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image source={productImages[item.image as keyof typeof productImages]} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <ThemedText style={styles.itemName} numberOfLines={2}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.itemPrice}>
          {item.price.toLocaleString('vi-VN')}₫ / {item.unit}
        </ThemedText>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}>
            <IconSymbol name="minus" size={16} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText style={styles.quantityText}>{item.quantity}</ThemedText>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}>
            <IconSymbol name="plus" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => updateQuantity(item.id, 0)}>
        <IconSymbol name="trash" size={20} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Giỏ hàng</ThemedText>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="cart" size={64} color="#ccc" />
          <ThemedText style={styles.emptyText}>Giỏ hàng của bạn đang trống</ThemedText>
          <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/')}>
            <ThemedText style={styles.shopButtonText}>Tiếp tục mua sắm</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            style={styles.cartList}
            contentContainerStyle={styles.cartContainer}
          />

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Tổng cộng:</ThemedText>
              <ThemedText style={styles.summaryValue}>
                {getTotalPrice().toLocaleString('vi-VN')}₫
              </ThemedText>
            </View>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <ThemedText style={styles.checkoutButtonText}>Thanh toán</ThemedText>
            </TouchableOpacity>
          </View>
        </>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cartList: {
    flex: 1,
  },
  cartContainer: {
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  summaryContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

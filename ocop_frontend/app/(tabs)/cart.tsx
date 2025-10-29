import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { cartService, Cart, CartItem } from '@/services';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

// Guest view when not logged in
const GuestCart = () => {
  const router = useRouter();
  return (
    <ThemedView style={styles.centerContainer}>
      <IconSymbol name="cart.badge.plus" size={80} color="#ccc" />
      <ThemedText style={styles.guestTitle}>Giỏ hàng của bạn</ThemedText>
      <ThemedText style={styles.guestSubtitle}>Đăng nhập để xem giỏ hàng và thêm sản phẩm.</ThemedText>
      <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
        <ThemedText style={styles.buttonText}>Đăng Nhập Ngay</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const CartScreenContent = () => {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      if (response.data) {
        setCart(response.data);
      }
    } catch (err) {
      setError('Không thể tải giỏ hàng. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchCart();
    }
  }, [isFocused, fetchCart]);

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    try {
      const response = await cartService.updateCartItem(productId, { quantity });
      if (response.data) setCart(response.data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật số lượng.');
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      const response = await cartService.removeFromCart(productId);
      if (response.data) setCart(response.data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xóa sản phẩm.');
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <ThemedText>Đang tải giỏ hàng...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <ThemedView style={styles.centerContainer}>
        <IconSymbol name="cart" size={64} color="#ccc" />
        <ThemedText style={styles.emptyText}>Giỏ hàng của bạn đang trống</ThemedText>
        <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/(tabs)/explore')}>
          <ThemedText style={styles.shopButtonText}>Tiếp tục mua sắm</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.product.images[0]?.url }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <ThemedText style={styles.itemName} numberOfLines={1}>{item.product.name}</ThemedText>
        <ThemedText style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')}₫</ThemedText>
        <View style={styles.quantityContainer}>
          <TouchableOpacity style={styles.quantityButton} onPress={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}>
            <IconSymbol name="minus" size={16} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText style={styles.quantityText}>{item.quantity}</ThemedText>
          <TouchableOpacity style={styles.quantityButton} onPress={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}>
            <IconSymbol name="plus" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveItem(item.product._id)}>
        <IconSymbol name="trash" size={20} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={cart.items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={<ThemedText style={styles.title}>Giỏ hàng của bạn</ThemedText>}
        contentContainerStyle={styles.cartListContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchCart} />}
      />
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <ThemedText style={styles.summaryLabel}>Tổng cộng</ThemedText>
          <ThemedText style={styles.summaryValue}>{cart.finalPrice.toLocaleString('vi-VN')}₫</ThemedText>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={() => router.push('/checkout')}>
          <ThemedText style={styles.checkoutButtonText}>Tiến hành thanh toán</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

export default function CartWrapper() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
        <ThemedView style={styles.centerContainer}>
            <ActivityIndicator size="large" />
        </ThemedView>
    );
  }

  return isAuthenticated ? <CartScreenContent /> : <GuestCart />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  guestTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 16 },
  guestSubtitle: { fontSize: 16, color: 'gray', marginTop: 8, textAlign: 'center', marginBottom: 32 },
  loginButton: { backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 28, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 16, marginBottom: 24 },
  shopButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  shopButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cartListContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  cartItem: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, alignItems: 'center' },
  itemImage: { width: 80, height: 80, borderRadius: 8 },
  itemInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  itemName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  itemPrice: { fontSize: 14, color: '#e63946', marginBottom: 8 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  quantityText: { fontSize: 16, fontWeight: '600', marginHorizontal: 16 },
  removeButton: { padding: 8 },
  summaryContainer: { borderTopWidth: 1, borderTopColor: '#e0e0e0', padding: 16, backgroundColor: '#fff' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  summaryLabel: { fontSize: 18, fontWeight: '600' },
  summaryValue: { fontSize: 20, fontWeight: 'bold', color: '#007AFF' },
  checkoutButton: { backgroundColor: '#007AFF', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  checkoutButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  errorText: { color: 'red' },
});
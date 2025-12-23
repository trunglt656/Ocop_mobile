import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { cartService, Cart, CartItem } from '@/services';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getPrimaryImageUrl } from '@/utils/imageHelper';

// Guest view when not logged in
const GuestCart = () => {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.centerContainer}>
        <IconSymbol name="cart.badge.plus" size={80} color="#ccc" />
        <ThemedText style={styles.guestTitle}>Giỏ hàng của bạn</ThemedText>
        <ThemedText style={styles.guestSubtitle}>Đăng nhập để xem giỏ hàng và thêm sản phẩm.</ThemedText>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
          <ThemedText style={styles.buttonText}>Đăng Nhập Ngay</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedView style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <ThemedText>Đang tải giỏ hàng...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedView style={styles.centerContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedView style={styles.emptyContainer}>
          {/* Empty Cart Icon with Background */}
          <View style={styles.emptyIconContainer}>
            <IconSymbol name="cart" size={80} color="#3B82F6" />
          </View>
          
          {/* Empty State Text */}
          <ThemedText style={styles.emptyTitle}>Giỏ hàng trống</ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Hãy khám phá và thêm sản phẩm OCOP đặc sản vào giỏ hàng của bạn!
          </ThemedText>
          
          {/* Browse Products Button */}
          <TouchableOpacity 
            style={styles.browseButton} 
            onPress={() => router.push('/(tabs)/')}
            activeOpacity={0.8}
          >
            <IconSymbol name="house.fill" size={20} color="#fff" />
            <ThemedText style={styles.browseButtonText}>Khám phá sản phẩm</ThemedText>
          </TouchableOpacity>
          
          {/* Secondary Button */}
          <TouchableOpacity 
            style={styles.exploreButton} 
            onPress={() => router.push('/(tabs)/explore')}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.exploreButtonText}>Xem tin tức OCOP</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const itemTotal = item.price * item.quantity;
    const itemDiscount = item.discount * item.quantity;
    const itemFinal = itemTotal - itemDiscount;
    
    return (
      <View style={styles.cartItem}>
        <Image 
          source={{ uri: getPrimaryImageUrl(item.product.images) }} 
          style={styles.itemImage}
          contentFit="cover"
        />
        <View style={styles.itemInfo}>
          <ThemedText style={styles.itemName} numberOfLines={2}>
            {item.product.name}
          </ThemedText>
          <View style={styles.priceRow}>
            <ThemedText style={styles.itemPrice}>
              {item.price.toLocaleString('vi-VN')}₫
            </ThemedText>
            {item.discount > 0 && (
              <ThemedText style={styles.itemDiscount}>
                -{item.discount.toLocaleString('vi-VN')}₫
              </ThemedText>
            )}
          </View>
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
            >
              <IconSymbol name="minus" size={16} color="#007AFF" />
            </TouchableOpacity>
            <ThemedText style={styles.quantityText}>{item.quantity}</ThemedText>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
            >
              <IconSymbol name="plus" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.itemTotal}>
            Thành tiền: {itemFinal.toLocaleString('vi-VN')}₫
          </ThemedText>
        </View>
        <TouchableOpacity 
          style={styles.removeButton} 
          onPress={() => handleRemoveItem(item.product._id)}
        >
          <IconSymbol name="trash" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
            <ThemedText style={styles.summaryLabel}>Tạm tính</ThemedText>
            <ThemedText style={styles.summaryText}>
              {cart.totalPrice.toLocaleString('vi-VN')}₫
            </ThemedText>
          </View>
          {cart.discountAmount > 0 && (
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Giảm giá</ThemedText>
              <ThemedText style={[styles.summaryText, styles.discountText]}>
                -{cart.discountAmount.toLocaleString('vi-VN')}₫
              </ThemedText>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <ThemedText style={styles.totalLabel}>Tổng cộng</ThemedText>
            <ThemedText style={styles.totalValue}>
              {cart.finalPrice.toLocaleString('vi-VN')}₫
            </ThemedText>
          </View>
        <ThemedText style={styles.noteText}>
          Phí vận chuyển: 30,000₫ • Miễn phí cho đơn từ 500,000₫
        </ThemedText>
        <TouchableOpacity style={styles.checkoutButton} onPress={() => router.push('/checkout')}>
          <ThemedText style={styles.checkoutButtonText}>Tiến hành thanh toán</ThemedText>
        </TouchableOpacity>
      </View>
      </ThemedView>
    </SafeAreaView>
  );
};

export default function CartWrapper() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedView style={styles.centerContainer}>
            <ActivityIndicator size="large" />
        </ThemedView>
      </SafeAreaView>
    );
  }

  return isAuthenticated ? <CartScreenContent /> : <GuestCart />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  browseButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    width: '100%',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  exploreButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
    width: '100%',
    alignItems: 'center',
  },
  exploreButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Guest Cart Styles
  guestTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 16 },
  guestSubtitle: { fontSize: 16, color: 'gray', marginTop: 8, textAlign: 'center', marginBottom: 32 },
  loginButton: { backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  // Cart List Styles
  title: { fontSize: 28, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  cartListContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  cartItem: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 12, 
    marginBottom: 12, 
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: { width: 80, height: 80, borderRadius: 8 },
  itemInfo: { flex: 1, marginLeft: 12, justifyContent: 'flex-start' },
  itemName: { fontSize: 15, fontWeight: '600', marginBottom: 6, lineHeight: 20 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  itemPrice: { fontSize: 15, fontWeight: '600', color: '#e63946' },
  itemDiscount: { fontSize: 13, color: '#22C55E', fontWeight: '500' },
  itemTotal: { fontSize: 14, fontWeight: '700', color: '#007AFF', marginTop: 4 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  quantityButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  quantityText: { fontSize: 16, fontWeight: '600', marginHorizontal: 16 },
  removeButton: { padding: 8 },
  summaryContainer: { borderTopWidth: 1, borderTopColor: '#e0e0e0', padding: 16, backgroundColor: '#fff' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryLabel: { fontSize: 15, color: '#666' },
  summaryText: { fontSize: 15, fontWeight: '500' },
  discountText: { color: '#22C55E' },
  totalRow: { 
    borderTopWidth: 1, 
    borderTopColor: '#e0e0e0', 
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 4
  },
  totalLabel: { fontSize: 18, fontWeight: '700' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#007AFF' },
  noteText: { 
    fontSize: 12, 
    color: '#999', 
    fontStyle: 'italic',
    marginBottom: 12
  },
  summaryValue: { fontSize: 20, fontWeight: 'bold', color: '#007AFF' },
  checkoutButton: { backgroundColor: '#007AFF', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  checkoutButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  errorText: { color: 'red' },
});
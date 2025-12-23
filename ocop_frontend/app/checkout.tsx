import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View, ScrollView, Alert, ActivityIndicator, Modal, FlatList } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { cartService, Cart } from '@/services/cartService';
import { addressService, Address } from '@/services/addressService';
import { orderService } from '@/services/orderService';
import { Colors, Spacing, Sizes } from '@/constants/theme';

const CheckoutScreenContent = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer'>('cod');

  // Check if this is a direct buy (from product detail)
  const isDirectBuy = params.directBuy === 'true';
  const directBuyProduct = isDirectBuy ? {
    productId: params.productId as string,
    name: params.productName as string,
    price: parseFloat(params.productPrice as string),
    image: params.productImage as string,
    quantity: parseInt(params.quantity as string),
  } : null;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Always fetch addresses
      const addressResponse = await addressService.getAddresses();
      
      // Only fetch cart if not direct buy
      if (!isDirectBuy) {
        const cartResponse = await cartService.getCart();
        if (cartResponse.data) setCart(cartResponse.data);
        
        if (!cartResponse.data || cartResponse.data.items.length === 0) {
          Alert.alert('Giỏ hàng trống', 'Bạn sẽ được chuyển về trang chủ.', [{ text: 'OK', onPress: () => router.replace('/(tabs)/') }]);
        }
      }

      if (addressResponse.data) {
        setAddresses(addressResponse.data);
        const defaultAddress = addressResponse.data.find(a => a.isDefault) || addressResponse.data[0];
        setSelectedAddress(defaultAddress || null);
      }

    } catch (err) {
      setError('Không thể tải thông tin thanh toán.');
    } finally {
      setLoading(false);
    }
  }, [router, isDirectBuy]);

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused, fetchData]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Lỗi', 'Vui lòng chọn địa chỉ giao hàng.');
      return;
    }
    setIsPlacingOrder(true);
    try {
      let orderData;
      
      if (isDirectBuy && directBuyProduct) {
        // Direct buy - create order with single product
        orderData = {
          isDirectBuy: true,
          items: [{
            product: directBuyProduct.productId,
            quantity: directBuyProduct.quantity,
            price: directBuyProduct.price,
          }],
          shippingAddress: {
            name: selectedAddress.name,
            phone: selectedAddress.phone,
            address: selectedAddress.address,
            ward: selectedAddress.ward,
            district: selectedAddress.district,
            province: selectedAddress.province,
          },
          paymentMethod: paymentMethod,
          notes: 'Giao hàng cẩn thận',
        };
      } else {
        // Normal checkout from cart
        orderData = {
          shippingAddress: {
            name: selectedAddress.name,
            phone: selectedAddress.phone,
            address: selectedAddress.address,
            ward: selectedAddress.ward,
            district: selectedAddress.district,
            province: selectedAddress.province,
          },
          paymentMethod: paymentMethod,
          notes: 'Giao hàng cẩn thận',
        };
      }
      
      await orderService.createOrder(orderData);
      Alert.alert('Thành công', 'Đơn hàng của bạn đã được đặt thành công!', [
        { text: 'OK', onPress: () => router.replace('/orders') },
      ]);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể đặt hàng. Vui lòng thử lại.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (loading) {
    return <ThemedView style={styles.centerContainer}><ActivityIndicator size="large" /><ThemedText>Đang tải...</ThemedText></ThemedView>;
  }

  if (error) {
    return <ThemedView style={styles.centerContainer}><ThemedText style={styles.errorText}>{error}</ThemedText></ThemedView>;
  }

  // Calculate shipping fee: free if cart total > 500,000đ, otherwise 30,000đ
  const shippingFee = cart && cart.totalPrice > 500000 ? 0 : 30000;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header with Back Button */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Thanh toán</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Address Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Địa chỉ giao hàng</ThemedText>
          <TouchableOpacity style={styles.card} onPress={() => selectedAddress ? setAddressModalVisible(true) : router.push('/addresses')}>
            {selectedAddress ? (
              <View style={styles.addressContent}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.addressName}>{selectedAddress.name} - {selectedAddress.phone}</ThemedText>
                  <ThemedText style={styles.addressText}>{`${selectedAddress.address}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`}</ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={20} color={Colors.light.muted} />
              </View>
            ) : (
              <ThemedText style={styles.addAddressText}>Thêm địa chỉ giao hàng</ThemedText>
            )}
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Tóm tắt đơn hàng</ThemedText>
            <View style={styles.card}>
              {isDirectBuy && directBuyProduct ? (
                // Direct buy - show single product
                <View style={styles.directBuyItem}>
                  <Image source={{ uri: directBuyProduct.image }} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <ThemedText style={styles.orderItemName}>{directBuyProduct.name}</ThemedText>
                    <ThemedText style={styles.productQuantity}>Số lượng: {directBuyProduct.quantity}</ThemedText>
                    <ThemedText style={styles.orderItemTotal}>{(directBuyProduct.price * directBuyProduct.quantity).toLocaleString('vi-VN')}₫</ThemedText>
                  </View>
                </View>
              ) : (
                // Normal cart checkout
                cart?.items.map(item => (
                  <View key={item._id} style={styles.orderItem}>
                      <ThemedText style={styles.orderItemName}>{item.product.name} (x{item.quantity})</ThemedText>
                      <ThemedText style={styles.orderItemTotal}>{(item.price * item.quantity).toLocaleString('vi-VN')}₫</ThemedText>
                  </View>
                ))
              )}
            </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Phương thức thanh toán</ThemedText>
            
            {/* COD Option */}
            <TouchableOpacity 
              style={[styles.paymentCard, paymentMethod === 'cod' && styles.paymentCardSelected]}
              onPress={() => setPaymentMethod('cod')}
            >
              <View style={styles.paymentOption}>
                <IconSymbol name="banknote.fill" size={24} color={paymentMethod === 'cod' ? Colors.light.primary : '#64748B'} />
                <View style={styles.paymentTextContainer}>
                  <ThemedText style={[styles.paymentText, paymentMethod === 'cod' && styles.paymentTextSelected]}>
                    Thanh toán khi nhận hàng
                  </ThemedText>
                  <ThemedText style={styles.paymentSubtext}>Trả tiền mặt khi nhận hàng</ThemedText>
                </View>
                {paymentMethod === 'cod' && (
                  <IconSymbol name="checkmark.circle.fill" size={24} color={Colors.light.primary} />
                )}
              </View>
            </TouchableOpacity>

            {/* Bank Transfer Option */}
            <TouchableOpacity 
              style={[styles.paymentCard, paymentMethod === 'bank_transfer' && styles.paymentCardSelected]}
              onPress={() => setPaymentMethod('bank_transfer')}
            >
              <View style={styles.paymentOption}>
                <IconSymbol name="building.columns.fill" size={24} color={paymentMethod === 'bank_transfer' ? Colors.light.primary : '#64748B'} />
                <View style={styles.paymentTextContainer}>
                  <ThemedText style={[styles.paymentText, paymentMethod === 'bank_transfer' && styles.paymentTextSelected]}>
                    Chuyển khoản ngân hàng
                  </ThemedText>
                  <ThemedText style={styles.paymentSubtext}>Chuyển khoản trước khi giao hàng</ThemedText>
                </View>
                {paymentMethod === 'bank_transfer' && (
                  <IconSymbol name="checkmark.circle.fill" size={24} color={Colors.light.primary} />
                )}
              </View>
            </TouchableOpacity>
        </View>

        {/* Totals */}
        <View style={styles.section}>
          <View style={styles.card}>
            {isDirectBuy && directBuyProduct ? (
              // Direct buy totals
              <>
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>Tạm tính</ThemedText>
                  <ThemedText style={styles.summaryValue}>{(directBuyProduct.price * directBuyProduct.quantity).toLocaleString('vi-VN')}₫</ThemedText>
                </View>
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>Phí vận chuyển</ThemedText>
                  <ThemedText style={styles.summaryValue}>
                    {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}₫`}
                  </ThemedText>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <ThemedText style={styles.totalLabel}>Tổng cộng</ThemedText>
                  <ThemedText style={styles.totalValue}>{(directBuyProduct.price * directBuyProduct.quantity + shippingFee).toLocaleString('vi-VN')}₫</ThemedText>
                </View>
              </>
            ) : (
              // Cart checkout totals
              <>
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>Tạm tính</ThemedText>
                  <ThemedText style={styles.summaryValue}>{(cart?.totalPrice || 0).toLocaleString('vi-VN')}₫</ThemedText>
                </View>
                {cart && cart.discountAmount > 0 && (
                  <View style={styles.summaryRow}>
                    <ThemedText style={styles.summaryLabel}>Giảm giá</ThemedText>
                    <ThemedText style={styles.discountText}>-{cart.discountAmount.toLocaleString('vi-VN')}₫</ThemedText>
                  </View>
                )}
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>Phí vận chuyển</ThemedText>
                  <ThemedText style={[styles.summaryValue, shippingFee === 0 && styles.discountText]}>
                    {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}₫`}
                  </ThemedText>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <ThemedText style={styles.totalLabel}>Tổng cộng</ThemedText>
                  <ThemedText style={styles.totalValue}>{((cart?.finalPrice || 0) + shippingFee).toLocaleString('vi-VN')}₫</ThemedText>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.placeOrderButton, (isPlacingOrder || !selectedAddress) && styles.disabledButton]} onPress={handlePlaceOrder} disabled={isPlacingOrder || !selectedAddress}>
          {isPlacingOrder ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.placeOrderText}>ĐẶT HÀNG</ThemedText>}
        </TouchableOpacity>
      </View>

      {/* Address Selection Modal */}
      <Modal visible={addressModalVisible} transparent={true} animationType="slide" onRequestClose={() => setAddressModalVisible(false)}>
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <ThemedText style={styles.modalTitle}>Chọn địa chỉ</ThemedText>
                <FlatList 
                    data={addresses}
                    keyExtractor={(item) => item._id}
                    renderItem={({item}) => (
                        <TouchableOpacity style={styles.modalAddressItem} onPress={() => { setSelectedAddress(item); setAddressModalVisible(false); }}>
                            <ThemedText style={styles.addressName}>{item.name} - {item.phone}</ThemedText>
                            <ThemedText>{`${item.address}, ${item.ward}, ${item.district}, ${item.province}`}</ThemedText>
                            {item.isDefault && <ThemedText style={styles.defaultBadge}>Mặc định</ThemedText>}
                        </TouchableOpacity>
                    )}
                />
                <TouchableOpacity style={styles.closeModalButton} onPress={() => setAddressModalVisible(false)}><ThemedText style={styles.closeModalText}>Đóng</ThemedText></TouchableOpacity>
            </View>
        </View>
      </Modal>
    </ThemedView>
  );
};

export default function CheckoutWrapper() {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) return <ThemedView style={styles.centerContainer}><ActivityIndicator size="large" /></ThemedView>;
    if (!isAuthenticated) {
        return (
            <ThemedView style={styles.centerContainer}>
                <ThemedText>Vui lòng đăng nhập để thanh toán.</ThemedText>
            </ThemedView>
        );
    }
    return <CheckoutScreenContent />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  scrollContent: { paddingBottom: Spacing.lg },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background },
  errorText: { color: Colors.light.secondary, fontSize: Sizes.body },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: { padding: Spacing.sm },
  headerTitle: { fontSize: Sizes.h3, fontWeight: 'bold', marginLeft: Spacing.md, flex: 1 },
  headerSpacer: { width: 40 },
  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.lg },
  sectionTitle: { fontSize: Sizes.h4, fontWeight: 'bold', marginBottom: Spacing.md },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressContent: { flexDirection: 'row', alignItems: 'center' },
  addressName: { fontSize: Sizes.body, fontWeight: '600', marginBottom: Spacing.xs },
  addressText: { color: Colors.light.muted, fontSize: Sizes.small },
  addAddressText: { color: Colors.light.primary, fontSize: Sizes.body },
  orderItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  orderItemName: { flex: 1, color: Colors.light.text, fontSize: Sizes.body },
  orderItemTotal: { fontWeight: '600', fontSize: Sizes.body },
  directBuyItem: {
    flexDirection: 'row',
    padding: Spacing.sm,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: Spacing.md,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productQuantity: {
    color: Colors.light.muted,
    fontSize: Sizes.small,
    marginVertical: Spacing.xs,
  },
  paymentCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  paymentCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#EEF2FF',
  },
  paymentOption: { flexDirection: 'row', alignItems: 'center' },
  paymentTextContainer: { flex: 1, marginLeft: Spacing.md },
  paymentText: { fontSize: Sizes.body, fontWeight: '600', color: Colors.light.text },
  paymentTextSelected: { color: Colors.light.primary },
  paymentSubtext: { fontSize: Sizes.small, color: Colors.light.muted, marginTop: 4 },
  summaryRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: Spacing.sm 
  },
  summaryLabel: { fontSize: Sizes.body, color: Colors.light.muted },
  summaryValue: { fontSize: Sizes.body, fontWeight: '500' },
  discountText: { fontSize: Sizes.body, fontWeight: '500', color: '#10b981' },
  totalRow: { borderTopWidth: 1, borderColor: Colors.light.border, marginTop: Spacing.sm, paddingTop: Spacing.sm },
  totalLabel: { fontSize: Sizes.h4, fontWeight: 'bold', color: Colors.light.text },
  totalValue: { fontSize: Sizes.h4, fontWeight: 'bold', color: Colors.light.primary },
  footer: { 
    padding: Spacing.md, 
    borderTopWidth: 1, 
    borderColor: Colors.light.border, 
    backgroundColor: Colors.light.card 
  },
  placeOrderButton: { 
    backgroundColor: Colors.light.primary, 
    paddingVertical: Spacing.md,
    borderRadius: 12, 
    alignItems: 'center' 
  },
  placeOrderText: { color: '#fff', fontSize: Sizes.h4, fontWeight: 'bold' },
  disabledButton: { backgroundColor: Colors.light.muted },
  // Modal Styles
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { 
    backgroundColor: Colors.light.card, 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    padding: Spacing.lg, 
    maxHeight: '60%' 
  },
  modalTitle: { fontSize: Sizes.h3, fontWeight: 'bold', marginBottom: Spacing.lg, textAlign: 'center' },
  modalAddressItem: { paddingVertical: Spacing.md, borderBottomWidth: 1, borderColor: Colors.light.border },
  modalPaymentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderColor: Colors.light.border },
  defaultBadge: { color: Colors.light.primary, fontWeight: 'bold', marginTop: Spacing.xs, fontSize: Sizes.caption },
  closeModalButton: { 
    backgroundColor: Colors.light.background, 
    padding: Spacing.md, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: Spacing.lg 
  },
  closeModalText: { fontWeight: 'bold', fontSize: Sizes.body, color: Colors.light.text },
});
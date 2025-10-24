import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

// Static imports for images (reuse from cart)
const productImages = {
  'buoi.jpg': require('@/assets/images/buoi.jpg'),
  'cacao.jpg': require('@/assets/images/cacao.jpg'),
  'dau_phong.jpg': require('@/assets/images/dau_phong.jpg'),
  'keo_sua.jpg': require('@/assets/images/keo_sua.jpg'),
};

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  unit: string;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    note: '',
  });

  // Mock cart items - in a real app, this would come from context or props
  const [cartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Bưởi da xanh Đồng Nai',
      price: 45000,
      image: 'buoi.jpg',
      quantity: 2,
      unit: 'kg',
    },
  ]);

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const deliveryFee = 15000;
  const totalPrice = getTotalPrice() + deliveryFee;

  const handlePlaceOrder = () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin giao hàng!');
      return;
    }

    // Here you would typically send the order to your backend
    Alert.alert(
      'Đặt hàng thành công',
      'Cảm ơn bạn đã đặt hàng! Chúng tôi sẽ liên hệ với bạn sớm nhất.',
      [
        {
          text: 'OK',
          onPress: () => router.push('/'),
        },
      ]
    );
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemImageContainer}>
        <IconSymbol name="photo" size={40} color="#ccc" />
      </View>
      <View style={styles.itemInfo}>
        <ThemedText style={styles.itemName} numberOfLines={2}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.itemPrice}>
          {item.price.toLocaleString('vi-VN')}₫ / {item.unit}
        </ThemedText>
        <ThemedText style={styles.itemQuantity}>
          Số lượng: {item.quantity}
        </ThemedText>
      </View>
      <ThemedText style={styles.itemTotal}>
        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Thanh toán</ThemedText>
        </View>

        {/* Delivery Information */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Thông tin giao hàng</ThemedText>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Họ tên *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Nhập họ tên của bạn"
              value={customerInfo.name}
              onChangeText={(text) => setCustomerInfo({...customerInfo, name: text})}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Số điện thoại *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Nhập số điện thoại"
              value={customerInfo.phone}
              onChangeText={(text) => setCustomerInfo({...customerInfo, phone: text})}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Địa chỉ giao hàng *</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Nhập địa chỉ giao hàng"
              value={customerInfo.address}
              onChangeText={(text) => setCustomerInfo({...customerInfo, address: text})}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Ghi chú</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ghi chú thêm (tùy chọn)"
              value={customerInfo.note}
              onChangeText={(text) => setCustomerInfo({...customerInfo, note: text})}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Đơn hàng</ThemedText>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <ThemedText style={styles.orderItemName} numberOfLines={2}>
                {item.name}
              </ThemedText>
              <ThemedText style={styles.orderItemDetail}>
                {item.quantity} x {item.price.toLocaleString('vi-VN')}₫
              </ThemedText>
              <ThemedText style={styles.orderItemTotal}>
                {(item.price * item.quantity).toLocaleString('vi-VN')}₫
              </ThemedText>
            </View>
          ))}

          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Tạm tính:</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {getTotalPrice().toLocaleString('vi-VN')}₫
            </ThemedText>
          </View>

          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Phí giao hàng:</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {deliveryFee.toLocaleString('vi-VN')}₫
            </ThemedText>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <ThemedText style={[styles.summaryLabel, styles.totalLabel]}>Tổng cộng:</ThemedText>
            <ThemedText style={[styles.summaryValue, styles.totalValue]}>
              {totalPrice.toLocaleString('vi-VN')}₫
            </ThemedText>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Phương thức thanh toán</ThemedText>
          <TouchableOpacity style={styles.paymentOption}>
            <IconSymbol name="creditcard.fill" size={24} color="#007AFF" />
            <ThemedText style={styles.paymentText}>Thanh toán khi nhận hàng</ThemedText>
            <IconSymbol name="checkmark" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Place Order Button */}
        <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
          <ThemedText style={styles.placeOrderText}>Đặt hàng</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  itemImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#999',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderItemName: {
    flex: 2,
    fontSize: 14,
    marginRight: 8,
  },
  orderItemDetail: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  orderItemTotal: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  paymentText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  placeOrderButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

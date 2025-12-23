import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { orderService } from '@/services';

interface OrderItem {
  product: {
    _id: string;
    name: string;
    images: any[];
  };
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    province: string;
    district: string;
    ward: string;
  };
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrder(id);
      setOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'confirmed';
      case 'confirmed': return 'shipping';
      case 'shipping': return 'delivered';
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipping': return 'Đang giao';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'confirmed': return '#3B82F6';
      case 'shipping': return '#8B5CF6';
      case 'delivered': return '#22C55E';
      case 'cancelled': return '#EF4444';
      default: return '#94A3B8';
    }
  };

  const handleUpdateStatus = async () => {
    if (!order) return;

    const nextStatus = getNextStatus(order.orderStatus);
    if (!nextStatus) return;

    Alert.alert(
      'Xác nhận',
      `Cập nhật trạng thái sang "${getStatusText(nextStatus)}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              setUpdating(true);
              await orderService.updateOrderStatus(order._id, nextStatus);
              Alert.alert('Thành công', 'Đã cập nhật trạng thái đơn hàng');
              loadOrder();
            } catch (error: any) {
              console.error('Error updating order:', error);
              Alert.alert('Lỗi', error.message || 'Không thể cập nhật đơn hàng');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    Alert.alert(
      'Xác nhận hủy đơn',
      'Bạn có chắc chắn muốn hủy đơn hàng này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đơn',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              await orderService.updateOrderStatus(order._id, 'cancelled');
              Alert.alert('Đã hủy', 'Đơn hàng đã được hủy');
              loadOrder();
            } catch (error: any) {
              console.error('Error cancelling order:', error);
              Alert.alert('Lỗi', error.message || 'Không thể hủy đơn hàng');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!order) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyContainer}>
          <ThemedText>Không tìm thấy đơn hàng</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const nextStatus = getNextStatus(order.orderStatus);

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Chi tiết đơn hàng</ThemedText>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Order Info */}
        <View style={styles.section}>
          <View style={styles.orderHeader}>
            <View>
              <ThemedText style={styles.orderNumber}>#{order.orderNumber}</ThemedText>
              <ThemedText style={styles.orderDate}>
                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
              </ThemedText>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(order.orderStatus) + '20' }
              ]}
            >
              <ThemedText
                style={[styles.statusText, { color: getStatusColor(order.orderStatus) }]}
              >
                {getStatusText(order.orderStatus)}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Thông tin khách hàng</ThemedText>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <IconSymbol name="person.fill" size={18} color="#64748B" />
              <ThemedText style={styles.infoText}>{order.user.name}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <IconSymbol name="phone.fill" size={18} color="#64748B" />
              <ThemedText style={styles.infoText}>
                {order.user.phone || 'Chưa có'}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <IconSymbol name="envelope.fill" size={18} color="#64748B" />
              <ThemedText style={styles.infoText}>{order.user.email}</ThemedText>
            </View>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Địa chỉ giao hàng</ThemedText>
          <View style={styles.infoCard}>
            <ThemedText style={styles.addressName}>
              {order.shippingAddress.fullName}
            </ThemedText>
            <ThemedText style={styles.addressPhone}>
              {order.shippingAddress.phone}
            </ThemedText>
            <ThemedText style={styles.addressText}>
              {order.shippingAddress.address}, {order.shippingAddress.ward},{' '}
              {order.shippingAddress.district}, {order.shippingAddress.province}
            </ThemedText>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Sản phẩm ({order.items.length})
          </ThemedText>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <ThemedText style={styles.itemName}>{item.product.name}</ThemedText>
                <ThemedText style={styles.itemQuantity}>x{item.quantity}</ThemedText>
              </View>
              <View style={styles.itemPricing}>
                <ThemedText style={styles.itemPrice}>
                  {item.price.toLocaleString('vi-VN')}đ
                </ThemedText>
                <ThemedText style={styles.itemTotal}>
                  {item.total.toLocaleString('vi-VN')}đ
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Info */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Thanh toán</ThemedText>
          <View style={styles.infoCard}>
            <View style={styles.paymentRow}>
              <ThemedText style={styles.paymentLabel}>Phương thức:</ThemedText>
              <ThemedText style={styles.paymentValue}>
                {order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod}
              </ThemedText>
            </View>
            <View style={styles.paymentRow}>
              <ThemedText style={styles.paymentLabel}>Trạng thái:</ThemedText>
              <ThemedText
                style={[
                  styles.paymentValue,
                  { color: order.paymentStatus === 'paid' ? '#22C55E' : '#F59E0B' }
                ]}
              >
                {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </ThemedText>
            </View>
            <View style={[styles.paymentRow, styles.totalRow]}>
              <ThemedText style={styles.totalLabel}>Tổng cộng:</ThemedText>
              <ThemedText style={styles.totalValue}>
                {order.totalAmount.toLocaleString('vi-VN')}đ
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Notes */}
        {order.notes && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Ghi chú</ThemedText>
            <View style={styles.infoCard}>
              <ThemedText style={styles.notesText}>{order.notes}</ThemedText>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
          <View style={styles.actionButtons}>
            {nextStatus && (
              <TouchableOpacity
                style={[styles.actionButton, styles.updateButton]}
                onPress={handleUpdateStatus}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <IconSymbol name="arrow.right.circle.fill" size={20} color="#FFFFFF" />
                    <ThemedText style={styles.actionButtonText}>
                      Cập nhật: {getStatusText(nextStatus)}
                    </ThemedText>
                  </>
                )}
              </TouchableOpacity>
            )}
            
            {order.orderStatus === 'pending' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancelOrder}
                disabled={updating}
              >
                <IconSymbol name="xmark.circle.fill" size={20} color="#FFFFFF" />
                <ThemedText style={styles.actionButtonText}>Hủy đơn</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  orderNumber: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
  },
  orderDate: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#0F172A',
    flex: 1,
  },
  addressName: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  addressPhone: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#0F172A',
    lineHeight: 20,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  itemPricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  itemTotal: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#2563EB',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  paymentValue: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  totalRow: {
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#2563EB',
  },
  notesText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#0F172A',
    lineHeight: 20,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  updateButton: {
    backgroundColor: '#2563EB',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
});

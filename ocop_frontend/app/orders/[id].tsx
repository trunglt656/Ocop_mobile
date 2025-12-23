import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { orderService, Order } from '@/services/orderService';
import { getImageUrl } from '@/utils/imageHelper';
import {
  FALLBACK_PRODUCT,
  formatCurrency,
  formatOrderDate,
  getOrderErrorMessage,
  getOrderStatusMeta,
} from '@/constants/orders';

const PAYMENT_STATUS_LABELS: Record<Order['paymentStatus'], string> = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thanh toán thất bại',
};

const PAYMENT_METHOD_LABELS: Record<Order['paymentMethod'], string> = {
  cod: 'Thanh toán khi nhận hàng',
  bank_transfer: 'Chuyển khoản ngân hàng',
  e_wallet: 'Ví điện tử',
  credit_card: 'Thẻ tín dụng/ghi nợ',
};

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderIdParam = params.id;
  const orderId = Array.isArray(orderIdParam) ? orderIdParam[0] : orderIdParam;

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Không tìm thấy mã đơn hàng hợp lệ.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const order = await orderService.getOrder(orderId);
        setOrder(order);
        setError(null);
      } catch (err) {
        setError(getOrderErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const statusMeta = useMemo(() => {
    if (!order) {
      return getOrderStatusMeta('pending');
    }
    return getOrderStatusMeta(order.orderStatus);
  }, [order]);

  return (
    <>
      <Stack.Screen
        options={{
          title: order ? `Đơn hàng #${order._id.slice(-6).toUpperCase()}` : 'Chi tiết đơn hàng',
        }}
      />
      <ThemedView style={styles.container}>
        {isLoading ? (
          <View style={styles.loaderWrapper}>
            <ActivityIndicator size="large" color="#2563EB" />
            <ThemedText style={styles.loaderText}>Đang lấy thông tin đơn hàng...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.errorState}>
            <IconSymbol name="exclamationmark.triangle.fill" size={42} color="#FB923C" />
            <ThemedText style={styles.errorTitle}>Có lỗi xảy ra</ThemedText>
            <ThemedText style={styles.errorSubtitle}>{error}</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
              <ThemedText style={styles.retryButtonText}>Quay lại</ThemedText>
            </TouchableOpacity>
          </View>
        ) : order ? (
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <View style={styles.headerCard}>
              <View style={styles.headerRow}>
                <View>
                  <ThemedText style={styles.orderCode}>
                    Mã đơn: #{order._id.slice(-6).toUpperCase()}
                  </ThemedText>
                  <ThemedText style={styles.orderDate}>
                    Tạo ngày {formatOrderDate(order.createdAt)}
                  </ThemedText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusMeta.background }]}>
                  <ThemedText style={[styles.statusText, { color: statusMeta.color }]}>
                    {statusMeta.label}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.statusRow}>
                <IconSymbol name="creditcard.fill" size={20} color="#2563EB" />
                <View style={styles.statusInfo}>
                  <ThemedText style={styles.statusLabel}>Thanh toán</ThemedText>
                  <ThemedText style={styles.statusValue}>
                    {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                  </ThemedText>
                </View>
                <IconSymbol name="shippingbox.fill" size={20} color="#0EA5E9" />
                <View style={styles.statusInfo}>
                  <ThemedText style={styles.statusLabel}>Phương thức</ThemedText>
                  <ThemedText style={styles.statusValue}>
                    {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Sản phẩm</ThemedText>
              <View style={styles.sectionDivider} />
              {order.items.map(item => (
                <View key={item._id} style={styles.productRow}>
                  <Image
                    source={{ uri: getImageUrl(item.image) || FALLBACK_PRODUCT }}
                    style={styles.productImage}
                    contentFit="cover"
                  />
                  <View style={styles.productInfo}>
                    <ThemedText style={styles.productName} numberOfLines={2}>
                      {item.name}
                    </ThemedText>
                    <ThemedText style={styles.productMeta}>
                      {formatCurrency(item.price)} • Số lượng: {item.quantity}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.productTotal}>
                    {formatCurrency(item.total || item.price * item.quantity)}
                  </ThemedText>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Địa chỉ giao hàng</ThemedText>
              <View style={styles.sectionDivider} />
              <View style={styles.infoRow}>
                <IconSymbol name="person.fill" size={18} color="#2563EB" />
                <ThemedText style={styles.infoValue}>{order.shippingAddress?.name}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <IconSymbol name="phone.fill" size={18} color="#2563EB" />
                <ThemedText style={styles.infoValue}>{order.shippingAddress?.phone}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <IconSymbol name="mappin.circle.fill" size={18} color="#2563EB" />
                <ThemedText style={styles.infoValue} numberOfLines={3}>
                  {order.shippingAddress?.fullAddress}
                </ThemedText>
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Tóm tắt thanh toán</ThemedText>
              <View style={styles.sectionDivider} />
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Tạm tính</ThemedText>
                <ThemedText style={styles.summaryValue}>{formatCurrency(order.subtotal)}</ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Phí vận chuyển</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  {order.shippingFee ? formatCurrency(order.shippingFee) : 'Miễn phí'}
                </ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Giảm giá</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  {order.discount ? `- ${formatCurrency(order.discount)}` : '0 ₫'}
                </ThemedText>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryTotalLabel}>Tổng cộng</ThemedText>
                <ThemedText style={styles.summaryTotalValue}>{formatCurrency(order.total)}</ThemedText>
              </View>
            </View>

            {order.notes ? (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Ghi chú</ThemedText>
                <View style={styles.sectionDivider} />
                <ThemedText style={styles.noteText}>{order.notes}</ThemedText>
              </View>
            ) : null}

            <TouchableOpacity style={styles.supportCard} onPress={() => router.push('/help')}>
              <View style={styles.supportIconWrapper}>
                <IconSymbol name="questionmark.circle.fill" size={20} color="#2563EB" />
              </View>
              <View style={styles.supportInfo}>
                <ThemedText style={styles.supportTitle}>Bạn cần hỗ trợ?</ThemedText>
                <ThemedText style={styles.supportSubtitle}>
                  Liên hệ đội ngũ CSKH để được trợ giúp nhanh chóng.
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={16} color="#2563EB" />
            </TouchableOpacity>
          </ScrollView>
        ) : null}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#475569',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  errorTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#1F2937',
  },
  errorSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#fff',
  },
  headerCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    gap: 18,
    shadowColor: '#0F172A',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderCode: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#fff',
  },
  orderDate: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#CBD5F5',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusInfo: {
    flex: 1,
    gap: 2,
  },
  statusLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#94A3B8',
  },
  statusValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#E2E8F0',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#0F172A',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  productInfo: {
    flex: 1,
    gap: 6,
  },
  productName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#0F172A',
  },
  productMeta: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#64748B',
  },
  productTotal: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#0F172A',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoValue: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#0F172A',
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  summaryLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#475569',
  },
  summaryValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#0F172A',
  },
  summaryTotalLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#0F172A',
  },
  summaryTotalValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#2563EB',
  },
  noteText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  supportIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportInfo: {
    flex: 1,
    gap: 4,
  },
  supportTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#0F172A',
  },
  supportSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#64748B',
  },
});

import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Stack, useFocusEffect, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { orderService, Order } from '@/services/orderService';
import { getImageUrl } from '@/utils/imageHelper';
import {
  formatCurrency,
  formatOrderDate,
  getOrderErrorMessage,
  getOrderStatusMeta,
  getFullAddress,
  ORDER_FILTERS,
  OrderFilterKey,
} from '@/constants/orders';

const METRIC_ORDER_KEYS: Order['orderStatus'][] = ['pending', 'confirmed', 'processing', 'shipped'];

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<OrderFilterKey>('all');

  const fetchOrders = useCallback(async () => {
    const orders = await orderService.getOrders({ limit: 100 });
    return orders ?? [];
  }, []);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(getOrderErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [fetchOrders]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(getOrderErrorMessage(err));
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (selectedFilter === 'all') {
      return orders;
    }
    return orders.filter(order => order.orderStatus === selectedFilter);
  }, [orders, selectedFilter]);

  const orderMetrics = useMemo(() => {
    if (!orders.length) {
      return [
        { id: 'total', label: 'Tổng đơn', value: '0', icon: 'bag.badge.plus', color: '#4C6FFF' },
        { id: 'active', label: 'Đang xử lý', value: '0', icon: 'arrow.triangle.2.circlepath', color: '#F59E0B' },
        { id: 'delivered', label: 'Đã giao', value: '0', icon: 'checkmark.circle.fill', color: '#10B981' },
        { id: 'spent', label: 'Đã chi', value: '0 ₫', icon: 'dollarsign.circle.fill', color: '#EC4899' },
      ];
    }

    const totalOrders = orders.length;
    const activeOrders = orders.filter(order => METRIC_ORDER_KEYS.includes(order.orderStatus)).length;
    const deliveredOrders = orders.filter(order => order.orderStatus === 'delivered').length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);

    return [
      { id: 'total', label: 'Tổng đơn', value: String(totalOrders), icon: 'bag.badge.plus', color: '#4C6FFF' },
      { id: 'active', label: 'Đang xử lý', value: String(activeOrders), icon: 'arrow.triangle.2.circlepath', color: '#F59E0B' },
      { id: 'delivered', label: 'Đã giao', value: String(deliveredOrders), icon: 'checkmark.circle.fill', color: '#10B981' },
      { id: 'spent', label: 'Đã chi', value: formatCurrency(totalSpent), icon: 'dollarsign.circle.fill', color: '#EC4899' },
    ];
  }, [orders]);

  const renderOrder = useCallback(
    ({ item }: { item: Order }) => {
      const statusMeta = getOrderStatusMeta(item.orderStatus);
      const firstItem = item.items?.[0];

      return (
        <TouchableOpacity
          style={styles.orderCard}
          onPress={() =>
            router.push({
              pathname: '/orders/[id]',
              params: { id: item._id },
            })
          }
          activeOpacity={0.9}
        >
          <View style={styles.orderCardHeader}>
            <ThemedText style={styles.orderId}>DH#{item._id.slice(-6).toUpperCase()}</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: statusMeta.background }]}>
              <ThemedText style={[styles.statusText, { color: statusMeta.color }]}>
                {statusMeta.label}
              </ThemedText>
            </View>
          </View>

          <View style={styles.orderBody}>
            <IconSymbol name="calendar.badge.clock" size={18} color="#64748B" />
            <ThemedText style={styles.orderMetaText}>{formatOrderDate(item.createdAt)}</ThemedText>
          </View>

          <View style={styles.orderSummary}>
            <View style={styles.orderProducts}>
              <Image
                source={{ uri: getImageUrl(firstItem?.image) }}
                style={styles.orderProductImage}
                contentFit="cover"
              />
              <View style={styles.orderProductInfo}>
                <ThemedText style={styles.orderTitle} numberOfLines={1}>
                  {firstItem?.name || 'Đơn hàng OCOP'}
                </ThemedText>
                <ThemedText style={styles.orderMeta}>
                  {item.items.length} sản phẩm • {formatCurrency(item.subtotal)}
                </ThemedText>
              </View>
            </View>
            <View style={styles.orderTotalBlock}>
              <ThemedText style={styles.orderTotalLabel}>Thành tiền</ThemedText>
              <ThemedText style={styles.orderTotal}>{formatCurrency(item.total)}</ThemedText>
            </View>
          </View>

          <View style={styles.orderFooter}>
            <View style={styles.orderFooterLeft}>
              <IconSymbol name="location.fill" size={16} color="#2563EB" />
              <ThemedText style={styles.orderFooterText} numberOfLines={1}>
                {getFullAddress(item.shippingAddress)}
              </ThemedText>
            </View>
            <View style={styles.orderFooterRight}>
              <ThemedText style={styles.viewDetailText}>Xem chi tiết</ThemedText>
              <IconSymbol name="arrow.right.circle.fill" size={16} color="#2563EB" />
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [router]
  );

  const renderHeader = useCallback(() => {
    if (!orders.length && !isLoading && !error) {
      return null;
    }

    return (
      <View>
        <View style={styles.metricRow}>
          {orderMetrics.map(metric => (
            <View key={metric.id} style={styles.metricCard}>
              <View style={[styles.metricIconWrapper, { backgroundColor: `${metric.color}1A` }]}>
                <IconSymbol name={metric.icon as any} size={18} color={metric.color} />
              </View>
              <ThemedText style={styles.metricValue}>{metric.value}</ThemedText>
              <ThemedText style={styles.metricLabel}>{metric.label}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.filterRow}>
          {ORDER_FILTERS.map(({ key, label, icon }) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.filterChip,
                selectedFilter === key && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(key)}
            >
              <IconSymbol
                name={icon}
                size={14}
                color={selectedFilter === key ? '#fff' : '#475569'}
              />
              <ThemedText
                style={[
                  styles.filterChipText,
                  selectedFilter === key && styles.filterChipTextActive,
                ]}
              >
                {label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }, [error, isLoading, orderMetrics, orders.length, selectedFilter]);

  return (
    <>
      <Stack.Screen options={{ title: 'Đơn hàng của tôi' }} />
      <ThemedView style={styles.container}>
        {isLoading ? (
          <View style={styles.loaderWrapper}>
            <ActivityIndicator size="large" color="#2563EB" />
            <ThemedText style={styles.loaderText}>Đang tải đơn hàng...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.errorState}>
            <IconSymbol name="exclamationmark.triangle.fill" size={40} color="#FB923C" />
            <ThemedText style={styles.errorTitle}>Không thể tải dữ liệu</ThemedText>
            <ThemedText style={styles.errorSubtitle}>{error}</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={loadOrders}>
              <ThemedText style={styles.retryButtonText}>Thử lại</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={item => item._id}
            renderItem={renderOrder}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor="#2563EB"
                colors={['#2563EB']}
              />
            }
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <IconSymbol name="shippingbox" size={48} color="#94A3B8" />
                <ThemedText style={styles.emptyTitle}>Chưa có đơn hàng</ThemedText>
                <ThemedText style={styles.emptySubtitle}>
                  Đặt sản phẩm đầu tiên để xem lịch sử mua hàng tại đây.
                </ThemedText>
              </View>
            }
          />
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginTop: 8,
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#fff',
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    width: '47%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
  },
  metricIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    marginTop: 12,
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#0F172A',
  },
  metricLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
  },
  filterChipText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  orderBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderMetaText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#64748B',
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  orderProducts: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  orderProductImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  orderProductInfo: {
    flex: 1,
    gap: 4,
  },
  orderTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#0F172A',
  },
  orderMeta: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#64748B',
  },
  orderTotalBlock: {
    alignItems: 'flex-end',
    gap: 4,
  },
  orderTotalLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#94A3B8',
  },
  orderTotal: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#0F172A',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  orderFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  orderFooterText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#475569',
    flex: 1,
  },
  orderFooterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    color: '#2563EB',
  },
  emptyState: {
    paddingVertical: 120,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#1F2937',
  },
  emptySubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#6B7280',
    maxWidth: 260,
    textAlign: 'center',
  },
});

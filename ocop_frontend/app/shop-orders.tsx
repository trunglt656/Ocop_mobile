import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { orderService } from '@/services';
import type { Order } from '@/services/orderService';
import { getImageUrl } from '@/utils/imageHelper';

export default function ShopOrdersScreen() {
  const router = useRouter();
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const insets = useSafeAreaInsets();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered'>('all');

  useEffect(() => {
    if (shopId) {
      loadOrders();
    }
  }, [shopId, filter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params: any = { shop: shopId };
      if (filter !== 'all') {
        params.status = filter;
      }
      const orders = await orderService.getOrders(params);
      setOrders(orders);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.orderStatus === 'pending').length;
    const confirmed = orders.filter(o => o.orderStatus === 'confirmed').length;
    const processing = orders.filter(o => o.orderStatus === 'processing').length;
    const shipped = orders.filter(o => o.orderStatus === 'shipped').length;
    const delivered = orders.filter(o => o.orderStatus === 'delivered').length;
    const revenue = orders
      .filter(o => o.orderStatus === 'delivered')
      .reduce((sum, o) => sum + o.total, 0);
    
    return { total, pending, confirmed, processing, shipped, delivered, revenue };
  }, [orders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    const statusText = getStatusText(newStatus);
    Alert.alert(
      'Cập nhật trạng thái',
      `Chuyển đơn hàng sang trạng thái "${statusText}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              await orderService.updateOrderStatus(orderId, newStatus);
              Alert.alert('Thành công', 'Đã cập nhật trạng thái đơn hàng');
              loadOrders();
            } catch (error: any) {
              Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
            }
          },
        },
      ]
    );
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

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'confirmed';
      case 'confirmed': return 'processing';
      case 'processing': return 'shipped';
      case 'shipped': return 'delivered';
      default: return null;
    }
  };

  const filters = [
    { key: 'all', label: 'Tất cả', count: stats.total, icon: 'tray.fill' },
    { key: 'pending', label: 'Chờ xác nhận', count: stats.pending, icon: 'clock.fill' },
    { key: 'confirmed', label: 'Đã xác nhận', count: stats.confirmed, icon: 'checkmark.circle.fill' },
    { key: 'processing', label: 'Đang xử lý', count: stats.processing, icon: 'gearshape.fill' },
    { key: 'shipped', label: 'Đang giao', count: stats.shipped, icon: 'shippingbox.fill' },
    { key: 'delivered', label: 'Đã giao', count: stats.delivered, icon: 'checkmark.seal.fill' },
  ];

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Quản lý đơn hàng</ThemedText>
        <View style={{ width: 44 }} />
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#EFF6FF' }]}>
            <IconSymbol name="bag.fill" size={20} color="#2563EB" />
          </View>
          <ThemedText style={styles.statValue}>{stats.total}</ThemedText>
          <ThemedText style={styles.statLabel}>Tổng đơn</ThemedText>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <IconSymbol name="clock.fill" size={20} color="#F59E0B" />
          </View>
          <ThemedText style={styles.statValue}>{stats.pending}</ThemedText>
          <ThemedText style={styles.statLabel}>Chờ xử lý</ThemedText>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
            <IconSymbol name="checkmark.seal.fill" size={20} color="#10B981" />
          </View>
          <ThemedText style={styles.statValue}>{stats.delivered}</ThemedText>
          <ThemedText style={styles.statLabel}>Đã giao</ThemedText>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FCE7F3' }]}>
            <IconSymbol name="dollarsign.circle.fill" size={20} color="#EC4899" />
          </View>
          <ThemedText style={styles.statValue}>{(stats.revenue / 1000000).toFixed(1)}M</ThemedText>
          <ThemedText style={styles.statLabel}>Doanh thu</ThemedText>
        </View>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
      >
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <IconSymbol name="tray" size={48} color="#CBD5E1" />
            </View>
            <ThemedText style={styles.emptyTitle}>Chưa có đơn hàng nào</ThemedText>
            <ThemedText style={styles.emptyText}>
              Đơn hàng mới sẽ xuất hiện ở đây
            </ThemedText>
          </View>
        ) : (
          orders.map((order) => (
            <TouchableOpacity
              key={order._id}
              style={styles.orderCard}
              onPress={() => router.push(`/orders/${order._id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.orderHeader}>
                <View style={styles.orderHeaderLeft}>
                  <ThemedText style={styles.orderId}>
                    #{order._id.slice(-8).toUpperCase()}
                  </ThemedText>
                  <ThemedText style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </ThemedText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.orderStatus) + '20' }]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(order.orderStatus) }]} />
                  <ThemedText style={[styles.statusText, { color: getStatusColor(order.orderStatus) }]}>
                    {getStatusText(order.orderStatus)}
                  </ThemedText>
                </View>
              </View>

              {/* Customer Info */}
              <View style={styles.customerSection}>
                <View style={styles.infoRow}>
                  <IconSymbol name="person.fill" size={14} color="#64748B" />
                  <ThemedText style={styles.infoText} numberOfLines={1}>
                    {order.shippingAddress?.name || 'N/A'}
                  </ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <IconSymbol name="phone.fill" size={14} color="#64748B" />
                  <ThemedText style={styles.infoText}>
                    {order.shippingAddress?.phone || 'N/A'}
                  </ThemedText>
                </View>
              </View>

              {/* Products */}
              <View style={styles.productsSection}>
                {order.items.slice(0, 2).map((item, index) => (
                  <View key={index} style={styles.productItem}>
                    <Image
                      source={{ uri: getImageUrl(item.image) || 'https://via.placeholder.com/50' }}
                      style={styles.productImage}
                      contentFit="cover"
                    />
                    <View style={styles.productInfo}>
                      <ThemedText style={styles.productName} numberOfLines={1}>
                        {item.name}
                      </ThemedText>
                      <ThemedText style={styles.productMeta}>
                        {item.quantity} x {item.price.toLocaleString('vi-VN')}₫
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.productTotal}>
                      {(item.quantity * item.price).toLocaleString('vi-VN')}₫
                    </ThemedText>
                  </View>
                ))}
                {order.items.length > 2 && (
                  <ThemedText style={styles.moreProducts}>
                    +{order.items.length - 2} sản phẩm khác
                  </ThemedText>
                )}
              </View>

              {/* Total */}
              <View style={styles.orderFooter}>
                <View style={styles.totalSection}>
                  <ThemedText style={styles.totalLabel}>Tổng tiền</ThemedText>
                  <ThemedText style={styles.totalValue}>
                    {order.total.toLocaleString('vi-VN')}₫
                  </ThemedText>
                </View>
                <View style={styles.actionsSection}>
                  {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && getNextStatus(order.orderStatus) && (
                    <TouchableOpacity
                      style={styles.quickActionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(order._id, getNextStatus(order.orderStatus)!);
                      }}
                    >
                      <IconSymbol name="arrow.right.circle.fill" size={16} color="#2563EB" />
                      <ThemedText style={styles.quickActionText}>
                        {getStatusText(getNextStatus(order.orderStatus)!)}
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                  <View style={styles.detailLink}>
                    <ThemedText style={styles.detailText}>Xem chi tiết</ThemedText>
                    <IconSymbol name="chevron.right" size={14} color="#94A3B8" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    marginTop: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  orderId: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
  },
  orderDate: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
  },
  orderContent: {
    marginBottom: 12,
  },
  orderInfo: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  totalLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
  totalValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#2563EB',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  detailButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  detailButtonText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#64748B',
  },
  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
  // Empty state
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
    marginBottom: 8,
  },
  // Order details
  orderHeaderLeft: {
    flex: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  customerSection: {
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  productsSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  productInfo: {
    flex: 1,
    gap: 2,
  },
  productName: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  productMeta: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  productTotal: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
  },
  moreProducts: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#2563EB',
    textAlign: 'center',
    marginTop: 8,
  },
  orderFooter: {
    gap: 12,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#2563EB',
  },
  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#94A3B8',
  },
});

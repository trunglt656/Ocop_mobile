import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { useAuth } from '@/contexts/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { orderService, Order } from '@/services/orderService';
import {
  FALLBACK_AVATAR,
  FALLBACK_PRODUCT,
  formatCurrency,
  formatOrderDate,
  getOrderErrorMessage,
  getOrderStatusMeta,
  ORDER_FILTERS,
  OrderFilterKey,
} from '@/constants/orders';

// Guest view when not logged in
const GuestProfile = () => {
  const router = useRouter();
  return (
    <ThemedView style={styles.centerContainer}>
      <IconSymbol name="person.circle" size={80} color="#ccc" />
      <ThemedText style={styles.guestTitle}>Chào mừng bạn!</ThemedText>
      <ThemedText style={styles.guestSubtitle}>Đăng nhập để khám phá đầy đủ tính năng.</ThemedText>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
          <IconSymbol name="lock.fill" size={18} color="#fff" />
          <ThemedText style={styles.buttonText}>Đăng Nhập</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/register')}>
          <IconSymbol name="person.badge.plus.fill" size={18} color="#fff" />
          <ThemedText style={styles.buttonText}>Đăng Ký</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

// Main profile screen for logged-in users
const UserProfile = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [isFetchingOrders, setIsFetchingOrders] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<OrderFilterKey>('all');

  const fetchOrders = useCallback(async () => {
    const response = await orderService.getOrders({ limit: 50 });
    return response.data ?? [];
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadOrders = async () => {
      setIsFetchingOrders(true);
      try {
        const data = await fetchOrders();
        if (!isActive) return;
        setOrders(data);
        setOrdersError(null);
      } catch (error) {
        if (!isActive) return;
        setOrdersError(getOrderErrorMessage(error));
      } finally {
        if (isActive) {
          setIsFetchingOrders(false);
        }
      }
    };

    loadOrders();

    return () => {
      isActive = false;
    };
  }, [fetchOrders]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
      setOrdersError(null);
    } catch (error) {
      setOrdersError(getOrderErrorMessage(error));
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

  const orderSummary = useMemo(() => {
    const zeroCurrency = formatCurrency(0);
    const baseMetrics = [
      { id: 'total', label: 'Tổng đơn', value: '0', icon: 'bag.fill', color: '#4C6FFF' },
      { id: 'active', label: 'Đang xử lý', value: '0', icon: 'clock.fill', color: '#F59E0B' },
      { id: 'delivered', label: 'Đã giao', value: '0', icon: 'checkmark.seal.fill', color: '#10B981' },
      { id: 'spent', label: 'Đã chi', value: zeroCurrency, icon: 'creditcard.fill', color: '#EC4899' },
    ];

    if (!orders.length) {
      return {
        metrics: baseMetrics,
        totalSpent: 0,
        activeOrders: [] as Order[],
      };
    }

    const activeStatuses: Order['orderStatus'][] = ['pending', 'confirmed', 'processing', 'shipped'];
    const totalOrders = orders.length;
    const activeOrdersList = orders
      .filter(order => activeStatuses.includes(order.orderStatus))
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
      );
    const deliveredOrders = orders.filter(order => order.orderStatus === 'delivered').length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);

    const metrics = [
      { id: 'total', label: 'Tổng đơn', value: String(totalOrders), icon: 'bag.fill', color: '#4C6FFF' },
      {
        id: 'active',
        label: 'Đang xử lý',
        value: String(activeOrdersList.length),
        icon: 'clock.fill',
        color: '#F59E0B',
      },
      {
        id: 'delivered',
        label: 'Đã giao',
        value: String(deliveredOrders),
        icon: 'checkmark.seal.fill',
        color: '#10B981',
      },
      {
        id: 'spent',
        label: 'Đã chi',
        value: formatCurrency(totalSpent),
        icon: 'creditcard.fill',
        color: '#EC4899',
      },
    ];

    return {
      metrics,
      totalSpent,
      activeOrders: activeOrdersList,
    };
  }, [orders]);

  const orderMetrics = orderSummary.metrics;
  const totalSpent = orderSummary.totalSpent;
  const activeOrders = orderSummary.activeOrders;

  const loyaltyInfo = useMemo(() => {
    const levels = [
      {
        id: 'bronze',
        name: 'Hạng Đồng',
        min: 0,
        next: 2_000_000,
        color: '#F97316',
        background: 'rgba(249, 115, 22, 0.15)',
        icon: 'medal.fill',
      },
      {
        id: 'silver',
        name: 'Hạng Bạc',
        min: 2_000_000,
        next: 5_000_000,
        color: '#94A3B8',
        background: 'rgba(148, 163, 184, 0.16)',
        icon: 'seal.fill',
      },
      {
        id: 'gold',
        name: 'Hạng Vàng',
        min: 5_000_000,
        next: 15_000_000,
        color: '#FACC15',
        background: 'rgba(250, 204, 21, 0.18)',
        icon: 'trophy.fill',
      },
      {
        id: 'platinum',
        name: 'Hạng Bạch kim',
        min: 15_000_000,
        next: Number.POSITIVE_INFINITY,
        color: '#38BDF8',
        background: 'rgba(56, 189, 248, 0.18)',
        icon: 'diamond.fill',
      },
    ];

    let currentLevel = levels[0];
    for (const level of levels) {
      if (totalSpent >= level.min) {
        currentLevel = level;
      } else {
        break;
      }
    }

    const currentIndex = levels.findIndex(level => level.id === currentLevel.id);
    const nextLevel = levels[Math.min(currentIndex + 1, levels.length - 1)];
    const isMaxLevel = currentLevel.next === Number.POSITIVE_INFINITY;
    const progress = isMaxLevel
      ? 100
      : Math.min(
          100,
          ((totalSpent - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
        );
    const remaining = isMaxLevel ? 0 : Math.max(0, nextLevel.min - totalSpent);

    return {
      currentLevel,
      nextLevel,
      isMaxLevel,
      progress: Number.isFinite(progress) ? progress : 0,
      remaining,
    };
  }, [totalSpent]);

  const activeOrderTimeline = useMemo(() => activeOrders.slice(0, 3), [activeOrders]);

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn chắc chắn muốn đăng xuất không?',
      [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  const quickActions = [
    { id: 'orders', label: 'Đơn hàng', icon: 'bag.fill', color: '#4C6FFF', onPress: () => router.push('/orders') },
    { id: 'favorites', label: 'Yêu thích', icon: 'heart.fill', color: '#F472B6', onPress: () => router.push('/favorites') },
    { id: 'addresses', label: 'Địa chỉ', icon: 'mappin.and.ellipse', color: '#2563EB', onPress: () => router.push('/addresses') },
    { id: 'settings', label: 'Cài đặt', icon: 'gearshape.fill', color: '#22C55E', onPress: () => router.push('/settings') },
    { id: 'help', label: 'Hỗ trợ', icon: 'questionmark.circle.fill', color: '#F97316', onPress: () => router.push('/help') },
    { id: 'test', label: 'Thử nghiệm', icon: 'sparkles', color: '#8B5CF6', onPress: () => router.push('/modal') },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor="#007AFF"
          colors={['#007AFF']}
        />
      }
    >
      <View style={styles.profileHeader}>
        <View style={styles.profileTop}>
          <Image
            source={{ uri: user?.avatar || FALLBACK_AVATAR }}
            style={styles.avatar}
            contentFit="cover"
          />
          <View style={styles.profileInfo}>
            <ThemedText style={styles.welcomeText}>Xin chào</ThemedText>
            <ThemedText style={styles.userName}>{user?.name || 'Người dùng OCOP'}</ThemedText>
            <View style={styles.userMetaRow}>
              <IconSymbol name="envelope.fill" size={14} color="#CBD5F5" />
              <ThemedText style={styles.userMetaText}>
                {user?.email || 'Chưa cập nhật email'}
              </ThemedText>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push('/settings')}
        >
          <IconSymbol name="pencil.circle.fill" size={20} color="#fff" />
          <ThemedText style={styles.editButtonText}>Chỉnh sửa hồ sơ</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <View style={[styles.sectionIconWrapper, { backgroundColor: '#E0E7FF' }]}>
              <IconSymbol name="chart.bar.fill" size={18} color="#4C6FFF" />
            </View>
            <ThemedText style={styles.sectionTitle}>Tổng quan đơn hàng</ThemedText>
          </View>
        </View>
        <View style={styles.metricsWrapper}>
          {orderMetrics.map(metric => (
            <View key={metric.id} style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View style={[styles.metricIconWrapper, { backgroundColor: `${metric.color}1A` }]}>
                  <IconSymbol name={metric.icon} size={18} color={metric.color} />
                </View>
                <ThemedText style={styles.metricLabel}>{metric.label}</ThemedText>
              </View>
              <ThemedText style={styles.metricValue}>{metric.value}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <View
              style={[
                styles.sectionIconWrapper,
                { backgroundColor: loyaltyInfo.currentLevel.background },
              ]}
            >
              <IconSymbol
                name={loyaltyInfo.currentLevel.icon}
                size={18}
                color={loyaltyInfo.currentLevel.color}
              />
            </View>
            <View>
              <ThemedText style={styles.sectionTitle}>Hạng thành viên</ThemedText>
              <ThemedText style={styles.sectionSubtitle}>{loyaltyInfo.currentLevel.name}</ThemedText>
            </View>
          </View>
          <View style={styles.membershipBadge}>
            <IconSymbol name="star.fill" size={14} color="#FACC15" />
            <ThemedText style={styles.membershipBadgeText}>OCOP+</ThemedText>
          </View>
        </View>

        <ThemedText style={styles.membershipDescription}>
          {loyaltyInfo.isMaxLevel
            ? 'Bạn đã đạt hạng cao nhất. Tiếp tục mua sắm để nhận nhiều ưu đãi độc quyền.'
            : `Còn ${formatCurrency(loyaltyInfo.remaining)} để nâng cấp lên ${
                loyaltyInfo.nextLevel.name
              }.`}
        </ThemedText>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(100, Math.max(loyaltyInfo.progress, loyaltyInfo.progress > 0 ? 8 : 0))}%`,
                backgroundColor: loyaltyInfo.currentLevel.color,
              },
            ]}
          />
        </View>
        <View style={styles.progressFooter}>
          <ThemedText style={styles.progressLabel}>
            Đã chi {formatCurrency(totalSpent)}
          </ThemedText>
          <ThemedText style={styles.progressLabel}>
            {loyaltyInfo.isMaxLevel
              ? `Trạng thái: ${loyaltyInfo.currentLevel.name}`
              : `Mục tiêu: ${formatCurrency(loyaltyInfo.nextLevel.min)}`}
          </ThemedText>
        </View>
      </View>

      {activeOrderTimeline.length ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIconWrapper, { backgroundColor: '#E0F2FE' }]}>
                <IconSymbol name="location.fill" size={18} color="#0284C7" />
              </View>
              <ThemedText style={styles.sectionTitle}>Đơn hàng đang xử lý</ThemedText>
            </View>
            <TouchableOpacity onPress={() => router.push('/orders')}>
              <ThemedText style={styles.sectionAction}>Theo dõi</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.timelineContainer}>
            {activeOrderTimeline.map((order, index) => {
              const statusMeta = getOrderStatusMeta(order.orderStatus);
              const isLast = index === activeOrderTimeline.length - 1;

              return (
                <View key={order._id} style={styles.timelineItem}>
                  <View style={styles.timelineIndicator}>
                    <View
                      style={[
                        styles.timelineDot,
                        {
                          borderColor: statusMeta.color,
                          backgroundColor: statusMeta.background,
                        },
                      ]}
                    />
                    {!isLast && <View style={styles.timelineConnector} />}
                  </View>
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineHeader}>
                      <ThemedText style={styles.timelineOrderId}>
                        DH#{order._id.slice(-6).toUpperCase()}
                      </ThemedText>
                      <ThemedText style={[styles.timelineStatus, { color: statusMeta.color }]}>
                        {statusMeta.label}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.timelineMeta}>
                      {formatOrderDate(order.updatedAt || order.createdAt)} • {order.items.length} sản phẩm
                    </ThemedText>
                    <TouchableOpacity
                      style={styles.timelineLink}
                      onPress={() =>
                        router.push({
                          pathname: '/orders/[id]',
                          params: { id: order._id },
                        })
                      }
                    >
                      <ThemedText style={styles.timelineLinkText}>Xem tiến trình</ThemedText>
                      <IconSymbol name="chevron.right" size={12} color="#2563EB" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <View style={[styles.sectionIconWrapper, { backgroundColor: '#FEE2E2' }]}>
              <IconSymbol name="clock.fill" size={18} color="#EF4444" />
            </View>
            <ThemedText style={styles.sectionTitle}>Lịch sử đơn hàng</ThemedText>
          </View>
          <TouchableOpacity onPress={() => router.push('/orders')}>
            <ThemedText style={styles.sectionAction}>Xem tất cả</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
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
        </ScrollView>

        {isFetchingOrders ? (
          <View style={styles.orderLoader}>
            <ActivityIndicator size="small" color="#007AFF" />
            <ThemedText style={styles.loaderText}>Đang tải đơn hàng ...</ThemedText>
          </View>
        ) : ordersError ? (
          <View style={styles.orderEmptyState}>
            <IconSymbol name="exclamationmark.circle" size={32} color="#F97316" />
            <ThemedText style={styles.emptyTitle}>Không thể tải dữ liệu</ThemedText>
            <ThemedText style={styles.emptySubtitle}>{ordersError}</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <ThemedText style={styles.retryButtonText}>Thử lại</ThemedText>
            </TouchableOpacity>
          </View>
        ) : filteredOrders.length ? (
          filteredOrders.slice(0, 4).map(order => {
            const statusMeta = getOrderStatusMeta(order.orderStatus);
            const firstItem = order.items?.[0];

            return (
              <View key={order._id} style={styles.orderCard}>
                <View style={styles.orderCardHeader}>
                  <ThemedText style={styles.orderId}>DH#{order._id.slice(-6).toUpperCase()}</ThemedText>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusMeta.background },
                    ]}
                  >
                    <ThemedText
                      style={[styles.statusText, { color: statusMeta.color }]}
                    >
                      {statusMeta.label}
                    </ThemedText>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.orderCardBody}
                  onPress={() =>
                    router.push({
                      pathname: '/orders/[id]',
                      params: { id: order._id },
                    })
                  }
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: firstItem?.image || FALLBACK_PRODUCT }}
                    style={styles.orderImage}
                    contentFit="cover"
                  />
                  <View style={styles.orderInfo}>
                    <ThemedText
                      style={styles.orderTitle}
                      numberOfLines={1}
                    >
                      {firstItem?.name || 'Đơn hàng OCOP'}
                    </ThemedText>
                    <ThemedText style={styles.orderMeta}>
                      {order.items.length} sản phẩm • {formatOrderDate(order.createdAt)}
                    </ThemedText>
                  </View>
                  <View style={styles.orderAmount}>
                    <ThemedText style={styles.orderTotal}>
                      {formatCurrency(order.total)}
                    </ThemedText>
                    <View style={styles.viewDetailRow}>
                      <ThemedText style={styles.viewDetailText}>Chi tiết</ThemedText>
                      <IconSymbol name="chevron.right" size={12} color="#2563EB" />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <View style={styles.orderEmptyState}>
            <IconSymbol name="tray" size={32} color="#9CA3AF" />
            <ThemedText style={styles.emptyTitle}>Chưa có đơn hàng</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Đặt sản phẩm đầu tiên để theo dõi tại đây.
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <View style={[styles.sectionIconWrapper, { backgroundColor: '#DCFCE7' }]}>
              <IconSymbol name="sparkles" size={18} color="#16A34A" />
            </View>
            <ThemedText style={styles.sectionTitle}>Tiện ích nhanh</ThemedText>
          </View>
        </View>
        <View style={styles.quickActionsGrid}>
          {quickActions.map(action => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionCard}
              onPress={action.onPress}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}1A` }]}>
                <IconSymbol name={action.icon} size={20} color={action.color} />
              </View>
              <ThemedText style={styles.quickActionLabel}>{action.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.logoutCard}>
        <View style={styles.logoutCardHeader}>
          <View style={styles.logoutIconWrapper}>
            <IconSymbol name="power" size={20} color="#FF4D4F" />
          </View>
          <View style={styles.logoutTextWrapper}>
            <ThemedText style={styles.logoutTitle}>Đăng xuất khỏi tài khoản</ThemedText>
            <ThemedText style={styles.logoutSubtitle}>
              Bạn sẽ phải đăng nhập lại để tiếp tục mua sắm.
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <IconSymbol
            name="rectangle.portrait.and.arrow.right"
            size={20}
            color="#FF4D4F"
          />
          <ThemedText style={styles.logoutText}>Đăng xuất</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>OCOP Đồng Nai • Version 1.0.0</ThemedText>
      </View>
    </ScrollView>
  );
};

export default function ProfileScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return isAuthenticated ? <UserProfile /> : <GuestProfile />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  guestTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    marginTop: 16,
  },
  guestSubtitle: {
    fontSize: 16,
    color: 'gray',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'Poppins-Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  registerButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  profileHeader: {
    margin: 16,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#1E293B',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  welcomeText: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
  },
  userMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userMetaText: {
    fontSize: 14,
    color: '#CBD5F5',
    fontFamily: 'Poppins-Regular',
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileInfo: {
    flex: 1,
  },
  editButton: {
    marginTop: 24,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  editButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  sectionAction: {
    fontSize: 14,
    color: '#2563EB',
    fontFamily: 'Poppins-SemiBold',
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  membershipBadgeText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontFamily: 'Poppins-SemiBold',
  },
  membershipDescription: {
    fontSize: 13,
    color: '#475569',
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
    marginBottom: 12,
  },
  progressBar: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  progressLabel: {
    fontSize: 12,
    color: '#475569',
    fontFamily: 'Poppins-SemiBold',
  },
  metricsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '47%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metricIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: 'Poppins-SemiBold',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
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
    fontSize: 13,
    color: '#475569',
    fontFamily: 'Poppins-SemiBold',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  timelineContainer: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    minHeight: 90,
  },
  timelineIndicator: {
    width: 20,
    alignItems: 'center',
    flexDirection: 'column',
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  timelineConnector: {
    flex: 1,
    width: 2,
    backgroundColor: '#E2E8F0',
    marginTop: 4,
    borderRadius: 999,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineOrderId: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  timelineStatus: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  timelineMeta: {
    marginTop: 6,
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
  },
  timelineLink: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timelineLinkText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#2563EB',
  },
  orderLoader: {
    marginTop: 24,
    alignItems: 'center',
    gap: 8,
  },
  loaderText: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
  },
  orderCard: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  orderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  orderCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  orderImage: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  orderMeta: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
  },
  orderAmount: {
    alignItems: 'flex-end',
    gap: 6,
  },
  orderTotal: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
  },
  viewDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#2563EB',
  },
  orderEmptyState: {
    marginTop: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F2937',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 16,
    fontFamily: 'Poppins-Regular',
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  quickActionCard: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E293B',
  },
  logoutCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  logoutCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoutIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 77, 79, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutTextWrapper: {
    flex: 1,
    gap: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 14,
    color: '#FF4D4F',
    fontFamily: 'Poppins-Bold',
  },
  logoutTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#E2E8F0',
  },
  logoutSubtitle: {
    fontSize: 13,
    color: '#CBD5F5',
    fontFamily: 'Poppins-Regular',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'Poppins-Regular',
  },
});

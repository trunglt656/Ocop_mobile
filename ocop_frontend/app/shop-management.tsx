import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AssetIcon } from '@/components/ui/asset-icon';
import { shopService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import type { Shop, ShopDashboard } from '@/services/shopService';

export default function ShopManagementScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [dashboard, setDashboard] = useState<ShopDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadShopData();
  }, []);

  const loadShopData = async () => {
    try {
      setLoading(true);
      // Get user's shop
      const userShop = await shopService.getMyShop();
      setShop(userShop);
      
      // Get dashboard data
      const dashboardData = await shopService.getShopDashboard(userShop._id);
      setDashboard(dashboardData);
    } catch (error: any) {
      console.error('Error loading shop data:', error);
      // If user doesn't have a shop, that's okay - show empty state
      if (error.message !== 'Bạn chưa có shop nào') {
        Alert.alert('Lỗi', 'Không thể tải thông tin shop');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadShopData();
    setRefreshing(false);
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

  if (!shop) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyContainer}>
          <AssetIcon name="shop" size={80} color="#CBD5E1" />
          <ThemedText style={styles.emptyTitle}>Chưa có shop</ThemedText>
          <ThemedText style={styles.emptyText}>
            Bạn chưa đăng ký shop nào. Hãy đăng ký để bắt đầu bán hàng!
          </ThemedText>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/register-shop')}
          >
            <IconSymbol name="plus.circle.fill" size={20} color="#FFFFFF" />
            <ThemedText style={styles.registerButtonText}>Đăng ký Shop</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved': return '#22C55E';
      case 'pending': return '#F59E0B';
      case 'suspended': return '#EF4444';
      case 'rejected': return '#DC2626';
      default: return '#94A3B8';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'pending': return 'Chờ duyệt';
      case 'suspended': return 'Tạm ngưng';
      case 'rejected': return 'Từ chối';
      default: return status;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <ThemedText style={styles.title}>Quản lý cửa hàng</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shop.status) + '20' }]}>
              <ThemedText style={[styles.statusText, { color: getStatusColor(shop.status) }]}>
                {getStatusText(shop.status)}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Shop Info Card */}
        <View style={styles.shopCard}>
          <View style={styles.shopHeader}>
            <View style={styles.shopLogo}>
              <AssetIcon name="shop" size={32} color="#2563EB" />
            </View>
            <View style={styles.shopInfo}>
              <ThemedText style={styles.shopName}>{shop.name}</ThemedText>
              <ThemedText style={styles.shopAddress}>{shop.address}</ThemedText>
            </View>
          </View>
        </View>

        {/* Dashboard Stats */}
        {dashboard && shop.status === 'active' && (
          <View style={styles.statsContainer}>
            <ThemedText style={styles.sectionTitle}>📊 Thống kê</ThemedText>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
                <AssetIcon name="menu" size={24} color="#2563EB" />
                <ThemedText style={styles.statValue}>
                  {dashboard.stats?.totalOrders || dashboard.totalOrders || 0}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Đơn hàng</ThemedText>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
                <AssetIcon name="creditcard" size={24} color="#22C55E" />
                <ThemedText style={styles.statValue}>
                  {(dashboard.stats?.totalRevenue || 0).toLocaleString('vi-VN')}đ
                </ThemedText>
                <ThemedText style={styles.statLabel}>Doanh thu</ThemedText>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
                <AssetIcon name="shop" size={24} color="#F59E0B" />
                <ThemedText style={styles.statValue}>
                  {dashboard.stats?.totalProducts || dashboard.totalProducts || 0}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Sản phẩm</ThemedText>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#FCE7F3' }]}>
                <AssetIcon name="star" size={24} color="#EC4899" />
                <ThemedText style={styles.statValue}>
                  {dashboard.averageRating ? dashboard.averageRating.toFixed(1) : 'N/A'}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Đánh giá TB</ThemedText>
              </View>
            </View>
          </View>
        )}

        {/* Management Actions */}
        <View style={styles.actionsContainer}>
          <ThemedText style={styles.sectionTitle}>⚙️ Quản lý</ThemedText>
          
          {shop.status === 'active' ? (
            <>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push(`/shop-products?shopId=${shop._id}`)}
              >
                <View style={styles.actionIcon}>
                  <AssetIcon name="shop" size={24} color="#2563EB" />
                </View>
                <View style={styles.actionContent}>
                  <ThemedText style={styles.actionTitle}>Quản lý sản phẩm</ThemedText>
                  <ThemedText style={styles.actionDescription}>
                    Thêm, sửa, xóa sản phẩm của shop
                  </ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={20} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push(`/shop-orders?shopId=${shop._id}`)}
              >
                <View style={styles.actionIcon}>
                  <AssetIcon name="menu" size={24} color="#22C55E" />
                </View>
                <View style={styles.actionContent}>
                  <ThemedText style={styles.actionTitle}>Quản lý đơn hàng</ThemedText>
                  <ThemedText style={styles.actionDescription}>
                    Xem và xử lý đơn hàng
                  </ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={20} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push(`/shop-settings?shopId=${shop._id}`)}
              >
                <View style={styles.actionIcon}>
                  <AssetIcon name="settings" size={24} color="#F59E0B" />
                </View>
                <View style={styles.actionContent}>
                  <ThemedText style={styles.actionTitle}>Cài đặt Shop</ThemedText>
                  <ThemedText style={styles.actionDescription}>
                    Cập nhật thông tin shop
                  </ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.pendingCard}>
              <AssetIcon name="clock" size={48} color="#F59E0B" />
              <ThemedText style={styles.pendingTitle}>
                Shop đang chờ xét duyệt
              </ThemedText>
              <ThemedText style={styles.pendingText}>
                Chúng tôi sẽ xem xét và phê duyệt shop của bạn trong vòng 1-3 ngày làm việc.
                Bạn sẽ nhận được thông báo qua email.
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  registerButton: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  registerButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  shopCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  shopHeader: {
    flexDirection: 'row',
    gap: 16,
  },
  shopLogo: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  shopName: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
  },
  shopAddress: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    marginTop: 4,
  },
  statsContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    marginTop: 4,
  },
  actionsContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  actionDescription: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    marginTop: 2,
  },
  pendingCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  pendingTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#92400E',
    marginTop: 16,
    textAlign: 'center',
  },
  pendingText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#92400E',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

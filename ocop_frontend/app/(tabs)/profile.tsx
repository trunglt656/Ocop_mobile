import React from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ProfileScreen() {
  const router = useRouter();

  const menuItems = [
    {
      id: 'orders',
      title: 'Đơn hàng của tôi',
      icon: 'bag.fill',
      onPress: () => router.push('/orders'),
    },
    {
      id: 'favorites',
      title: 'Sản phẩm yêu thích',
      icon: 'heart.fill',
      onPress: () => router.push('/favorites'),
    },
    {
      id: 'addresses',
      title: 'Địa chỉ giao hàng',
      icon: 'location.fill',
      onPress: () => router.push('/addresses'),
    },
    {
      id: 'settings',
      title: 'Cài đặt',
      icon: 'gearshape.fill',
      onPress: () => router.push('/settings'),
    },
    {
      id: 'help',
      title: 'Trợ giúp & Hỗ trợ',
      icon: 'questionmark.circle.fill',
      onPress: () => router.push('/help'),
    },
  ];

  const renderMenuItem = ({ item }: { item: typeof menuItems[0] }) => (
    <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
      <View style={styles.menuItemLeft}>
        <IconSymbol name={item.icon} size={24} color="#007AFF" />
        <ThemedText style={styles.menuItemText}>{item.title}</ThemedText>
      </View>
      <IconSymbol name="chevron.right" size={16} color="#999" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <IconSymbol name="person.circle.fill" size={80} color="#007AFF" />
        </View>
        <ThemedText style={styles.userName}>Nguyễn Văn A</ThemedText>
        <ThemedText style={styles.userEmail}>nguyenvana@example.com</ThemedText>
        <TouchableOpacity style={styles.editProfileButton}>
          <ThemedText style={styles.editProfileText}>Chỉnh sửa thông tin</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        {menuItems.map((item) => (
          <View key={item.id}>
            {renderMenuItem({ item })}
          </View>
        ))}
      </View>

      <View style={styles.statsSection}>
        <ThemedText style={styles.sectionTitle}>Thống kê</ThemedText>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>12</ThemedText>
            <ThemedText style={styles.statLabel}>Đơn hàng</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>8</ThemedText>
            <ThemedText style={styles.statLabel}>Yêu thích</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>4.8</ThemedText>
            <ThemedText style={styles.statLabel}>Đánh giá</ThemedText>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton}>
        <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#ff4444" />
        <ThemedText style={styles.logoutText}>Đăng xuất</ThemedText>
      </TouchableOpacity>

      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>OCOP Đồng Nai - Version 1.0.0</ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  editProfileButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  editProfileText: {
    color: '#007AFF',
    fontSize: 14,
  },
  menuSection: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  statsSection: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginBottom: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#ff4444',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

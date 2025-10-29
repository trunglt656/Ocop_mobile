import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Image } from 'expo-image';

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
          <ThemedText style={styles.buttonText}>Đăng Nhập</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/register')}>
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

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  const menuItems = [
    { id: 'orders', title: 'Đơn hàng của tôi', icon: 'bag.fill', onPress: () => router.push('/orders') },
    { id: 'favorites', title: 'Sản phẩm yêu thích', icon: 'heart.fill', onPress: () => router.push('/favorites') },
    { id: 'addresses', title: 'Địa chỉ giao hàng', icon: 'location.fill', onPress: () => router.push('/addresses') },
    { id: 'settings', title: 'Cài đặt', icon: 'gearshape.fill', onPress: () => router.push('/settings') },
    { id: 'help', title: 'Trợ giúp & Hỗ trợ', icon: 'questionmark.circle.fill', onPress: () => router.push('/help') },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image 
          source={{ uri: user?.avatar || 'https://via.placeholder.com/80' }}
          style={styles.avatar}
        />
        <ThemedText style={styles.userName}>{user?.name || 'Người dùng'}</ThemedText>
        <ThemedText style={styles.userEmail}>{user?.email || ''}</ThemedText>
      </View>

      <View style={styles.menuSection}>
        {menuItems.map(item => (
          <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
            <View style={styles.menuItemLeft}>
              <IconSymbol name={item.icon} size={22} color="#007AFF" />
              <ThemedText style={styles.menuItemText}>{item.title}</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={16} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.logoutButtonContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#ff4444" />
          <ThemedText style={styles.logoutText}>Đăng xuất</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>OCOP Đồng Nai - Version 1.0.0</ThemedText>
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
  // Common styles
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // Guest Profile styles
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  guestSubtitle: {
    fontSize: 16,
    color: 'gray',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 32,
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
  },
  registerButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // User Profile styles
  profileHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginBottom: 12,
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
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
  },
  logoutButtonContainer: {
    backgroundColor: '#fff',
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#ff4444',
    marginLeft: 8,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
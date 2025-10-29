import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { addressService, Address } from '@/services/addressService';
import { Colors } from '@/constants/theme';

export default function AddressesScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressService.getAddresses();
      if (response.success && response.data) {
        setAddresses(response.data);
      } else {
        setError(response.message || 'Failed to fetch addresses');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const handleSetDefault = async (id: string) => {
    try {
      const response = await addressService.setDefaultAddress(id);
      if (response.success) {
        fetchAddresses(); // Re-fetch to update the list
      } else {
        Alert.alert('Error', response.message || 'Failed to set default address');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred');
    }
  };

  const renderAddress = ({ item }: { item: Address }) => (
    <View style={styles.addressItem}>
      <View style={styles.addressInfo}>
        <ThemedText style={styles.addressName}>{item.name} {item.isDefault && <ThemedText style={styles.defaultLabel}>(Mặc định)</ThemedText>}</ThemedText>
        <ThemedText>{item.phone}</ThemedText>
        <ThemedText>{item.fullAddress}</ThemedText>
      </View>
      {!item.isDefault && (
        <TouchableOpacity style={styles.setDefaultButton} onPress={() => handleSetDefault(item._id)}>
          <ThemedText style={styles.setDefaultButtonText}>Chọn làm mặc định</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Địa chỉ giao hàng' }} />
      <ThemedView style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.light.primary} />
        ) : error ? (
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        ) : (
          <FlatList
            data={addresses}
            renderItem={renderAddress}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={<ThemedText style={styles.emptyText}>Bạn chưa có địa chỉ nào.</ThemedText>}
            contentContainerStyle={styles.listContainer}
          />
        )}
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-address')}>
          <ThemedText style={styles.addButtonText}>+ Thêm địa chỉ mới</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  addressItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  defaultLabel: {
    color: Colors.light.primary,
    fontSize: 14,
  },
  setDefaultButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  setDefaultButtonText: {
    color: Colors.light.primary,
    fontSize: 12,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: Colors.light.secondary,
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    opacity: 0.7,
  },
});

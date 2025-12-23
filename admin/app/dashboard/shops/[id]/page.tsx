'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getShop, addShopAdmin, removeShopAdmin, toggleShopStatus } from '@/services/shopService';
import { getProducts } from '@/services/productService';
import { getUsers } from '@/services/userService';

interface Props {
  params: {
    id: string;
  };
}

export default function ShopDetailPage({ params }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Fetch shop details
  const { data: shopResponse, isLoading } = useQuery({
    queryKey: ['shop', params.id],
    queryFn: () => getShop(params.id),
  });

  const shop = shopResponse?.data;

  // Fetch shop products
  const { data: productsData } = useQuery({
    queryKey: ['shop-products', params.id],
    queryFn: () => getProducts({ page: 1, limit: 100 }),
    enabled: !!params.id,
  });

  // Fetch available users for admin assignment
  const { data: usersData } = useQuery({
    queryKey: ['users-available'],
    queryFn: () => getUsers({ limit: 100 }),
    enabled: showAddAdmin,
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: toggleShopStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop', params.id] });
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });

  // Add admin mutation
  const addAdminMutation = useMutation({
    mutationFn: ({ shopId, userId }: { shopId: string; userId: string }) =>
      addShopAdmin(shopId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop', params.id] });
      setShowAddAdmin(false);
      setSelectedUserId('');
      alert('Thêm quản trị viên thành công!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Thêm quản trị viên thất bại!');
    },
  });

  // Remove admin mutation
  const removeAdminMutation = useMutation({
    mutationFn: ({ shopId, userId }: { shopId: string; userId: string }) =>
      removeShopAdmin(shopId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop', params.id] });
      alert('Xóa quản trị viên thành công!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Xóa quản trị viên thất bại!');
    },
  });

  const handleToggleStatus = () => {
    if (confirm(`Bạn có chắc chắn muốn ${shop?.isActive ? 'tạm khóa' : 'kích hoạt'} shop này?`)) {
      toggleStatusMutation.mutate(params.id);
    }
  };

  const handleAddAdmin = () => {
    if (!selectedUserId) {
      alert('Vui lòng chọn người dùng!');
      return;
    }
    addAdminMutation.mutate({ shopId: params.id, userId: selectedUserId });
  };

  const handleRemoveAdmin = (userId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa quản trị viên này?')) {
      removeAdminMutation.mutate({ shopId: params.id, userId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy shop</h2>
        <button
          onClick={() => router.back()}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const activeProducts = productsData?.data?.filter(p => p.isActive).length || 0;
  const totalProducts = productsData?.data?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{shop.name}</h1>
            <p className="mt-1 text-gray-600">{shop.slug}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggleStatus}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              shop.isActive
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {shop.isActive ? 'Tạm khóa' : 'Kích hoạt'}
          </button>
          <button
            onClick={() => router.push(`/dashboard/shops/${params.id}/edit`)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Chỉnh sửa
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            shop.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {shop.isActive ? 'Đang hoạt động' : 'Đã khóa'}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đang bán</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{activeProducts}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quản trị viên</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{shop.admins?.length || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tỷ lệ hoạt động</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shop Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin Shop</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Mô tả</label>
              <p className="mt-1 text-gray-900">{shop.description || 'Chưa có mô tả'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Địa chỉ</label>
              <p className="mt-1 text-gray-900">{shop.address || 'Chưa cập nhật'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Số điện thoại</label>
                <p className="mt-1 text-gray-900">{shop.contact?.phone || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="mt-1 text-gray-900">{shop.contact?.email || '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Ngày tạo</label>
                <p className="mt-1 text-gray-900">
                  {new Date(shop.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Cập nhật lần cuối</label>
                <p className="mt-1 text-gray-900">
                  {new Date(shop.updatedAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Owner Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Chủ sở hữu</h2>
          <div className="flex items-start space-x-4">
            <div className="h-16 w-16 flex-shrink-0">
              {shop.owner.avatar ? (
                <img
                  className="h-16 w-16 rounded-full"
                  src={shop.owner.avatar}
                  alt={shop.owner.name}
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 text-2xl font-medium">
                    {shop.owner.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{shop.owner.name}</h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {shop.owner.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {shop.owner.phone}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Admins */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Quản trị viên Shop</h2>
          <button
            onClick={() => setShowAddAdmin(!showAddAdmin)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm quản trị viên</span>
          </button>
        </div>

        {showAddAdmin && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn người dùng
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- Chọn người dùng --</option>
                  {usersData?.data
                    ?.filter(u => !shop.admins?.some(admin => admin._id === u._id) && u._id !== shop.owner._id)
                    .map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} - {user.email}
                      </option>
                    ))}
                </select>
              </div>
              <button
                onClick={handleAddAdmin}
                disabled={!selectedUserId}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400"
              >
                Thêm
              </button>
              <button
                onClick={() => {
                  setShowAddAdmin(false);
                  setSelectedUserId('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {shop.admins && shop.admins.length > 0 ? (
            shop.admins.map((admin) => (
              <div
                key={admin._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 flex-shrink-0">
                    {admin.avatar ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={admin.avatar}
                        alt={admin.name}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {admin.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{admin.name}</p>
                    <p className="text-sm text-gray-600">{admin.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveAdmin(admin._id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Xóa
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">Chưa có quản trị viên</p>
          )}
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Sản phẩm của Shop</h2>
          <button
            onClick={() => router.push(`/dashboard/products?shop=${params.id}`)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Xem tất cả →
          </button>
        </div>

        {productsData?.data && productsData.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {productsData.data.slice(0, 6).map((product) => (
              <div key={product._id} className="border border-gray-200 rounded-lg p-4">
                {product.images && product.images.length > 0 && (
                  <img
                    src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-primary-600 font-semibold">
                  {product.price.toLocaleString('vi-VN')} đ
                </p>
                <div className="mt-2">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                      product.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.isActive ? 'Đang bán' : 'Ẩn'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Chưa có sản phẩm nào</p>
        )}
      </div>
    </div>
  );
}

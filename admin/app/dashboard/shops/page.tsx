'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getShops, deleteShop, toggleShopStatus, approveShop, rejectShop } from '@/services/shopService';
import Pagination from '@/components/products/Pagination';

export default function ShopsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const limit = 10;

  // Fetch shops
  const { data: shopsData, isLoading } = useQuery({
    queryKey: ['shops', currentPage, searchTerm, statusFilter],
    queryFn: () => getShops({ 
      page: currentPage, 
      limit, 
      search: searchTerm,
      status: statusFilter !== 'all' ? statusFilter : undefined
    }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteShop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      alert('Xóa shop thành công!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Xóa shop thất bại!');
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: toggleShopStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ shopId, notes }: { shopId: string; notes?: string }) => approveShop(shopId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      alert('Đã duyệt shop thành công!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Duyệt shop thất bại!');
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ shopId, notes }: { shopId: string; notes: string }) => rejectShop(shopId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      alert('Đã từ chối shop!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Từ chối shop thất bại!');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa shop này?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: string) => {
    toggleStatusMutation.mutate(id);
  };

  const handleApprove = (shopId: string) => {
    if (confirm('Bạn có chắc chắn muốn duyệt shop này?')) {
      approveMutation.mutate({ shopId });
    }
  };

  const handleReject = (shopId: string) => {
    const notes = prompt('Lý do từ chối:');
    if (notes) {
      rejectMutation.mutate({ shopId, notes });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Shop</h1>
          <p className="mt-2 text-gray-600">
            Quản lý các shop bán hàng trên sàn OCOP
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/shops/new')}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Thêm shop</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng shop</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {shopsData?.pagination?.total || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {shopsData?.data?.filter(s => s.status === 'pending').length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {shopsData?.data?.filter(s => s.status === 'active').length || 0}
              </p>
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
              <p className="text-sm font-medium text-gray-600">Bị từ chối</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {shopsData?.data?.filter(s => s.status === 'rejected').length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Chờ duyệt
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Đã duyệt
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Bị từ chối
          </button>
        </div>
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm shop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Shops Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shop
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chủ shop
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Liên hệ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái duyệt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hoạt động
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {shopsData?.data?.map((shop) => (
              <tr key={shop._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{shop.name}</div>
                    <div className="text-sm text-gray-500">{shop.address || 'N/A'}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{shop.owner?.name || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{shop.owner?.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{shop.contact?.phone || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{shop.contact?.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      shop.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : shop.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : shop.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {shop.status === 'active' && 'Đã duyệt'}
                    {shop.status === 'pending' && 'Chờ duyệt'}
                    {shop.status === 'rejected' && 'Bị từ chối'}
                    {shop.status === 'suspended' && 'Bị đình chỉ'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleStatus(shop._id)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      shop.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {shop.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                  {shop.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(shop._id)}
                        className="text-green-600 hover:text-green-900 font-semibold"
                      >
                        ✓ Duyệt
                      </button>
                      <button
                        onClick={() => handleReject(shop._id)}
                        className="text-red-600 hover:text-red-900 font-semibold"
                      >
                        ✗ Từ chối
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => router.push(`/dashboard/shops/${shop._id}`)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    Chi tiết
                  </button>
                  <button
                    onClick={() => handleDelete(shop._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {shopsData?.pagination && shopsData.pagination.pages > 1 && (
          <Pagination
            currentPage={shopsData.pagination.page}
            totalPages={shopsData.pagination.pages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}

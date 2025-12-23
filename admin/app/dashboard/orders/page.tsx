'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, updateOrderStatus } from '@/services/orderService';
import OrderTable from '@/components/orders/OrderTable';
import OrderFilters from '@/components/orders/OrderFilters';
import Pagination from '@/components/products/Pagination';
import { formatCurrency } from '@/lib/utils';

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<any>({});
  const limit = 10;

  // Fetch orders
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['orders', currentPage, filters],
    queryFn: () => getOrders({ page: currentPage, limit, ...filters }),
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      alert('Cập nhật trạng thái thành công!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Cập nhật thất bại!');
    },
  });

  const handleStatusChange = (id: string, status: any) => {
    if (confirm('Bạn có chắc muốn cập nhật trạng thái đơn hàng?')) {
      updateStatusMutation.mutate({ id, status });
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate stats from current data
  const stats = ordersData?.data
    ? {
        total: ordersData.pagination?.total || 0,
        pending: ordersData.data.filter((o) => o.orderStatus === 'pending').length,
        processing: ordersData.data.filter(
          (o) => o.orderStatus === 'processing' || o.orderStatus === 'confirmed'
        ).length,
        delivered: ordersData.data.filter((o) => o.orderStatus === 'delivered').length,
        revenue: ordersData.data.reduce((sum, o) => sum + o.total, 0),
      }
    : { total: 0, pending: 0, processing: 0, delivered: 0, revenue: 0 };

  if (isLoadingOrders) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
        <p className="mt-2 text-gray-600">
          Quản lý tất cả đơn hàng trong hệ thống
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Tổng đơn hàng"
          value={stats.total}
          icon="total"
          color="blue"
        />
        <StatsCard
          title="Chờ xử lý"
          value={stats.pending}
          icon="pending"
          color="yellow"
        />
        <StatsCard
          title="Đang xử lý"
          value={stats.processing}
          icon="processing"
          color="purple"
        />
        <StatsCard
          title="Đã giao"
          value={stats.delivered}
          icon="delivered"
          color="green"
        />
      </div>

      {/* Filters */}
      <OrderFilters onFilterChange={handleFilterChange} />

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Danh sách đơn hàng
          </h2>
        </div>

        <OrderTable
          orders={ordersData?.data || []}
          onStatusChange={handleStatusChange}
          isLoading={false}
        />

        {/* Pagination */}
        {ordersData?.pagination && (ordersData.pagination.pages || 0) > 1 && (
          <Pagination
            currentPage={ordersData.pagination.page}
            totalPages={ordersData.pagination.pages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div
          className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center transition-transform duration-300 hover:scale-110 hover:rotate-6`}
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

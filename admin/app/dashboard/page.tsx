'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardStats } from '@/types/dashboard';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: DashboardStats }>(
        '/admin/dashboard/stats'
      );
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p>Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Tổng người dùng"
          value={data?.totalUsers || 0}
          icon="users"
          color="blue"
        />
        <StatsCard
          title="Tổng sản phẩm"
          value={data?.totalProducts || 0}
          icon="box"
          color="green"
        />
        <StatsCard
          title="Tổng đơn hàng"
          value={data?.totalOrders || 0}
          icon="shopping-bag"
          color="purple"
        />
        <StatsCard
          title="Doanh thu"
          value={formatCurrency(data?.totalRevenue || 0)}
          icon="dollar"
          color="gold"
        />
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thống kê đơn hàng
          </h2>
          <div className="space-y-3">
            <OrderStatusRow
              label="Chờ xác nhận"
              value={data?.orderStats.pending || 0}
              color="yellow"
            />
            <OrderStatusRow
              label="Đã xác nhận"
              value={data?.orderStats.confirmed || 0}
              color="blue"
            />
            <OrderStatusRow
              label="Đang xử lý"
              value={data?.orderStats.processing || 0}
              color="indigo"
            />
            <OrderStatusRow
              label="Đang giao hàng"
              value={data?.orderStats.shipped || 0}
              color="purple"
            />
            <OrderStatusRow
              label="Đã giao hàng"
              value={data?.orderStats.delivered || 0}
              color="green"
            />
            <OrderStatusRow
              label="Đã hủy"
              value={data?.orderStats.cancelled || 0}
              color="red"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thống kê sản phẩm
          </h2>
          <div className="space-y-3">
            <OrderStatusRow
              label="Đang hoạt động"
              value={data?.productStats.active || 0}
              color="green"
            />
            <OrderStatusRow
              label="Không hoạt động"
              value={data?.productStats.inactive || 0}
              color="gray"
            />
            <OrderStatusRow
              label="Hết hàng"
              value={data?.productStats.outOfStock || 0}
              color="red"
            />
            <OrderStatusRow
              label="Sản phẩm nổi bật"
              value={data?.productStats.featured || 0}
              color="yellow"
            />
            <OrderStatusRow
              label="Sản phẩm OCOP"
              value={data?.productStats.ocop || 0}
              color="primary"
            />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Đơn hàng gần đây</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.recentOrders && data.recentOrders.length > 0 ? (
                data.recentOrders.map((order: any) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.user?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Chưa có đơn hàng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
  value: string | number;
  icon: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    gold: 'bg-gold-500',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2 transition-colors duration-200">{value}</p>
        </div>
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center transition-transform duration-300 hover:scale-110 hover:rotate-6`}>
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function OrderStatusRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    purple: 'bg-purple-100 text-purple-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${colorClasses[color]}`}
      >
        {value}
      </span>
    </div>
  );
}

'use client';

import { Order, OrderStatusMap, PaymentMethodMap } from '@/types/order';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface OrderTableProps {
  orders: Order[];
  onStatusChange?: (id: string, status: Order['orderStatus']) => void;
  isLoading?: boolean;
}

export default function OrderTable({
  orders,
  onStatusChange,
  isLoading = false,
}: OrderTableProps) {
  const router = useRouter();

  const getStatusBadge = (status: Order['orderStatus']) => {
    const badges: Record<Order['orderStatus'], string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status]}`}>
        {OrderStatusMap[status]}
      </span>
    );
  };

  const getPaymentBadge = (status: Order['paymentStatus']) => {
    const badges: Record<Order['paymentStatus'], string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };

    const labels: Record<Order['paymentStatus'], string> = {
      pending: 'Chờ thanh toán',
      paid: 'Đã thanh toán',
      failed: 'Thất bại',
      refunded: 'Đã hoàn tiền',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
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
        <p className="mt-4 text-gray-500">Không có đơn hàng nào</p>
      </div>
    );
  }

  return (
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
              Thanh toán
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngày đặt
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-200 animate-fadeIn">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-primary-600">
                  #{order.orderNumber}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {order.user?.name || 'N/A'}
                </div>
                <div className="text-sm text-gray-500">
                  {order.user?.phone || order.shippingAddress?.phone}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(order.total)}
                </div>
                <div className="text-xs text-gray-500">
                  {order.items?.length || 0} sản phẩm
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="space-y-1">
                  {getPaymentBadge(order.paymentStatus)}
                  <div className="text-xs text-gray-500">
                    {PaymentMethodMap[order.paymentMethod]}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(order.orderStatus)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => router.push(`/dashboard/orders/${order._id}`)}
                  className="text-primary-600 hover:text-primary-900 mr-4 transition-all duration-200 hover:underline hover:scale-105 inline-block"
                >
                  Chi tiết
                </button>
                {order.orderStatus === 'pending' && onStatusChange && (
                  <button
                    onClick={() => onStatusChange(order._id, 'confirmed')}
                    className="text-green-600 hover:text-green-900 transition-all duration-200 hover:underline hover:scale-105 inline-block"
                  >
                    Xác nhận
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

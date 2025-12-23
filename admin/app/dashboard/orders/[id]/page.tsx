'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrder, updateOrderStatus, updatePaymentStatus } from '@/services/orderService';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Order, OrderStatusMap, PaymentMethodMap } from '@/types/order';
import { useState } from 'react';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const queryClient = useQueryClient();
  const [trackingNumber, setTrackingNumber] = useState('');

  // Fetch order
  const { data: orderData, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ status, tracking }: { status: Order['orderStatus']; tracking?: string }) =>
      updateOrderStatus(orderId, status, tracking),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      alert('Cập nhật trạng thái thành công!');
      setTrackingNumber('');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Cập nhật thất bại!');
    },
  });

  // Update payment status mutation
  const updatePaymentMutation = useMutation({
    mutationFn: (status: Order['paymentStatus']) =>
      updatePaymentStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      alert('Cập nhật thanh toán thành công!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Cập nhật thất bại!');
    },
  });

  const handleUpdateStatus = (status: Order['orderStatus']) => {
    if (status === 'shipped' && !trackingNumber) {
      alert('Vui lòng nhập mã vận đơn!');
      return;
    }
    
    if (confirm(`Cập nhật trạng thái đơn hàng thành "${OrderStatusMap[status]}"?`)) {
      updateStatusMutation.mutate({ status, tracking: trackingNumber });
    }
  };

  const handleUpdatePayment = (status: Order['paymentStatus']) => {
    if (confirm('Cập nhật trạng thái thanh toán?')) {
      updatePaymentMutation.mutate(status);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!orderData?.data) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p>Không tìm thấy đơn hàng!</p>
      </div>
    );
  }

  const order = orderData.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Quay lại
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Chi tiết đơn hàng #{order.orderNumber}
          </h1>
          <p className="mt-2 text-gray-600">
            Đặt ngày {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            In đơn hàng
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Sản phẩm ({order.items?.length || 0})
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 pb-4 border-b last:border-b-0">
                    <img
                      src={item.image || item.product?.images?.[0]?.url || '/placeholder.png'}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(item.price)} x {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.total)}
                      </p>
                      {item.discount > 0 && (
                        <p className="text-xs text-red-600">
                          Giảm {item.discount}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="text-gray-900">{formatCurrency(order.shippingFee)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Giảm giá</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Tổng cộng</span>
                  <span className="text-primary-600">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Địa chỉ giao hàng
            </h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
              <p className="text-gray-600">{order.shippingAddress.phone}</p>
              <p className="text-gray-600">
                {order.shippingAddress.address}, {order.shippingAddress.ward}
              </p>
              <p className="text-gray-600">
                {order.shippingAddress.district}, {order.shippingAddress.province}
              </p>
              {order.shippingAddress.instructions && (
                <p className="text-gray-500 italic mt-2">
                  Ghi chú: {order.shippingAddress.instructions}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Trạng thái đơn hàng
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái hiện tại
                </label>
                <select
                  value={order.orderStatus}
                  onChange={(e) => handleUpdateStatus(e.target.value as Order['orderStatus'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={order.orderStatus === 'delivered' || order.orderStatus === 'cancelled'}
                >
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="shipped">Đang giao hàng</option>
                  <option value="delivered">Đã giao hàng</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              {order.orderStatus === 'processing' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã vận đơn
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Nhập mã vận đơn"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={() => handleUpdateStatus('shipped')}
                    disabled={!trackingNumber}
                    className="mt-2 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                  >
                    Cập nhật giao hàng
                  </button>
                </div>
              )}

              {order.trackingNumber && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    Mã vận đơn: {order.trackingNumber}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Thanh toán
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Phương thức</p>
                <p className="font-medium">{PaymentMethodMap[order.paymentMethod]}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái thanh toán
                </label>
                <select
                  value={order.paymentStatus}
                  onChange={(e) => handleUpdatePayment(e.target.value as Order['paymentStatus'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="pending">Chờ thanh toán</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="failed">Thất bại</option>
                  <option value="refunded">Đã hoàn tiền</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin khách hàng
            </h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">{order.user?.name}</p>
              <p className="text-gray-600">{order.user?.email}</p>
              <p className="text-gray-600">{order.user?.phone}</p>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Ghi chú
              </h2>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

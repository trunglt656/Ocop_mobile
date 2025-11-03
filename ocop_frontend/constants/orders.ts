import { ApiError } from '@/services/apiClient';
import { Order } from '@/services/orderService';

export type OrderFilterKey = 'all' | Order['orderStatus'];

export interface OrderFilter {
  key: OrderFilterKey;
  label: string;
  icon: string;
}

export const ORDER_FILTERS: OrderFilter[] = [
  { key: 'all', label: 'Tất cả', icon: 'tray.fill' },
  { key: 'pending', label: 'Chờ xác nhận', icon: 'clock.badge.exclamationmark' },
  { key: 'confirmed', label: 'Đã xác nhận', icon: 'checkmark.circle' },
  { key: 'processing', label: 'Đang xử lý', icon: 'gearshape.2.fill' },
  { key: 'shipped', label: 'Đang giao', icon: 'shippingbox.fill' },
  { key: 'delivered', label: 'Đã giao', icon: 'hand.thumbsup.fill' },
  { key: 'cancelled', label: 'Đã hủy', icon: 'xmark.circle.fill' },
  { key: 'refunded', label: 'Hoàn tiền', icon: 'arrow.uturn.left.circle.fill' },
];

export const ORDER_STATUS_META: Record<
  Order['orderStatus'],
  { label: string; color: string; background: string }
> = {
  pending: { label: 'Chờ xác nhận', color: '#F59E0B', background: 'rgba(245, 158, 11, 0.12)' },
  confirmed: { label: 'Đã xác nhận', color: '#6366F1', background: 'rgba(99, 102, 241, 0.12)' },
  processing: { label: 'Đang xử lý', color: '#2563EB', background: 'rgba(37, 99, 235, 0.12)' },
  shipped: { label: 'Đang giao', color: '#0EA5E9', background: 'rgba(14, 165, 233, 0.12)' },
  delivered: { label: 'Đã giao', color: '#10B981', background: 'rgba(16, 185, 129, 0.12)' },
  cancelled: { label: 'Đã hủy', color: '#EF4444', background: 'rgba(239, 68, 68, 0.12)' },
  refunded: { label: 'Hoàn tiền', color: '#8B5CF6', background: 'rgba(139, 92, 246, 0.12)' },
};

export const FALLBACK_AVATAR = 'https://via.placeholder.com/120?text=User';
export const FALLBACK_PRODUCT = 'https://via.placeholder.com/64?text=OCOP';

export const formatCurrency = (value: number) =>
  `${Math.round(value).toLocaleString('vi-VN')} ₫`;

export const formatOrderDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Chưa xác định';
  }
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const getOrderStatusMeta = (status: Order['orderStatus']) =>
  ORDER_STATUS_META[status] || ORDER_STATUS_META.pending;

export const getOrderErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Không tải được đơn hàng. Vui lòng thử lại sau.';
};

'use client';

import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ProductTableProps {
  products: Product[];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  isLoading?: boolean;
}

export default function ProductTable({
  products,
  onDelete,
  onStatusChange,
  isLoading = false,
}: ProductTableProps) {
  const router = useRouter();

  // Debug logging
  console.log('🔍 ProductTable received products:', products?.length || 0);
  console.log('📦 Products data:', products);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      out_of_stock: 'bg-red-100 text-red-800',
      discontinued: 'bg-yellow-100 text-yellow-800',
    };
    
    const labels: Record<string, string> = {
      active: 'Đang bán',
      inactive: 'Không hoạt động',
      out_of_stock: 'Hết hàng',
      discontinued: 'Ngừng bán',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getOCOPBadge = (level: string) => {
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gold-100 text-gold-800">
        OCOP {level}
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

  if (products.length === 0) {
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
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <p className="mt-4 text-gray-500">Không có sản phẩm nào</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sản phẩm
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Giá
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tồn kho
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              OCOP
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Người tạo
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-200 animate-fadeIn">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    {product.images && product.images.length > 0 ? (
                      <img
                        className="h-10 w-10 rounded-lg object-cover"
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${product.images[0].url}`}
                        alt={product.name}
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/40?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <svg
                          className="h-6 w-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {product.name}
                    </div>
                    <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatCurrency(product.price)}
                </div>
                {product.discount > 0 && (
                  <div className="text-xs text-gray-500">
                    Giảm {product.discount}%
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{product.stock}</div>
                {product.stock <= product.minStock && (
                  <div className="text-xs text-red-600">Sắp hết hàng</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(product.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {product.isOCOP && getOCOPBadge(product.ocopLevel)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {typeof product.createdBy === 'object' && product.createdBy
                    ? product.createdBy.name
                    : 'Super Admin'}
                </div>
                {typeof product.createdBy === 'object' && product.createdBy && (
                  <div className="text-xs text-gray-500">
                    {product.createdBy.email}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => router.push(`/dashboard/products/${product._id}/edit`)}
                  className="text-primary-600 hover:text-primary-900 mr-4 transition-all duration-200 hover:underline hover:scale-105 inline-block"
                >
                  Sửa
                </button>
                <button
                  onClick={() => onDelete(product._id)}
                  className="text-red-600 hover:text-red-900 transition-all duration-200 hover:underline hover:scale-105 inline-block"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

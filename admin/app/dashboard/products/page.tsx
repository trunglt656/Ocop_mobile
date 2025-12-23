'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getProducts, deleteProduct } from '@/services/productService';
import { getCategories } from '@/services/categoryService';
import ProductTable from '@/components/products/ProductTable';
import ProductFilters from '@/components/products/ProductFilters';
import Pagination from '@/components/products/Pagination';

export default function ProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<any>({});
  const limit = 10;

  // Fetch products
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', currentPage, filters],
    queryFn: () => getProducts({ page: currentPage, limit, ...filters }),
  });

  // Debug logging
  console.log('🔍 Products page - productsData:', productsData);
  console.log('📦 Products count:', productsData?.data?.length || 0);

  // Fetch categories for filters
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      alert('Xóa sản phẩm thành công!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Xóa sản phẩm thất bại!');
    },
  });

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (isLoadingProducts) {
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
          <p className="mt-2 text-gray-600">
            Quản lý tất cả sản phẩm OCOP trong hệ thống
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/products/new')}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Tổng sản phẩm"
          value={productsData?.pagination?.total || 0}
          icon="box"
          color="blue"
        />
        <StatsCard
          title="Đang bán"
          value={
            productsData?.data?.filter((p) => p.status === 'active').length || 0
          }
          icon="check"
          color="green"
        />
        <StatsCard
          title="Hết hàng"
          value={productsData?.data?.filter((p) => p.stock === 0).length || 0}
          icon="alert"
          color="red"
        />
        <StatsCard
          title="OCOP"
          value={productsData?.data?.filter((p) => p.isOCOP).length || 0}
          icon="star"
          color="gold"
        />
      </div>

      {/* Filters */}
      <ProductFilters
        onFilterChange={handleFilterChange}
        categories={categoriesData?.data || []}
      />

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Danh sách sản phẩm
          </h2>
        </div>
        
        <ProductTable
          products={productsData?.data || []}
          onDelete={handleDelete}
          onStatusChange={(id, status) => {
            // TODO: Implement status change
            console.log('Change status', id, status);
          }}
          isLoading={false}
        />

        {/* Pagination */}
        {productsData?.pagination && (productsData.pagination.pages || 0) > 1 && (
          <Pagination
            currentPage={productsData.pagination.page}
            totalPages={productsData.pagination.pages}
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
    green: 'bg-green-500',
    red: 'bg-red-500',
    gold: 'bg-gold-500',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div
          className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center`}
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
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

interface ProductFiltersProps {
  onFilterChange: (filters: any) => void;
  categories: Array<{ _id: string; name: string }>;
}

export default function ProductFilters({ onFilterChange, categories }: ProductFiltersProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [isOCOP, setIsOCOP] = useState<boolean | undefined>(undefined);

  const handleApplyFilters = () => {
    onFilterChange({
      search: search || undefined,
      category: category || undefined,
      status: status || undefined,
      isOCOP,
    });
  };

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setStatus('');
    setIsOCOP(undefined);
    onFilterChange({});
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tìm kiếm
          </label>
          <input
            type="text"
            placeholder="Tên sản phẩm, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Danh mục
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Tất cả</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Tất cả</option>
            <option value="active">Đang bán</option>
            <option value="inactive">Không hoạt động</option>
            <option value="out_of_stock">Hết hàng</option>
            <option value="discontinued">Ngừng bán</option>
          </select>
        </div>

        {/* OCOP Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            OCOP
          </label>
          <select
            value={isOCOP === undefined ? '' : isOCOP.toString()}
            onChange={(e) =>
              setIsOCOP(e.target.value === '' ? undefined : e.target.value === 'true')
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Tất cả</option>
            <option value="true">Có chứng nhận</option>
            <option value="false">Không chứng nhận</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex space-x-3">
        <button
          onClick={handleApplyFilters}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          Áp dụng
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          Đặt lại
        </button>
      </div>
    </div>
  );
}

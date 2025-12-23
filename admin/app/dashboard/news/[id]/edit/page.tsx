'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { newsService } from '@/services/newsService';
import { NewsFormData } from '@/types/admin';

const categoryOptions = [
  { value: 'announcement', label: 'Thông báo' },
  { value: 'news', label: 'Tin tức' },
  { value: 'event', label: 'Sự kiện' },
  { value: 'promotion', label: 'Khuyến mãi' },
  { value: 'guide', label: 'Hướng dẫn' },
];

export default function EditNewsPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const newsId = params.id as string;
  
  const [formData, setFormData] = useState<NewsFormData>({
    title: '',
    content: '',
    summary: '',
    thumbnail: '',
    images: [],
    category: 'news',
    status: 'draft',
    isPinned: false,
    tags: [],
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: [],
    },
  });

  const [tagsInput, setTagsInput] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');

  const { data: newsData, isLoading } = useQuery({
    queryKey: ['news', newsId],
    queryFn: () => newsService.getById(newsId),
    enabled: !!newsId,
  });

  useEffect(() => {
    if (newsData?.data) {
      const news = newsData.data;
      setFormData({
        title: news.title,
        content: news.content,
        summary: news.summary || '',
        thumbnail: news.thumbnail || '',
        images: news.images || [],
        category: news.category,
        status: news.status,
        isPinned: news.isPinned,
        tags: news.tags || [],
        seo: news.seo || { metaTitle: '', metaDescription: '', keywords: [] },
      });
      setTagsInput(news.tags?.join(', ') || '');
      setKeywordsInput(news.seo?.keywords?.join(', ') || '');
    }
  }, [newsData]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<NewsFormData>) => newsService.update(newsId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['news', newsId] });
      alert('Cập nhật tin tức thành công!');
      router.push('/dashboard/news');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật tin tức');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề');
      return;
    }
    
    if (!formData.content.trim()) {
      alert('Vui lòng nhập nội dung');
      return;
    }

    const dataToSubmit = {
      ...formData,
      tags: tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [],
      seo: {
        ...formData.seo,
        keywords: keywordsInput ? keywordsInput.split(',').map(k => k.trim()).filter(Boolean) : [],
      },
    };

    await updateMutation.mutateAsync(dataToSubmit);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa tin tức</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Thông tin cơ bản</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Nhập tiêu đề tin tức..."
              maxLength={200}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.title.length}/200 ký tự
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tóm tắt
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              placeholder="Nhập tóm tắt ngắn gọn..."
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.summary?.length || 0}/500 ký tự
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
              rows={15}
              placeholder="Nhập nội dung tin tức (hỗ trợ HTML)..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="draft">Bản nháp</option>
                <option value="published">Xuất bản</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Nhập các tags, cách nhau bởi dấu phẩy"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Ghim tin tức (hiển thị đầu tiên)
              </span>
            </label>
          </div>
        </div>

        {/* Media */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Hình ảnh</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh thumbnail
            </label>
            <input
              type="url"
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
            {formData.thumbnail && (
              <div className="mt-2">
                <img
                  src={formData.thumbnail}
                  alt="Thumbnail preview"
                  className="w-full max-w-md h-48 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Invalid+Image';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">SEO Settings</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              value={formData.seo?.metaTitle}
              onChange={(e) => setFormData({
                ...formData,
                seo: { ...formData.seo, metaTitle: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Tiêu đề SEO"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              value={formData.seo?.metaDescription}
              onChange={(e) => setFormData({
                ...formData,
                seo: { ...formData.seo, metaDescription: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              placeholder="Mô tả SEO"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keywords
            </label>
            <input
              type="text"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Từ khóa SEO, cách nhau bởi dấu phẩy"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={updateMutation.isPending}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { newsService, News } from '@/services/newsService';
import { getImageUrl } from '@/utils/imageHelper';
import API_CONFIG from '@/constants/api';

const CATEGORY_LABELS: Record<string, string> = {
  announcement: 'Thông báo',
  news: 'Tin tức',
  event: 'Sự kiện',
  promotion: 'Khuyến mãi',
  guide: 'Hướng dẫn',
};

const CATEGORY_COLORS: Record<string, string> = {
  announcement: '#EF4444',
  news: '#3B82F6',
  event: '#8B5CF6',
  promotion: '#F59E0B',
  guide: '#10B981',
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [news, setNews] = useState<News[]>([]);
  const [featuredNews, setFeaturedNews] = useState<News[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { key: 'all', label: 'Tất cả' },
    { key: 'news', label: 'Tin tức' },
    { key: 'event', label: 'Sự kiện' },
    { key: 'promotion', label: 'Khuyến mãi' },
    { key: 'announcement', label: 'Thông báo' },
    { key: 'guide', label: 'Hướng dẫn' },
  ];

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const [newsResponse, featuredResponse] = await Promise.all([
        newsService.getNews({
          status: 'published',
          limit: 50,
          ...(selectedCategory !== 'all' && { category: selectedCategory }),
          ...(searchQuery && { search: searchQuery }),
        }),
        newsService.getFeaturedNews(),
      ]);

      const newsData = newsResponse?.data?.news || [];
      const featuredData = featuredResponse?.data?.news || [];
      
      setNews(newsData);
      setFeaturedNews(featuredData);
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews([]);
      setFeaturedNews([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNews();
    setRefreshing(false);
  };

  const handleNewsPress = (newsItem: News) => {
    router.push(`/news-detail?id=${newsItem._id}`);
  };

  const renderFeaturedItem = ({ item }: { item: News }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => handleNewsPress(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: getImageUrl(item.thumbnail) }}
        style={styles.featuredImage}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.featuredGradient} />
      <View style={styles.featuredContent}>
        <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_COLORS[item.category] }]}>
          <ThemedText style={styles.categoryBadgeText}>
            {CATEGORY_LABELS[item.category]}
          </ThemedText>
        </View>
        <ThemedText style={styles.featuredTitle} numberOfLines={2}>
          {item.title}
        </ThemedText>
        <View style={styles.featuredMeta}>
          <IconSymbol name="calendar" size={14} color="#FFF" />
          <ThemedText style={styles.featuredDate}>
            {formatDate(item.publishedAt || item.createdAt)}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderNewsItem = ({ item }: { item: News }) => (
      <TouchableOpacity
        style={styles.newsCard}
        onPress={() => handleNewsPress(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: getImageUrl(item.thumbnail) }}
          style={styles.newsImage}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.newsContent}>
          <View style={[styles.smallCategoryBadge, { backgroundColor: CATEGORY_COLORS[item.category] }]}>
            <ThemedText style={styles.smallCategoryText}>
              {CATEGORY_LABELS[item.category]}
            </ThemedText>
          </View>
          <ThemedText style={styles.newsTitle} numberOfLines={2}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.newsSummary} numberOfLines={2}>
            {item.summary}
          </ThemedText>
          <View style={styles.newsMeta}>
            <View style={styles.metaItem}>
              <IconSymbol name="calendar" size={12} color="#64748B" />
              <ThemedText style={styles.metaText}>
                {formatDate(item.publishedAt || item.createdAt)}
              </ThemedText>
            </View>
            <View style={styles.metaItem}>
              <IconSymbol name="eye" size={12} color="#64748B" />
              <ThemedText style={styles.metaText}>{item.viewCount || 0}</ThemedText>
            </View>
          </View>
        </View>
      </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <ThemedText style={styles.loadingText}>Đang tải tin tức...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={news}
        keyExtractor={(item) => item._id}
        renderItem={renderNewsItem}
        contentContainerStyle={[styles.listContent, { paddingTop: insets.top + 60 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <IconSymbol name="magnifyingglass" size={20} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm tin tức..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Categories */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesContainer}
              contentContainerStyle={styles.categoriesContent}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat.key && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.key)}
                >
                  <ThemedText
                    style={[
                      styles.categoryChipText,
                      selectedCategory === cat.key && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Featured News */}
            {featuredNews.length > 0 && (
              <View style={styles.featuredSection}>
                <ThemedText style={styles.sectionTitle}>Nổi bật</ThemedText>
                <FlatList
                  data={featuredNews}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item._id}
                  renderItem={renderFeaturedItem}
                  contentContainerStyle={styles.featuredList}
                />
              </View>
            )}

            <ThemedText style={styles.sectionTitle}>Tất cả tin tức</ThemedText>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="newspaper" size={64} color="#CBD5E1" />
            <ThemedText style={styles.emptyText}>Chưa có tin tức</ThemedText>
          </View>
        }
      />

      {/* Fixed Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <ThemedText style={styles.headerTitle}>Tin tức OCOP</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#0F172A',
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingRight: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFF',
  },
  featuredSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  featuredList: {
    paddingRight: 16,
  },
  featuredCard: {
    width: 280,
    height: 180,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 6,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredDate: {
    fontSize: 12,
    color: '#FFF',
    marginLeft: 4,
  },
  newsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  newsImage: {
    width: 120,
    height: 120,
  },
  newsContent: {
    flex: 1,
    padding: 12,
  },
  smallCategoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  smallCategoryText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  newsSummary: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 18,
  },
  newsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#94A3B8',
  },
});

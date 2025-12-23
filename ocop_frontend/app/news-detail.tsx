import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import RenderHTML from 'react-native-render-html';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { newsService, News } from '@/services/newsService';
import { getImageUrl } from '@/utils/imageHelper';

const { width } = Dimensions.get('window');

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
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function NewsDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const newsId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<News | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNewsDetail();
  }, [newsId]);

  const fetchNewsDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await newsService.getNewsById(newsId);
      console.log('News detail response:', response);
      setNews(response.data);
    } catch (err) {
      console.error('Error fetching news detail:', err);
      setError('Không thể tải tin tức');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Chi tiết tin tức' }} />
        <ActivityIndicator size="large" color="#3B82F6" />
        <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !news) {
    return (
      <ThemedView style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Lỗi' }} />
        <IconSymbol name="exclamationmark.triangle" size={64} color="#EF4444" />
        <ThemedText style={styles.errorText}>{error || 'Không tìm thấy tin tức'}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: news.title,
          headerShown: true,
          headerBackTitle: 'Quay lại',
        }}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Thumbnail Image */}
        {news.thumbnail && (
          <Image
            source={{ uri: getImageUrl(news.thumbnail) }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={300}
          />
        )}

        <View style={styles.content}>
          {/* Category Badge */}
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: CATEGORY_COLORS[news.category] },
            ]}
          >
            <ThemedText style={styles.categoryText}>
              {CATEGORY_LABELS[news.category]}
            </ThemedText>
          </View>

          {/* Title */}
          <ThemedText style={styles.title}>{news.title}</ThemedText>

          {/* Meta Info */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <IconSymbol name="person" size={16} color="#64748B" />
              <ThemedText style={styles.metaText}>
                {news.author?.name || 'Admin'}
              </ThemedText>
            </View>
            <View style={styles.metaItem}>
              <IconSymbol name="calendar" size={16} color="#64748B" />
              <ThemedText style={styles.metaText}>
                {formatDate(news.publishedAt || news.createdAt)}
              </ThemedText>
            </View>
            <View style={styles.metaItem}>
              <IconSymbol name="eye" size={16} color="#64748B" />
              <ThemedText style={styles.metaText}>{news.viewCount || 0} lượt xem</ThemedText>
            </View>
          </View>

          {/* Summary */}
          {news.summary && (
            <View style={styles.summaryContainer}>
              <ThemedText style={styles.summary}>{news.summary}</ThemedText>
            </View>
          )}

          {/* Content */}
          <View style={styles.htmlContainer}>
            <RenderHTML
              contentWidth={width - 32}
              source={{ html: news.content }}
              tagsStyles={{
                body: { color: '#1E293B', fontSize: 16, lineHeight: 24 },
                p: { marginBottom: 12, color: '#1E293B' },
                h1: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, color: '#0F172A' },
                h2: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#0F172A' },
                h3: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#0F172A' },
                h4: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#0F172A' },
                blockquote: {
                  borderLeftWidth: 4,
                  borderLeftColor: '#3B82F6',
                  paddingLeft: 16,
                  marginLeft: 0,
                  fontStyle: 'italic',
                  color: '#475569',
                },
                ul: { marginBottom: 12, paddingLeft: 20 },
                ol: { marginBottom: 12, paddingLeft: 20 },
                li: { marginBottom: 8, color: '#1E293B' },
              }}
            />
          </View>
        </View>
      </ScrollView>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
  },
  errorText: {
    marginTop: 12,
    color: '#EF4444',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  thumbnail: {
    width: '100%',
    height: 240,
    backgroundColor: '#E2E8F0',
  },
  content: {
    padding: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
    lineHeight: 32,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#64748B',
  },
  summaryContainer: {
    backgroundColor: '#F1F5F9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  summary: {
    fontSize: 16,
    fontWeight: '500',
    color: '#475569',
    lineHeight: 24,
  },
  htmlContainer: {
    marginTop: 8,
  },
});

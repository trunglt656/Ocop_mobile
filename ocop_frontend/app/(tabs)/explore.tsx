import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

type NewsArticle = {
  id: string;
  title: string;
  summary: string;
  image: string;
  category: string;
  publishedAt: string;
  author: string;
  readingTime: number;
  isFeatured?: boolean;
  tags?: string[];
};

type StatCard = {
  id: string;
  label: string;
  value: string;
  icon: string;
  color: string;
};

type TrendingTopic = {
  tag: string;
  count: number;
};

const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'ocop-launch',
    title: 'Su kien OCOP Dong Nai 2025 thu hut hon 5.000 luot tham quan',
    summary:
      'Gian hang OCOP tai trung tam thuong mai Bien Hoa trinh dien hang chuc san pham nong nghiep, goi y mua sam Tet va cac chuong trinh khuyen mai hap dan.',
    image:
      'https://images.unsplash.com/photo-1455849318743-b2233052fcff?auto=format&fit=crop&w=1080&q=80',
    category: 'Su kien',
    publishedAt: '2025-02-21T04:30:00.000Z',
    author: 'Ban bien tap',
    readingTime: 4,
    isFeatured: true,
    tags: ['Su kien', 'Trien lam', 'OCOP'],
  },
  {
    id: 'organic-tea',
    title: 'Tra huu co OCOP len ke sieu thi, mo co hoi cho nong dan Tan Phu',
    summary:
      'San pham tra huu co OCOP da duoc cac sieu thi tai Bien Hoa, Ho Chi Minh va Da Nang ky ket phan phoi, mo rong dau ra ben vung cho nong dan.',
    image:
      'https://images.unsplash.com/photo-1515824955341-43172b000fea?auto=format&fit=crop&w=1080&q=80',
    category: 'Nong nghiep',
    publishedAt: '2025-02-18T08:00:00.000Z',
    author: 'Ngoc Hanh',
    readingTime: 5,
    tags: ['Nong nghiep', 'Huong chuan'],
  },
  {
    id: 'startup-story',
    title: 'Cau chuyen khoi nghiep tu dac san mut du du cua 9x Tai Son',
    summary:
      'Thanh cong cua thuong hieu mut du du Tai Son la minh chung cho viec doi moi dong goi va ke chuyen thuong hieu giup san pham OCOP tro nen thu hut.',
    image:
      'https://images.unsplash.com/photo-1542831371-d531d36971e6?auto=format&fit=crop&w=1080&q=80',
    category: 'Khoi nghiep',
    publishedAt: '2025-02-16T06:15:00.000Z',
    author: 'Thanh Long',
    readingTime: 6,
    tags: ['Khoi nghiep', 'Cau chuyen'],
  },
  {
    id: 'export-lesson',
    title: 'Bai hoc xuat khau san pham OCOP sang thi truong Han Quoc',
    summary:
      'Doanh nghiep OCOP Dong Nai chia se kinh nghiem dap ung tieu chuan chat luong va nghiep vu xuat khau khi lam viec voi doi tac Han Quoc.',
    image:
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1080&q=80',
    category: 'Thi truong',
    publishedAt: '2025-02-12T03:45:00.000Z',
    author: 'Minh Tri',
    readingTime: 7,
    tags: ['Thi truong', 'Xuat khau'],
  },
  {
    id: 'tourism-route',
    title: 'Dong Nai khai truong tuyen du lich trai nghiem ket hop san pham OCOP',
    summary:
      'Tour trai nghiem moi dua du khach tham quan farm trai cay, lang nghe va cac gian hang OCOP tai Vinh Cuu va Thong Nhat.',
    image:
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1080&q=80',
    category: 'Du lich',
    publishedAt: '2025-02-10T10:20:00.000Z',
    author: 'Quynh Nhi',
    readingTime: 5,
    tags: ['Du lich', 'Trai nghiem'],
  },
  {
    id: 'digital-transformation',
    title: 'Chuyen doi so giup doanh nghiep OCOP toi uu chuoi cung ung',
    summary:
      'Ung dung phan mem quan ly kho va ban le giup doanh nghiep OCOP giam ton kho, tang hieu qua van hanh trong mua Tet.',
    image:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1080&q=80',
    category: 'Cong nghe',
    publishedAt: '2025-02-08T09:05:00.000Z',
    author: 'Anh Duong',
    readingTime: 4,
    tags: ['Cong nghe', 'Chuyen doi so'],
  },
];

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Dang cap nhat';
  }
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const readingTimeLabel = (minutes: number) => `${minutes} phut doc`;

const sortByPublishedDate = (articles: NewsArticle[]) =>
  [...articles].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tat ca');
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const allCategories = useMemo(() => {
    const unique = Array.from(new Set(NEWS_ARTICLES.map(article => article.category))).sort();
    return ['Tat ca', ...unique];
  }, []);

  const filteredArticles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return NEWS_ARTICLES.filter(article => {
      const matchesCategory =
        selectedCategory === 'Tat ca' || article.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!query) return true;

      const haystack = [
        article.title,
        article.summary,
        article.author,
        ...(article.tags ?? []),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [selectedCategory, searchQuery]);

  const featuredArticle = useMemo(() => {
    if (!filteredArticles.length) return null;
    const priority = filteredArticles.find(article => article.isFeatured);
    return priority ?? sortByPublishedDate(filteredArticles)[0];
  }, [filteredArticles]);

  const regularArticles = useMemo(() => {
    if (!featuredArticle) return filteredArticles;
    return filteredArticles.filter(article => article.id !== featuredArticle.id);
  }, [filteredArticles, featuredArticle]);

  const statsCards = useMemo<StatCard[]>(() => {
    const totalArticles = filteredArticles.length;
    const savedCount = savedArticles.length;
    const tagSet = new Set<string>();
    NEWS_ARTICLES.forEach(article => article.tags?.forEach(tag => tagSet.add(tag)));
    const latestArticle = sortByPublishedDate(NEWS_ARTICLES)[0];

    return [
      {
        id: 'total',
        label: 'Tong tin',
        value: String(totalArticles),
        icon: 'doc.text.fill',
        color: '#2563EB',
      },
      {
        id: 'saved',
        label: 'Da luu',
        value: String(savedCount),
        icon: 'bookmark.fill',
        color: '#F97316',
      },
      {
        id: 'topics',
        label: 'Chu de',
        value: String(tagSet.size),
        icon: 'tag.fill',
        color: '#10B981',
      },
      {
        id: 'updated',
        label: 'Cap nhat',
        value: formatDate(latestArticle?.publishedAt ?? ''),
        icon: 'clock.fill',
        color: '#6366F1',
      },
    ];
  }, [filteredArticles.length, savedArticles.length]);

  const trendingTopics = useMemo<TrendingTopic[]>(() => {
    const counter: Record<string, number> = {};
    filteredArticles.forEach(article =>
      article.tags?.forEach(tag => {
        counter[tag] = (counter[tag] ?? 0) + 1;
      })
    );
    return Object.entries(counter)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag, count]) => ({ tag, count }));
  }, [filteredArticles]);

  const highlightArticles = useMemo(() => sortByPublishedDate(regularArticles).slice(0, 3), [
    regularArticles,
  ]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const toggleSaveArticle = useCallback(
    (articleId: string) => {
      setSavedArticles(current =>
        current.includes(articleId)
          ? current.filter(id => id !== articleId)
          : [...current, articleId]
      );
    },
    [setSavedArticles]
  );

  const openArticle = useCallback((article: NewsArticle) => {
    Alert.alert('Tin tuc', `${article.title}\n\nNoi dung chi tiet se duoc cap nhat trong phien ban tiep theo.`);
  }, []);

  const handleSelectTag = useCallback((tag: string) => {
    setSearchQuery(tag);
  }, []);

  const renderArticle = ({ item }: { item: NewsArticle }) => {
    const isSaved = savedArticles.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.articleCard}
        activeOpacity={0.9}
        onPress={() => openArticle(item)}
      >
        <Image source={{ uri: item.image }} style={styles.articleImage} contentFit="cover" />
        <View style={styles.articleContent}>
          <View style={styles.articleHeader}>
            <View style={styles.articleCategory}>
              <IconSymbol name="tag.fill" size={12} color="#1D4ED8" />
              <ThemedText style={styles.articleCategoryText}>{item.category}</ThemedText>
            </View>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => toggleSaveArticle(item.id)}
            >
              <IconSymbol
                name={isSaved ? 'bookmark.fill' : 'bookmark'}
                size={16}
                color={isSaved ? '#F97316' : '#94A3B8'}
              />
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.articleTitle} numberOfLines={2}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.articleSummary} numberOfLines={2}>
            {item.summary}
          </ThemedText>
          <View style={styles.articleMetaRow}>
            <View style={styles.metaGroup}>
              <IconSymbol name="calendar" size={12} color="#64748B" />
              <ThemedText style={styles.articleMetaText}>{formatDate(item.publishedAt)}</ThemedText>
            </View>
            <View style={styles.metaGroup}>
              <IconSymbol name="clock" size={12} color="#64748B" />
              <ThemedText style={styles.articleMetaText}>
                {readingTimeLabel(item.readingTime)}
              </ThemedText>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const listHeader = () => (
    <View style={[styles.headerContainer, { paddingTop: insets.top + 12 }]}>
      <View style={styles.pageHeading}>
        <View style={styles.pageHeadingIcon}>
          <IconSymbol name="newspaper.fill" size={18} color="#2563EB" />
        </View>
        <View>
          <ThemedText type="title" style={styles.pageTitle}>
            Tin tuc
          </ThemedText>
          <ThemedText style={styles.pageSubtitle}>
            Cap nhat cau chuyen, su kien va goc nhin ve chuong trinh OCOP Dong Nai.
          </ThemedText>
        </View>
      </View>

      <View style={styles.searchBar}>
        <IconSymbol name="magnifyingglass" size={16} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tim kiem tu khoa, tac gia, the..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={18} color="#94A3B8" />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollChips
        categories={allCategories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <StatsRow cards={statsCards} />

      {trendingTopics.length ? (
        <TrendingTopics topics={trendingTopics} onSelectTag={handleSelectTag} />
      ) : null}

      {featuredArticle ? (
        <TouchableOpacity
          style={styles.featuredCard}
          activeOpacity={0.92}
          onPress={() => openArticle(featuredArticle)}
        >
          <Image
            source={{ uri: featuredArticle.image }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
          />
          <View style={styles.featuredOverlay} />
          <View style={styles.featuredContent}>
            <View style={styles.featuredTag}>
              <IconSymbol name="bolt.fill" size={14} color="#F97316" />
              <ThemedText style={styles.featuredTagText}>Noi bat</ThemedText>
            </View>
            <ThemedText style={styles.featuredTitle} numberOfLines={3}>
              {featuredArticle.title}
            </ThemedText>
            <ThemedText style={styles.featuredSummary} numberOfLines={2}>
              {featuredArticle.summary}
            </ThemedText>
            <View style={styles.featuredMeta}>
              <View style={styles.metaGroup}>
                <IconSymbol name="person.fill" size={14} color="#E2E8F0" />
                <ThemedText style={styles.featuredMetaText}>
                  {featuredArticle.author}
                </ThemedText>
              </View>
              <View style={styles.metaGroup}>
                <IconSymbol name="clock" size={14} color="#E2E8F0" />
                <ThemedText style={styles.featuredMetaText}>
                  {readingTimeLabel(featuredArticle.readingTime)}
                </ThemedText>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ) : null}

      {highlightArticles.length ? (
        <HighlightsList articles={highlightArticles} onPressArticle={openArticle} />
      ) : null}

      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Ban tin moi</ThemedText>
        <ThemedText style={styles.sectionCount}>
          {regularArticles.length} bai viet
        </ThemedText>
      </View>
    </View>
  );

  if (!NEWS_ARTICLES.length) {
    return (
      <ThemedView style={styles.centerScreen}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>Dang cap nhat tin tuc...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={regularArticles}
        keyExtractor={item => item.id}
        renderItem={renderArticle}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 24,
        }}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <IconSymbol name="doc.text.magnifyingglass" size={32} color="#94A3B8" />
            <ThemedText style={styles.emptyTitle}>Khong co bai viet phu hop</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Thu thay doi tu khoa hoac chon danh muc khac de xem nhieu tin hon.
            </ThemedText>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />
        }
      />
    </ThemedView>
  );
}

type ScrollChipsProps = {
  categories: string[];
  selected: string;
  onSelect: (value: string) => void;
};

const ScrollChips = ({ categories, selected, onSelect }: ScrollChipsProps) => (
  <View style={styles.chipScroll}>
    <FlatList
      data={categories}
      keyExtractor={item => item}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
      renderItem={({ item }) => {
        const isActive = item === selected;
        return (
          <TouchableOpacity
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelect(item)}
          >
            <IconSymbol
              name={isActive ? 'checkmark.circle.fill' : 'circle'}
              size={14}
              color={isActive ? '#fff' : '#475569'}
            />
            <ThemedText style={[styles.chipText, isActive && styles.chipTextActive]}>
              {item}
            </ThemedText>
          </TouchableOpacity>
        );
      }}
    />
  </View>
);

type StatsRowProps = {
  cards: StatCard[];
};

const StatsRow = ({ cards }: StatsRowProps) => (
  <View style={styles.statsRow}>
    {cards.map(card => (
      <View key={card.id} style={styles.statCard}>
        <View style={[styles.statIconWrap, { backgroundColor: `${card.color}1A` }]}>
          <IconSymbol name={card.icon} size={16} color={card.color} />
        </View>
        <ThemedText style={styles.statLabel}>{card.label}</ThemedText>
        <ThemedText style={styles.statValue}>{card.value}</ThemedText>
      </View>
    ))}
  </View>
);

type TrendingTopicsProps = {
  topics: TrendingTopic[];
  onSelectTag: (tag: string) => void;
};

const TrendingTopics = ({ topics, onSelectTag }: TrendingTopicsProps) => (
  <View style={styles.trendingSection}>
    <View style={styles.trendingHeader}>
      <View style={styles.metaGroup}>
        <IconSymbol name="flame.fill" size={16} color="#F97316" />
        <ThemedText style={styles.trendingTitle}>The noi bat</ThemedText>
      </View>
      <ThemedText style={styles.trendingSubtitle}>Chon nhanh de loc tin</ThemedText>
    </View>
    <FlatList
      data={topics}
      keyExtractor={item => item.tag}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.trendingList}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.trendingChip}
          onPress={() => onSelectTag(item.tag)}
        >
          <IconSymbol name="number.circle.fill" size={14} color="#9333EA" />
          <ThemedText style={styles.trendingChipText}>
            {item.tag} ({item.count})
          </ThemedText>
        </TouchableOpacity>
      )}
    />
  </View>
);

type HighlightsListProps = {
  articles: NewsArticle[];
  onPressArticle: (article: NewsArticle) => void;
};

const HighlightsList = ({ articles, onPressArticle }: HighlightsListProps) => (
  <View style={styles.highlightSection}>
    <View style={styles.sectionHeader}>
      <View style={styles.metaGroup}>
        <IconSymbol name="sparkles" size={18} color="#8B5CF6" />
        <ThemedText style={styles.sectionTitle}>Goi y cho ban</ThemedText>
      </View>
    </View>
    <View style={styles.highlightRow}>
      {articles.map(article => (
        <TouchableOpacity
          key={article.id}
          style={styles.highlightCard}
          onPress={() => onPressArticle(article)}
          activeOpacity={0.9}
        >
          <Image source={{ uri: article.image }} style={styles.highlightImage} contentFit="cover" />
          <View style={styles.highlightContent}>
            <ThemedText style={styles.highlightCategory}>{article.category}</ThemedText>
            <ThemedText style={styles.highlightTitle} numberOfLines={2}>
              {article.title}
            </ThemedText>
            <View style={styles.metaGroup}>
              <IconSymbol name="clock" size={12} color="#A855F7" />
              <ThemedText style={styles.highlightMeta}>
                {readingTimeLabel(article.readingTime)}
              </ThemedText>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  loadingText: {
    fontSize: 14,
    color: '#475569',
    fontFamily: 'Poppins-Regular',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 20,
  },
  pageHeading: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  pageHeadingIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: 26,
    fontFamily: 'Poppins-Bold',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
    maxWidth: 300,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#0F172A',
  },
  chipScroll: {
    marginHorizontal: -20,
  },
  chipRow: {
    paddingHorizontal: 20,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipActive: {
    backgroundColor: '#0F172A',
  },
  chipText: {
    fontSize: 13,
    color: '#475569',
    fontFamily: 'Poppins-SemiBold',
  },
  chipTextActive: {
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
  },
  statValue: {
    fontSize: 20,
    color: '#0F172A',
    fontFamily: 'Poppins-Bold',
  },
  trendingSection: {
    gap: 12,
  },
  trendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendingTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  trendingSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  trendingList: {
    gap: 10,
  },
  trendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  trendingChipText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#6B21A8',
  },
  featuredCard: {
    height: 240,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  featuredContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    gap: 10,
  },
  featuredTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(249, 115, 22, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  featuredTagText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#FBBF24',
  },
  featuredTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  featuredSummary: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#E2E8F0',
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  featuredMetaText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#E2E8F0',
  },
  highlightSection: {
    gap: 12,
  },
  highlightRow: {
    flexDirection: 'row',
    gap: 12,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  highlightImage: {
    width: '100%',
    height: 90,
  },
  highlightContent: {
    padding: 12,
    gap: 8,
  },
  highlightCategory: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#6366F1',
  },
  highlightTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  highlightMeta: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#7C3AED',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  sectionCount: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  articleImage: {
    width: 120,
    height: '100%',
  },
  articleContent: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  articleCategoryText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D4ED8',
  },
  saveButton: {
    padding: 6,
  },
  articleTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  articleSummary: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#475569',
  },
  articleMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  articleMetaText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  separator: {
    height: 16,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    gap: 10,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
});

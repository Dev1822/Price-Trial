import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import TrendingChips from '../components/TrendingChips';
import FilterSortBar from '../components/FilterSortBar';
import OfferCard from '../components/OfferCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { useTheme } from '../theme/ThemeContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

const DEFAULT_TRENDING = [
  { id: '1', title: 'iPhone 15', query: 'iphone 15' },
  { id: '2', title: 'MacBook Air M3 16GB', query: 'macbook air m3 16gb' },
  { id: '3', title: 'Sony WH-1000XM5', query: 'sony wh 1000xm5' },
  { id: '4', title: 'Samsung Galaxy S24', query: 'samsung galaxy s24' },
  { id: '5', title: 'iPhone 15 charger', query: 'iphone 15 charger' },
  { id: '6', title: 'iPhone 15 cover', query: 'iphone 15 cover' }
];

export default function HomeScreen() {
  const { theme, spacing, radii, typography } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [trendingItems, setTrendingItems] = useState(DEFAULT_TRENDING);
  const [resultData, setResultData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Filters & Sorting state
  const [selectedPlatform, setSelectedPlatform] = useState('ALL');
  const [sortBy, setSortBy] = useState('PRICE_ASC');

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/trending`);
      const json = await res.json();
      if (json?.data && Array.isArray(json.data)) {
        setTrendingItems(json.data);
      }
    } catch (e) {
      setTrendingItems(DEFAULT_TRENDING);
    }
  };

  const handleSearch = async (queryToSearch) => {
    const q = queryToSearch !== undefined ? queryToSearch : searchQuery;
    if (!q || !q.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    const cleanQuery = q.trim();
    setActiveQuery(cleanQuery);
    setSearchQuery(cleanQuery);

    try {
      const res = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(cleanQuery)}`);
      const json = await res.json();
      if (json && json.success) {
        setResultData(json.data);
      } else {
        setErrorMessage(json.error || 'Failed to scrape prices');
      }
    } catch (err) {
      setErrorMessage('Unable to connect to the server. Please check your internet connection.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    if (activeQuery) {
      handleSearch(activeQuery);
    } else {
      initApp();
      setIsRefreshing(false);
    }
  };

  // Get all offers and compute savings vs next cheapest offer
  const allOffers = resultData?.results || resultData?.allDeals || [];

  // Compute savings strictly against next cheapest offer
  const sortedOverall = [...allOffers].filter(o => o.price > 0).sort((a, b) => a.price - b.price);
  const lowestOverall = sortedOverall[0] || null;
  let savingsVsNextText = null;

  if (lowestOverall && sortedOverall.length > 1) {
    const nextCheapest = sortedOverall.find(o => o.price > lowestOverall.price);
    if (nextCheapest) {
      const diff = nextCheapest.price - lowestOverall.price;
      if (diff >= 1) {
        savingsVsNextText = `₹${diff.toLocaleString('en-IN')} less than ${nextCheapest.platform}`;
      }
    }
  }

  // Filter & Sort listings for display
  const getFilteredOffers = () => {
    let filtered = [...allOffers];

    // Filter by platform
    if (selectedPlatform !== 'ALL') {
      filtered = filtered.filter(
        item => item.platform?.toUpperCase() === selectedPlatform.toUpperCase()
      );
    }

    // Sort by user preference
    if (sortBy === 'PRICE_ASC') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'PRICE_DESC') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'DISCOUNT_DESC') {
      filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    } else if (sortBy === 'RATING_DESC') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return filtered;
  };

  const displayOffers = getFilteredOffers();
  const hasSearched = Boolean(activeQuery && resultData);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* Top Header */}
      <Header />

      {/* Integrated Search Input */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmit={() => handleSearch(searchQuery)}
        onClear={() => setSearchQuery('')}
        isLoading={isLoading}
      />

      {/* Trending Search Chips (Hidden once a search has been executed) */}
      <TrendingChips
        trendingItems={trendingItems}
        onSelect={(query) => handleSearch(query)}
        visible={!hasSearched && !isLoading}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.accent}
            colors={[theme.colors.accent]}
          />
        }
      >
        {/* Loading Skeleton */}
        {isLoading && <SkeletonLoader count={4} />}

        {/* Inline Error Notice */}
        {errorMessage && !isLoading && (
          <View
            style={[
              styles.errorCard,
              {
                backgroundColor: theme.colors.dangerBg,
                borderColor: theme.colors.dangerBorder,
                borderRadius: radii.md
              }
            ]}
          >
            <View style={styles.errorHeader}>
              <Ionicons name="alert-circle-outline" size={18} color={theme.colors.danger} />
              <Text style={[styles.errorTitle, { color: theme.colors.danger, fontSize: typography.fontSizes.sm }]}>
                Scraping Request Incomplete
              </Text>
            </View>
            <Text style={[styles.errorDesc, { color: theme.colors.textSecondary, fontSize: typography.fontSizes.sm }]}>
              {errorMessage}
            </Text>
            <TouchableOpacity
              style={[
                styles.retryBtn,
                {
                  borderColor: theme.colors.dangerBorder,
                  borderRadius: radii.xs,
                  backgroundColor: theme.colors.surface
                }
              ]}
              onPress={() => handleSearch(activeQuery || searchQuery)}
              accessibilityRole="button"
            >
              <Ionicons name="refresh-outline" size={14} color={theme.colors.danger} />
              <Text style={[styles.retryText, { color: theme.colors.danger, fontSize: typography.fontSizes.xs }]}>
                Retry Search
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search Results */}
        {resultData && !isLoading && (
          <>
            {/* Results Summary Bar */}
            <View style={[styles.resultsMetaBar, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.resultsCountText, { color: theme.colors.textPrimary, fontSize: typography.fontSizes.base }]}>
                {displayOffers.length} {displayOffers.length === 1 ? 'offer' : 'offers'} for "{resultData.query}"
              </Text>
            </View>

            {/* Segmented Platform Filter & Sort Bar */}
            <FilterSortBar
              selectedPlatform={selectedPlatform}
              onSelectPlatform={setSelectedPlatform}
              sortBy={sortBy}
              onSelectSort={setSortBy}
              totalResults={displayOffers.length}
            />

            {/* Unified Offer List (Best deal on top, followed by other offers) */}
            <View style={styles.offersList}>
              {displayOffers.length === 0 ? (
                <View style={[styles.noPlatformMatch, { backgroundColor: theme.colors.surface, borderRadius: radii.md, borderColor: theme.colors.border }]}>
                  <Text style={[styles.noMatchText, { color: theme.colors.textSecondary, fontSize: typography.fontSizes.sm }]}>
                    No matching offers found on {selectedPlatform}.
                  </Text>
                  <TouchableOpacity
                    style={[styles.resetFilterBtn, { borderColor: theme.colors.border, borderRadius: radii.xs }]}
                    onPress={() => setSelectedPlatform('ALL')}
                  >
                    <Text style={[styles.resetFilterText, { color: theme.colors.accent, fontSize: typography.fontSizes.xs }]}>
                      Show all stores
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                displayOffers.map((item, index) => {
                  const isTopDeal = (index === 0 && sortBy === 'PRICE_ASC' && selectedPlatform === 'ALL');
                  return (
                    <OfferCard
                      key={item.id || `offer-${index}`}
                      item={item}
                      isLowestPrice={isTopDeal}
                      savingsVsNext={isTopDeal ? savingsVsNextText : null}
                    />
                  );
                })
              )}
            </View>
          </>
        )}

        {/* Empty State when no search active */}
        {!resultData && !isLoading && !errorMessage && (
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconWrapper,
                {
                  backgroundColor: theme.colors.surfaceSubtle,
                  borderColor: theme.colors.border,
                  borderRadius: radii.full
                }
              ]}
            >
              <Ionicons name="search-outline" size={32} color={theme.colors.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary, fontSize: typography.fontSizes.lg }]}>
              Compare Live Prices
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textMuted, fontSize: typography.fontSizes.sm }]}>
              Search for any electronics, phone, laptop or accessories. PriceTrail checks Amazon, Flipkart and Snapdeal concurrently to surface the best available price.
            </Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  errorCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 14,
    borderWidth: 1
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  errorTitle: {
    fontWeight: '600'
  },
  errorDesc: {
    lineHeight: 18,
    marginBottom: 10
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
    minHeight: 36
  },
  retryText: {
    fontWeight: '600'
  },
  resultsMetaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  resultsCountText: {
    fontWeight: '600',
    letterSpacing: -0.2
  },
  offersList: {
    paddingVertical: 12
  },
  noPlatformMatch: {
    marginHorizontal: 16,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },
  noMatchText: {
    textAlign: 'center'
  },
  resetFilterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1
  },
  resetFilterText: {
    fontWeight: '600'
  },
  emptyContainer: {
    paddingHorizontal: 32,
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyIconWrapper: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 16
  },
  emptyTitle: {
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.2
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 20
  }
});

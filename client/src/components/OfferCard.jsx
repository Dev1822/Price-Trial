import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function OfferCard({
  item,
  isLowestPrice = false,
  savingsVsNext = null
}) {
  const { theme, spacing, radii, typography } = useTheme();

  if (!item) return null;

  const handleOpenStore = () => {
    if (item.link) {
      Linking.openURL(item.link);
    }
  };

  const getPlatformDotColor = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'amazon':
        return theme.colors.platforms.amazon;
      case 'flipkart':
        return theme.colors.platforms.flipkart;
      case 'snapdeal':
        return theme.colors.platforms.snapdeal;
      default:
        return theme.colors.accent;
    }
  };

  const brandDotColor = getPlatformDotColor(item.platform);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: isLowestPrice ? theme.colors.borderStrong : theme.colors.border,
          borderRadius: radii.lg
        },
        isLowestPrice ? theme.shadows.card : theme.shadows.subtle
      ]}
    >
      {/* Top Meta Header: Lowest Price & Savings vs Next Store */}
      {isLowestPrice && (
        <View style={[styles.topBanner, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surfaceSubtle }]}>
          <View style={styles.topBannerLeft}>
            <Text style={[styles.lowestPriceLabel, { color: theme.colors.accent, fontSize: typography.fontSizes.xs }]}>
              Lowest price
            </Text>
            {savingsVsNext ? (
              <Text style={[styles.savingsVsNextText, { color: theme.colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
                · {savingsVsNext}
              </Text>
            ) : null}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.cardContent}
        onPress={handleOpenStore}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`View ${item.title} on ${item.platform} for ${item.formattedPrice || item.price}`}
      >
        {/* Product Thumbnail */}
        <View style={[styles.imageContainer, { borderColor: theme.colors.border, borderRadius: radii.md }]}>
          <Image
            source={{ uri: item.image || 'https://via.placeholder.com/120' }}
            style={styles.thumbnail}
            resizeMode="contain"
          />
        </View>

        {/* Product Information */}
        <View style={styles.body}>
          {/* Store Name with Small Neutral Brand Dot */}
          <View style={styles.storeHeader}>
            <View style={[styles.storeDot, { backgroundColor: brandDotColor }]} />
            <Text style={[styles.storeName, { color: theme.colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
              {item.platform}
            </Text>

            {item.rating ? (
              <View style={styles.ratingBox}>
                <Ionicons name="star" size={11} color="#f59e0b" />
                <Text style={[styles.ratingText, { color: theme.colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
                  {item.rating}
                </Text>
              </View>
            ) : null}
          </View>

          {/* 2-Line Product Title */}
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.textPrimary,
                fontSize: isLowestPrice ? typography.fontSizes.base : typography.fontSizes.sm
              }
            ]}
            numberOfLines={2}
          >
            {item.title}
          </Text>

          {/* Pricing Row: Tabular numeral, largest element */}
          <View style={styles.priceRow}>
            <Text
              style={[
                styles.priceText,
                typography.tabularNums,
                {
                  color: isLowestPrice ? theme.colors.accent : theme.colors.textPrimary,
                  fontSize: isLowestPrice ? typography.fontSizes.priceLg : typography.fontSizes.priceMd
                }
              ]}
            >
              {item.formattedPrice || `₹${Number(item.price).toLocaleString('en-IN')}`}
            </Text>

            {item.originalPrice && item.originalPrice > item.price ? (
              <>
                <Text
                  style={[
                    styles.strikethroughPrice,
                    typography.tabularNums,
                    { color: theme.colors.textMuted, fontSize: typography.fontSizes.sm }
                  ]}
                >
                  {item.formattedOriginalPrice || `₹${Number(item.originalPrice).toLocaleString('en-IN')}`}
                </Text>
                {item.discount > 0 && (
                  <Text style={[styles.discountText, { color: theme.colors.success, fontSize: typography.fontSizes.xs }]}>
                    {item.discount}% off
                  </Text>
                )}
              </>
            ) : null}
          </View>

          {/* Secondary Muted Line: Delivery/Seller info (never truncated) */}
          {item.badge ? (
            <Text style={[styles.metaText, { color: theme.colors.textMuted, fontSize: typography.fontSizes.xs }]}>
              {item.badge}
            </Text>
          ) : null}
        </View>

        {/* Utilitarian "View" Action Button */}
        <View style={styles.actionColumn}>
          <TouchableOpacity
            style={[
              styles.viewBtn,
              {
                backgroundColor: isLowestPrice ? theme.colors.accent : theme.colors.surfaceSubtle,
                borderColor: isLowestPrice ? theme.colors.accent : theme.colors.border,
                borderRadius: radii.sm
              }
            ]}
            onPress={handleOpenStore}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.viewBtnText,
                {
                  color: isLowestPrice ? theme.colors.textInverse : theme.colors.textPrimary,
                  fontSize: typography.fontSizes.sm
                }
              ]}
            >
              View
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    overflow: 'hidden'
  },
  topBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  topBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  lowestPriceLabel: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4
  },
  savingsVsNextText: {
    fontWeight: '500'
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12
  },
  imageContainer: {
    width: 76,
    height: 76,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4
  },
  thumbnail: {
    width: '100%',
    height: '100%'
  },
  body: {
    flex: 1,
    justifyContent: 'center'
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3
  },
  storeDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  storeName: {
    fontWeight: '600',
    letterSpacing: -0.1
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 6
  },
  ratingText: {
    fontWeight: '500'
  },
  title: {
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 4
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 2
  },
  priceText: {
    fontWeight: '700'
  },
  strikethroughPrice: {
    textDecorationLine: 'line-through',
    fontWeight: '400'
  },
  discountText: {
    fontWeight: '600'
  },
  metaText: {
    fontWeight: '400',
    marginTop: 1
  },
  actionColumn: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  viewBtn: {
    minWidth: 54,
    height: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  viewBtnText: {
    fontWeight: '600'
  }
});

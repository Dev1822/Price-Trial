import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function SkeletonLoader({ count = 4 }) {
  const { theme, radii } = useTheme();
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 750,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true
        })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: radii.lg
            }
          ]}
        >
          {/* Skeleton Thumbnail */}
          <Animated.View
            style={[
              styles.imageSkeleton,
              {
                backgroundColor: theme.colors.surfaceSubtle,
                borderRadius: radii.md,
                opacity: opacityAnim
              }
            ]}
          />

          {/* Skeleton Content */}
          <View style={styles.contentSkeleton}>
            {/* Store and Rating line */}
            <Animated.View
              style={[
                styles.lineSm,
                {
                  backgroundColor: theme.colors.surfaceSubtle,
                  borderRadius: radii.xs,
                  opacity: opacityAnim
                }
              ]}
            />
            {/* Title Line 1 */}
            <Animated.View
              style={[
                styles.lineLg,
                {
                  backgroundColor: theme.colors.surfaceSubtle,
                  borderRadius: radii.xs,
                  opacity: opacityAnim
                }
              ]}
            />
            {/* Title Line 2 */}
            <Animated.View
              style={[
                styles.lineMd,
                {
                  backgroundColor: theme.colors.surfaceSubtle,
                  borderRadius: radii.xs,
                  opacity: opacityAnim
                }
              ]}
            />
            {/* Price Line */}
            <Animated.View
              style={[
                styles.priceLine,
                {
                  backgroundColor: theme.colors.surfaceSubtle,
                  borderRadius: radii.xs,
                  opacity: opacityAnim
                }
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderWidth: 1,
    gap: 12
  },
  imageSkeleton: {
    width: 76,
    height: 76
  },
  contentSkeleton: {
    flex: 1,
    gap: 8
  },
  lineSm: {
    width: '35%',
    height: 10
  },
  lineLg: {
    width: '90%',
    height: 14
  },
  lineMd: {
    width: '65%',
    height: 14
  },
  priceLine: {
    width: '40%',
    height: 18,
    marginTop: 2
  }
});

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { palette, radius, spacing, typography } from '@/src/theme';

type Props = {
  kicker?: string;
  title: string;
  subtitle: string;
  pageOf?: { current: number; total: number };
  onPrev?: () => void;
  onNext?: () => void;
  onPress?: () => void;
};

/**
 * Chartreuse highlight card — inspired by the "Game Insights & Highlights"
 * panel at the bottom of the Tennis World mockup. Big serif-feel title +
 * subtitle + paging chevrons. Drop it as a hero for vendor insights, trend
 * digests, or weekly recap surfaces.
 */
export function InsightHighlightsCard({
  kicker,
  title,
  subtitle,
  pageOf,
  onPrev,
  onNext,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.94 }]}>
      <View style={styles.iconWrap}>
        <Ionicons name="trending-up" size={20} color={palette.bg.espressoEnd} />
      </View>
      <View style={{ flex: 1 }}>
        {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>

        {pageOf ? (
          <View style={styles.footer}>
            <Pressable hitSlop={8} onPress={onPrev} style={styles.pageBtn}>
              <Ionicons name="chevron-back" size={16} color={palette.bg.espressoEnd} />
            </Pressable>
            <View style={styles.pageDots}>
              {Array.from({ length: pageOf.total }).map((_, i) => (
                <View
                  key={i}
                  style={[styles.pageDot, i === pageOf.current && styles.pageDotOn]}
                />
              ))}
            </View>
            <Pressable hitSlop={8} onPress={onNext} style={styles.pageBtn}>
              <Ionicons name="chevron-forward" size={16} color={palette.bg.espressoEnd} />
            </Pressable>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing['4'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    padding: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: palette.brand.accentLime,
    shadowColor: palette.brand.accentLimeDeep,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  kicker: {
    ...typography.small,
    fontFamily: typography.bodyEmphasis.fontFamily,
    color: 'rgba(0, 0, 0, 0.65)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 17,
    lineHeight: 22,
    color: palette.bg.espressoEnd,
  },
  subtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(0, 0, 0, 0.72)',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginTop: spacing['2'],
  },
  pageBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  pageDots: { flex: 1, flexDirection: 'row', gap: 4, justifyContent: 'center' },
  pageDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  pageDotOn: {
    width: 14,
    backgroundColor: palette.bg.espressoEnd,
  },
});

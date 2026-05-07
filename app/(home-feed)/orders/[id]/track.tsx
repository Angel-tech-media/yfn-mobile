import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { palette, radius, spacing, typography } from '@/src/theme';

const TIMELINE = [
  { key: 'placed', label: 'Order placed', sub: 'Vibe', date: 'May 6, 9:42 AM', icon: 'checkmark-circle' as const },
  { key: 'confirmed', label: 'Confirmed by vendor', sub: "Sarah's Boutique", date: 'May 6, 10:20 AM', icon: 'checkmark-circle' as const },
  { key: 'packed', label: 'Packed and ready', sub: 'Lagos hub', date: 'May 6, 4:35 PM', icon: 'checkmark-circle' as const },
  { key: 'shipped', label: 'In transit', sub: 'Courier picked up', date: 'May 7, 8:15 AM', icon: 'navigate' as const },
  { key: 'oop', label: 'Out for delivery', sub: 'Pending', date: '—', icon: 'ellipse-outline' as const },
  { key: 'delivered', label: 'Delivered', sub: 'Pending', date: '—', icon: 'ellipse-outline' as const },
];

export default function TrackShipmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ScreenContainer variant="espresso">
      <TopBar title="Track shipment" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.summary}>
          <Text style={styles.kicker}>Order ID</Text>
          <Text style={styles.idValue}>#{id}</Text>
          <Text style={styles.eta}>Estimated delivery · <Text style={styles.etaValue}>Today by 6:00 PM</Text></Text>
        </View>

        <View style={styles.mapPlaceholder}>
          <View style={styles.mapPin}>
            <Ionicons name="location" size={14} color="#FFFFFF" />
            <Text style={styles.mapPinLabel}>Live map</Text>
          </View>
        </View>

        <View style={styles.timeline}>
          <Text style={styles.timelineTitle}>Timeline</Text>
          {TIMELINE.map((t, i) => {
            const reached = i <= 3;
            return (
              <View key={t.key} style={styles.row}>
                <View style={styles.rail}>
                  <View style={[styles.dot, reached && styles.dotReached]}>
                    {reached ? <Ionicons name="checkmark" size={12} color="#FFFFFF" /> : null}
                  </View>
                  {i < TIMELINE.length - 1 ? (
                    <View style={[styles.line, reached && styles.lineReached]} />
                  ) : null}
                </View>
                <View style={styles.body}>
                  <Text style={[styles.label, !reached && styles.labelMuted]}>{t.label}</Text>
                  <Text style={styles.sub}>{t.sub}</Text>
                  <Text style={styles.date}>{t.date}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40, gap: spacing['4'] },
  summary: { gap: 4 },
  kicker: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
  },
  idValue: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 20,
    color: palette.ink.onDarkStrong,
  },
  eta: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkSoft,
  },
  etaValue: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    color: palette.brand.orange,
  },
  mapPlaceholder: {
    height: 180,
    borderRadius: radius.lg,
    backgroundColor: '#A8C7B7',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1'],
    borderRadius: 999,
  },
  mapPinLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    color: '#1463B6',
  },
  timeline: {
    padding: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    gap: 0,
  },
  timelineTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
    marginBottom: spacing['3'],
  },
  row: { flexDirection: 'row', gap: spacing['3'] },
  rail: { alignItems: 'center', width: 20 },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotReached: { backgroundColor: palette.brand.orange, borderColor: palette.brand.orange },
  line: {
    width: 1.5,
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginTop: 2,
    minHeight: 28,
  },
  lineReached: { backgroundColor: palette.brand.orange },
  body: { flex: 1, paddingBottom: spacing['3'], gap: 2 },
  label: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  labelMuted: { fontFamily: typography.body.fontFamily, color: palette.ink.onDarkMuted },
  sub: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkSoft,
  },
  date: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
  },
});

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { useOrderTrack } from '@/src/api/orders/hooks';
import { continuous, useUi } from '@/src/theme/ui';

export default function TrackShipmentScreen() {
  const ui = useUi();
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = String(id ?? '');
  const { data, isLoading, isError, refetch, isFetching } = useOrderTrack(orderId);

  const steps = data?.timeline?.length
    ? data.timeline
    : [
        { label: 'Order placed · held in escrow', done: true, at: new Date().toISOString() },
        { label: 'Seller confirmed', done: true, at: new Date().toISOString() },
        { label: 'Ready for pickup / rider', done: false, at: null },
        { label: 'Delivered & released', done: false, at: null },
      ];

  const currentIdx = Math.max(
    0,
    steps.reduce((acc, s, idx) => (s.done ? idx : acc), 0),
  );

  return (
    <ScreenContainer variant="espresso">
      <TopBar title={`Order #${orderId.slice(0, 8)}`} showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Lovable Ink Banner */}
        <LinearGradient
          colors={ui.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}>
          <View style={[styles.limeIconBox, { backgroundColor: ui.lime }]}>
            <Ionicons name="shield-checkmark" size={24} color={ui.limeForeground} />
          </View>
          <Text style={styles.heroTitle}>{data?.status ?? 'Order in progress'}</Text>
          <Text style={styles.heroSub}>
            The vendor has been notified. We&apos;ll update you at every step.
          </Text>
        </LinearGradient>

        {/* Lovable Step Progress Card */}
        <View style={[styles.timelineCard, { backgroundColor: ui.card, borderColor: ui.separator }]}>
          {isLoading ? (
            <Text style={[styles.subText, { color: ui.secondaryLabel }]}>
              Loading tracking events…
            </Text>
          ) : isError ? (
            <View style={{ gap: 8 }}>
              <Text style={[styles.subText, { color: ui.secondaryLabel }]}>
                Couldn&apos;t load tracking events.
              </Text>
              <Pressable onPress={() => refetch()} disabled={isFetching}>
                <Text style={{ color: ui.coral, fontFamily: 'InstrumentSans_700Bold' }}>
                  {isFetching ? 'Retrying…' : 'Try again'}
                </Text>
              </Pressable>
            </View>
          ) : (
            steps.map((s, i) => {
              const reached = s.done || i <= currentIdx;
              const isNow = i === currentIdx;
              return (
                <View key={`${s.label}-${i}`} style={styles.stepRow}>
                  <View
                    style={[
                      styles.stepCircle,
                      {
                        backgroundColor: reached ? ui.accent : ui.secondary,
                      },
                    ]}>
                    {reached ? (
                      <Ionicons name="checkmark" size={16} color={ui.onAccent} />
                    ) : (
                      <Text style={[styles.stepNum, { color: ui.secondaryLabel }]}>{i + 1}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.stepLabel,
                        { color: reached ? ui.label : ui.secondaryLabel },
                      ]}>
                      {s.label}
                    </Text>
                    {s.at ? (
                      <Text style={[styles.stepTime, { color: ui.secondaryLabel }]}>
                        {formatWhen(s.at)}
                      </Text>
                    ) : null}
                  </View>
                  {isNow ? (
                    <View style={[styles.nowPill, { backgroundColor: ui.lime }]}>
                      <Text style={[styles.nowText, { color: ui.limeForeground }]}>Now</Text>
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </View>

        <PrimaryButton
          label="Back to home"
          variant="secondary"
          onPress={() => router.replace('/(home-feed)/(tabs)' as never)}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-NG', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 8,
    paddingBottom: 40,
    gap: 16,
  },
  heroCard: {
    padding: 24,
    borderRadius: 26,
    alignItems: 'center',
    gap: 8,
    ...continuous,
  },
  limeIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    ...continuous,
  },
  heroTitle: {
    fontFamily: 'BricolageGrotesque_800ExtraBold',
    fontSize: 22,
    color: '#F4F2E8',
    textAlign: 'center',
  },
  heroSub: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 13,
    color: 'rgba(244, 242, 232, 0.8)',
    textAlign: 'center',
    lineHeight: 19,
  },
  timelineCard: {
    padding: 20,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 18,
    ...continuous,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 13,
  },
  stepLabel: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
  },
  stepTime: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 11,
    marginTop: 2,
  },
  nowPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  nowText: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 11,
  },
  subText: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 13,
  },
});

import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { PressableScale } from '@/components/ui/PressableScale';
import {
  formatNaira,
  transactions,
  type Txn,
} from '@/src/data/lovable-data';
import { useToast } from '@/src/hooks/use-toast';
import { continuous, corner, layout, type, useUi } from '@/src/theme/ui';

export default function WalletScreen() {
  const ui = useUi();
  const toast = useToast();
  const [hidden, setHidden] = useState(false);
  const balance = 48700;

  const quick = [
    { icon: 'add' as const, label: 'Top up' },
    { icon: 'paper-plane-outline' as const, label: 'Send' },
    { icon: 'phone-portrait-outline' as const, label: 'Airtime' },
    { icon: 'flash-outline' as const, label: 'Bills' },
  ];

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView edges={['top']} style={styles.safe}>
        {/* Title */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: ui.label }]}>Wallet</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}>
          {/* Lovable Dark Ink Hero Balance Card */}
          <View style={styles.cardWrapper}>
            <LinearGradient
              colors={[ui.ink, '#091510']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.heroCard, { borderColor: 'rgba(200, 255, 59, 0.25)' }]}>
              {/* Decorative Lime Glow Blur */}
              <View style={[styles.glowBlob, { backgroundColor: ui.lime }]} />

              <View style={styles.heroContent}>
                <View style={styles.heroTopRow}>
                  <Text style={[styles.balanceKicker, { color: ui.inkMuted }]}>
                    AVAILABLE BALANCE
                  </Text>
                  <PressableScale
                    haptic="light"
                    scaleTo={0.9}
                    hitSlop={8}
                    onPress={() => setHidden((h) => !h)}>
                    <Ionicons
                      name={hidden ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={ui.inkMuted}
                    />
                  </PressableScale>
                </View>

                <Text style={[styles.balanceAmount, { color: ui.inkForeground }]}>
                  {hidden ? '₦ ••••••' : formatNaira(balance)}
                </Text>

                <View style={[styles.escrowPill, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                  <View style={[styles.escrowDot, { backgroundColor: ui.lime }]} />
                  <Text style={[styles.escrowText, { color: ui.inkForeground }]}>
                    Protected by escrow on every order
                  </Text>
                </View>

                {/* 4 Lime Quick Action Buttons */}
                <View style={styles.quickGrid}>
                  {quick.map((q) => (
                    <PressableScale
                      key={q.label}
                      haptic="light"
                      scaleTo={0.92}
                      onPress={() => toast.show({ variant: 'info', title: `${q.label} is coming soon` })}
                      style={styles.quickItem}>
                      <View style={[styles.quickIconCircle, { backgroundColor: ui.lime }]}>
                        <Ionicons name={q.icon} size={20} color={ui.limeForeground} />
                      </View>
                      <Text style={[styles.quickLabel, { color: ui.inkForeground }]}>
                        {q.label}
                      </Text>
                    </PressableScale>
                  ))}
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Referral Card (Coral / 15) */}
          <View style={styles.referralWrap}>
            <View style={[styles.referralCard, { backgroundColor: 'rgba(229, 38, 47, 0.12)' }]}>
              <View style={[styles.referralGiftCircle, { backgroundColor: ui.coral }]}>
                <Ionicons name="gift-outline" size={20} color={ui.coralForeground} />
              </View>
              <View style={styles.referralInfo}>
                <Text style={[styles.referralTitle, { color: ui.label }]}>
                  Invite friends, earn ₦1,000
                </Text>
                <Text style={[styles.referralSub, { color: ui.secondaryLabel }]}>
                  For every friend who makes their first order.
                </Text>
              </View>
              <PressableScale
                haptic="medium"
                scaleTo={0.94}
                onPress={() => toast.show({ variant: 'success', title: 'Invite link copied' })}
                style={[styles.inviteBtn, { backgroundColor: ui.label }]}>
                <Text style={[styles.inviteBtnText, { color: ui.background }]}>Invite</Text>
              </PressableScale>
            </View>
          </View>

          {/* Recent Activity Section */}
          <View style={styles.activitySection}>
            <Text style={[styles.sectionTitle, { color: ui.label }]}>Recent activity</Text>
            <View style={[styles.activityList, { backgroundColor: ui.card, borderColor: ui.separator }]}>
              {transactions.map((t, idx) => {
                const inflow = t.amount > 0;
                const isLast = idx === transactions.length - 1;
                return (
                  <View
                    key={t.id}
                    style={[
                      styles.activityRow,
                      !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: ui.separator },
                    ]}>
                    <View
                      style={[
                        styles.activityIconBox,
                        {
                          backgroundColor: inflow
                            ? 'rgba(200, 255, 59, 0.25)'
                            : ui.cardRaised,
                        },
                      ]}>
                      <Ionicons
                        name={inflow ? 'arrow-down' : 'arrow-up'}
                        size={17}
                        color={inflow ? ui.accent : ui.label}
                        style={{ transform: [{ rotate: inflow ? '45deg' : '45deg' }] }}
                      />
                    </View>
                    <View style={styles.activityTextWrap}>
                      <Text style={[styles.activityLabel, { color: ui.label }]} numberOfLines={1}>
                        {t.label}
                      </Text>
                      <Text style={[styles.activityDetail, { color: ui.secondaryLabel }]} numberOfLines={1}>
                        {t.detail} · {t.time}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.activityAmount,
                        { color: inflow ? ui.success : ui.label },
                      ]}>
                      {inflow ? '+' : ''}
                      {formatNaira(t.amount)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </EspressoBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontFamily: 'BricolageGrotesque_800ExtraBold',
    fontSize: 28,
  },
  scroll: {
    paddingBottom: 110,
  },
  cardWrapper: {
    paddingHorizontal: 20,
    marginTop: 6,
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    overflow: 'hidden',
    ...continuous,
  },
  glowBlob: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.15,
  },
  heroContent: {
    gap: 8,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceKicker: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.6,
  },
  balanceAmount: {
    fontFamily: 'BricolageGrotesque_800ExtraBold',
    fontSize: 38,
    letterSpacing: -1,
  },
  escrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginTop: 4,
  },
  escrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  escrowText: {
    fontFamily: 'InstrumentSans_500Medium',
    fontSize: 12,
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  quickItem: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  quickIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 12,
  },
  referralWrap: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  referralCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    ...continuous,
  },
  referralGiftCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralInfo: {
    flex: 1,
    gap: 2,
  },
  referralTitle: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 14,
  },
  referralSub: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 12,
  },
  inviteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  inviteBtnText: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 12,
  },
  activitySection: {
    marginTop: 24,
    paddingHorizontal: 20,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
  },
  activityList: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...continuous,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  activityIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTextWrap: {
    flex: 1,
    gap: 2,
  },
  activityLabel: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
  },
  activityDetail: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 12,
  },
  activityAmount: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 14,
  },
});

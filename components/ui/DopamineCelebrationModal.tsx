import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { vibeHaptics } from '@/src/lib/haptics';
import { palette, radius, spacing, typography } from '@/src/theme';

export type CelebrationDetails = {
  title: string;
  subtitle: string;
  badge?: string;
  isGift?: boolean;
  recipientHandle?: string;
  isAnonymous?: boolean;
  isEscrowPrivate?: boolean;
  amountKobo?: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  details: CelebrationDetails;
};

const PARTICLES = [
  { emoji: '⚡', delay: 0, x: -60, y: -120 },
  { emoji: '✨', delay: 60, x: 70, y: -140 },
  { emoji: '🎁', delay: 100, x: -110, y: -40 },
  { emoji: '🔥', delay: 150, x: 100, y: -50 },
  { emoji: '💎', delay: 200, x: -50, y: 70 },
  { emoji: '🎉', delay: 250, x: 80, y: 80 },
];

export function DopamineCelebrationModal({ visible, onClose, details }: Props) {
  const scaleAnim = useRef(new Animated.Value(0.4)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      vibeHaptics.dopamineBurst();
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.4);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Animated Particles */}
        {PARTICLES.map((p, idx) => (
          <Particle key={idx} {...p} />
        ))}

        <Animated.View
          style={[
            styles.card,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}>
          <LinearGradient
            colors={['#241913', '#16100D']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          <View style={styles.iconCircle}>
            <LinearGradient
              colors={['#FF9F2E', '#D89544']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Ionicons
              name={details.isGift ? 'gift-outline' : 'checkmark-done'}
              size={36}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.title}>{details.title}</Text>
          <Text style={styles.subtitle}>{details.subtitle}</Text>

          {/* Privacy & Escrow Badges */}
          <View style={styles.badgeRow}>
            {details.isEscrowPrivate ? (
              <View style={styles.securityBadge}>
                <Ionicons name="shield-checkmark" size={13} color="#4ADE80" />
                <Text style={styles.securityBadgeText}>Zero-Knowledge Escrow Address</Text>
              </View>
            ) : null}

            {details.isAnonymous ? (
              <View style={styles.mysteryBadge}>
                <Ionicons name="eye-off-outline" size={13} color="#FBBF24" />
                <Text style={styles.mysteryBadgeText}>Secret Gifter Masked</Text>
              </View>
            ) : null}
          </View>

          {details.recipientHandle ? (
            <View style={styles.recipientBox}>
              <Text style={styles.recipientLabel}>Recipient</Text>
              <Text style={styles.recipientHandle}>{details.recipientHandle}</Text>
              <Text style={styles.recipientHint}>
                A delivery claim voucher has been dispatched to their inbox.
              </Text>
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => [styles.continueBtn, pressed && { opacity: 0.9 }]}
            onPress={() => {
              vibeHaptics.selection();
              onClose();
            }}>
            <LinearGradient
              colors={['#D89544', '#B07530']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <Text style={styles.continueBtnText}>Continue Shopping</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

function Particle({ emoji, delay, x, y }: { emoji: string; delay: number; x: number; y: number }) {
  const transAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(transAnim, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay, transAnim, fadeAnim]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        {
          opacity: fadeAnim,
          transform: [
            { translateX: transAnim.interpolate({ inputRange: [0, 1], outputRange: [0, x] }) },
            { translateY: transAnim.interpolate({ inputRange: [0, 1], outputRange: [0, y] }) },
            { scale: transAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1.3] }) },
          ],
        },
      ]}>
      <Text style={styles.particleEmoji}>{emoji}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 3, 2, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['5'],
  },
  particle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  particleEmoji: {
    fontSize: 32,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: radius.xl,
    padding: spacing['6'],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232, 93, 63, 0.35)',
    overflow: 'hidden',
    shadowColor: '#D89544',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['4'],
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 24,
    lineHeight: 30,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing['2'],
  },
  subtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: spacing['4'],
    paddingHorizontal: spacing['2'],
  },
  badgeRow: {
    flexDirection: 'column',
    gap: 8,
    width: '100%',
    marginBottom: spacing['4'],
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  securityBadgeText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: '#4ADE80',
    fontWeight: '600',
  },
  mysteryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  mysteryBadgeText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: '#FBBF24',
    fontWeight: '600',
  },
  recipientBox: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: radius.md,
    padding: spacing['3'],
    marginBottom: spacing['4'],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  recipientLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recipientHandle: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 16,
    color: palette.brand.orange,
    marginTop: 2,
  },
  recipientHint: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 15,
    color: palette.ink.onDarkMuted,
    marginTop: 4,
  },
  continueBtn: {
    width: '100%',
    height: 50,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  continueBtnText: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

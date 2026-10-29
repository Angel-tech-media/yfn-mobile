import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useCreateRepost, useDeleteRepost, useMyReposts } from '@/src/api/reposts/hooks';
import { useAuth } from '@/src/store/auth';
import { palette, radius, spacing, typography } from '@/src/theme';

import { BottomSheet } from './BottomSheet';

type Visibility = 'public' | 'mutuals' | 'close-friends';

type Props = {
  visible: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: string;
    vendor: string;
    vendorId: string;
  };
};

const VISIBILITY: Array<{ key: Visibility; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'public', label: 'Public', icon: 'globe-outline' },
  { key: 'mutuals', label: 'Mutuals only', icon: 'people-outline' },
  { key: 'close-friends', label: 'Close friends', icon: 'star-outline' },
];

export function RepostSheet({ visible, onClose, product }: Props) {
  const [caption, setCaption] = useState('');
  const [visibilityMode, setVisibilityMode] = useState<Visibility>('public');
  const userId = useAuth((s) => s.user?.id);
  const { data: reposts = [] } = useMyReposts();
  const createRepost = useCreateRepost();
  const deleteRepost = useDeleteRepost();
  const existingRepost = reposts.find((repost) => repost.productId === product.id);
  const reposted = !!existingRepost;
  const canRepost = product.vendorId !== userId;
  const pending = createRepost.isPending || deleteRepost.isPending;

  const handleRepost = () => {
    if (existingRepost) {
      deleteRepost.mutate(existingRepost.id, { onSuccess: onClose });
      return;
    }
    createRepost.mutate(
      {
        productId: product.id,
        vendorId: product.vendorId,
        caption: caption.trim() || undefined,
        visibility: visibilityMode,
      },
      {
        onSuccess: () => {
          setCaption('');
          onClose();
        },
      },
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.headerRow}>
        <Ionicons name="repeat" size={20} color={palette.brand.orange} />
        <Text style={styles.title}>{reposted ? 'Already reposted' : 'Repost product'}</Text>
      </View>

      <Text style={styles.subtitle}>
        Share this product to your profile and track referral performance from your wallet.
      </Text>

      {/* Product preview card */}
      <View style={styles.productCard}>
        <View style={styles.productThumb}>
          <Ionicons name="bag" size={20} color={palette.ink.onLightStrong} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.productName} numberOfLines={1}>
            {product.name}
          </Text>
          <Text style={styles.productMeta} numberOfLines={1}>
            {product.vendor} · {product.price}
          </Text>
        </View>
      </View>

      {/* Caption */}
      <Text style={styles.fieldLabel}>Add your take (optional)</Text>
      <TextInput
        value={caption}
        onChangeText={setCaption}
        placeholder="Write a quote, review, or styling tip…"
        placeholderTextColor={palette.ink.onDarkMuted}
        multiline
        style={styles.captionInput}
        maxLength={280}
      />

      {/* Visibility */}
      <Text style={styles.fieldLabel}>Who sees it</Text>
      <View style={styles.visibilityRow}>
        {VISIBILITY.map((v) => {
          const on = visibilityMode === v.key;
          return (
            <Pressable
              key={v.key}
              onPress={() => setVisibilityMode(v.key)}
              style={[styles.visibilityChip, on && styles.visibilityChipOn]}>
              <Ionicons
                name={v.icon}
                size={14}
                color={on ? palette.ink.onLightStrong : palette.ink.onDarkSoft}
              />
              <Text
                style={[styles.visibilityLabel, on && styles.visibilityLabelOn]}>
                {v.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Earnings explainer */}
      <View style={styles.earnCard}>
        <View style={styles.earnIcon}>
          <Ionicons name="cash-outline" size={16} color={palette.brand.orange} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.earnTitle}>How earnings work</Text>
          <Text style={styles.earnText}>
            The backend records clicks, conversions, and earnings for reposts.
            Earnings drop into your eWallet when eligible orders are completed.
          </Text>
        </View>
      </View>

      {/* CTA */}
      {canRepost ? (
        <Pressable
          onPress={handleRepost}
          disabled={pending}
          style={({ pressed }) => [
            styles.cta,
            reposted && styles.ctaUndo,
            pending && { opacity: 0.6 },
            pressed && { opacity: 0.9 },
          ]}>
          <Ionicons
            name={reposted ? 'close' : 'repeat'}
            size={18}
            color="#fff"
          />
          <Text style={styles.ctaLabel}>
            {pending ? 'Saving…' : reposted ? 'Undo repost' : 'Repost to my profile'}
          </Text>
        </Pressable>
      ) : (
        <View style={styles.ctaDisabled}>
          <Ionicons name="information-circle-outline" size={16} color={palette.ink.onDarkMuted} />
          <Text style={styles.ctaDisabledLabel}>
            You can&apos;t repost your own product.
          </Text>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginBottom: spacing['1'],
  },
  title: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 18,
    color: palette.ink.onDarkStrong,
  },
  subtitle: {
    ...typography.body,
    fontSize: 13,
    color: palette.ink.onDarkMuted,
    marginBottom: spacing['3'],
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    marginBottom: spacing['3'],
  },
  productThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: {
    ...typography.bodyEmphasis,
    color: palette.ink.onDarkStrong,
  },
  productMeta: {
    ...typography.caption,
    color: palette.ink.onDarkMuted,
  },
  fieldLabel: {
    ...typography.small,
    color: palette.ink.onDarkSoft,
    fontFamily: typography.bodyEmphasis.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing['2'],
  },
  captionInput: {
    minHeight: 64,
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    color: palette.ink.onDarkStrong,
    ...typography.body,
    fontSize: 14,
    marginBottom: spacing['3'],
    textAlignVertical: 'top',
  },
  visibilityRow: {
    flexDirection: 'row',
    gap: spacing['2'],
    marginBottom: spacing['4'],
  },
  visibilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing['3'],
    height: 34,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  visibilityChipOn: {
    backgroundColor: 'rgba(47, 107, 255, 0.15)',
    borderColor: palette.brand.orange,
  },
  visibilityLabel: {
    ...typography.caption,
    color: palette.ink.onDarkSoft,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  visibilityLabelOn: { color: palette.brand.orangeDeep },
  earnCard: {
    flexDirection: 'row',
    gap: spacing['3'],
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(47, 107, 255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255,0.30)',
    marginBottom: spacing['3'],
  },
  earnIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(47, 107, 255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  earnTitle: {
    ...typography.bodyEmphasis,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
    marginBottom: 2,
  },
  earnText: {
    ...typography.caption,
    color: palette.ink.onDarkSoft,
    lineHeight: 17,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 999,
    backgroundColor: palette.brand.orange,
  },
  ctaUndo: {
    backgroundColor: palette.status.danger,
  },
  ctaLabel: {
    ...typography.bodyEmphasis,
    fontSize: 15,
    color: '#fff',
  },
  ctaDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: palette.line.onDark,
  },
  ctaDisabledLabel: {
    ...typography.body,
    fontSize: 13,
    color: palette.ink.onDarkMuted,
  },
});

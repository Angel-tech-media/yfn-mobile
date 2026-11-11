import { useCallback, useRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { PressableScale } from '@/components/ui/PressableScale';
import { useUser } from '@/src/store/user';
import { continuous, corner, type, useUi } from '@/src/theme/ui';
import { BottomSheet } from './BottomSheet';

type Props = {
  visible: boolean;
  onClose: () => void;
};

type ActionItem = {
  key: string;
  label: string;
  subtitle: string;
  badge?: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  iconColor: string;
  href: string;
  isPrimary?: boolean;
};

export function CreateSheet({ visible, onClose }: Props) {
  const ui = useUi();
  const role = useUser((s) => s.role);
  const isVendor = role === 'vendor';
  const pendingActionRef = useRef<(() => void) | null>(null);

  const runPendingAction = useCallback(() => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    action?.();
  }, []);

  const closeThenNavigate = useCallback(
    (href: string) => {
      pendingActionRef.current = () => router.push(href as never);
      onClose();

      if (Platform.OS !== 'ios') {
        setTimeout(runPendingAction, 0);
      }
    },
    [onClose, runPendingAction],
  );

  // Distinct Apple-style actions for Vendor vs Buyer
  const vendorActions: ActionItem[] = [
    {
      key: 'product',
      label: 'List a Product',
      subtitle: 'Upload product photos, set price, sizes, and stock inventory',
      badge: 'Primary',
      icon: 'pricetag',
      tint: 'rgba(255, 159, 10, 0.16)',
      iconColor: ui.accent,
      href: '/products/add',
      isPrimary: true,
    },
    {
      key: 'banner',
      label: 'Store Banner & Details',
      subtitle: 'Change your shop header cover photo, store logo, bio & location',
      badge: 'Branding',
      icon: 'image-outline',
      tint: 'rgba(175, 82, 222, 0.14)',
      iconColor: '#AF52DE',
      href: '/vendor-store-setup/store-details',
    },
    {
      key: 'post',
      label: 'Store Announcement',
      subtitle: 'Publish quick news, restock alerts, or studio notes to your followers',
      badge: 'Update',
      icon: 'chatbubble-ellipses-outline',
      tint: 'rgba(10, 132, 255, 0.14)',
      iconColor: '#0A84FF',
      href: '/create/post',
    },
  ];

  const buyerActions: ActionItem[] = [
    {
      key: 'post',
      label: 'Community Post',
      subtitle: 'Share an outfit, unboxing, review, or lifestyle photo',
      badge: 'Feed',
      icon: 'camera-outline',
      tint: 'rgba(52, 199, 89, 0.14)',
      iconColor: '#34C759',
      href: '/create/post',
    },
    {
      key: 'story',
      label: 'Daily Story',
      subtitle: 'Share a 24-hour photo or quick moment with your circle',
      icon: 'sparkles-outline',
      tint: 'rgba(175, 82, 222, 0.14)',
      iconColor: '#AF52DE',
      href: '/create/story',
    },
    {
      key: 'reel',
      label: 'Video Reel',
      subtitle: 'Record or upload a short styling clip or video review',
      icon: 'play-circle-outline',
      tint: 'rgba(255, 59, 48, 0.14)',
      iconColor: '#FF3B30',
      href: '/create/reel',
    },
  ];

  const actions = isVendor ? vendorActions : buyerActions;

  return (
    <BottomSheet visible={visible} onClose={onClose} onDismiss={runPendingAction}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[type.title2, { color: ui.label }]}>
            {isVendor ? 'Vendor Studio' : 'Create'}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: isVendor ? 'rgba(255, 159, 10, 0.14)' : ui.card }]}>
            <Ionicons
              name={isVendor ? 'storefront' : 'person'}
              size={12}
              color={isVendor ? ui.accent : ui.secondaryLabel}
            />
            <Text style={[type.caption2, { color: isVendor ? ui.accent : ui.secondaryLabel, fontWeight: '700' }]}>
              {isVendor ? 'VENDOR' : 'BUYER'}
            </Text>
          </View>
        </View>
        <Text style={[type.subhead, { color: ui.secondaryLabel, marginTop: 4 }]}>
          {isVendor
            ? 'Manage your storefront, list products, or broadcast store announcements.'
            : 'Share your purchases, fits, and moments with the community.'}
        </Text>
      </View>

      <View style={styles.list}>
        {actions.map((a) => (
          <PressableScale
            key={a.key}
            onPress={() => closeThenNavigate(a.href)}
            haptic={a.isPrimary ? 'medium' : 'light'}
            scaleTo={0.97}
            style={[
              styles.card,
              continuous,
              {
                borderRadius: corner.lg,
                backgroundColor: a.isPrimary ? (ui.isDark ? '#1C150A' : '#FFF9F0') : ui.card,
                borderColor: a.isPrimary ? ui.accent : ui.separator,
                borderWidth: a.isPrimary ? 1.5 : 1,
              },
            ]}>
            <View style={[styles.iconWrap, continuous, { borderRadius: corner.md, backgroundColor: a.tint }]}>
              <Ionicons name={a.icon} size={22} color={a.iconColor} />
            </View>

            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={[type.body, { color: ui.label, fontWeight: '700' }]}>
                  {a.label}
                </Text>
                {a.badge ? (
                  <View
                    style={[
                      styles.itemBadge,
                      continuous,
                      {
                        borderRadius: corner.sm,
                        backgroundColor: a.isPrimary ? ui.accent : (ui.isDark ? 'rgba(22, 22, 27, 0.76)' : '#E5E5EA'),
                      },
                    ]}>
                    <Text
                      style={[
                        type.caption2,
                        {
                          color: a.isPrimary ? ui.onAccent : ui.secondaryLabel,
                          fontWeight: '700',
                          fontSize: 10,
                        },
                      ]}>
                      {a.badge}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={[type.caption, { color: ui.secondaryLabel, marginTop: 2 }]} numberOfLines={2}>
                {a.subtitle}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color={ui.tertiaryLabel} />
          </PressableScale>
        ))}
      </View>

      <View style={[styles.footerNote, continuous, { borderRadius: corner.md, backgroundColor: ui.card }]}>
        <Ionicons
          name={isVendor ? 'information-circle-outline' : 'sparkles-outline'}
          size={16}
          color={isVendor ? ui.accent : ui.secondaryLabel}
        />
        <Text style={[type.caption2, { color: ui.secondaryLabel, flex: 1 }]}>
          {isVendor
            ? 'Looking to customize your shop cover? Tap "Store Banner & Details" above.'
            : 'Looking to sell? You can switch or apply for a Vendor account in your Profile.'}
        </Text>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  list: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    marginTop: 16,
  },
});

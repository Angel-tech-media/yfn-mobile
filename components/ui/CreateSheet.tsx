import { useCallback, useRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { PressableScale } from '@/components/ui/PressableScale';
import { useMe } from '@/src/api/account/hooks';
import { useToast } from '@/src/hooks/use-toast';
import { useUser } from '@/src/store/user';
import { continuous, useUi } from '@/src/theme/ui';
import { BottomSheet } from './BottomSheet';

type Props = {
  visible: boolean;
  onClose: () => void;
};

type CreateOption = {
  key: string;
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
  toneBg: string;
  toneFg: string;
  onPress: () => void;
};

export function CreateSheet({ visible, onClose }: Props) {
  const ui = useUi();
  const toast = useToast();
  const { data: me } = useMe();
  const role = useUser((s) => s.role);
  const storeLive = Boolean(me?.hasStore || me?.role === 'vendor' || role === 'vendor');
  const pendingActionRef = useRef<(() => void) | null>(null);

  const runPendingAction = useCallback(() => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    action?.();
  }, []);

  const closeThenRun = useCallback(
    (fn: () => void) => {
      pendingActionRef.current = fn;
      onClose();

      if (Platform.OS !== 'ios') {
        setTimeout(runPendingAction, 0);
      }
    },
    [onClose, runPendingAction],
  );

  const options: CreateOption[] = [
    {
      key: 'post',
      title: 'Write a post',
      body: 'Share a thought, a fit or the gist',
      icon: 'create-outline',
      toneBg: ui.lime,
      toneFg: ui.limeForeground,
      onPress: () => closeThenRun(() => router.push('/create/post' as never)),
    },
    {
      key: 'story',
      title: 'Add a story',
      body: 'Disappears after 24 hours',
      icon: 'camera-outline',
      toneBg: ui.coral,
      toneFg: '#FFFFFF',
      onPress: () => closeThenRun(() => router.push('/create/story' as never)),
    },
    {
      key: 'store',
      title: storeLive ? 'List a product' : 'Start selling',
      body: storeLive ? 'Add something new to your store' : 'Open your store in 3 quick steps',
      icon: 'storefront-outline',
      toneBg: '#1D4A38',
      toneFg: '#F4F2E8',
      onPress: () =>
        closeThenRun(() =>
          router.push((storeLive ? '/products/add' : '/vendor-verify') as never),
        ),
    },
    {
      key: 'live',
      title: 'Go live',
      body: 'Live shopping & drops',
      icon: 'radio-outline',
      toneBg: ui.secondary,
      toneFg: ui.secondaryForeground,
      onPress: () =>
        closeThenRun(() => {
          toast.show({ variant: 'info', title: 'Live shopping is coming soon 👀' });
        }),
    },
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose} onDismiss={runPendingAction}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: ui.label }]}>Create</Text>
        <Text style={[styles.subtitle, { color: ui.secondaryLabel }]}>
          What are you making today?
        </Text>
      </View>

      <View style={styles.grid}>
        {options.map((o) => (
          <PressableScale
            key={o.key}
            haptic="light"
            scaleTo={0.97}
            onPress={o.onPress}
            style={[
              styles.card,
              {
                backgroundColor: ui.card,
                borderColor: ui.separator,
              },
            ]}>
            <View style={[styles.iconBox, { backgroundColor: o.toneBg }]}>
              <Ionicons name={o.icon} size={20} color={o.toneFg} />
            </View>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: ui.label }]}>{o.title}</Text>
              <Text style={[styles.cardBody, { color: ui.secondaryLabel }]} numberOfLines={2}>
                {o.body}
              </Text>
            </View>
          </PressableScale>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
    gap: 2,
  },
  title: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 24,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'InstrumentSans_500Medium',
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    paddingBottom: 8,
  },
  card: {
    width: '48.2%',
    padding: 14,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
    ...continuous,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...continuous,
  },
  cardText: {
    gap: 2,
  },
  cardTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 15,
    letterSpacing: -0.2,
  },
  cardBody: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 12,
    lineHeight: 16,
  },
});

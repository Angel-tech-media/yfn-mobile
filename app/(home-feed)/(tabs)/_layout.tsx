import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreateSheet } from '@/components/ui/CreateSheet';
import { PressableScale } from '@/components/ui/PressableScale';
import { continuous, type, useUi } from '@/src/theme/ui';

type TabKey = 'index' | 'market' | 'wallet' | 'profile' | 'hive';
type IconSet = 'ion' | 'mci';

type TabSpec = {
  key: TabKey;
  iconSet: IconSet;
  icon: string;
  iconActive: string;
  label: string;
};

const TABS_LEFT: TabSpec[] = [
  { key: 'index', iconSet: 'ion', icon: 'home-outline', iconActive: 'home', label: 'Home' },
  { key: 'market', iconSet: 'ion', icon: 'storefront-outline', iconActive: 'storefront', label: 'Market' },
];

const TABS_RIGHT: TabSpec[] = [
  { key: 'wallet', iconSet: 'ion', icon: 'wallet-outline', iconActive: 'wallet', label: 'Wallet' },
  { key: 'profile', iconSet: 'ion', icon: 'person-outline', iconActive: 'person', label: 'Profile' },
];

function TabBarButton({ t, focused, onPress }: { t: TabSpec; focused: boolean; onPress: () => void }) {
  const ui = useUi();
  const color = focused ? ui.label : ui.secondaryLabel;
  const name = (focused ? t.iconActive : t.icon) as keyof typeof Ionicons.glyphMap;
  return (
    <PressableScale
      accessibilityRole="tab"
      accessibilityLabel={t.label}
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      haptic="selection"
      scaleTo={0.88}
      style={styles.slot}>
      <Ionicons name={name} size={24} color={color} />
      <Text style={[type.caption2, { color }]}>{t.label}</Text>
      {focused ? (
        <LinearGradient
          colors={['#FF3B3B', '#2F6BFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activeIndicator}
        />
      ) : (
        <View style={styles.activeIndicatorSpacer} />
      )}
    </PressableScale>
  );
}

function CustomTabBar(props: any) {
  const { state, navigation, navigateToTab, emitter } = props;
  const ui = useUi();
  const activeName = state.routes[state.index]?.name;
  const go = (key: string) => () => {
    if (navigateToTab) {
      const targetRoute = state.routes.find((r: any) => r.name === key);
      if (targetRoute) {
        navigateToTab(targetRoute.key);
        return;
      }
    }
    if (navigation?.navigate) {
      navigation.navigate(key);
    }
  };

  const handleCreate = () => {
    if (navigation?.emit) {
      navigation.emit({ type: 'openCreate' });
    } else if (emitter?.emit) {
      emitter.emit({ type: 'openCreate' });
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe} pointerEvents="box-none">
      <View style={[styles.bar, { borderColor: ui.separator, backgroundColor: 'rgba(18, 24, 51, 0.85)' }]}>
        <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
        {TABS_LEFT.map((t) => (
          <TabBarButton key={t.key} t={t} focused={activeName === t.key} onPress={go(t.key)} />
        ))}
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Create"
          haptic="medium"
          scaleTo={0.9}
          onPress={handleCreate}
          style={styles.createBtnWrapper}>
          <LinearGradient
            colors={['#FF3B3B', '#2F6BFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.createBtnGradient}>
            <Ionicons name="add" size={26} color="#FFFFFF" />
          </LinearGradient>
        </PressableScale>
        {TABS_RIGHT.map((t) => (
          <TabBarButton key={t.key} t={t} focused={activeName === t.key} onPress={go(t.key)} />
        ))}
      </View>
    </SafeAreaView>
  );
}

export default function TabLayout() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false, animation: 'shift' }}
        screenListeners={{
          // @ts-ignore - custom event
          openCreate: () => setCreateOpen(true),
        }}
        tabBar={(props) => <CustomTabBar {...props} />}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="market" />
        <Tabs.Screen name="wallet" />
        <Tabs.Screen name="profile" />
        {/* Routes still navigable but hidden from the bar */}
        <Tabs.Screen name="hive" options={{ href: null }} />
        <Tabs.Screen name="news" options={{ href: null }} />
        <Tabs.Screen name="shop" options={{ href: null }} />
        <Tabs.Screen name="inbox" options={{ href: null }} />
      </Tabs>

      <CreateSheet visible={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  safe: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  bar: {
    marginHorizontal: 16,
    marginBottom: 6,
    height: 64,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    overflow: 'hidden',
    borderWidth: 1,
    ...continuous,
  },
  slot: { width: 60, height: 56, alignItems: 'center', justifyContent: 'center', gap: 2 },
  activeIndicator: {
    width: 14,
    height: 3,
    borderRadius: 1.5,
    marginTop: 2,
    shadowColor: '#2F6BFF',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  activeIndicatorSpacer: {
    height: 3,
    marginTop: 2,
  },
  createBtnWrapper: {
    shadowColor: '#2F6BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  createBtnGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

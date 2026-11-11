import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreateSheet } from '@/components/ui/CreateSheet';
import { PressableScale } from '@/components/ui/PressableScale';
import { glass, plasma } from '@/src/theme/plasma';
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
      style={[styles.slot, focused && styles.slotFocused]}>
      <Ionicons name={name} size={22} color={color} />
      <Text style={[type.caption2, { color, fontFamily: focused ? 'Inter_600SemiBold' : 'Inter_500Medium' }]}>
        {t.label}
      </Text>
      {focused ? (
        <LinearGradient
          colors={[plasma.blue, plasma.cyan]}
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
  const g = ui.isDark ? glass.dark : glass.light;
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
      <View style={[styles.bar, { borderColor: g.rimStrong }]}>
        <BlurView
          intensity={65}
          tint={g.blurTint}
          experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: g.fill }]} />
        <LinearGradient
          pointerEvents="none"
          colors={g.sheen}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
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
            colors={['#E85D3F', '#C94124']}
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
        screenOptions={{
          headerShown: false,
          animation: 'shift',
          sceneStyle: { backgroundColor: 'transparent' },
        }}
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
    marginBottom: 8,
    height: 66,
    borderRadius: 33,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    ...continuous,
  },
  slot: {
    width: 62,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  slotFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  activeIndicator: {
    width: 14,
    height: 2.5,
    borderRadius: 1.5,
    marginTop: 2,
  },
  activeIndicatorSpacer: {
    height: 2.5,
    marginTop: 2,
  },
  createBtnWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  createBtnGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.32)',
  },
});

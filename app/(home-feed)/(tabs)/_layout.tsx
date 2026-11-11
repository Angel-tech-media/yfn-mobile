import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreateSheet } from '@/components/ui/CreateSheet';
import { PressableScale } from '@/components/ui/PressableScale';
import { continuous, useUi } from '@/src/theme/ui';

type TabKey = 'index' | 'market' | 'wallet' | 'profile';

type TabSpec = {
  key: TabKey;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  label: string;
};

const TABS_LEFT: TabSpec[] = [
  { key: 'index', icon: 'home-outline', iconActive: 'home', label: 'Home' },
  { key: 'market', icon: 'storefront-outline', iconActive: 'storefront', label: 'Market' },
];

const TABS_RIGHT: TabSpec[] = [
  { key: 'wallet', icon: 'wallet-outline', iconActive: 'wallet', label: 'Wallet' },
  { key: 'profile', icon: 'person-outline', iconActive: 'person', label: 'Profile' },
];

function TabBarButton({
  t,
  focused,
  onPress,
}: {
  t: TabSpec;
  focused: boolean;
  onPress: () => void;
}) {
  const ui = useUi();
  const iconColor = focused ? ui.limeForeground : ui.secondaryLabel;
  const labelColor = focused ? ui.label : ui.secondaryLabel;
  const iconName = focused ? t.iconActive : t.icon;

  return (
    <PressableScale
      accessibilityRole="tab"
      accessibilityLabel={t.label}
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      haptic="selection"
      scaleTo={0.92}
      style={styles.tabSlot}>
      <View
        style={[
          styles.iconPill,
          focused ? { backgroundColor: ui.lime } : { backgroundColor: 'transparent' },
        ]}>
        <Ionicons name={iconName} size={20} color={iconColor} />
      </View>
      <Text
        style={[
          styles.tabLabel,
          {
            color: labelColor,
            fontFamily: focused ? 'InstrumentSans_700Bold' : 'InstrumentSans_600SemiBold',
          },
        ]}>
        {t.label}
      </Text>
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
    <SafeAreaView edges={['bottom']} style={[styles.dockedBar, { backgroundColor: ui.card, borderTopColor: ui.separator }]}>
      <View style={styles.barContent}>
        {/* Left Tabs: Home, Market */}
        {TABS_LEFT.map((t) => (
          <TabBarButton key={t.key} t={t} focused={activeName === t.key} onPress={go(t.key)} />
        ))}

        {/* Raised Center "+" Action Button */}
        <View style={styles.centerButtonWrapper}>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Create"
            haptic="medium"
            scaleTo={0.9}
            onPress={handleCreate}
            style={[
              styles.raisedCreateBtn,
              {
                backgroundColor: ui.accent,
                borderColor: ui.background,
              },
            ]}>
            <Ionicons name="add" size={28} color={ui.onAccent} />
          </PressableScale>
        </View>

        {/* Right Tabs: Wallet, Profile */}
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
        <Tabs.Screen name="shop" options={{ href: null }} />
        <Tabs.Screen name="inbox" options={{ href: null }} />
      </Tabs>

      <CreateSheet visible={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  dockedBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 4,
    paddingHorizontal: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  barContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 2,
  },
  tabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    gap: 3,
  },
  iconPill: {
    width: 48,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: -0.1,
  },
  centerButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  raisedCreateBtn: {
    marginTop: -24,
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    ...continuous,
  },
});

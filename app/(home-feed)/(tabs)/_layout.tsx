import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreateSheet } from '@/components/ui/CreateSheet';
import { palette } from '@/src/theme';

// type TabKey = 'index' | 'market' | 'hive' | 'wallet' | 'profile';
type TabKey = 'index' | 'market' | 'wallet' | 'profile' | 'hive'; // Kept 'hive' in type for commented out tab
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
  // { key: 'hive', iconSet: 'mci', icon: 'hexagon-multiple-outline', iconActive: 'hexagon-multiple', label: 'Hive' },
  { key: 'market', iconSet: 'ion', icon: 'storefront-outline', iconActive: 'storefront', label: 'Market' },
];

const TABS_RIGHT: TabSpec[] = [
  { key: 'wallet', iconSet: 'ion', icon: 'wallet-outline', iconActive: 'wallet', label: 'Wallet' },
  { key: 'profile', iconSet: 'ion', icon: 'person-outline', iconActive: 'person', label: 'Profile' },
];

function TabIcon({ spec, focused }: { spec: TabSpec; focused: boolean }) {
  const color = focused ? palette.brand.orangeDeep : palette.brand.orange;
  if (spec.iconSet === 'mci') {
    return (
      <MaterialCommunityIcons
        name={(focused ? spec.iconActive : spec.icon) as keyof typeof MaterialCommunityIcons.glyphMap}
        size={22}
        color={color}
      />
    );
  }
  return (
    <Ionicons
      name={(focused ? spec.iconActive : spec.icon) as keyof typeof Ionicons.glyphMap}
      size={20}
      color={color}
    />
  );
}

export default function TabLayout() {
  const [createOpen, setCreateOpen] = useState(false);

  const renderTab = (t: TabSpec, focused: boolean, onPress: () => void) => (
    <Pressable
      key={t.key}
      accessibilityRole="button"
      accessibilityLabel={t.label}
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      style={[styles.slot, focused && styles.slotActive]}>
      <TabIcon spec={t} focused={focused} />
    </Pressable>
  );

  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={({ state, navigation }) => {
          const activeName = state.routes[state.index]?.name;
          return (
            <SafeAreaView edges={['bottom']} style={styles.safe}>
              <View style={styles.bar}>
                {TABS_LEFT.map((t) =>
                  renderTab(t, activeName === t.key, () => navigation.navigate(t.key)),
                )}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Create"
                  onPress={() => setCreateOpen(true)}
                  style={({ pressed }) => [styles.createBtn, pressed && { opacity: 0.85 }]}>
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </Pressable>

                {TABS_RIGHT.map((t) =>
                  renderTab(t, activeName === t.key, () => navigation.navigate(t.key)),
                )}
              </View>
            </SafeAreaView>
          );
        }}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="market" />
        <Tabs.Screen name="wallet" />
        <Tabs.Screen name="profile" />
        {/* Routes still navigable but hidden from the bar */}
        {/* <Tabs.Screen name="hive" /> */}
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
  safe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  bar: {
    marginHorizontal: 12,
    marginBottom: 8,
    height: 60,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  slot: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotActive: {
    backgroundColor: 'rgba(216, 149, 68, 0.18)',
  },
  createBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.brand.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
});

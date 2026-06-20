import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, interpolateColor } from 'react-native-reanimated';

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

function TabBarButton({ t, focused, onPress, onLayout }: { t: TabSpec; focused: boolean; onPress: () => void; onLayout: (e: any) => void }) {
  return (
    <Pressable
      key={t.key}
      accessibilityRole="button"
      accessibilityLabel={t.label}
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      onLayout={onLayout}
      style={styles.slot}>
      <TabIcon spec={t} focused={focused} />
    </Pressable>
  );
}

function CustomTabBar({ state, navigation }: { state: any; navigation: any }) {
  const activeName = state.routes[state.index]?.name;
  const [positions, setPositions] = useState<Record<string, number>>({});
  
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (positions[activeName] !== undefined) {
      translateX.value = withTiming(positions[activeName], { duration: 250 });
    }
  }, [activeName, positions]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      opacity: translateX.value > 0 || positions[activeName] === 0 ? 1 : 0, // hide until first layout
    };
  });

  const renderTab = (t: TabSpec, focused: boolean, onPress: () => void) => (
    <TabBarButton 
      key={t.key} 
      t={t} 
      focused={focused} 
      onPress={onPress} 
      onLayout={(e) => {
        const x = e.nativeEvent.layout.x;
        setPositions((prev) => ({ ...prev, [t.key]: x }));
      }}
    />
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <View style={styles.bar}>
        <Animated.View style={[styles.slidingIndicator, indicatorStyle]} />
        
        {TABS_LEFT.map((t) =>
          renderTab(t, activeName === t.key, () => navigation.navigate(t.key)),
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create"
          // @ts-ignore - handled by parent
          onPress={() => navigation.emit({ type: 'openCreate' })}
          style={({ pressed }) => [styles.createBtn, pressed && { opacity: 0.85 }]}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </Pressable>

        {TABS_RIGHT.map((t) =>
          renderTab(t, activeName === t.key, () => navigation.navigate(t.key)),
        )}
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
    overflow: 'hidden', // to ensure background respects border radius
  },
  slidingIndicator: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 999,
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

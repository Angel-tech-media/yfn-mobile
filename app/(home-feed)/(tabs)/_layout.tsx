import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreateSheet } from '@/components/ui/CreateSheet';
import { palette } from '@/src/theme';

type TabKey = 'index' | 'shop' | 'inbox' | 'profile';

const TABS: Array<{
  key: TabKey;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  label: string;
}> = [
  { key: 'index', icon: 'home-outline', iconActive: 'home', label: 'Home' },
  { key: 'shop', icon: 'storefront-outline', iconActive: 'storefront', label: 'Shop' },
  { key: 'inbox', icon: 'chatbubble-outline', iconActive: 'chatbubble', label: 'Inbox' },
  { key: 'profile', icon: 'person-outline', iconActive: 'person', label: 'Profile' },
];

export default function TabLayout() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={({ state, navigation }) => (
          <SafeAreaView edges={['bottom']} style={styles.safe}>
            <View style={styles.bar}>
              {TABS.slice(0, 2).map((t) => {
                const focused = state.routes[state.index]?.name === t.key;
                return (
                  <Pressable
                    key={t.key}
                    accessibilityRole="button"
                    accessibilityLabel={t.label}
                    accessibilityState={{ selected: focused }}
                    onPress={() => navigation.navigate(t.key)}
                    style={[styles.slot, focused && styles.slotActive]}>
                    <Ionicons
                      name={focused ? t.iconActive : t.icon}
                      size={22}
                      color={focused ? palette.ink.onLightStrong : palette.ink.onDarkSoft}
                    />
                  </Pressable>
                );
              })}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Create"
                onPress={() => setCreateOpen(true)}
                style={({ pressed }) => [styles.createBtn, pressed && { opacity: 0.85 }]}>
                <Ionicons name="add" size={26} color="#FFFFFF" />
              </Pressable>

              {TABS.slice(2).map((t) => {
                const focused = state.routes[state.index]?.name === t.key;
                return (
                  <Pressable
                    key={t.key}
                    accessibilityRole="button"
                    accessibilityLabel={t.label}
                    accessibilityState={{ selected: focused }}
                    onPress={() => navigation.navigate(t.key)}
                    style={[styles.slot, focused && styles.slotActive]}>
                    <Ionicons
                      name={focused ? t.iconActive : t.icon}
                      size={22}
                      color={focused ? palette.ink.onLightStrong : palette.ink.onDarkSoft}
                    />
                  </Pressable>
                );
              })}
            </View>
          </SafeAreaView>
        )}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="shop" />
        <Tabs.Screen name="inbox" />
        <Tabs.Screen name="profile" />
      </Tabs>

      <CreateSheet visible={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: 'transparent',
  },
  bar: {
    marginHorizontal: 16,
    marginBottom: 8,
    height: 64,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    backgroundColor: 'rgba(20,12,8,0.92)',
    borderWidth: 1,
    borderColor: palette.line.onDark,
  },
  slot: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotActive: {
    backgroundColor: palette.bg.surface,
  },
  createBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.brand.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});

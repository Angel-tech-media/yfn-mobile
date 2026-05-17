import { Pressable, StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { palette } from '@/src/theme';

export type TabKey = 'home' | 'shop' | 'reels' | 'inbox' | 'profile';

type Item = {
  key: TabKey;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  label: string;
};

const ITEMS: Item[] = [
  { key: 'home', icon: 'home-outline', iconActive: 'home', label: 'Home' },
  { key: 'shop', icon: 'storefront-outline', iconActive: 'storefront', label: 'Shop' },
  { key: 'reels', icon: 'play-circle-outline', iconActive: 'play-circle', label: 'Reels' },
  { key: 'inbox', icon: 'chatbubble-outline', iconActive: 'chatbubble', label: 'Inbox' },
  { key: 'profile', icon: 'person-outline', iconActive: 'person', label: 'Profile' },
];

type Props = {
  active: TabKey;
  onChange: (key: TabKey) => void;
};

export function BottomTabBar({ active, onChange }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.pill}>
        {ITEMS.map((item) => {
          const isActive = item.key === active;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: isActive }}
              onPress={() => onChange(item.key)}
              style={({ pressed }) => [
                styles.slot,
                isActive && styles.slotActive,
                pressed && styles.pressed,
              ]}>
              <Ionicons
                name={isActive ? item.iconActive : item.icon}
                size={22}
                color={isActive ? palette.ink.onLightStrong : palette.ink.onDarkSoft}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
  },
  pill: {
    height: 64,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
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
  pressed: { opacity: 0.7 },
});

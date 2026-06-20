import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { palette, spacing } from '@/src/theme';

export type TabKey = 'posts' | 'products' | 'reposts';

export function ProfileTabs({
  activeTab,
  onTabChange,
  tabs = ['posts', 'products', 'reposts'],
}: {
  activeTab: string;
  onTabChange: (tab: any) => void;
  tabs?: string[];
}) {
  const activeIndex = tabs.indexOf(activeTab) !== -1 ? tabs.indexOf(activeTab) : 0;
  const tabWidth = 100 / tabs.length;
  const offset = useSharedValue(activeIndex * 100);

  useEffect(() => {
    offset.value = withTiming(activeIndex * 100, { duration: 250, easing: Easing.out(Easing.ease) });
  }, [activeIndex, offset]);

  const indicatorStyle = useAnimatedStyle(() => {
    // using number + '%' string conversion for translateX
    return {
      transform: [{ translateX: `${offset.value}%` as any }],
    };
  });

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        let iconName: any = 'grid-outline';
        if (tab === 'posts') iconName = activeTab === 'posts' ? 'grid' : 'grid-outline';
        if (tab === 'products') iconName = activeTab === 'products' ? 'cube' : 'cube-outline';
        if (tab === 'reposts') iconName = activeTab === 'reposts' ? 'repeat' : 'repeat-outline';

        const isActive = activeTab === tab;

        return (
          <Pressable
            key={tab}
            onPress={() => onTabChange(tab)}
            style={styles.tab}>
            <Ionicons
              name={iconName}
              size={24}
              color={isActive ? palette.brand.orange : palette.ink.onDarkMuted}
            />
          </Pressable>
        );
      })}
      <Animated.View style={[styles.indicator, { width: `${tabWidth}%` }, indicatorStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: palette.line.divider,
    marginHorizontal: spacing['5'],
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3'],
  },
  indicator: {
    position: 'absolute',
    bottom: -1,
    height: 3,
    backgroundColor: palette.brand.orange,
  },
});

import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
            style={[styles.tab, isActive && styles.tabActive]}>
            <Ionicons
              name={iconName}
              size={24}
              color={isActive ? palette.brand.orange : palette.ink.onDarkMuted}
            />
          </Pressable>
        );
      })}
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
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    marginBottom: -1, // overlap the container bottom border
  },
  tabActive: {
    borderBottomColor: palette.brand.orange,
  },
});

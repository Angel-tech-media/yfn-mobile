import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

export default function TabTwoScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Explore</Text>
      <Text style={styles.copy}>
        This tab is now a clean placeholder for product discovery, onboarding, or supporting
        content.
      </Text>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Suggested next steps</Text>
        <Text style={styles.panelItem}>Create real route groups under `app/`.</Text>
        <Text style={styles.panelItem}>Add query hooks under `src/` by feature.</Text>
        <Text style={styles.panelItem}>Replace placeholder copy with product content.</Text>
      </View>

      <Pressable onPress={() => void Linking.openURL('https://docs.expo.dev/router/introduction')}>
        <Text style={styles.link}>Expo Router docs</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff7ed',
  },
  title: {
    marginBottom: 12,
    color: '#7c2d12',
    fontSize: 32,
    fontWeight: '700',
  },
  copy: {
    marginBottom: 24,
    color: '#9a3412',
    fontSize: 16,
    lineHeight: 24,
  },
  panel: {
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  panelTitle: {
    marginBottom: 10,
    color: '#7c2d12',
    fontSize: 18,
    fontWeight: '600',
  },
  panelItem: {
    color: '#9a3412',
    fontSize: 15,
    lineHeight: 22,
  },
  link: {
    color: '#c2410c',
    fontSize: 16,
    fontWeight: '600',
  },
});

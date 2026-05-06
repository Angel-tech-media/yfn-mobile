import { StyleSheet, Text, View } from 'react-native';

import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>YFN Mobile</Text>
        <Text style={styles.title}>Base app shell is ready.</Text>
        <Text style={styles.copy}>
          The starter example folders have been removed. Use this screen as the new entry point for
          your actual product flows.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current setup</Text>
        <Text style={styles.cardCopy}>Expo Router for navigation.</Text>
        <Text style={styles.cardCopy}>TanStack Query provider wired at the app root.</Text>
        <Text style={styles.cardCopy}>No root-level starter UI abstractions remaining.</Text>
      </View>

      <Link href="/modal" style={styles.link}>
        Open modal
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  hero: {
    marginBottom: 24,
  },
  eyebrow: {
    marginBottom: 8,
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    marginBottom: 12,
    color: '#0f172a',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
  },
  copy: {
    color: '#475569',
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  cardTitle: {
    marginBottom: 10,
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '600',
  },
  cardCopy: {
    color: '#334155',
    fontSize: 15,
    lineHeight: 22,
  },
  link: {
    color: '#0f766e',
    fontSize: 16,
    fontWeight: '600',
  },
});

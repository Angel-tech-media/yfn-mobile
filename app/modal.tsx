import { StyleSheet, Text, View } from 'react-native';

import { Link } from 'expo-router';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This is a modal</Text>
      <Text style={styles.copy}>Use it for lightweight flows that should sit above the tab UI.</Text>
      <Link href="/" dismissTo style={styles.link}>
        Go to home screen
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#120c08',
  },
  link: {
    marginTop: 15,
    color: '#D89544',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    marginBottom: 12,
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  copy: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});

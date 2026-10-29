import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandLogo } from '@/components/ui/BrandLogo';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { palette, spacing, typography } from '@/src/theme';

export default function WelcomeScreen() {
  return (
    <View style={styles.root}>
      <Image
        source={require('@/assets/figma/welcome-hero.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="top center"
      />

      <LinearGradient
        colors={['rgba(0,0,0,0.10)', 'rgba(38,18,10,0.55)', 'rgba(22,9,3,0.96)']}
        locations={[0, 0.45, 0.85]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <BrandLogo size="md" color="#FFFFFF" />
        </View>

        <View style={styles.spacer} />

        <View style={styles.copyBlock}>
          <Text style={styles.title}>
            Your Market.{'\n'}Your Voice.{' '}
            <Text style={styles.titleAccent}>Your Future.</Text>
          </Text>
          <Text style={styles.tagline}>
            Shop, sell, read and connect with your{'\n'}world, all in one app
          </Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton label="Get started" onPress={() => router.push('/intent' as never)} />
          <View style={styles.altRow}>
            <Text style={styles.altLine}>Already have an account? </Text>
            <Pressable onPress={() => router.push('/login')} hitSlop={8}>
              <Text style={styles.altLink}>Log in</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg.espressoEnd,
  },
  safe: {
    flex: 1,
    paddingHorizontal: spacing['5'],
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing['3'],
  },
  spacer: { flex: 1 },
  copyBlock: {
    gap: spacing['3'],
    alignItems: 'center',
    paddingHorizontal: spacing['2'],
    paddingBottom: spacing['6'],
  },
  title: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 30,
    lineHeight: 36,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  titleAccent: {
    color: palette.brand.orange,
  },
  tagline: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.88)',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.30)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  actions: {
    gap: spacing['4'],
    paddingBottom: spacing['4'],
  },
  altRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  altLine: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  altLink: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.brand.orange,
  },
});

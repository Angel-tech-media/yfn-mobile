import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandLogo } from '@/components/ui/BrandLogo';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { palette, spacing, typography } from '@/src/theme';

export default function SplashScreen() {
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(lift, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const t = setTimeout(() => router.replace('/welcome'), 1900);
    return () => clearTimeout(t);
  }, [fade, lift]);

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Animated.View
            style={{
              opacity: fade,
              transform: [{ translateY: lift }],
            }}>
            <BrandLogo size="xl" />
          </Animated.View>
        </View>
        <Animated.View style={{ opacity: fade }}>
          <Text style={styles.tagline}>Marketplace · Stories · You</Text>
        </Animated.View>
      </SafeAreaView>
    </EspressoBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: spacing['5'],
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    textAlign: 'center',
    paddingBottom: spacing['8'],
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: palette.ink.onDarkSoft,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

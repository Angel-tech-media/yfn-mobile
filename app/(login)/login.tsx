import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { authApi } from '@/src/api';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { useUser } from '@/src/store/user';
import { palette, radius, spacing, typography } from '@/src/theme';

export default function LoginScreen() {
  const setRole = useUser((s) => s.setRole);

  const enterAs = async (role: 'buyer' | 'vendor') => {
    setRole(role);
    // Mock sign-in with the demo account — real signup flow handles new users.
    await authApi.login('davidokpo@gmail.com', 'vibe-demo-2026', role);
    router.replace('/(tabs)' as never);
  };

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="" showBack />

      <View style={styles.titleBlock}>
        <Text style={styles.title}>Welcome to Vibe</Text>
        <Text style={styles.subtitle}>How will you be using Vibe today?</Text>
      </View>

      <View style={styles.tiles}>
        <RoleTile
          icon="person"
          label="Buyer"
          tagline="Discover, shop, and follow vendors near you"
          gradient={['#D89544', '#A6692E']}
          onPress={() => enterAs('buyer')}
        />
        <RoleTile
          icon="storefront"
          label="Vendor"
          tagline="Sell your products and reach buyers in your area"
          gradient={['#2A2540', '#0F0E1F']}
          accent="#D89544"
          onPress={() => enterAs('vendor')}
        />
      </View>

      <View style={styles.note}>
        <Ionicons name="shield-checkmark" size={14} color={palette.brand.orange} />
        <Text style={styles.noteText}>
          Vendors complete NIN verification once selected
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>New to Vibe?</Text>
        <Pressable onPress={() => router.push('/signup' as never)} hitSlop={8}>
          <Text style={styles.footerLink}>Create account</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

function RoleTile({
  icon,
  label,
  tagline,
  gradient,
  accent,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tagline: string;
  gradient: [string, string];
  accent?: string;
  onPress: () => void;
}) {
  const accentColor = accent ?? '#fff';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] }]}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.tileIcon, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
        <Ionicons name={icon} size={24} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.tileLabel}>{label}</Text>
        <Text style={styles.tileTagline}>{tagline}</Text>
      </View>
      <View style={[styles.tileArrow, { backgroundColor: accentColor }]}>
        <Ionicons
          name="arrow-forward"
          size={18}
          color={accent ? '#fff' : palette.ink.onLightStrong}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  titleBlock: {
    paddingTop: spacing['5'],
    paddingBottom: spacing['8'],
    alignItems: 'center',
    gap: spacing['2'],
  },
  title: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 28,
    lineHeight: 34,
    color: palette.ink.onDarkStrong,
  },
  subtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: palette.ink.onDarkMuted,
    textAlign: 'center',
    paddingHorizontal: spacing['5'],
  },
  tiles: {
    gap: spacing['3'],
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    padding: spacing['4'],
    minHeight: 110,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  tileIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 22,
    lineHeight: 28,
    color: '#fff',
  },
  tileTagline: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  tileArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    marginTop: spacing['4'],
  },
  noteText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: palette.ink.onDarkSoft,
  },
  footer: {
    paddingVertical: spacing['5'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 'auto',
  },
  footerText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkSoft,
  },
  footerLink: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.brand.orange,
  },
});

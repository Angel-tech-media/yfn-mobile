import { useEffect, useMemo, useRef, useState } from 'react';

import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { useToast } from '@/src/hooks/use-toast';
import { useAuth } from '@/src/store/auth';
import { useUser } from '@/src/store/user';
import { palette, radius, spacing, typography } from '@/src/theme';

export default function LoginScreen() {
  const setRole = useUser((s) => s.setRole);
  const signIn = useAuth((s) => s.signIn);
  const toast = useToast();
  const [role, setSelectedRole] = useState<'buyer' | 'vendor'>('buyer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length >= 8 && !submitting,
    [email, password, submitting],
  );

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setRole(role);
    const result = await signIn({ email: email.trim(), password, role });
    setSubmitting(false);
    if (!result.ok) {
      toast.error('Login failed', {
        description: result.reason,
      });
      return;
    }
    toast.success('Welcome back!', {
      description: `Signed in as ${role}`,
      icon: 'hand-right',
    });
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
          selected={role === 'buyer'}
          onPress={() => setSelectedRole('buyer')}
        />
        <RoleTile
          icon="storefront"
          label="Vendor"
          tagline="Sell your products and reach buyers in your area"
          gradient={['#2A2540', '#0F0E1F']}
          accent="#D89544"
          selected={role === 'vendor'}
          onPress={() => setSelectedRole('vendor')}
        />
      </View>

      <View style={styles.form}>
        <TextField
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextField
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          isPassword
        />

        <PrimaryButton
          label={`Log in as ${role === 'buyer' ? 'buyer' : 'vendor'}`}
          onPress={submit}
          disabled={!canSubmit}
          loading={submitting}
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
        <Pressable onPress={() => router.push(`/signup?role=${role}` as never)} hitSlop={8}>
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
  selected,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tagline: string;
  gradient: [string, string];
  accent?: string;
  selected?: boolean;
  onPress: () => void;
}) {
  const accentColor = accent ?? '#fff';
  const selectedProgress = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(selectedProgress, {
      toValue: selected ? 1 : 0,
      useNativeDriver: true,
      tension: 140,
      friction: 16,
    }).start();
  }, [selected, selectedProgress]);

  const arrowOpacity = selectedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const checkOpacity = selectedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const arrowScale = selectedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.72],
  });
  const checkScale = selectedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.72, 1],
  });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        selected && styles.tileSelected,
        pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
      ]}>
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
        <Animated.View
          style={[
            styles.tileIconLayer,
            { opacity: arrowOpacity, transform: [{ scale: arrowScale }] },
          ]}>
          <Ionicons
            name="arrow-forward"
            size={18}
            color={accent ? '#fff' : palette.ink.onLightStrong}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.tileIconLayer,
            { opacity: checkOpacity, transform: [{ scale: checkScale }] },
          ]}>
          <Ionicons
            name="checkmark"
            size={18}
            color={accent ? '#fff' : palette.ink.onLightStrong}
          />
        </Animated.View>
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
  tileSelected: {
    borderColor: '#fff',
    borderWidth: 2,
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
  tileIconLayer: {
    ...StyleSheet.absoluteFillObject,
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
  form: {
    gap: spacing['3'],
    paddingTop: spacing['5'],
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

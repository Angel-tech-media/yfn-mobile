import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, spacing, typography } from '@/src/theme';

export default function SnapSelfieScreen() {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#1A1812', '#0A0805']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </Pressable>
          <View style={styles.topRightStack}>
            <Pressable hitSlop={8} style={styles.iconBtn}>
              <Ionicons name="camera-reverse-outline" size={22} color="#FFFFFF" />
            </Pressable>
            <Pressable hitSlop={8} style={styles.iconBtn}>
              <Ionicons name="flash-outline" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <View style={styles.headerCopy}>
          <Text style={styles.title}>Snap selfie</Text>
          <Text style={styles.subtitle}>
            Position your face in the frame. Ensure there is{'\n'}good lighting.
          </Text>
        </View>

        <View style={styles.faceFrameWrap}>
          <View style={styles.faceFrame} />
        </View>

        <View style={styles.controls}>
          <Pressable style={styles.sideBtn} hitSlop={8}>
            <Ionicons name="images-outline" size={22} color="#FFFFFF" />
            <Text style={styles.sideBtnLabel}>Gallery</Text>
          </Pressable>
          <Pressable
            style={styles.shutterOuter}
            onPress={() => router.replace('/vendor-verify/complete')}>
            <View style={styles.shutterInner} />
          </Pressable>
          <Pressable style={styles.sideBtn} hitSlop={8}>
            <Ionicons name="help-circle-outline" size={22} color="#FFFFFF" />
            <Text style={styles.sideBtnLabel}>Help</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: spacing['4'] },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: spacing['2'],
  },
  topRightStack: {
    gap: spacing['2'],
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  headerCopy: {
    alignItems: 'center',
    gap: spacing['2'],
    paddingTop: spacing['4'],
    paddingBottom: spacing['4'],
  },
  title: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 22,
    lineHeight: 28,
    color: palette.ink.onDarkStrong,
  },
  subtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkSoft,
    textAlign: 'center',
  },
  faceFrameWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceFrame: {
    width: 220,
    height: 280,
    borderRadius: 999,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#FFFFFF',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['6'],
    paddingBottom: spacing['4'],
  },
  sideBtn: { alignItems: 'center', gap: 4 },
  sideBtnLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 14,
    color: palette.ink.onDarkSoft,
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
});

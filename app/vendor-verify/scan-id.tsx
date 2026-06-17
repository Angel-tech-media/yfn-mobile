import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSubmitIdDocument } from '@/src/api/auth/hooks';
import type { IdDocumentType } from '@/src/api/types';
import { useImagePicker } from '@/src/hooks/useImagePicker';
import { palette, radius, spacing, typography } from '@/src/theme';
import { assetUploadErrorMessage, uploadLocalAsset } from '@/src/utils/upload-media';

export default function ScanIdScreen() {
  const { country: countryParam, source, type } = useLocalSearchParams<{
    country?: string;
    source?: string;
    type?: string;
  }>();
  const idType = parseIdType(type);
  const country = typeof countryParam === 'string' && countryParam ? countryParam : 'NG';
  const { pick } = useImagePicker();
  const submitIdDocument = useSubmitIdDocument();
  const galleryLaunched = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setUploading] = useState(false);
  const isBusy = isUploading || submitIdDocument.isPending;

  const submitDocument = useCallback(
    async (pickerSource: 'camera' | 'library') => {
      if (!idType) {
        setError('Choose an ID type before uploading your document.');
        return;
      }
      if (isBusy) return;

      setError(null);
      const image = await pick(pickerSource, { mediaTypes: ['images'] });
      if (!image) return;

      setUploading(true);
      let frontMediaId: string;
      try {
        const uploaded = await uploadLocalAsset(image, 'kyc');
        frontMediaId = uploaded.mediaId;
      } catch (err) {
        setError(assetUploadErrorMessage(err));
        setUploading(false);
        return;
      }

      try {
        const document = await submitIdDocument.mutateAsync({
          country,
          type: idType,
          frontMediaId,
        });
        router.push(`/vendor-verify/photo-guide?idDocumentId=${document.idDocumentId}` as never);
      } catch {
        setError('Could not submit your ID document.');
      } finally {
        setUploading(false);
      }
    },
    [country, idType, isBusy, pick, submitIdDocument],
  );

  useEffect(() => {
    if (source !== 'gallery' || galleryLaunched.current) return;
    galleryLaunched.current = true;
    submitDocument('library');
  }, [source, submitDocument]);

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
          <Pressable hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="camera-reverse-outline" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.headerCopy}>
          <Text style={styles.title}>Scan front of ID</Text>
          <Text style={styles.subtitle}>
            Please point the camera at the ID card. Position it{'\n'}inside the frame. Make sure it is clear enough.
          </Text>
        </View>

        <View style={styles.viewfinder}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>

        <View style={styles.controls}>
          <Pressable
            disabled={isBusy}
            onPress={() => submitDocument('library')}
            style={({ pressed }) => [styles.sideBtn, isBusy && { opacity: 0.5 }, pressed && { opacity: 0.85 }]}
            hitSlop={8}>
            <Ionicons name="images-outline" size={22} color="#FFFFFF" />
            <Text style={styles.sideBtnLabel}>Gallery</Text>
          </Pressable>
          <Pressable
            disabled={isBusy}
            style={styles.shutterOuter}
            onPress={() => submitDocument('camera')}>
            {isBusy ? <ActivityIndicator color="#FFFFFF" /> : <View style={styles.shutterInner} />}
          </Pressable>
          <Pressable style={styles.sideBtn} hitSlop={8}>
            <Ionicons name="help-circle-outline" size={22} color="#FFFFFF" />
            <Text style={styles.sideBtnLabel}>Help</Text>
          </Pressable>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </SafeAreaView>
    </View>
  );
}

function parseIdType(value: string | string[] | undefined): IdDocumentType | null {
  const normalized = Array.isArray(value) ? value[0] : value;
  if (
    normalized === 'national' ||
    normalized === 'passport' ||
    normalized === 'driver' ||
    normalized === 'voter'
  ) {
    return normalized;
  }
  return null;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: spacing['4'] },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing['2'],
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  headerCopy: {
    alignItems: 'center',
    gap: spacing['2'],
    paddingTop: spacing['4'],
    paddingBottom: spacing['6'],
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
  viewfinder: {
    alignSelf: 'center',
    width: '100%',
    aspectRatio: 1.6,
    borderRadius: radius.lg,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: palette.brand.orange,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: radius.md },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: radius.md },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: radius.md },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: radius.md },
  controls: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['6'],
    paddingBottom: spacing['4'],
  },
  sideBtn: {
    alignItems: 'center',
    gap: 4,
  },
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
  errorText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: palette.status.danger,
    textAlign: 'center',
    paddingBottom: spacing['3'],
  },
});

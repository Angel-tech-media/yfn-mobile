import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TextField } from '@/components/ui/TextField';
import { useMe } from '@/src/api/account/hooks';
import { useCreateReel } from '@/src/api/feed/hooks';
import { useImagePicker, type PickedImage } from '@/src/hooks/useImagePicker';
import { useToast } from '@/src/hooks/use-toast';
import { palette, radius, spacing, typography } from '@/src/theme';
import { apiErrorMessage } from '@/src/utils/api-error-message';
import { logApiFailure } from '@/src/utils/api-logging';
import { assetUploadErrorMessage, uploadLocalAsset } from '@/src/utils/upload-media';

export default function CreateReelScreen() {
  const [video, setVideo] = useState<PickedImage | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setUploading] = useState(false);
  const { data: me } = useMe();
  const audio = `original sound · ${me?.username ?? 'me'}`;
  const { pick } = useImagePicker();
  const createReel = useCreateReel();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  if (!video) {
    return (
      <View style={styles.root}>
        <LinearGradient colors={['#1A1812', '#0A0805']} style={StyleSheet.absoluteFill} />
        <View style={[styles.safe, { paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.topRow}>
            <Pressable onPress={() => router.back()} style={styles.iconBtn} hitSlop={8}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.center}>
            <View style={styles.recordRing}>
              <View style={styles.recordCenter} />
            </View>
            <Text style={styles.recordHint}>Hold to record up to 60s</Text>
            <View style={styles.actionsRow}>
              <Pressable
                onPress={async () => {
                  const v = await pick('library', { mediaTypes: ['videos'] });
                  if (v) setVideo(v);
                }}
                style={styles.secondaryBtn}>
                <Ionicons name="film-outline" size={18} color="#FFFFFF" />
                <Text style={styles.secondaryLabel}>From gallery</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  const v = await pick('camera', { mediaTypes: ['videos'] });
                  if (v) setVideo(v);
                }}
                style={styles.secondaryBtn}>
                <Ionicons name="videocam-outline" size={18} color="#FFFFFF" />
                <Text style={styles.secondaryLabel}>Record now</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ReelVideoPreview uri={video.uri} />
      <LinearGradient
        colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(0,0,0,0.85)']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.safe, { paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.topRow}>
          <Pressable onPress={() => setVideo(null)} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>New reel</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.captionBlock}>
          <TextField
            placeholder="Add a caption…"
            value={caption}
            onChangeText={setCaption}
            multiline
            numberOfLines={3}
          />
          <View style={styles.audioRow}>
            <Ionicons name="musical-notes" size={14} color="#FFFFFF" />
            <Text style={styles.audioText}>{audio}</Text>
          </View>
        </View>

        <View style={styles.actionsBottom}>
          <Pressable
            disabled={!video || createReel.isPending || isUploading}
            onPress={async () => {
              if (!video || createReel.isPending || isUploading) return;
              setUploading(true);
              let videoMediaId: string;
              try {
                const uploaded = await uploadLocalAsset(video, 'reel');
                videoMediaId = uploaded.mediaId;
              } catch (err) {
                toast.error('Upload failed', {
                  description: assetUploadErrorMessage(err),
                });
                setUploading(false);
                return;
              }

              try {
                await createReel.mutateAsync({
                  videoMediaId,
                  caption: caption.trim(),
                  audio,
                });
                toast.success('Reel posted!', {
                  icon: 'videocam',
                });
                router.back();
              } catch (err) {
                logApiFailure('POST /reels', err, {
                  endpoint: 'POST /reels',
                  flow: 'reel',
                  videoMediaId,
                  captionLength: caption.trim().length,
                  hasAudio: Boolean(audio),
                });
                toast.error('Could not post reel', {
                  description: apiErrorMessage(err),
                });
              } finally {
                setUploading(false);
              }
            }}
            style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.85 }]}>
            <Text style={styles.shareLabel}>{createReel.isPending || isUploading ? 'Posting' : 'Post reel'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function ReelVideoPreview({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (nextPlayer) => {
    nextPlayer.loop = true;
    nextPlayer.muted = true;
    nextPlayer.play();
  });

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      nativeControls={false}
      allowsFullscreen={false}
      surfaceType="textureView"
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  safe: { flex: 1, paddingHorizontal: spacing['4'] },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing['2'] },
  headerTitle: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 16,
    color: '#FFFFFF',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing['4'] },
  recordRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordCenter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.brand.orange,
  },
  recordHint: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkSoft,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing['3'],
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing['4'],
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  secondaryLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    color: '#FFFFFF',
  },
  captionBlock: { gap: spacing['2'], paddingBottom: spacing['3'] },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing['3'],
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  audioText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: '#FFFFFF',
  },
  actionsBottom: { paddingBottom: spacing['4'] },
  shareBtn: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareLabel: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 15,
    color: '#FFFFFF',
  },
});

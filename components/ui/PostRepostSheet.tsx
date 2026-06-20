import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';

import { useToggleRepostPost } from '@/src/api/feed/hooks';
import { useAuth } from '@/src/store/auth';
import { useToast } from '@/src/hooks/use-toast';
import { palette, radius, spacing, typography } from '@/src/theme';

import { BottomSheet } from './BottomSheet';

type Visibility = 'public' | 'mutuals' | 'close-friends';

type Props = {
  visible: boolean;
  onClose: () => void;
  post: {
    id: string;
    authorHandle: string;
    author: string;
    repostedByMe?: boolean;
    caption?: string;
  };
};

const VISIBILITY: Array<{ key: Visibility; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'public', label: 'Public', icon: 'globe-outline' },
  { key: 'mutuals', label: 'Mutuals only', icon: 'people-outline' },
  { key: 'close-friends', label: 'Close friends', icon: 'star-outline' },
];

export function PostRepostSheet({ visible, onClose, post }: Props) {
  const [caption, setCaption] = useState('');
  const [visibilityMode, setVisibilityMode] = useState<Visibility>('public');
  const userId = useAuth((s) => s.user?.handle);
  const toast = useToast();
  const toggleRepost = useToggleRepostPost();
  
  const reposted = !!post.repostedByMe;
  const canRepost = post.authorHandle !== userId;
  const pending = toggleRepost.isPending;

  const handleRepost = () => {
    toggleRepost.mutate(
      {
        postId: post.id,
        isReposted: reposted,
        input: reposted ? undefined : {
          caption: caption.trim() || undefined,
          visibility: visibilityMode,
        },
      },
      {
        onSuccess: () => {
          toast.show({
            variant: 'success',
            title: reposted ? 'Repost removed' : 'Post reposted',
          });
          setCaption('');
          onClose();
        },
        onError: (error: any) => {
          const status = error?.response?.status;
          const msg = error?.response?.data?.message;
          if (status === 401) {
            toast.show({ variant: 'error', title: 'You must be logged in to repost.' });
          } else if (status === 422) {
            toast.show({ variant: 'error', title: msg || 'Cannot repost your own post.' });
          } else if (status === 404) {
            toast.show({ variant: 'error', title: 'Post not found. It may have been deleted.' });
          } else {
            toast.show({ variant: 'error', title: 'Failed to repost post.' });
          }
          console.error('Repost error:', error);
        },
      },
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.headerRow}>
        <Ionicons name="repeat" size={20} color={palette.brand.orange} />
        <Text style={styles.title}>{reposted ? 'Undo Repost' : 'Repost Post'}</Text>
      </View>

      <Text style={styles.subtitle}>
        Share this post with your followers.
      </Text>

      {/* Post preview card */}
      <View style={styles.postCard}>
        <View style={styles.postThumb}>
          <Ionicons name="document-text-outline" size={20} color={palette.ink.onLightStrong} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.postAuthor} numberOfLines={1}>
            {post.author}
          </Text>
          <Text style={styles.postCaption} numberOfLines={1}>
            {post.caption || 'No caption'}
          </Text>
        </View>
      </View>

      {!reposted && (
        <>
          {/* Caption */}
          <Text style={styles.fieldLabel}>Add your take (optional)</Text>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Write a quote or comment…"
            placeholderTextColor={palette.ink.onDarkMuted}
            multiline
            style={styles.captionInput}
            maxLength={280}
          />

          {/* Visibility */}
          <Text style={styles.fieldLabel}>Who sees it</Text>
          <View style={styles.visibilityRow}>
            {VISIBILITY.map((v) => {
              const on = visibilityMode === v.key;
              return (
                <Pressable
                  key={v.key}
                  onPress={() => setVisibilityMode(v.key)}
                  style={[styles.visibilityChip, on && styles.visibilityChipOn]}>
                  <Ionicons
                    name={v.icon}
                    size={14}
                    color={on ? palette.ink.onLightStrong : palette.ink.onDarkSoft}
                  />
                  <Text style={[styles.visibilityLabel, on && styles.visibilityLabelOn]}>
                    {v.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {/* CTA */}
      {canRepost ? (
        <Pressable
          onPress={handleRepost}
          disabled={pending}
          style={({ pressed }) => [
            styles.cta,
            reposted && styles.ctaUndo,
            pending && { opacity: 0.6 },
            pressed && { opacity: 0.9 },
          ]}>
          <Ionicons name={reposted ? 'close' : 'repeat'} size={18} color={reposted ? palette.status.danger : "#fff"} />
          <Text style={[styles.ctaLabel, reposted && { color: palette.status.danger }]}>
            {pending ? 'Saving…' : reposted ? 'Undo repost' : 'Repost'}
          </Text>
        </Pressable>
      ) : (
        <View style={styles.ctaDisabled}>
          <Ionicons name="information-circle-outline" size={16} color={palette.ink.onDarkMuted} />
          <Text style={styles.ctaDisabledLabel}>
            You can&apos;t repost your own post.
          </Text>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginBottom: spacing['1'],
  },
  title: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 18,
    color: palette.ink.onDarkStrong,
  },
  subtitle: {
    ...typography.body,
    fontSize: 13,
    color: palette.ink.onDarkMuted,
    marginBottom: spacing['3'],
  },
  postCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: palette.line.onDark,
    marginBottom: spacing['3'],
  },
  postThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postAuthor: {
    ...typography.bodyEmphasis,
    color: palette.ink.onDarkStrong,
  },
  postCaption: {
    ...typography.caption,
    color: palette.ink.onDarkSoft,
  },
  fieldLabel: {
    ...typography.bodyEmphasis,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
    marginBottom: spacing['2'],
  },
  captionInput: {
    ...typography.body,
    color: palette.ink.onDarkStrong,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: radius.md,
    padding: spacing['3'],
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing['4'],
  },
  visibilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2'],
    marginBottom: spacing['5'],
  },
  visibilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing['3'],
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  visibilityChipOn: {
    backgroundColor: 'rgba(216, 149, 68, 0.1)',
    borderColor: palette.brand.orange,
  },
  visibilityLabel: {
    ...typography.bodyEmphasis,
    fontSize: 13,
    color: palette.ink.onDarkSoft,
  },
  visibilityLabelOn: {
    color: palette.brand.orangeDeep,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: palette.brand.orange,
    marginTop: spacing['2'],
  },
  ctaUndo: {
    backgroundColor: 'rgba(255, 59, 71, 0.1)',
  },
  ctaLabel: {
    ...typography.bodyEmphasis,
    color: '#fff',
  },
  ctaDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.04)',
    marginTop: spacing['2'],
  },
  ctaDisabledLabel: {
    ...typography.body,
    fontSize: 14,
    color: palette.ink.onDarkMuted,
  },
});

import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { EmojiPicker } from '@/components/ui/EmojiPicker';
import { FloatingHearts } from '@/src/components/ui/FloatingHearts';
import { useMe } from '@/src/api/account/hooks';
import { chatApi } from '@/src/api/chat';
import { useDeleteStory, useEditStory, useLikeStory, useStoriesInbox, useUnlikeStory, useViewStory } from '@/src/api/feed/hooks';
import { palette, spacing, typography } from '@/src/theme';

const SLIDE_DURATION = 5000;
const { width: SW } = Dimensions.get('window');

export default function StoryViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: stories = [], isError, isLoading, refetch } = useStoriesInbox();
  const { data: me } = useMe();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const authorStories = stories
    .filter((item) => item.author.id === id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  const story = authorStories[currentIndex];
  const isMine = me?.handle === story?.author.handle;
  const [paused, setPaused] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  const viewStory = useViewStory();
  const deleteStory = useDeleteStory();
  const editStory = useEditStory();
  const likeStory = useLikeStory();
  const unlikeStory = useUnlikeStory();

  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [optionsOpen, setOptionsOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editCaption, setEditCaption] = useState('');

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || sending || !story) return;

    setSending(true);
    setPaused(true);
    try {
      const conv = await chatApi.startOrFetch({ participantUserId: story.author.id });
      await chatApi.sendMessage(conv.id, { kind: 'story_reply', body, imageUrl: story.imageUrl });
      
      setDraft('');
      setPaused(false);
      router.back();
    } catch (e) {
      console.error('Failed to send story reply', e);
      setPaused(false);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!story || paused) return;
    if (!isMine) viewStory.mutate(story.id);
    
    progress.setValue(0);
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: SLIDE_DURATION,
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (finished) {
        if (currentIndex < authorStories.length - 1) {
          setCurrentIndex((c) => c + 1);
        } else {
          router.back();
        }
      }
    });
    return () => anim.stop();
  }, [paused, progress, story?.id, currentIndex, authorStories.length, isMine]);

  const handleDelete = () => {
    Alert.alert('Delete Story', 'Are you sure you want to delete this story?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setPaused(false);
          deleteStory.mutate(story.id, {
            onSuccess: () => {
              if (authorStories.length === 1) router.back();
              else if (currentIndex > 0) setCurrentIndex((c) => c - 1);
            },
          });
          setOptionsOpen(false);
        },
      },
    ]);
  };

  const handleEdit = () => {
    setEditCaption(story.caption ?? '');
    setEditing(true);
    setOptionsOpen(false);
  };

  const handleSaveEdit = () => {
    if (story) {
      editStory.mutate({ storyId: story.id, input: { caption: editCaption } }, {
        onSuccess: () => {
          setEditing(false);
          setPaused(false);
        }
      });
    }
  };

  if (isLoading) {
    return <StateView label="Loading story..." />;
  }

  if (isError) {
    return <StateView label="Could not load story." onRetry={() => refetch()} />;
  }

  if (!story) {
    return <StateView label="Story not found." />;
  }

  return (
    <View style={styles.root}>
      <Image source={{ uri: story.imageUrl }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.55)', 'transparent', 'transparent', 'rgba(0, 0, 0, 0.65)']}
        locations={[0, 0.18, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Pressable
        style={styles.tapLeft}
        onPress={() => {
          if (currentIndex > 0) {
            setCurrentIndex((c) => c - 1);
            progress.setValue(0);
          } else {
            router.back();
          }
        }}
        onLongPress={() => setPaused(true)}
        onPressOut={() => setPaused(false)}
      />
      <Pressable
        style={styles.tapRight}
        onPress={() => {
          if (currentIndex < authorStories.length - 1) {
            setCurrentIndex((c) => c + 1);
            progress.setValue(0);
          } else {
            router.back();
          }
        }}
        onLongPress={() => setPaused(true)}
        onPressOut={() => setPaused(false)}
      />

      <SafeAreaView edges={['top']} style={styles.topBar}>
        <View style={styles.segments}>
          {authorStories.map((_, i) => (
            <View key={i} style={styles.segmentTrack}>
              {i < currentIndex ? (
                <View style={[styles.segmentFill, { width: '100%' }]} />
              ) : i === currentIndex ? (
                <Animated.View
                  style={[
                    styles.segmentFill,
                    {
                      width: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.push(`/u/${story.author.handle}` as never)}
            style={styles.authorRow}
            hitSlop={6}>
            <Avatar
              size={32}
              source={story.author.avatarUrl ? { uri: story.author.avatarUrl } : undefined}
              initials={initialsFor(story.author.name)}
            />
            <Text style={styles.author}>{story.author.name}</Text>
            <Text style={styles.age}>{ageLabel(story.createdAt)}</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={() => setPaused((value) => !value)}
            hitSlop={8}
            style={styles.iconBtn}
            accessibilityLabel="Pause/play">
            <Ionicons name={paused ? 'play' : 'pause'} size={16} color="#fff" />
          </Pressable>
          <Pressable hitSlop={8} onPress={() => router.back()} style={styles.iconBtn} accessibilityLabel="Close">
            <Ionicons name="close" size={18} color="#fff" />
          </Pressable>
        </View>
      </SafeAreaView>

      {story.caption ? (
        <View style={styles.captionWrap}>
          <Text style={styles.caption}>{story.caption}</Text>
        </View>
      ) : null}

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        {isMine ? (
          <View style={styles.ownFooter}>
            <View style={styles.viewsRow}>
              <Ionicons name="eye-outline" size={20} color="#fff" />
              <Text style={styles.viewsCount}>{story.viewsCount || 0} Viewers</Text>
              
              {story.likesCount && story.likesCount > 0 ? (
                <>
                  <View style={{ width: 12 }} />
                  <Ionicons name="heart" size={20} color="#EF4444" />
                  <Text style={styles.viewsCount}>{story.likesCount}</Text>
                </>
              ) : null}
            </View>
            <View style={{ flex: 1 }} />
            <Pressable
              hitSlop={8}
              style={styles.iconBtn}
              accessibilityLabel="More"
              onPress={() => {
                setPaused(true);
                setOptionsOpen(true);
              }}>
              <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.composer}>
              <TextInput
                placeholder={`Reply to ${story.author.name}...`}
                placeholderTextColor="rgba(255,255,255,0.65)"
                style={styles.composerInput}
                value={draft}
                onChangeText={setDraft}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <Pressable
                onPress={() => {
                  setPaused(true);
                  setShowEmojiPicker(true);
                }}
                hitSlop={8}
                style={{ marginLeft: 8 }}>
                <Ionicons name="happy-outline" size={22} color="rgba(255,255,255,0.75)" />
              </Pressable>
            </View>
            <Pressable
              hitSlop={8}
              style={styles.iconBtn}
              accessibilityLabel={story.likedByMe ? "Unlike story" : "Like story"}
              onPress={() => {
                if (story.likedByMe) {
                  unlikeStory.mutate(story.id);
                } else {
                  likeStory.mutate(story.id);
                }
              }}>
              <Ionicons name={story.likedByMe ? "heart" : "heart-outline"} size={26} color={story.likedByMe ? "#EF4444" : "#fff"} />
            </Pressable>
            <Pressable hitSlop={8} style={styles.iconBtn} accessibilityLabel="DM" onPress={handleSend} disabled={sending}>
              <Ionicons name="paper-plane-outline" size={24} color={draft.trim() && !sending ? "#fff" : "rgba(255,255,255,0.85)"} />
            </Pressable>
          </>
        )}
      </SafeAreaView>

      {isMine && story.likesCount && story.likesCount > 0 ? <FloatingHearts count={story.likesCount} /> : null}
      {showEmojiPicker && !editing && (
        <EmojiPicker
          onEmojiSelected={(emoji) => setDraft((d) => d + emoji)}
          onClose={() => {
            setShowEmojiPicker(false);
            setPaused(false);
          }}
        />
      )}

      {editing && (
        <View style={styles.editOverlay}>
          <SafeAreaView edges={['top']} style={{ flex: 1 }}>
            <View style={styles.editHeaderRow}>
              <Pressable onPress={() => { setEditing(false); setPaused(false); }} hitSlop={8}>
                <Text style={styles.editCancelText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSaveEdit} hitSlop={8}>
                <Text style={styles.editSaveText}>Done</Text>
              </Pressable>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: spacing['4'] }}>
              <TextInput
                style={styles.editInput}
                value={editCaption}
                onChangeText={setEditCaption}
                placeholder="Write a caption..."
                placeholderTextColor="rgba(255,255,255,0.65)"
                autoFocus
                multiline
              />
            </View>
          </SafeAreaView>
        </View>
      )}

      <BottomSheet
        visible={optionsOpen}
        onClose={() => {
          setOptionsOpen(false);
          setPaused(false);
        }}>
        <View style={{ paddingBottom: spacing['4'] }}>
          <Pressable style={styles.optionRow} onPress={handleEdit}>
            <Ionicons name="pencil-outline" size={24} color="#000" />
            <Text style={styles.optionText}>Edit Story</Text>
          </Pressable>
          <Pressable style={styles.optionRow} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
            <Text style={[styles.optionText, { color: '#EF4444' }]}>Delete Story</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </View>
  );
}

function StateView({ label, onRetry }: { label: string; onRetry?: () => void }) {
  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.stateHeader}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
          <Ionicons name="close" size={18} color="#fff" />
        </Pressable>
      </SafeAreaView>
      <View style={styles.stateCenter}>
        <Text style={styles.stateText}>{label}</Text>
        {onRetry ? (
          <Pressable onPress={onRetry} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function initialsFor(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'Y';
}

function ageLabel(value: string) {
  const then = new Date(value).getTime();
  if (!Number.isFinite(then)) return '';
  const diff = Math.max(0, Date.now() - then);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  stateHeader: { alignItems: 'flex-end', paddingHorizontal: spacing['3'], paddingTop: 6 },
  stateCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing['3'] },
  stateText: { ...typography.body, color: '#fff' },
  retryBtn: {
    height: 36,
    borderRadius: 999,
    paddingHorizontal: spacing['4'],
    backgroundColor: palette.brand.orange,
    justifyContent: 'center',
  },
  retryText: { ...typography.bodyEmphasis, color: '#fff' },
  tapLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SW * 0.35,
  },
  tapRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: SW * 0.65,
  },
  topBar: {
    paddingHorizontal: spacing['3'],
    paddingTop: 6,
  },
  segments: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 4,
  },
  segmentTrack: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  segmentFill: { height: '100%', backgroundColor: '#fff' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing['2'],
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  author: {
    ...typography.bodyEmphasis,
    color: '#fff',
    fontSize: 14,
  },
  age: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.75)',
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionWrap: {
    position: 'absolute',
    bottom: 130,
    left: spacing['4'],
    right: spacing['4'],
  },
  caption: {
    ...typography.title,
    fontSize: 17,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing['3'],
    paddingBottom: spacing['3'],
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing['2'],
  },
  composer: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    paddingHorizontal: spacing['3'],
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  composerInput: {
    flex: 1,
    color: '#fff',
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    paddingVertical: 4,
  },
  ownFooter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2'],
  },
  viewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewsCount: {
    ...typography.bodyEmphasis,
    color: '#fff',
    fontSize: 15,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingVertical: spacing['4'],
    paddingHorizontal: spacing['4'],
  },
  optionText: {
    ...typography.bodyEmphasis,
    fontSize: 16,
    color: '#000',
  },
  editOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 10,
  },
  editHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
  },
  editCancelText: {
    ...typography.body,
    fontSize: 17,
    color: '#fff',
  },
  editSaveText: {
    ...typography.bodyEmphasis,
    fontSize: 17,
    color: palette.brand.orange,
  },
  editInput: {
    ...typography.title,
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
  },
});

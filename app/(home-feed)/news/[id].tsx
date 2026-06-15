import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNewsArticle } from '@/src/api/news/hooks';
import type { Article } from '@/src/api/types';
import { palette, radius, spacing, typography } from '@/src/theme';

const FALLBACK_COVER: [string, string] = ['#3a2818', '#1f1108'];

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: article, isError, isLoading, refetch } = useNewsArticle(id);
  const [clapped, setClapped] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setClapped(Boolean(article?.clappedByMe));
    setSaved(Boolean(article?.savedByMe));
  }, [article?.clappedByMe, article?.savedByMe, article?.id]);

  if (isLoading) {
    return (
      <View style={styles.root}>
        <SafeAreaView edges={['top']} style={styles.topBar}>
          <BackButton />
        </SafeAreaView>
        <Text style={styles.stateText}>Loading article...</Text>
      </View>
    );
  }

  if (isError || !article) {
    return (
      <View style={styles.root}>
        <SafeAreaView edges={['top']} style={styles.topBar}>
          <BackButton />
        </SafeAreaView>
        <View style={styles.stateBlock}>
          <Text style={styles.stateTitle}>Article unavailable</Text>
          <Text style={styles.stateText}>The backend could not load this story.</Text>
          <Pressable onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const authorInitial = article.author.initial ?? article.author.name.charAt(0).toUpperCase();
  const paragraphs = article.paragraphs?.length ? article.paragraphs : [article.excerpt];
  const claps = article.claps + (clapped && !article.clappedByMe ? 1 : 0);

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Hero article={article}>
          <SafeAreaView edges={['top']} style={styles.heroBar}>
            <BackButton light />
            <View style={styles.heroActions}>
              <Pressable
                onPress={() => setSaved((value) => !value)}
                accessibilityLabel="Save"
                style={styles.heroIconBtn}>
                <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color="#fff" />
              </Pressable>
              <Pressable accessibilityLabel="Share" style={styles.heroIconBtn}>
                <Ionicons name="share-outline" size={18} color="#fff" />
              </Pressable>
            </View>
          </SafeAreaView>
          <View style={styles.heroFooter}>
            <View style={styles.tagPill}>
              <Text style={styles.tagPillText}>{article.category}</Text>
            </View>
          </View>
        </Hero>

        <View style={styles.body}>
          <Text style={styles.headline}>{article.title}</Text>

          <View style={styles.authorRow}>
            {article.author.avatarUrl ? (
              <Image source={{ uri: article.author.avatarUrl }} style={styles.authorAvatar} contentFit="cover" />
            ) : (
              <View style={styles.authorAvatar}>
                <Text style={styles.authorInitial}>{authorInitial}</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.authorName}>{article.author.name}</Text>
              <Text style={styles.authorMeta}>
                {article.author.role ?? 'Vibe News'} · {dateLabel(article.publishedAt)} · {article.readMin} min read
              </Text>
            </View>
            <Pressable style={styles.followBtn}>
              <Text style={styles.followText}>Follow</Text>
            </Pressable>
          </View>

          <View style={styles.actionBar}>
            <Pressable onPress={() => setClapped((value) => !value)} style={styles.actionItem}>
              <Ionicons
                name={clapped ? 'heart' : 'heart-outline'}
                size={18}
                color={clapped ? palette.brand.orangeDeep : palette.ink.onLightSubtle}
              />
              <Text style={styles.actionCount}>{claps.toLocaleString()}</Text>
            </Pressable>
            <View style={styles.actionItem}>
              <Ionicons name="chatbubble-outline" size={18} color={palette.ink.onLightSubtle} />
              <Text style={styles.actionCount}>{article.comments.toLocaleString()}</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Pressable onPress={() => setSaved((value) => !value)} accessibilityLabel="Save">
              <Ionicons
                name={saved ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={saved ? palette.brand.orange : palette.ink.onLightSubtle}
              />
            </Pressable>
            <Pressable accessibilityLabel="Share">
              <Ionicons name="share-outline" size={18} color={palette.ink.onLightSubtle} />
            </Pressable>
          </View>

          <Text style={styles.excerpt}>{article.excerpt}</Text>

          {paragraphs.map((paragraph, index) => (
            <Text key={`${article.id}-${index}`} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}

          {article.tags?.length ? (
            <View style={styles.tagsRow}>
              {article.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.authorCard}>
            {article.author.avatarUrl ? (
              <Image
                source={{ uri: article.author.avatarUrl }}
                style={styles.authorAvatarLg}
                contentFit="cover"
              />
            ) : (
              <View style={styles.authorAvatarLg}>
                <Text style={styles.authorInitialLg}>{authorInitial}</Text>
              </View>
            )}
            <Text style={styles.authorCardName}>Written by {article.author.name}</Text>
            <Text style={styles.authorCardMeta}>{article.author.role ?? 'Vibe News'}</Text>
            <Pressable style={styles.authorFollow}>
              <Text style={styles.authorFollowText}>Follow</Text>
            </Pressable>
          </View>

          {article.related.length ? (
            <>
              <Text style={styles.sectionTitle}>More from Vibe</Text>
              {article.related.map((related) => (
                <Pressable
                  key={related.id}
                  onPress={() => router.push(`/news/${related.id}` as never)}
                  style={styles.relatedCard}>
                  <RelatedThumb article={related} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.relatedHeadline} numberOfLines={3}>
                      {related.title}
                    </Text>
                    <Text style={styles.relatedMeta}>
                      {sourceLabel(related)} · {dateLabel(related.publishedAt)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function BackButton({ light = false }: { light?: boolean }) {
  return (
    <Pressable onPress={() => router.back()} accessibilityLabel="Back" style={styles.heroIconBtn}>
      <Ionicons name="chevron-back" size={20} color={light ? '#fff' : palette.ink.onLightStrong} />
    </Pressable>
  );
}

function Hero({ article, children }: { article: Article; children: ReactNode }) {
  if (article.coverUrl) {
    return (
      <View style={styles.hero}>
        <Image source={{ uri: article.coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
        {children}
      </View>
    );
  }

  return (
    <LinearGradient colors={FALLBACK_COVER} style={styles.hero}>
      {children}
    </LinearGradient>
  );
}

function RelatedThumb({ article }: { article: Article }) {
  if (article.coverUrl) {
    return <Image source={{ uri: article.coverUrl }} style={styles.relatedThumb} contentFit="cover" />;
  }
  return <LinearGradient colors={FALLBACK_COVER} style={styles.relatedThumb} />;
}

function sourceLabel(article: Article) {
  return article.author.role ? article.author.role : article.author.name;
}

function dateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingBottom: 60 },
  topBar: {
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['2'],
  },
  stateBlock: { padding: spacing['5'], gap: spacing['3'] },
  stateTitle: { ...typography.h2, color: palette.ink.onLightStrong },
  stateText: {
    ...typography.body,
    color: palette.ink.onLightSubtle,
    padding: spacing['5'],
  },
  retryBtn: {
    alignSelf: 'flex-start',
    height: 38,
    borderRadius: radius.md,
    paddingHorizontal: spacing['4'],
    backgroundColor: palette.brand.orange,
    justifyContent: 'center',
  },
  retryText: { ...typography.bodyEmphasis, color: '#fff' },
  hero: {
    height: 280,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  heroBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['2'],
  },
  heroActions: { flexDirection: 'row', gap: spacing['2'] },
  heroIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroFooter: {
    paddingHorizontal: spacing['4'],
    paddingBottom: spacing['4'],
  },
  tagPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing['3'],
    height: 26,
    borderRadius: 999,
    backgroundColor: palette.brand.orange,
    justifyContent: 'center',
  },
  tagPillText: {
    ...typography.caption,
    color: '#fff',
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  body: { paddingHorizontal: spacing['5'], paddingTop: spacing['5'] },
  headline: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 30,
    lineHeight: 38,
    color: palette.ink.onLightStrong,
    marginBottom: spacing['4'],
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingVertical: spacing['3'],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: palette.line.divider,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  authorInitial: { ...typography.bodyEmphasis, color: '#fff' },
  authorName: { ...typography.bodyEmphasis, color: palette.ink.onLightStrong },
  authorMeta: {
    ...typography.caption,
    color: palette.ink.onLightSubtle,
    marginTop: 2,
  },
  followBtn: {
    paddingHorizontal: spacing['3'],
    height: 30,
    borderRadius: 999,
    backgroundColor: palette.ink.onLightStrong,
    justifyContent: 'center',
  },
  followText: {
    ...typography.caption,
    color: '#fff',
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4'],
    paddingVertical: spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: palette.line.divider,
  },
  actionItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionCount: {
    ...typography.caption,
    color: palette.ink.onLightSubtle,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  excerpt: {
    fontFamily: 'Manrope_400Regular',
    fontStyle: 'italic',
    fontSize: 18,
    lineHeight: 28,
    color: palette.ink.onLightSubtle,
    marginTop: spacing['5'],
    marginBottom: spacing['4'],
  },
  paragraph: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 17,
    lineHeight: 28,
    color: palette.ink.onLightStrong,
    marginBottom: spacing['4'],
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2'],
    marginTop: spacing['3'],
    marginBottom: spacing['5'],
  },
  tag: {
    paddingHorizontal: spacing['3'],
    height: 30,
    borderRadius: 999,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
  },
  tagText: { ...typography.caption, color: palette.ink.onLightSubtle },
  authorCard: {
    paddingVertical: spacing['5'],
    paddingHorizontal: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing['5'],
  },
  authorAvatarLg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2'],
    overflow: 'hidden',
  },
  authorInitialLg: { ...typography.h2, color: '#fff' },
  authorCardName: { ...typography.title, color: palette.ink.onLightStrong },
  authorCardMeta: {
    ...typography.caption,
    color: palette.ink.onLightSubtle,
    textAlign: 'center',
  },
  authorFollow: {
    paddingHorizontal: spacing['5'],
    height: 36,
    borderRadius: 999,
    backgroundColor: palette.ink.onLightStrong,
    justifyContent: 'center',
    marginTop: spacing['2'],
  },
  authorFollowText: { ...typography.bodyEmphasis, color: '#fff' },
  sectionTitle: {
    ...typography.h2,
    fontSize: 20,
    color: palette.ink.onLightStrong,
    marginBottom: spacing['3'],
  },
  relatedCard: {
    flexDirection: 'row',
    gap: spacing['3'],
    paddingVertical: spacing['3'],
    borderTopWidth: 1,
    borderTopColor: palette.line.divider,
  },
  relatedThumb: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  relatedHeadline: {
    ...typography.bodyEmphasis,
    color: palette.ink.onLightStrong,
    fontSize: 15,
    lineHeight: 21,
  },
  relatedMeta: {
    ...typography.caption,
    color: palette.ink.onLightSubtle,
    marginTop: 4,
  },
});

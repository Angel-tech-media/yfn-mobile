import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { PressableScale } from '@/components/ui/PressableScale';
import { useNewsArticle } from '@/src/api/news/hooks';
import { findCuratedNews } from '@/src/data/curated-news';
import { continuous, corner, layout, type, useUi } from '@/src/theme/ui';

function formatAuthor(author: unknown): string {
  if (!author) return 'Aktive Editorial';
  if (typeof author === 'string') return author;
  if (typeof author === 'object' && author !== null && 'name' in author) {
    const name = (author as { name?: unknown }).name;
    if (typeof name === 'string' && name.trim()) return name;
  }
  return 'Aktive Editorial';
}

function relativeTime(iso?: string): string {
  if (!iso) return 'Today';
  const diffMs = Date.now() - new Date(iso).getTime();
  const hrs = Math.max(1, Math.floor(diffMs / 3600_000));
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ui = useUi();
  const curated = findCuratedNews(id);
  const { data: remoteArticle, isLoading } = useNewsArticle(curated ? undefined : id);
  const article = remoteArticle ?? curated;

  return (
    <EspressoBackground>
      <SafeAreaView edges={['top']} style={styles.safe}>
        {/* Lovable TopBar */}
        <View style={styles.topBar}>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Go back"
            haptic="light"
            scaleTo={0.92}
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: ui.card, borderColor: ui.separator }]}>
            <Ionicons name="arrow-back" size={20} color={ui.label} />
          </PressableScale>
          <Text style={[type.title3, styles.topTitle, { color: ui.label }]} numberOfLines={1}>
            {article?.category || 'Story'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {!article && isLoading ? (
            <Text style={[type.subhead, styles.loading, { color: ui.secondaryLabel }]}>
              Loading story…
            </Text>
          ) : !article ? (
            <View style={styles.empty}>
              <Text style={[type.title3, { color: ui.label }]}>Story unavailable</Text>
              <Text style={[type.subhead, { color: ui.secondaryLabel }]}>
                This story may have been moved or removed.
              </Text>
            </View>
          ) : (
            <>
              {article.coverUrl ? (
                <View style={[styles.heroWrap, { backgroundColor: ui.fill, borderColor: ui.separator }]}>
                  <Image source={{ uri: article.coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
                </View>
              ) : null}

              <View style={styles.articleBody}>
                <View style={[styles.categoryPill, { backgroundColor: ui.lime }]}>
                  <Text style={[styles.categoryText, { color: ui.limeForeground }]}>
                    {article.category}
                  </Text>
                </View>

                <Text style={[type.title1, styles.title, { color: ui.label }]}>
                  {article.title}
                </Text>

                <View style={styles.metaRow}>
                  <Text style={[type.footnote, { color: ui.secondaryLabel }]}>
                    By {formatAuthor(article.author)} · {relativeTime(article.publishedAt)} ·
                  </Text>
                  <Ionicons name="time-outline" size={13} color={ui.secondaryLabel} />
                  <Text style={[type.footnote, { color: ui.secondaryLabel }]}>
                    {article.readMin || 4} min read
                  </Text>
                </View>

                {article.excerpt ? (
                  <Text style={[type.headline, styles.excerpt, { color: ui.label }]}>
                    {article.excerpt}
                  </Text>
                ) : null}

                {(article.paragraphs ?? []).map((p, idx) => (
                  <Text key={`p-${idx}`} style={[type.body, styles.paragraph, { color: ui.secondaryLabel }]}>
                    {p}
                  </Text>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </EspressoBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.gutter,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  topTitle: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 60,
  },
  loading: {
    textAlign: 'center',
    padding: 32,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    padding: 36,
  },
  heroWrap: {
    marginHorizontal: layout.gutter,
    aspectRatio: 16 / 10,
    borderRadius: corner.xl,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    ...continuous,
  },
  articleBody: {
    paddingHorizontal: layout.gutter + 2,
    paddingTop: 20,
    gap: 12,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: corner.pill,
  },
  categoryText: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    fontFamily: 'BricolageGrotesque_800ExtraBold',
    fontSize: 28,
    lineHeight: 33,
    letterSpacing: -0.7,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  excerpt: {
    marginTop: 6,
    fontSize: 17,
    lineHeight: 24,
    fontFamily: 'InstrumentSans_600SemiBold',
  },
  paragraph: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 23,
  },
});

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { palette, radius, spacing, typography } from '@/src/theme';

type Tab = 'For you' | 'Trending' | 'Music' | 'Sport' | 'Business';

const TABS: Tab[] = ['For you', 'Trending', 'Music', 'Sport', 'Business'];

const TRENDING_TAGS = [
  { tag: 'NaijaVsMorocco', delta: '+412%' },
  { tag: 'Detty December', delta: '+88%' },
  { tag: 'AfroFusion', delta: '+54%' },
  { tag: 'AsoEbi', delta: '+31%' },
  { tag: 'TimelessII', delta: '+296%' },
  { tag: 'AfconQualifiers', delta: '+178%' },
  { tag: 'LagosFashionWeek', delta: '+142%' },
  { tag: 'NaijaJollofWars', delta: '+98%' },
  { tag: 'AfroNation2026', delta: '+72%' },
  { tag: 'CBNUpdate', delta: '+45%' },
];

const HERO = {
  id: 'n1',
  headline: 'Super Eagles draw shock fans, jersey demand spikes 6x in Lagos',
  source: 'Vibe Sport',
  age: '12m',
  tag: 'Sport',
  insight: 'Vendors stocking jerseys saw 4x sales',
  cover: ['#3a2818', '#1f1108'] as [string, string],
};

const GRID = [
  {
    id: 'n2',
    headline: "Davido drops 'Timeless II' — merch pre-orders open",
    source: 'Vibe Music',
    age: '1h',
    tag: 'Music',
    cover: ['#3a1f2c', '#1f0e17'] as [string, string],
  },
  {
    id: 'n3',
    headline: 'Detty December: how vendors are pricing experiences',
    source: 'Vibe Lifestyle',
    age: '3h',
    tag: 'Trending',
    cover: ['#1f3a2c', '#0f1f17'] as [string, string],
  },
  {
    id: 'n4',
    headline: 'New CBN guideline cuts P2P withdrawal fees from January',
    source: 'Vibe Business',
    age: '5h',
    tag: 'Business',
    cover: ['#2c2c3a', '#15151f'] as [string, string],
  },
  {
    id: 'n5',
    headline: 'AsoEbi season is back — fabric prices climb 18%',
    source: 'Vibe Style',
    age: '6h',
    tag: 'Style',
    cover: ['#3a2c1f', '#1f170e'] as [string, string],
  },
  {
    id: 'n9',
    headline: 'Burna Boy adds two surprise Lagos dates to the world tour',
    source: 'Vibe Music',
    age: '7h',
    tag: 'Music',
    cover: ['#3a0F2A', '#15050F'] as [string, string],
  },
  {
    id: 'n10',
    headline: 'Lagos Fashion Week — full schedule + ticket waves',
    source: 'Vibe Style',
    age: '9h',
    tag: 'Style',
    cover: ['#2c1F3A', '#150e1F'] as [string, string],
  },
  {
    id: 'n11',
    headline: 'AFCON qualifier draw lands: Super Eagles group revealed',
    source: 'Vibe Sport',
    age: '10h',
    tag: 'Sport',
    cover: ['#0F3D2E', '#051410'] as [string, string],
  },
  {
    id: 'n12',
    headline: 'GTBank Food & Drink Festival returns — vendor sign-up open',
    source: 'Vibe Foodies',
    age: '11h',
    tag: 'Foodies',
    cover: ['#3A2A0F', '#150F05'] as [string, string],
  },
];

const LIST = [
  {
    id: 'n6',
    headline: 'How a 22-year-old tailor in Surulere is shipping to Atlanta',
    source: 'Vibe Stories',
    age: '8h',
    tag: 'Stories',
    cover: ['#2c1f3a', '#150e1f'] as [string, string],
  },
  {
    id: 'n7',
    headline: 'NIN verification adoption hits 64% on Vibe vendor signups',
    source: 'Vibe Business',
    age: '12h',
    tag: 'Business',
    cover: ['#1f2c3a', '#0e151f'] as [string, string],
  },
  {
    id: 'n8',
    headline: "Lagos tech meetup: founders weigh in on the Vibe Insight feed",
    source: 'Vibe Tech',
    age: '1d',
    tag: 'Tech',
    cover: ['#3a1f1f', '#1f0e0e'] as [string, string],
  },
  {
    id: 'n13',
    headline: 'EFCC, CBN move on USSD fraud — new tooling rollout in Q3',
    source: 'Vibe Business',
    age: '1d',
    tag: 'Business',
    cover: ['#1A2C44', '#080F1F'] as [string, string],
  },
  {
    id: 'n14',
    headline: 'Vibe Hive: BookBot lists the most-discussed African novels of 2026',
    source: 'Vibe Hive',
    age: '1d',
    tag: 'Hive',
    cover: ['#3a2818', '#1f1108'] as [string, string],
  },
  {
    id: 'n15',
    headline: 'Rema and Wizkid collab teased — merch vendors on alert',
    source: 'Vibe Music',
    age: '2d',
    tag: 'Music',
    cover: ['#3D2E45', '#150F1A'] as [string, string],
  },
  {
    id: 'n16',
    headline: 'How escrow on Vibe cut "what I ordered vs what I got" complaints 71%',
    source: 'Vibe Stories',
    age: '2d',
    tag: 'Stories',
    cover: ['#1f3a3a', '#06140F'] as [string, string],
  },
  {
    id: 'n17',
    headline: 'Anime in Naija: streaming numbers triple year-on-year',
    source: 'Vibe Culture',
    age: '3d',
    tag: 'Culture',
    cover: ['#4A1A2A', '#1A070F'] as [string, string],
  },
];

export default function NewsScreen() {
  const [active, setActive] = useState<Tab>('For you');

  const open = (id: string) => router.push(`/news/${id}` as never);

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>News</Text>
          <Pressable hitSlop={8} accessibilityLabel="Search news">
            <Ionicons name="search" size={22} color={palette.ink.onDarkStrong} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}>
          {TABS.map((t) => {
            const on = active === t;
            return (
              <Pressable
                key={t}
                onPress={() => setActive(t)}
                style={[styles.tab, on && styles.tabOn]}>
                <Text style={[styles.tabLabel, on && styles.tabLabelOn]}>{t}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Insight banner */}
          <LinearGradient
            colors={['rgba(216, 149, 68,0.20)', 'rgba(255,61,0,0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Ionicons name="sparkles" size={16} color={palette.brand.orange} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.insightLabel}>Vibe Insight · for vendors</Text>
              <Text style={styles.insightText}>
                Football jerseys trending +412% in Lagos this week — restock to ride the wave.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={palette.ink.onDarkSoft} />
          </LinearGradient>

          {/* Trending tags */}
          <Text style={styles.sectionTitle}>Trending now</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendRow}>
            {TRENDING_TAGS.map((t) => (
              <Pressable key={t.tag} style={styles.trendChip}>
                <Text style={styles.trendTag}>#{t.tag}</Text>
                <Text style={styles.trendDelta}>{t.delta}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Hero article */}
          <Pressable onPress={() => open(HERO.id)} style={styles.heroCard}>
            <LinearGradient colors={HERO.cover} style={styles.heroImage}>
              <View style={styles.heroTagPill}>
                <Text style={styles.heroTagText}>{HERO.tag}</Text>
              </View>
            </LinearGradient>
            <View style={styles.heroBody}>
              <Text style={styles.heroHeadline}>{HERO.headline}</Text>
              <View style={styles.metaLine}>
                <Text style={styles.metaSource}>{HERO.source}</Text>
                <View style={styles.metaDot} />
                <Text style={styles.metaAge}>{HERO.age} ago</Text>
              </View>
              {HERO.insight ? (
                <View style={styles.heroInsight}>
                  <Ionicons name="trending-up" size={12} color={palette.brand.orange} />
                  <Text style={styles.heroInsightText}>{HERO.insight}</Text>
                </View>
              ) : null}
            </View>
          </Pressable>

          {/* Image grid */}
          <Text style={styles.sectionTitle}>Top stories</Text>
          <View style={styles.grid}>
            {GRID.map((g) => (
              <Pressable
                key={g.id}
                onPress={() => open(g.id)}
                style={styles.gridCard}>
                <LinearGradient colors={g.cover} style={styles.gridImage}>
                  <View style={styles.gridTag}>
                    <Text style={styles.gridTagText}>{g.tag}</Text>
                  </View>
                  <Pressable hitSlop={6} style={styles.gridSave}>
                    <Ionicons
                      name="bookmark-outline"
                      size={14}
                      color="#fff"
                    />
                  </Pressable>
                </LinearGradient>
                <Text style={styles.gridHeadline} numberOfLines={3}>
                  {g.headline}
                </Text>
                <View style={styles.metaLine}>
                  <Text style={styles.metaSource}>{g.source}</Text>
                  <View style={styles.metaDot} />
                  <Text style={styles.metaAge}>{g.age}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          {/* List */}
          <Text style={styles.sectionTitle}>Latest</Text>
          {LIST.map((a) => (
            <Pressable
              key={a.id}
              onPress={() => open(a.id)}
              style={styles.articleRow}>
              <LinearGradient colors={a.cover} style={styles.articleThumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.articleHeadline} numberOfLines={2}>
                  {a.headline}
                </Text>
                <View style={styles.metaLine}>
                  <Text style={styles.metaSource}>{a.source}</Text>
                  <View style={styles.metaDot} />
                  <Text style={styles.metaAge}>{a.age} ago</Text>
                </View>
              </View>
              <Pressable hitSlop={6}>
                <Ionicons name="bookmark-outline" size={18} color={palette.ink.onDarkSoft} />
              </Pressable>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </EspressoBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['3'],
    paddingBottom: spacing['3'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { ...typography.h2, color: palette.ink.onDarkStrong },
  tabsRow: {
    paddingHorizontal: spacing['4'],
    gap: spacing['2'],
    paddingBottom: spacing['3'],
  },
  tab: {
    paddingHorizontal: spacing['3'],
    height: 32,
    borderRadius: 999,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: palette.line.onDark,
  },
  tabOn: {
    backgroundColor: palette.bg.surface,
    borderColor: palette.bg.surface,
  },
  tabLabel: {
    ...typography.caption,
    color: palette.ink.onDarkSoft,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  tabLabelOn: { color: palette.ink.onLightStrong },
  scroll: { paddingBottom: 120 },
  insightCard: {
    marginHorizontal: spacing['4'],
    padding: spacing['3'],
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    borderWidth: 1,
    borderColor: 'rgba(216, 149, 68,0.3)',
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(216, 149, 68,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightLabel: {
    ...typography.small,
    color: palette.brand.orange,
    fontFamily: typography.bodyEmphasis.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  insightText: {
    ...typography.body,
    color: palette.ink.onDarkStrong,
  },
  sectionTitle: {
    ...typography.title,
    color: palette.ink.onDarkStrong,
    paddingHorizontal: spacing['4'],
    marginTop: spacing['5'],
    marginBottom: spacing['3'],
  },
  trendRow: {
    paddingHorizontal: spacing['4'],
    gap: spacing['2'],
  },
  trendChip: {
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: palette.line.onDark,
  },
  trendTag: {
    ...typography.bodyEmphasis,
    color: palette.ink.onDarkStrong,
  },
  trendDelta: {
    ...typography.small,
    color: palette.brand.orange,
    fontFamily: typography.bodyEmphasis.fontFamily,
    marginTop: 2,
  },
  heroCard: {
    marginHorizontal: spacing['4'],
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    shadowColor: 'rgba(40, 26, 16, 0.18)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 3,
  },
  heroImage: {
    height: 180,
    padding: spacing['3'],
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  heroTagPill: {
    paddingHorizontal: spacing['3'],
    height: 24,
    borderRadius: 999,
    backgroundColor: palette.brand.orange,
    justifyContent: 'center',
  },
  heroTagText: {
    ...typography.small,
    color: '#fff',
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  heroBody: { padding: spacing['3'], gap: 6 },
  heroHeadline: {
    ...typography.title,
    fontSize: 17,
    lineHeight: 23,
    color: palette.ink.onDarkStrong,
  },
  metaLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  metaSource: {
    ...typography.caption,
    color: palette.brand.orange,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: palette.ink.onDarkMuted,
  },
  metaAge: { ...typography.caption, color: palette.ink.onDarkMuted },
  heroInsight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  heroInsightText: {
    ...typography.caption,
    color: palette.ink.onDarkSoft,
  },
  grid: {
    paddingHorizontal: spacing['4'],
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['3'],
  },
  gridCard: {
    width: '47.5%',
    gap: 6,
  },
  gridImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    padding: spacing['2'],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gridTag: {
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    justifyContent: 'center',
  },
  gridTagText: {
    ...typography.small,
    color: '#fff',
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  gridSave: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridHeadline: {
    ...typography.bodyEmphasis,
    fontSize: 14,
    lineHeight: 19,
    color: palette.ink.onDarkStrong,
  },
  articleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: palette.line.onDark,
  },
  articleThumb: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
  },
  articleHeadline: {
    ...typography.bodyEmphasis,
    color: palette.ink.onDarkStrong,
  },
});

import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { InputBar } from '@/components/ui/InputBar';
import { VerifiedCheck } from '@/components/ui/VerifiedCheck';
import { palette, radius, spacing, typography } from '@/src/theme';

type Msg = {
  id: string;
  from: 'me' | 'them';
  body?: string;
  image?: any;
  product?: { name: string; price: string };
  time: string;
};

const SEED: Msg[] = [
  { id: 'm1', from: 'them', body: 'Hi! Saw your post — is the Ankara dress still available?', time: '10:15 AM' },
  { id: 'm2', from: 'me', body: 'Yes! We have it in 3 colors. What size are you?', time: '10:18 AM' },
  { id: 'm3', from: 'them', body: 'Size 12. How fast can it ship to Abuja?', time: '10:19 AM' },
  {
    id: 'm4',
    from: 'me',
    product: { name: 'Ankara high shoulder fitted gown', price: '₦24,990' },
    time: '10:21 AM',
  },
  { id: 'm5', from: 'me', body: 'About 3 days! Tap to buy directly here ↑', time: '10:21 AM' },
  { id: 'm6', from: 'them', body: 'Just paid 💖 thanks!', time: '10:24 AM' },
];

const PEERS: Record<string, { name: string; avatar: any; verified?: boolean }> = {
  default: { name: 'Aisha Bello', avatar: require('@/assets/figma/story-1.png'), verified: true },
  support: { name: 'Vibe Support', avatar: require('@/assets/figma/icon-sell.png') },
};

export default function MessageThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const peer = PEERS[String(id) as keyof typeof PEERS] ?? PEERS.default;
  const [messages, setMessages] = useState<Msg[]>(SEED);
  const [draft, setDraft] = useState('');

  const send = () => {
    if (!draft.trim()) return;
    setMessages((arr) => [
      ...arr,
      { id: `m-${Date.now()}`, from: 'me', body: draft.trim(), time: 'now' },
    ]);
    setDraft('');
  };

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color={palette.ink.onDarkStrong} />
          </Pressable>
          <Avatar size={36} source={peer.avatar} />
          <View style={{ flex: 1 }}>
            <View style={styles.peerNameRow}>
              <Text style={styles.peerName}>{peer.name}</Text>
              {peer.verified ? <VerifiedCheck tone="success" size={12} /> : null}
            </View>
            <Text style={styles.peerStatus}>Active now</Text>
          </View>
          <Pressable hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="call-outline" size={20} color={palette.ink.onDarkStrong} />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={80}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}>
            {messages.map((m) => (
              <View
                key={m.id}
                style={[styles.bubbleWrap, m.from === 'me' ? styles.bubbleMe : styles.bubbleThem]}>
                {m.product ? (
                  <Pressable style={styles.productCard}>
                    <Image source={require('@/assets/figma/product-sample.png')} style={styles.productImg} contentFit="cover" />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={styles.productName} numberOfLines={2}>{m.product.name}</Text>
                      <Text style={styles.productPrice}>{m.product.price}</Text>
                    </View>
                  </Pressable>
                ) : null}
                {m.body ? (
                  <View style={[styles.bubble, m.from === 'me' ? styles.bubbleMeStyle : styles.bubbleThemStyle]}>
                    <Text style={[styles.bubbleText, m.from === 'them' && { color: palette.ink.onDarkStrong }]}>
                      {m.body}
                    </Text>
                  </View>
                ) : null}
                <Text style={[styles.time, m.from === 'me' ? styles.timeMe : styles.timeThem]}>{m.time}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.composerWrap}>
            <InputBar
              placeholder="Type a message…"
              value={draft}
              onChangeText={setDraft}
              onSend={send}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </EspressoBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.10)',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  peerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  peerName: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 15,
    color: palette.ink.onDarkStrong,
  },
  peerStatus: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: '#22C55E',
  },
  list: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    gap: spacing['3'],
  },
  bubbleWrap: { gap: 4, maxWidth: '78%' },
  bubbleMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubbleThem: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: {
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius: 18,
  },
  bubbleMeStyle: {
    backgroundColor: palette.brand.orange,
    borderBottomRightRadius: 4,
  },
  bubbleThemStyle: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 19,
    color: '#FFFFFF',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    padding: spacing['2'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.10)',
    width: 240,
  },
  productImg: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  productName: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  productPrice: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.brand.orange,
  },
  time: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    color: palette.ink.onDarkMuted,
  },
  timeMe: { textAlign: 'right' },
  timeThem: { textAlign: 'left' },
  composerWrap: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.10)',
  },
});

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { PressableScale } from '@/components/ui/PressableScale';
import {
  actions,
  compact,
  me,
  posts,
  sampleOrders,
  useApp,
} from '@/src/data/lovable-data';
import { useToast } from '@/src/hooks/use-toast';
import { useTheme } from '@/src/store/theme';
import { continuous, corner, layout, type, useUi } from '@/src/theme/ui';

export default function ProfileTabScreen() {
  const ui = useUi();
  const toast = useToast();
  const themeMode = useTheme((s) => s.mode);
  const setThemeMode = useTheme((s) => s.setMode);

  const signedIn = useApp((s) => s.signedIn);
  const profile = useApp((s) => s.profile);
  const wishlist = useApp((s) => s.wishlist.length);
  const saved = useApp((s) => s.savedPosts.length);
  const ordersCount = useApp((s) => s.orders.length) + sampleOrders.length;
  const storeLive = useApp((s) => s.storeLive);
  const storeName = useApp((s) => s.storeName);
  const myPosts = useApp((s) => s.myPosts.length);

  const likedPostsWithImage = posts.filter((p) => p.image);

  const rows = [
    { icon: 'bag-handle-outline' as const, label: 'My orders', meta: `${ordersCount}`, to: '/orders' },
    { icon: 'heart-outline' as const, label: 'Wishlist', meta: `${wishlist}`, to: '/wishlist' },
    { icon: 'bookmark-outline' as const, label: 'Saved posts', meta: `${saved}` },
    { icon: 'location-outline' as const, label: 'Addresses', meta: '1' },
    { icon: 'settings-outline' as const, label: 'Settings' },
    { icon: 'help-circle-outline' as const, label: 'Help & support' },
  ];

  if (!signedIn) {
    return (
      <EspressoBackground variant="espresso">
        <SafeAreaView edges={['top']} style={styles.centerContainer}>
          <View style={[styles.guestAvatar, { backgroundColor: ui.cardRaised }]}>
            <Text style={[styles.guestAvatarText, { color: ui.label }]}>G</Text>
          </View>
          <Text style={[styles.guestTitle, { color: ui.label }]}>
            You're browsing as a guest
          </Text>
          <Text style={[styles.guestSub, { color: ui.secondaryLabel }]}>
            Create an account to save favourites, follow vendors and check out faster.
          </Text>
          <View style={styles.guestActions}>
            <PressableScale
              haptic="medium"
              onPress={() => actions.signIn()}
              style={[styles.primaryBtn, { backgroundColor: ui.label }]}>
              <Text style={[styles.primaryBtnText, { color: ui.background }]}>
                Create account
              </Text>
            </PressableScale>
            <PressableScale
              haptic="light"
              onPress={() => actions.signIn()}
              style={[styles.secondaryBtn, { borderColor: ui.separator, backgroundColor: ui.card }]}>
              <Text style={[styles.secondaryBtnText, { color: ui.label }]}>Log in</Text>
            </PressableScale>
          </View>
        </SafeAreaView>
      </EspressoBackground>
    );
  }

  return (
    <EspressoBackground variant="espresso">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Cover Header Banner */}
        <LinearGradient
          colors={[ui.ink, '#091510']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.coverBanner}
        />

        {/* Profile Info Overlay */}
        <View style={styles.profileBody}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatarCircle, { backgroundColor: ui.background, borderColor: ui.background }]}>
              <View style={[styles.avatarInner, { backgroundColor: ui.cardRaised }]}>
                <Text style={[styles.avatarText, { color: ui.label }]}>
                  {profile.name.charAt(0)}
                </Text>
              </View>
            </View>
            <PressableScale
              haptic="light"
              scaleTo={0.94}
              onPress={() => toast.show({ variant: 'info', title: 'Profile editing is coming soon' })}
              style={[styles.editBtn, { borderColor: ui.separator, backgroundColor: ui.card }]}>
              <Text style={[styles.editBtnText, { color: ui.label }]}>Edit profile</Text>
            </PressableScale>
          </View>

          {/* Name & Bio */}
          <Text style={[styles.name, { color: ui.label }]}>{profile.name}</Text>
          <Text style={[styles.handleLocation, { color: ui.secondaryLabel }]}>
            @{me.handle === 'you' ? (profile.name.split(' ')[0] ?? '').toLowerCase() : me.handle} · {me.location}
          </Text>
          <Text style={[styles.bio, { color: ui.label }]}>{me.bio}</Text>

          {/* Interest Chips */}
          {profile.interests.length ? (
            <View style={styles.interestChips}>
              {profile.interests.map((i) => (
                <View key={i} style={[styles.interestPill, { backgroundColor: ui.cardRaised }]}>
                  <Text style={[styles.interestText, { color: ui.label }]}>{i}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* 3-Column Stats Card */}
          <View style={[styles.statsCard, { backgroundColor: ui.card, borderColor: ui.separator }]}>
            <View style={styles.statCol}>
              <Text style={[styles.statValue, { color: ui.label }]}>{myPosts + 12}</Text>
              <Text style={[styles.statLabel, { color: ui.secondaryLabel }]}>Posts</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={[styles.statValue, { color: ui.label }]}>{compact(me.followers)}</Text>
              <Text style={[styles.statLabel, { color: ui.secondaryLabel }]}>Followers</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={[styles.statValue, { color: ui.label }]}>{compact(me.following)}</Text>
              <Text style={[styles.statLabel, { color: ui.secondaryLabel }]}>Following</Text>
            </View>
          </View>

          {/* Lime Store CTA Banner */}
          <View style={[styles.storeCard, { backgroundColor: ui.lime }]}>
            <View style={[styles.storeIconWrap, { backgroundColor: ui.label }]}>
              <Ionicons name="storefront-outline" size={20} color={ui.background} />
            </View>
            <View style={styles.storeTextWrap}>
              <Text style={[styles.storeTitle, { color: ui.limeForeground }]}>
                {storeLive ? storeName : 'Turn your hustle into a store'}
              </Text>
              <Text style={[styles.storeSub, { color: ui.limeForeground }]}>
                {storeLive ? 'Your store is live' : 'Set up in 3 steps. No fees to start.'}
              </Text>
            </View>
            <PressableScale
              haptic="medium"
              scaleTo={0.94}
              onPress={() => {
                if (!storeLive) {
                  actions.launchStore("Ada's Vintage");
                  toast.show({ variant: 'success', title: 'Store launched!' });
                } else {
                  router.push('/vendor-dashboard' as never);
                }
              }}
              style={[styles.storeBtn, { backgroundColor: ui.label }]}>
              <Text style={[styles.storeBtnText, { color: ui.background }]}>
                {storeLive ? 'Dashboard' : 'Start'}
              </Text>
            </PressableScale>
          </View>

          {/* Menu Card */}
          <View style={[styles.menuList, { backgroundColor: ui.card, borderColor: ui.separator }]}>
            {rows.map((r, idx) => (
              <PressableScale
                key={r.label}
                haptic="light"
                scaleTo={0.99}
                onPress={() => {
                  if (r.to) {
                    router.push(r.to as never);
                  } else {
                    toast.show({ variant: 'info', title: `${r.label} is coming soon` });
                  }
                }}
                style={[
                  styles.menuRow,
                  { borderBottomColor: ui.separator },
                ]}>
                <Ionicons name={r.icon} size={18} color={ui.secondaryLabel} />
                <Text style={[styles.menuRowLabel, { color: ui.label }]}>{r.label}</Text>
                {r.meta ? (
                  <Text style={[styles.menuRowMeta, { color: ui.secondaryLabel }]}>
                    {r.meta}
                  </Text>
                ) : null}
                <Ionicons name="chevron-forward" size={16} color={ui.secondaryLabel} />
              </PressableScale>
            ))}

            {/* Night Mode Switch Row */}
            <View style={styles.menuRow}>
              <Ionicons name="moon-outline" size={18} color={ui.accent} />
              <Text style={[styles.menuRowLabel, { color: ui.label }]}>Night mode</Text>
              <Switch
                value={ui.isDark}
                onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
                trackColor={{ false: ui.separator, true: ui.accent }}
                thumbColor={ui.isDark ? ui.limeForeground : '#FFFFFF'}
              />
            </View>
          </View>

          {/* Posts You Liked 3-Column Grid */}
          <View style={styles.likedSection}>
            <Text style={[styles.sectionTitle, { color: ui.label }]}>Posts you liked</Text>
            <View style={styles.likedGrid}>
              {likedPostsWithImage.slice(0, 3).map((p) => (
                <PressableScale
                  key={p.id}
                  haptic="light"
                  scaleTo={0.97}
                  onPress={() => router.push(`/post/${p.id}` as never)}
                  style={styles.likedThumbWrap}>
                  <Image source={p.image} style={styles.likedThumb} contentFit="cover" />
                </PressableScale>
              ))}
            </View>
          </View>

          {/* Log Out Button */}
          <PressableScale
            haptic="medium"
            scaleTo={0.96}
            onPress={() => {
              actions.signOut();
              toast.show({ variant: 'info', title: 'Logged out' });
            }}
            style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={18} color={ui.danger} />
            <Text style={[styles.logoutText, { color: ui.danger }]}>Log out</Text>
          </PressableScale>
        </View>
      </ScrollView>
    </EspressoBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 110,
  },
  coverBanner: {
    width: '100%',
    height: 112,
  },
  profileBody: {
    paddingHorizontal: 20,
    marginTop: -44,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  avatarCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 32,
  },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  editBtnText: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 13,
  },
  name: {
    fontFamily: 'BricolageGrotesque_800ExtraBold',
    fontSize: 24,
    marginTop: 12,
  },
  handleLocation: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 13,
    marginTop: 2,
  },
  bio: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  interestChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  interestPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  interestText: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 12,
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    marginTop: 16,
    ...continuous,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
  },
  statLabel: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 12,
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 20,
    marginTop: 16,
    ...continuous,
  },
  storeIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeTextWrap: {
    flex: 1,
    gap: 2,
  },
  storeTitle: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 14,
  },
  storeSub: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 11,
    opacity: 0.85,
  },
  storeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  storeBtnText: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 12,
  },
  menuList: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginTop: 16,
    ...continuous,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuRowLabel: {
    flex: 1,
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
  },
  menuRowMeta: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 13,
  },
  likedSection: {
    marginTop: 22,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
  },
  likedGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  likedThumbWrap: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  likedThumb: {
    width: '100%',
    height: '100%',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    marginTop: 12,
  },
  logoutText: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  guestAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  guestAvatarText: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 28,
  },
  guestTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 22,
    textAlign: 'center',
  },
  guestSub: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  guestActions: {
    width: '100%',
    gap: 10,
    marginTop: 16,
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 14,
  },
  secondaryBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  secondaryBtnText: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
  },
});

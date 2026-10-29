import React, { useState, useMemo } from 'react';
import {
  Dimensions,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import Svg, { Circle, Defs, Line, LinearGradient, RadialGradient, Rect, Stop, Text as SvgText, G } from 'react-native-svg';

import { vibeHaptics } from '@/src/lib/haptics';
import { palette, radius, spacing, typography } from '@/src/theme';
import { formatKobo } from '@/src/utils/money';
import type { SearchPlace } from '@/src/api/types';

interface ProductSearchMapProps {
  vendors: SearchPlace[];
  searchQuery: string;
  userCoords?: { lat: number; lng: number };
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_HEIGHT = 440;

// Lagos center coordinate reference
const DEFAULT_USER_LAT = 6.5244;
const DEFAULT_USER_LNG = 3.3792;

export function ProductSearchMap({ vendors, searchQuery, userCoords }: ProductSearchMapProps) {
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(
    vendors[0]?.id ?? null,
  );
  const [onlyOpen, setOnlyOpen] = useState(false);

  // Filter vendors that agreed to appear on map
  const mapVendors = useMemo(() => {
    return vendors
      .filter((v) => v.showOnMap !== false)
      .filter((v) => (!onlyOpen ? true : v.open !== false));
  }, [vendors, onlyOpen]);

  const activeVendor = useMemo(() => {
    return mapVendors.find((v) => v.id === selectedVendorId) ?? mapVendors[0] ?? null;
  }, [mapVendors, selectedVendorId]);

  // Compute map pin positions (mercator-like projection relative to Lagos center)
  const userLat = userCoords?.lat ?? DEFAULT_USER_LAT;
  const userLng = userCoords?.lng ?? DEFAULT_USER_LNG;

  const pins = useMemo(() => {
    // Canvas bounds
    const minX = 40;
    const maxX = SCREEN_WIDTH - 40;
    const minY = 60;
    const maxY = MAP_HEIGHT - 60;

    return mapVendors.map((vendor, idx) => {
      // Relative offset from Lagos center (lat ~ 6.4 - 6.6, lng ~ 3.3 - 3.5)
      const lat = vendor.lat ?? (DEFAULT_USER_LAT + (idx % 2 === 0 ? 0.02 * (idx + 1) : -0.02 * (idx + 1)));
      const lng = vendor.lng ?? (DEFAULT_USER_LNG + (idx % 2 === 1 ? 0.03 * (idx + 1) : -0.03 * (idx + 1)));

      // Normalized coordinates into canvas dimensions
      const deltaLng = lng - userLng;
      const deltaLat = lat - userLat;

      const posX = Math.min(maxX, Math.max(minX, SCREEN_WIDTH / 2 + deltaLng * 1200));
      const posY = Math.min(maxY, Math.max(minY, MAP_HEIGHT / 2 - deltaLat * 1200));

      // Calculate approximate proximity in km
      const distKm =
        vendor.distanceKm ??
        Math.max(
          0.8,
          Number((Math.sqrt(Math.pow(deltaLat * 111, 2) + Math.pow(deltaLng * 111, 2)) || 1.2).toFixed(1)),
        );

      return {
        vendor,
        x: posX,
        y: posY,
        distKm,
      };
    });
  }, [mapVendors, userLat, userLng]);

  const openVendorPage = (vendor: SearchPlace) => {
    vibeHaptics.selection();
    const target = vendor.handle || vendor.id;
    if (target) {
      router.push(`/place/${target}` as never);
    }
  };

  const openDirections = (vendor: SearchPlace) => {
    const lat = vendor.lat ?? DEFAULT_USER_LAT;
    const lng = vendor.lng ?? DEFAULT_USER_LNG;
    const label = encodeURIComponent(vendor.storeName);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${label}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.container}>
      {/* Search Map Subheader / Filter Bar */}
      <View style={styles.topBar}>
        <View style={styles.topInfo}>
          <View style={styles.liveBeacon} />
          <Text style={styles.topCount}>
            {mapVendors.length} nearby store{mapVendors.length === 1 ? '' : 's'} {searchQuery ? `with "${searchQuery}"` : 'near you'}
          </Text>
        </View>

        <Pressable
          onPress={() => setOnlyOpen((v) => !v)}
          style={[styles.filterChip, onlyOpen && styles.filterChipActive]}>
          <Text style={[styles.filterChipText, onlyOpen && styles.filterChipTextActive]}>
            {onlyOpen ? '✓ Open Now' : 'Open Now'}
          </Text>
        </Pressable>
      </View>

      {/* Google Business Dark AMOLED Map Canvas */}
      <View style={styles.mapCanvas}>
        <Svg width={SCREEN_WIDTH} height={MAP_HEIGHT} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="radarPulse" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#1E3027" stopOpacity="0.8" />
              <Stop offset="70%" stopColor="#121212" stopOpacity="0.4" />
              <Stop offset="100%" stopColor="#0B0806" stopOpacity="0" />
            </RadialGradient>
            <LinearGradient id="streetGlow" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#2E231A" stopOpacity="0.6" />
              <Stop offset="100%" stopColor="#1A1510" stopOpacity="0.2" />
            </LinearGradient>
          </Defs>

          {/* Dark map background */}
          <Rect x="0" y="0" width={SCREEN_WIDTH} height={MAP_HEIGHT} fill="#0E0A08" />

          {/* Map Grid / Street Vectors */}
          <Circle cx={SCREEN_WIDTH / 2} cy={MAP_HEIGHT / 2} r="180" fill="url(#radarPulse)" />
          <Circle cx={SCREEN_WIDTH / 2} cy={MAP_HEIGHT / 2} r="120" stroke="rgba(47, 107, 255, 0.12)" strokeWidth="1" strokeDasharray="4 4" fill="none" />
          <Circle cx={SCREEN_WIDTH / 2} cy={MAP_HEIGHT / 2} r="220" stroke="rgba(47, 107, 255, 0.08)" strokeWidth="1" strokeDasharray="6 6" fill="none" />

          {/* Stylized Street Lines */}
          <Line x1="0" y1={MAP_HEIGHT * 0.35} x2={SCREEN_WIDTH} y2={MAP_HEIGHT * 0.42} stroke="#221810" strokeWidth="8" />
          <Line x1="0" y1={MAP_HEIGHT * 0.72} x2={SCREEN_WIDTH} y2={MAP_HEIGHT * 0.65} stroke="#221810" strokeWidth="6" />
          <Line x1={SCREEN_WIDTH * 0.3} y1="0" x2={SCREEN_WIDTH * 0.42} y2={MAP_HEIGHT} stroke="#221810" strokeWidth="7" />
          <Line x1={SCREEN_WIDTH * 0.75} y1="0" x2={SCREEN_WIDTH * 0.68} y2={MAP_HEIGHT} stroke="#221810" strokeWidth="6" />

          {/* Street Name Labels */}
          <SvgText x="14" y={MAP_HEIGHT * 0.33} fill="rgba(255,255,255,0.22)" fontSize="10" fontFamily="sans-serif">
            HERBERT MACAULAY WAY
          </SvgText>
          <SvgText x={SCREEN_WIDTH * 0.45} y="22" fill="rgba(255,255,255,0.22)" fontSize="10" fontFamily="sans-serif">
            COMMERCIAL AVE
          </SvgText>

          {/* User Location Blue Glowing Dot */}
          <G x={SCREEN_WIDTH / 2} y={MAP_HEIGHT / 2}>
            <Circle cx="0" cy="0" r="16" fill="rgba(33, 150, 243, 0.25)" />
            <Circle cx="0" cy="0" r="7" fill="#2196F3" stroke="#FFFFFF" strokeWidth="2" />
          </G>
        </Svg>

        {/* User Location Label Pill */}
        <View style={styles.userBeaconBadge}>
          <Text style={styles.userBeaconText}>Your Location</Text>
        </View>

        {/* Interactive Vendor Pins */}
        {pins.map(({ vendor, x, y }, idx) => {
          const isSelected = vendor.id === activeVendor?.id;
          const displayPrice = vendor.matchedProductPrice
            ? formatKobo(vendor.matchedProductPrice)
            : `★ ${vendor.rating.toFixed(1)}`;

          return (
            <Pressable
              key={vendor.id ? `vendor-pin-${vendor.id}-${idx}` : `vendor-pin-${idx}`}
              onPress={() => {
                if (isSelected) {
                  openVendorPage(vendor);
                } else {
                  vibeHaptics.light();
                  setSelectedVendorId(vendor.id);
                }
              }}
              style={[
                styles.pinWrapper,
                { left: x - 42, top: y - 48 },
                isSelected && styles.pinWrapperSelected,
              ]}>
              <View style={[styles.pinBubble, isSelected && styles.pinBubbleSelected]}>
                <Ionicons
                  name={vendor.showExactLocation === false ? 'shield-half-sharp' : 'storefront'}
                  size={12}
                  color={isSelected ? '#FFFFFF' : palette.brand.orange}
                />
                <Text
                  style={[styles.pinLabel, isSelected && styles.pinLabelSelected]}
                  numberOfLines={1}>
                  {displayPrice}
                </Text>
                {isSelected && (
                  <Ionicons name="chevron-forward" size={12} color="#FFFFFF" />
                )}
              </View>
              <View style={[styles.pinTip, isSelected && styles.pinTipSelected]} />
              <View style={[styles.pinPulse, isSelected && styles.pinPulseSelected]} />
            </Pressable>
          );
        })}
      </View>

      {/* Google Business Store Details Card Drawer */}
      {activeVendor && (
        <View style={styles.drawer}>
          <View style={styles.storeCard}>
            <Pressable
              onPress={() => openVendorPage(activeVendor)}
              style={({ pressed }) => [
                styles.storeCardTop,
                pressed && { opacity: 0.8 },
              ]}>
              <View style={styles.storeIconWrap}>
                <Ionicons name="storefront" size={24} color={palette.brand.orange} />
              </View>

              <View style={{ flex: 1, gap: 2 }}>
                <View style={styles.storeNameRow}>
                  <Text style={styles.storeName} numberOfLines={1}>
                    {activeVendor.storeName}
                  </Text>
                  {activeVendor.isYfnVerified && (
                    <Ionicons name="checkmark-circle" size={16} color={palette.brand.orange} />
                  )}
                  <View style={styles.openPill}>
                    <Text style={styles.openPillText}>View Store</Text>
                    <Ionicons name="chevron-forward" size={11} color={palette.brand.orange} />
                  </View>
                </View>

                {/* Rating & Distance Meta */}
                <View style={styles.storeMetaRow}>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#F4C464" />
                    <Text style={styles.ratingText}>
                      {activeVendor.rating.toFixed(1)} ({activeVendor.ratingCount})
                    </Text>
                  </View>

                  <Text style={styles.metaDot}>·</Text>

                  <View style={styles.distanceBadge}>
                    <Ionicons name="navigate-outline" size={12} color={palette.brand.orange} />
                    <Text style={styles.distanceText}>
                      {((pins.find((p) => p.vendor.id === activeVendor.id)?.distKm ?? 1.2) * 0.621371).toFixed(1)} miles away
                    </Text>
                  </View>

                  <Text style={styles.metaDot}>·</Text>

                  <Text style={[styles.openBadge, !activeVendor.open && styles.closedBadge]}>
                    {activeVendor.open ? 'Open Now' : 'Closed'}
                  </Text>
                </View>

                {activeVendor.showExactLocation === false ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="shield-checkmark" size={12} color="#D89544" />
                    <Text style={[styles.storeAddress, { color: '#D89544' }]} numberOfLines={1}>
                      Neighborhood Zone (Exact Pin Masked)
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.storeAddress} numberOfLines={1}>
                    {activeVendor.address}
                  </Text>
                )}
              </View>
            </Pressable>

            {/* Matched Product Stock Bar */}
            {activeVendor.matchedProductTitle && (
              <Pressable
                onPress={() => {
                  if (activeVendor.matchedProductId) {
                    vibeHaptics.light();
                    router.push(`/product/${activeVendor.matchedProductId}` as never);
                  }
                }}
                style={({ pressed }) => [
                  styles.productBanner,
                  pressed && { opacity: 0.8 },
                ]}>
                <Ionicons name="pricetag" size={14} color={palette.brand.orange} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.productBannerTitle} numberOfLines={1}>
                    Has: {activeVendor.matchedProductTitle}
                  </Text>
                  {activeVendor.matchedProductPrice && (
                    <Text style={styles.productBannerPrice}>
                      {formatKobo(activeVendor.matchedProductPrice)} · In Stock
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={14} color={palette.brand.orange} />
              </Pressable>
            )}

            {/* Google Business Action CTAs */}
            <View style={styles.actionRow}>
              <Pressable
                onPress={() => openDirections(activeVendor)}
                style={({ pressed }) => [
                  styles.directionsBtn,
                  pressed && { opacity: 0.8 },
                ]}>
                <Ionicons name="map-outline" size={16} color={palette.ink.onDarkStrong} />
                <Text style={styles.directionsBtnText}>Directions</Text>
              </Pressable>

              <Pressable
                onPress={() => openVendorPage(activeVendor)}
                style={({ pressed }) => [
                  styles.orderBtn,
                  pressed && { opacity: 0.85 },
                ]}>
                <Ionicons name="storefront" size={16} color="#FFFFFF" />
                <Text style={styles.orderBtnText}>Visit Store</Text>
              </Pressable>

              {activeVendor.matchedProductId && (
                <Pressable
                  onPress={() => {
                    vibeHaptics.light();
                    router.push(`/product/${activeVendor.matchedProductId}` as never);
                  }}
                  style={({ pressed }) => [
                    styles.viewItemBtn,
                    pressed && { opacity: 0.85 },
                  ]}>
                  <Ionicons name="bag-handle" size={15} color={palette.brand.orange} />
                  <Text style={styles.viewItemBtnText}>Item</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    backgroundColor: '#120C08',
  },
  topInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    flex: 1,
  },
  liveBeacon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  topCount: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkSoft,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.18)',
    borderColor: '#4CAF50',
  },
  filterChipText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkSoft,
  },
  filterChipTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  mapCanvas: {
    width: SCREEN_WIDTH,
    height: MAP_HEIGHT,
    backgroundColor: '#0E0A08',
    overflow: 'hidden',
    position: 'relative',
  },
  userBeaconBadge: {
    position: 'absolute',
    top: MAP_HEIGHT / 2 + 12,
    left: SCREEN_WIDTH / 2 - 42,
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  userBeaconText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pinWrapper: {
    position: 'absolute',
    alignItems: 'center',
    width: 84,
  },
  pinWrapperSelected: {
    zIndex: 10,
    transform: [{ scale: 1.08 }],
  },
  pinBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(26, 18, 14, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.45)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  pinBubbleSelected: {
    backgroundColor: palette.brand.orange,
    borderColor: '#FFFFFF',
  },
  pinLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkStrong,
  },
  pinLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pinTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(26, 18, 14, 0.95)',
  },
  pinTipSelected: {
    borderTopColor: palette.brand.orange,
  },
  pinPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.brand.orange,
    marginTop: 2,
  },
  pinPulseSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  drawer: {
    padding: spacing['3'],
    backgroundColor: '#120C08',
  },
  storeCard: {
    padding: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    gap: spacing['3'],
  },
  storeCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['3'],
  },
  storeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: 'rgba(47, 107, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storeName: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 16,
    color: palette.ink.onDarkStrong,
  },
  storeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: '#F4C464',
    fontWeight: '600',
  },
  metaDot: {
    color: palette.ink.onDarkMuted,
    fontSize: 12,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  distanceText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.brand.orange,
  },
  openBadge: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  closedBadge: {
    color: '#FF5252',
  },
  storeAddress: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
    marginTop: 2,
  },
  productBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    padding: spacing['2'],
    borderRadius: radius.sm,
    backgroundColor: 'rgba(47, 107, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.18)',
  },
  productBannerTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkStrong,
  },
  productBannerPrice: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.brand.orange,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing['2'],
  },
  directionsBtn: {
    flex: 1,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  directionsBtnText: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  orderBtn: {
    flex: 1.4,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.md,
    backgroundColor: palette.brand.orange,
  },
  orderBtnText: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  viewItemBtn: {
    height: 42,
    paddingHorizontal: spacing['3'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: radius.md,
    backgroundColor: 'rgba(47, 107, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.3)',
  },
  viewItemBtnText: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 12,
    color: palette.brand.orange,
    fontWeight: '600',
  },
  openPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(47, 107, 255, 0.12)',
    marginLeft: 'auto',
  },
  openPillText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.brand.orange,
    fontWeight: '600',
  },
});

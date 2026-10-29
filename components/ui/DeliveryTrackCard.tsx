import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';

import { TopoBackground } from '@/components/ui/TopoBackground';
import { palette, radius, spacing, typography } from '@/src/theme';

type Props = {
  vendor: string;
  product: string;
  status: string;
  etaMin: number;
  progress: number; // 0..1 — courier position along route
  onTrack?: () => void;
  onCall?: () => void;
};

/**
 * Bolt-style live delivery card with a topographic line background and an
 * inline SVG showing the route from pickup → courier → destination.
 */
export function DeliveryTrackCard({
  vendor,
  product,
  status,
  etaMin,
  progress,
  onTrack,
  onCall,
}: Props) {
  // Route geometry inside the SVG viewBox (400 wide, 180 tall here).
  const start = { x: 40, y: 130 };
  const end = { x: 360, y: 50 };
  // Curved control point so the path arcs like a real route.
  const ctrl = { x: 200, y: 30 };
  const courier = pointOnQuadratic(start, ctrl, end, progress);

  const traveledD = `M${start.x} ${start.y} Q ${lerp(start.x, ctrl.x, progress / 2)} ${lerp(
    start.y,
    ctrl.y,
    progress / 2,
  )} ${courier.x} ${courier.y}`;
  const remainingD = `M${courier.x} ${courier.y} Q ${ctrl.x} ${ctrl.y} ${end.x} ${end.y}`;

  return (
    <Pressable onPress={onTrack} style={styles.card}>
      <LinearGradient
        colors={['#0F2A22', '#0A1F1A', '#06140F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <TopoBackground color="rgba(76,175,80,0.18)" strokeWidth={1} />

      {/* Route + pins SVG */}
      <Svg
        width="100%"
        height={180}
        viewBox="0 0 400 180"
        preserveAspectRatio="none"
        style={styles.routeSvg}>
        {/* Remaining route — soft */}
        <Path
          d={remainingD}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="3"
          strokeDasharray="6 6"
          fill="none"
          strokeLinecap="round"
        />
        {/* Traveled — solid bright */}
        <Path
          d={traveledD}
          stroke={palette.brand.orange}
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Pickup pin */}
        <Circle cx={start.x} cy={start.y} r="9" fill="#fff" />
        <Circle cx={start.x} cy={start.y} r="4" fill={palette.brand.orange} />
        {/* Destination pin */}
        <Circle cx={end.x} cy={end.y} r="9" fill={palette.brand.orange} />
        <Circle cx={end.x} cy={end.y} r="4" fill="#fff" />
        {/* Courier marker halo */}
        <Circle
          cx={courier.x}
          cy={courier.y}
          r="14"
          fill={palette.brand.orange}
          opacity={0.25}
        />
        <Circle cx={courier.x} cy={courier.y} r="9" fill={palette.brand.orange} />
      </Svg>

      {/* ETA pill on top of map */}
      <View style={styles.etaPill}>
        <View style={styles.etaDot} />
        <Text style={styles.etaText}>Arriving in {etaMin} min</Text>
      </View>

      {/* Bottom info strip */}
      <View style={styles.infoStrip}>
        <View style={styles.courierAvatar}>
          <Ionicons name="bicycle" size={18} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.vendor} numberOfLines={1}>
            {vendor}
          </Text>
          <Text style={styles.product} numberOfLines={1}>
            {product} · {status}
          </Text>
        </View>
        <Pressable
          onPress={onCall}
          accessibilityLabel="Call courier"
          style={styles.iconBtn}>
          <Ionicons name="call" size={16} color={palette.brand.orange} />
        </Pressable>
        <Pressable
          onPress={onTrack}
          accessibilityLabel="Track order"
          style={[styles.iconBtn, styles.iconBtnPrimary]}>
          <Ionicons name="navigate" size={16} color="#fff" />
        </Pressable>
      </View>
    </Pressable>
  );
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function pointOnQuadratic(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  t: number,
) {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing['4'],
    height: 240,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    backgroundColor: '#0A1F1A',
  },
  routeSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  etaPill: {
    position: 'absolute',
    top: spacing['3'],
    left: spacing['3'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing['3'],
    height: 28,
    borderRadius: 999,
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  etaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.status.success,
  },
  etaText: {
    ...typography.caption,
    color: '#fff',
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  infoStrip: {
    position: 'absolute',
    bottom: spacing['3'],
    left: spacing['3'],
    right: spacing['3'],
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['3'],
    backgroundColor: '#121833',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  courierAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendor: {
    ...typography.bodyEmphasis,
    color: '#fff',
  },
  product: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(47, 107, 255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255,0.35)',
  },
  iconBtnPrimary: {
    backgroundColor: palette.brand.orange,
    borderColor: palette.brand.orange,
  },
});

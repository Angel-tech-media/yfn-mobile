import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { LivePill } from '@/components/ui/LivePill';
import { palette, radius, spacing, typography } from '@/src/theme';

export type ScoreTeam = {
  name: string;
  flag: string; // single emoji flag
  scores: number[]; // per period (sets / quarters)
};

type Props = {
  title: string;
  meta: string;
  status: 'live' | 'finished' | 'upcoming';
  /** Period the match is currently in (e.g. "Set 3", "Q3", "FT"). */
  periodLabel?: string;
  home: ScoreTeam;
  away: ScoreTeam;
  onOpenThread?: () => void;
};

/**
 * Score-forward card for live match topics inside a Hive community. Inspired
 * by the tennis match-report mockup — big numeric per-period scores, flags,
 * Live pill, status chip.
 */
export function LiveScoreCard({
  title,
  meta,
  status,
  periodLabel,
  home,
  away,
  onOpenThread,
}: Props) {
  const winner =
    status === 'finished'
      ? totalOf(home) === totalOf(away)
        ? 'draw'
        : totalOf(home) > totalOf(away)
        ? 'home'
        : 'away'
      : undefined;

  return (
    <Pressable onPress={onOpenThread} style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.meta}>{meta}</Text>
        </View>
        {status === 'live' ? (
          <LivePill />
        ) : status === 'finished' ? (
          <View style={[styles.statusChip, styles.statusChipFinished]}>
            <Text style={styles.statusChipText}>Full time</Text>
          </View>
        ) : (
          <View style={styles.statusChip}>
            <Ionicons name="time-outline" size={10} color={palette.ink.onDarkSoft} />
            <Text style={styles.statusChipText}>{periodLabel ?? 'Upcoming'}</Text>
          </View>
        )}
      </View>

      <View style={styles.scoreboard}>
        <ScoreRow
          team={home}
          highlight={winner === 'home'}
          dim={winner === 'away'}
          maxPeriods={Math.max(home.scores.length, away.scores.length)}
        />
        <View style={styles.divider} />
        <ScoreRow
          team={away}
          highlight={winner === 'away'}
          dim={winner === 'home'}
          maxPeriods={Math.max(home.scores.length, away.scores.length)}
        />
      </View>

      {periodLabel && status === 'live' ? (
        <View style={styles.periodFooter}>
          <View style={styles.periodDot} />
          <Text style={styles.periodText}>{periodLabel}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function ScoreRow({
  team,
  highlight,
  dim,
  maxPeriods,
}: {
  team: ScoreTeam;
  highlight?: boolean;
  dim?: boolean;
  maxPeriods: number;
}) {
  const padded = [...team.scores, ...Array(Math.max(0, maxPeriods - team.scores.length)).fill(0)];
  return (
    <View style={styles.row}>
      <View style={styles.teamCol}>
        <Text style={styles.flag}>{team.flag}</Text>
        <Text
          style={[
            styles.teamName,
            highlight && styles.teamNameWin,
            dim && styles.teamNameDim,
          ]}
          numberOfLines={1}>
          {team.name}
        </Text>
      </View>
      <View style={styles.scoreCol}>
        {padded.map((n, i) => (
          <View
            key={i}
            style={[
              styles.scoreCell,
              highlight && styles.scoreCellWin,
              dim && styles.scoreCellDim,
            ]}>
            <Text
              style={[
                styles.scoreText,
                highlight && styles.scoreTextWin,
                dim && styles.scoreTextDim,
              ]}>
              {n}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function totalOf(t: ScoreTeam) {
  return t.scores.reduce((a, b) => a + b, 0);
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing['4'],
    padding: spacing['3'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderWidth: 1,
    borderColor: palette.line.onDark,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['2'],
    marginBottom: spacing['3'],
  },
  title: { ...typography.title, fontSize: 15, color: palette.ink.onDarkStrong },
  meta: { ...typography.caption, color: palette.ink.onDarkMuted, marginTop: 2 },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  statusChipFinished: { backgroundColor: 'rgba(63, 201, 192, 0.18)' },
  statusChipText: {
    ...typography.small,
    color: palette.ink.onDarkSoft,
    fontFamily: typography.bodyEmphasis.fontFamily,
    letterSpacing: 0.4,
  },
  scoreboard: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: radius.md,
    paddingVertical: spacing['2'],
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    marginHorizontal: spacing['3'],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
  },
  teamCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  flag: { fontSize: 22 },
  teamName: {
    ...typography.bodyEmphasis,
    color: palette.ink.onDarkStrong,
    flex: 1,
  },
  teamNameWin: { color: palette.brand.accentLime },
  teamNameDim: { color: palette.ink.onDarkMuted },
  scoreCol: { flexDirection: 'row', gap: 6 },
  scoreCell: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  scoreCellWin: { backgroundColor: palette.brand.accentLime },
  scoreCellDim: { backgroundColor: 'rgba(0, 0, 0, 0.03)' },
  scoreText: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 18,
    color: palette.ink.onDarkStrong,
  },
  scoreTextWin: { color: palette.bg.espressoEnd },
  scoreTextDim: { color: palette.ink.onDarkMuted },
  periodFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing['3'],
  },
  periodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.brand.accentLime,
  },
  periodText: {
    ...typography.caption,
    color: palette.ink.onDarkSoft,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
});

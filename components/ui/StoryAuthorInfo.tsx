import { StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { palette, spacing, typography } from '@/src/theme';

import { Avatar } from './Avatar';
import { VerifiedCheck } from './VerifiedCheck';

type Props = {
  avatar?: ImageSourcePropType;
  name: string;
  meta?: string;
  audioLabel?: string;
  verified?: boolean;
  rightAction?: React.ReactNode;
};

export function StoryAuthorInfo({
  avatar,
  name,
  meta,
  audioLabel,
  verified,
  rightAction,
}: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <Avatar source={avatar} size={40} />
        <View style={styles.id}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            {verified ? <VerifiedCheck tone="success" size={14} /> : null}
          </View>
          {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        </View>
        {rightAction}
      </View>
      {audioLabel ? (
        <View style={styles.audioChip}>
          <Ionicons name="musical-note" size={12} color={palette.ink.onDarkSoft} />
          <Text style={styles.audioText} numberOfLines={1}>{audioLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing['2'],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  id: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
  },
  name: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    color: palette.ink.onDarkStrong,
  },
  meta: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    color: palette.ink.onDarkMuted,
  },
  audioChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
    paddingHorizontal: spacing['3'],
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    maxWidth: '85%',
  },
  audioText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    color: palette.ink.onDarkSoft,
  },
});

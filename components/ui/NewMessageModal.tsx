import { useState } from 'react';
import { Modal, View, StyleSheet, TextInput, Pressable, Text, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/Avatar';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { useSearch } from '@/src/api/search/hooks';
import { useStartConversation } from '@/src/api/chat/hooks';
import { palette, radius, spacing, typography } from '@/src/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function NewMessageModal({ visible, onClose }: Props) {
  const [query, setQuery] = useState('');
  const { data: searchResults, isFetching } = useSearch({ q: query, type: 'people', limit: 10 });
  const startConversation = useStartConversation();
  const insets = useSafeAreaInsets();

  const handleSelectUser = (userId: string) => {
    startConversation.mutate(
      { participantUserId: userId },
      {
        onSuccess: (conv) => {
          onClose();
          router.push(`/threads/${conv.id}` as never);
        },
      }
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <EspressoBackground variant="espresso">
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
          <View style={styles.header}>
            <Pressable hitSlop={8} onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={palette.ink.onDarkStrong} />
            </Pressable>
            <Text style={styles.title}>New Message</Text>
            <View style={{ width: 36 }} />
          </View>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={20} color={palette.ink.onDarkSoft} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a user..."
              placeholderTextColor={palette.ink.onDarkMuted}
              value={query}
              onChangeText={setQuery}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={palette.ink.onDarkSoft} />
              </Pressable>
            )}
          </View>
          
          {isFetching && (
            <View style={styles.center}>
              <ActivityIndicator color={palette.brand.orange} />
            </View>
          )}
          
          {!isFetching && searchResults?.people?.length === 0 && query.trim() !== '' && (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No users found for "{query}"</Text>
            </View>
          )}

          <FlatList
            data={searchResults?.people || []}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.userRow, pressed && { backgroundColor: 'rgba(255,255,255,0.04)' }]}
                onPress={() => handleSelectUser(item.id)}
                disabled={startConversation.isPending}
              >
                <Avatar
                  size={48}
                  source={item.avatarUrl ? { uri: item.avatarUrl } : undefined}
                  initials={(item.name || item.handle || 'C').charAt(0).toUpperCase()}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userHandle}>@{item.handle}</Text>
                </View>
                {startConversation.isPending && startConversation.variables?.participantUserId === item.id && (
                  <ActivityIndicator color={palette.brand.orange} size="small" />
                )}
              </Pressable>
            )}
          />
        </View>
      </EspressoBackground>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['3'],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  title: {
    ...typography.h2,
    fontSize: 18,
    color: palette.ink.onDarkStrong,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing['5'],
    marginVertical: spacing['3'],
    paddingHorizontal: spacing['3'],
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    gap: spacing['2'],
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: palette.ink.onDarkStrong,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.body,
    color: palette.ink.onDarkMuted,
  },
  list: {
    paddingHorizontal: spacing['5'],
    paddingBottom: spacing['8'],
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['3'],
    gap: spacing['3'],
    borderRadius: radius.md,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    ...typography.bodyEmphasis,
    color: palette.ink.onDarkStrong,
  },
  userHandle: {
    ...typography.caption,
    color: palette.ink.onDarkMuted,
  },
});

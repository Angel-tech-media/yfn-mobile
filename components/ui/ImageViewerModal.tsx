import { useState } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Pressable,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Text,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedScrollHandler } from 'react-native-reanimated';

import { typography } from '@/src/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  imageUrls: string[];
  initialIndex?: number;
};

export function ImageViewerModal({ visible, onClose, imageUrls, initialIndex = 0 }: Props) {
  const { width, height } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const insets = useSafeAreaInsets();

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(Math.min(Math.max(nextIndex, 0), imageUrls.length - 1));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Animated.ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumEnd}
          contentOffset={{ x: initialIndex * width, y: 0 }}
        >
          {imageUrls.map((url, i) => (
            <View key={i} style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
              <Image
                source={{ uri: url }}
                style={{ width, height: '100%' }}
                contentFit="contain"
              />
            </View>
          ))}
        </Animated.ScrollView>

        <View style={[styles.overlay, { top: (insets.top || 20) + 10 }]} pointerEvents="box-none">
          {imageUrls.length > 1 && (
            <View style={styles.counter}>
              <Text style={styles.counterText}>
                {activeIndex + 1} / {imageUrls.length}
              </Text>
            </View>
          )}
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#FFF" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 40,
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counter: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  counterText: {
    color: '#FFF',
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
  },
});

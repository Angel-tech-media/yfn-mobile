import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Tactical micro-feedback utility to trigger kinetic dopamine responses
 * across interactions (Nike & Chinese super-app tactile design principles).
 */
export const vibeHaptics = {
  /**
   * Ultra-light tap for tab changes, toggle switches, or filter selection (Kanso simplicity).
   */
  selection: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.selectionAsync();
    } catch {
      // Graceful fallback on devices without haptic motors
    }
  },

  /**
   * Crisp micro-tap on hovering or touching buttons/cards.
   */
  light: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  },

  /**
   * Solid tactile confirmation when adding to cart, bookmarking, or liking.
   */
  medium: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
  },

  /**
   * Heavy impulse for primary action submission.
   */
  heavy: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
  },

  /**
   * Dual-pulse success feedback when a sale or delivery is confirmed.
   */
  success: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  },

  /**
   * Rapid rhythmic pulse sequence mimicking a gaming coin drop / jackpot reward.
   * Delivers an instant neurochemical dopamine spike upon payment or gift dispatch!
   */
  dopamineBurst: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setTimeout(async () => {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {}
      }, 70);
      setTimeout(async () => {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch {}
      }, 150);
      setTimeout(async () => {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }, 230);
    } catch {}
  },
};

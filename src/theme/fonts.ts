import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

/**
 * Brand typography registration.
 * Registers both standard Inter faces and tight neo-grotesk display aliases (`InterTight_*`)
 * so `useFonts(appFonts)` resolves all theme tokens with zero network/install overhead.
 */
export const appFonts = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  InterTight_500Medium: Inter_500Medium,
  InterTight_600SemiBold: Inter_600SemiBold,
  InterTight_700Bold: Inter_700Bold,
};

import {
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
} from '@expo-google-fonts/instrument-sans';

/**
 * Aktive brand typography ("Lagos Paper" & "Lagos Night" from Lovable):
 * - Display & Headings: Bricolage Grotesque (500, 600, 700, 800)
 * - Body & UI: Instrument Sans (400, 500, 600, 700)
 * Also aliases `InterTight_*` -> `BricolageGrotesque_*` and `Inter_*` -> `InstrumentSans_*`
 * so every screen in the app renders with Lovable's exact typography.
 */
export const appFonts = {
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,

  // Legacy aliases mapped to Lovable typography
  Inter_400Regular: InstrumentSans_400Regular,
  Inter_500Medium: InstrumentSans_500Medium,
  Inter_600SemiBold: InstrumentSans_600SemiBold,
  Inter_700Bold: InstrumentSans_700Bold,
  InterTight_500Medium: BricolageGrotesque_500Medium,
  InterTight_600SemiBold: BricolageGrotesque_600SemiBold,
  InterTight_700Bold: BricolageGrotesque_700Bold,
  InterTight_800ExtraBold: BricolageGrotesque_800ExtraBold,
};

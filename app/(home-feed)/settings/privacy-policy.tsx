import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { palette, radius, spacing, typography } from '@/src/theme';

export default function PrivacyPolicyScreen() {
  return (
    <ScreenContainer>
      <TopBar title="Privacy Policy" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.effectiveDate}>Effective Date: October 2026</Text>
          <Text style={styles.intro}>
            Your privacy is fundamental to Vibe. This Privacy Policy details how we collect, protect, and use your personal information when using our mobile application and social commerce network.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect personal information you provide when creating an account (email, phone number, display name), transaction information necessary for fulfillment (delivery address, payment reference), and usage analytics to improve recommendations.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>2. How We Use Information</Text>
          <Text style={styles.paragraph}>
            We use your data to process orders, facilitate secure escrow payouts, prevent fraudulent behavior, deliver real-time order updates via push notifications, and personalize your feed.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>3. Data Sharing & Third Parties</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal data. We only share delivery addresses with the vendor and fulfillment couriers handling your specific order, and payment tokens with certified payment processors (e.g., Paystack).
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>4. Your Rights & Account Deletion</Text>
          <Text style={styles.paragraph}>
            You have the right to export your data and request account deletion at any time via Settings &gt; Delete Account. Upon deletion, personal details are anonymized and tokens revoked, with records purged after statutory retention periods.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>5. Contact Our Privacy Officer</Text>
          <Text style={styles.paragraph}>
            If you have questions or data protection requests, please contact privacy@vibe.ng.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing['4'],
    paddingBottom: spacing['10'],
    gap: spacing['4'],
  },
  header: {
    marginBottom: spacing['2'],
    gap: spacing['2'],
  },
  effectiveDate: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  intro: {
    fontFamily: typography.body.fontFamily,
    fontSize: 15,
    lineHeight: 22,
    color: palette.ink.onDarkSoft,
  },
  card: {
    backgroundColor: palette.bg.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.line.divider,
    padding: spacing['4'],
    gap: spacing['2'],
  },
  sectionTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 16,
    color: palette.ink.onDarkStrong,
    fontWeight: '600',
  },
  paragraph: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: palette.ink.onDarkSoft,
  },
});

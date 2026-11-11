import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { palette, radius, spacing, typography } from '@/src/theme';

export default function TermsOfServiceScreen() {
  return (
    <ScreenContainer>
      <TopBar title="Terms of Service" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.effectiveDate}>Effective Date: October 2026</Text>
          <Text style={styles.intro}>
            Welcome to Aktive. These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Aktive platform, mobile application, escrow commerce tools, and related services.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. Account & Eligibility</Text>
          <Text style={styles.paragraph}>
            You must be at least 18 years of age (or the legal age of majority in your jurisdiction) to open a vendor store or initiate transactions on Aktive. You are responsible for safeguarding your login credentials and for all activities under your account.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>2. Escrow & Payment Protection</Text>
          <Text style={styles.paragraph}>
            All buyer purchases on Aktive are secured by automated escrow protection. When an order is placed, funds are safely held until the buyer confirms delivery or the standard inspection window elapses. Vendors are credited upon verified fulfillment.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>3. Prohibited Content & Behavior</Text>
          <Text style={styles.paragraph}>
            Users may not post counterfeit items, stolen goods, weapons, illegal substances, hate speech, abusive comments, or fraudulent listings. Violations will result in immediate content removal, account suspension, and referral to authorities where applicable.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>4. Community Safety & Reporting</Text>
          <Text style={styles.paragraph}>
            Any user can report suspicious listings, inappropriate behavior, or intellectual property infringements directly in-app. Our automated moderation filters and human review teams investigate and take action on reported content.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>5. Contact & Inquiries</Text>
          <Text style={styles.paragraph}>
            For questions or disputes regarding these Terms, contact our legal and support team at support@aktive.ng.
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

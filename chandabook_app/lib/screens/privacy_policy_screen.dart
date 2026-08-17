import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../widgets/festive_card.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Privacy Policy & Compliance'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            FestiveCard(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.shield_outlined, color: AppTheme.devotionalEmerald, size: 24),
                      SizedBox(width: 8),
                      Text(
                        'ChandaBook Privacy Policy',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Last Updated: August 2026\nApp Version: 1.0.0 (Google Play Production Release)',
                    style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
                  ),
                  const Divider(height: 24),
                  const Text(
                    '1. Overview & Purpose',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'ChandaBook is designed exclusively for community festival committees, mandals, and devotional trusts to maintain transparent financial records of donations (Chanda), festival expenditures, and devotee prasadam sponsorships.',
                    style: TextStyle(fontSize: 13, height: 1.4),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    '2. Information We Collect',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    '• Donor Information: Name, phone number (optional, used solely for sending digital receipts via WhatsApp upon user request), amount, and payment mode.\n'
                    '• Committee Records: Expense items, category classifications, and volunteer collector tags.\n'
                    '• Device Identifiers: Firebase Cloud Messaging (FCM) push tokens used strictly to deliver real-time festival activity notifications to committee members.',
                    style: TextStyle(fontSize: 13, height: 1.4),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    '3. Data Storage & Security',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'All festival records are stored locally with offline caching and securely synchronized with Google Cloud Firestore over encrypted SSL/TLS connections. We do not sell, rent, or monetize your donor data with any third-party advertisers.',
                    style: TextStyle(fontSize: 13, height: 1.4),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    '4. User Control & Data Deletion',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'You retain 100% ownership of your festival committee data. You may export full CSV / PDF audit statements at any time or request complete erasure of your festival group data directly through the App Settings.',
                    style: TextStyle(fontSize: 13, height: 1.4),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    '5. Contact Us',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'For privacy inquiries or data removal requests, please contact: support@chandabook.app',
                    style: TextStyle(fontSize: 13, height: 1.4),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';
import '../models/collection_model.dart';
import '../models/group_model.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/app_constants.dart';
import '../core/utils/date_formatter.dart';
import '../core/utils/number_to_words.dart';
import '../widgets/festive_card.dart';
import '../services/whatsapp_service.dart';
import '../services/pdf_service.dart';

class ReceiptModalScreen extends StatelessWidget {
  final CollectionModel collection;
  final GroupModel group;

  const ReceiptModalScreen({
    super.key,
    required this.collection,
    required this.group,
  });

  @override
  Widget build(BuildContext context) {
    final activeFestival = AppConstants.getFestivalType(group.festivalType);
    final words = NumberToWords.convert(collection.amount);
    final formattedAmount = DateFormatter.formatCurrency(collection.amount);

    return Scaffold(
      appBar: AppBar(
        title: Text('Receipt #${collection.receiptNo}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.print_outlined),
            tooltip: 'Print PDF Receipt',
            onPressed: () {
              PdfService.printReceipt(group, collection);
            },
          ),
          IconButton(
            icon: const Icon(Icons.share_outlined),
            tooltip: 'Share Receipt',
            onPressed: () {
              final text = WhatsAppService.buildReceiptMessage(group, collection);
              Share.share(text, subject: 'Chanda Receipt #${collection.receiptNo}');
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        physics: const BouncingScrollPhysics(),
        child: Column(
          children: [
            // Receipt Card Container
            FestiveCard(
              padding: const EdgeInsets.all(20),
              borderRadius: 20,
              border: Border.all(color: AppTheme.primarySaffron.withOpacity(0.4), width: 1.5),
              child: Column(
                children: [
                  // Decorative Header
                  Text(
                    activeFestival.icon,
                    style: const TextStyle(fontSize: 36),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    group.name.toUpperCase(),
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primarySaffronDark,
                    ),
                  ),
                  if (group.location.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(
                      group.location,
                      style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                    ),
                  ],
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.primarySaffron.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'OFFICIAL CHANDA RECEIPT',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.8,
                        color: AppTheme.primarySaffronDark,
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Divider(color: AppTheme.borderSubtle),
                  const SizedBox(height: 10),

                  // Receipt Meta Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildMetaTag('Receipt #', collection.receiptNo),
                      _buildMetaTag('Date', DateFormatter.formatDisplay(collection.date)),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Donor Info Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.bgSurface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.borderSubtle),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Received with thanks from:',
                          style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          collection.donorName,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textMain,
                          ),
                        ),
                        if (collection.phone.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.phone, size: 12, color: AppTheme.textMuted),
                              const SizedBox(width: 4),
                              Text(collection.phone, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                            ],
                          ),
                        ],
                        if (collection.address.isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              const Icon(Icons.location_on, size: 12, color: AppTheme.textMuted),
                              const SizedBox(width: 4),
                              Text(collection.address, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Amount Box
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFECFDF5), Color(0xFFD1FAE5)],
                      ),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppTheme.devotionalEmerald.withOpacity(0.3)),
                    ),
                    child: Column(
                      children: [
                        const Text(
                          'DONATION AMOUNT PAID',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                            color: Color(0xFF065F46),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          formattedAmount,
                          style: const TextStyle(
                            fontSize: 30,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF047857),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          words,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 12,
                            fontStyle: FontStyle.italic,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF065F46),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Payment Details Table
                  _buildDetailRow('Payment Mode', collection.paymentMode),
                  _buildDetailRow('Collected By', collection.collectedBy),
                  if (collection.notes.isNotEmpty)
                    _buildDetailRow('Sankalpam / Note', collection.notes),

                  const SizedBox(height: 16),
                  const Divider(color: AppTheme.borderSubtle),
                  const SizedBox(height: 12),

                  // Bottom QR & Signature Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          QrImageView(
                            data: 'CHANDABOOK:${group.code}:${collection.receiptNo}:${collection.amount}',
                            version: QrVersions.auto,
                            size: 64.0,
                            gapless: true,
                            foregroundColor: AppTheme.darkSlate,
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Digital Verified QR',
                            style: TextStyle(fontSize: 9, color: AppTheme.textMuted),
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppTheme.devotionalEmerald.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: AppTheme.devotionalEmerald.withOpacity(0.3)),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.check_circle, size: 12, color: AppTheme.devotionalEmerald),
                                SizedBox(width: 4),
                                Text(
                                  'VERIFIED DONATION',
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.devotionalEmerald,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            collection.collectedBy,
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                          const Text(
                            'Authorized Collector',
                            style: TextStyle(fontSize: 10, color: AppTheme.textMuted),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    '✨ May divine grace bring joy, health & prosperity to your family! ✨',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 11,
                      fontStyle: FontStyle.italic,
                      color: AppTheme.primarySaffronDark,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Share Actions
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF25D366),
                  foregroundColor: Colors.white,
                ),
                onPressed: () {
                  final msg = WhatsAppService.buildReceiptMessage(group, collection);
                  WhatsAppService.launchWhatsApp(collection.phone, msg);
                },
                icon: const Icon(Icons.send_rounded),
                label: const Text(
                  'Send Receipt on WhatsApp',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      PdfService.printReceipt(group, collection);
                    },
                    icon: const Icon(Icons.picture_as_pdf),
                    label: const Text('Download / Print PDF'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      final text = WhatsAppService.buildReceiptMessage(group, collection);
                      Share.share(text);
                    },
                    icon: const Icon(Icons.share),
                    label: const Text('Share Text'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildMetaTag(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
        Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(label, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}

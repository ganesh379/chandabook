import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';
import '../models/group_model.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/app_constants.dart';
import '../core/utils/date_formatter.dart';
import '../widgets/festive_card.dart';
import '../services/upi_service.dart';

class UpiQrScreen extends StatefulWidget {
  final GroupModel group;

  const UpiQrScreen({super.key, required this.group});

  @override
  State<UpiQrScreen> createState() => _UpiQrScreenState();
}

class _UpiQrScreenState extends State<UpiQrScreen> {
  final _customAmountController = TextEditingController();
  double? _selectedAmount;

  @override
  void dispose() {
    _customAmountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final upiId = widget.group.upiId.isNotEmpty ? widget.group.upiId : 'utsavcommittee@upi';
    final payeeName = widget.group.upiPayeeName.isNotEmpty ? widget.group.upiPayeeName : widget.group.name;
    final activeFestival = AppConstants.getFestivalType(widget.group.festivalType);

    final upiPayload = UpiService.buildUpiUriString(
      upiId: upiId,
      payeeName: payeeName,
      amount: _selectedAmount,
      note: '${widget.group.name} Chanda',
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('UPI Donation QR Code'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            tooltip: 'Share QR Link',
            onPressed: () {
              Share.share(
                '🙏 Scan & Pay Festival Chanda for *${widget.group.name}* via UPI: $upiId\nOr Pay Directly: $upiPayload',
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        physics: const BouncingScrollPhysics(),
        child: Column(
          children: [
            // UPI Poster Card
            FestiveCard(
              padding: const EdgeInsets.all(24),
              borderRadius: 24,
              border: Border.all(color: AppTheme.primarySaffron.withOpacity(0.4), width: 2),
              child: Column(
                children: [
                  Text(activeFestival.icon, style: const TextStyle(fontSize: 40)),
                  const SizedBox(height: 6),
                  Text(
                    widget.group.name.toUpperCase(),
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primarySaffronDark,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Official Committee UPI Collection',
                    style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
                  ),
                  const SizedBox(height: 16),

                  // QR Code Box
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primarySaffron.withOpacity(0.15),
                          blurRadius: 20,
                          offset: const Offset(0, 4),
                        ),
                      ],
                      border: Border.all(color: AppTheme.borderSubtle, width: 1.5),
                    ),
                    child: QrImageView(
                      data: upiPayload,
                      version: QrVersions.auto,
                      size: 200.0,
                      gapless: true,
                      foregroundColor: AppTheme.darkSlate,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // UPI ID display
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppTheme.bgSurface,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppTheme.borderSubtle),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.account_balance, size: 16, color: AppTheme.primarySaffron),
                        const SizedBox(width: 8),
                        Text(
                          upiId,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textMain,
                          ),
                        ),
                      ],
                    ),
                  ),

                  if (_selectedAmount != null && _selectedAmount! > 0) ...[
                    const SizedBox(height: 12),
                    Text(
                      'Fixed Amount: ${DateFormatter.formatCurrency(_selectedAmount!)}',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.devotionalEmerald,
                      ),
                    ),
                  ],

                  const SizedBox(height: 16),
                  const Text(
                    'Accepted via Google Pay, PhonePe, Paytm, BHIM & all UPI apps',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Optional Preset Amount Selector
            const Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Set Fixed Amount (Optional):',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.textMain),
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: [
                ActionChip(
                  label: const Text('Any Amount'),
                  backgroundColor: _selectedAmount == null ? AppTheme.primarySaffron : Colors.white,
                  labelStyle: TextStyle(
                    color: _selectedAmount == null ? Colors.white : AppTheme.textMain,
                    fontWeight: FontWeight.bold,
                  ),
                  onPressed: () => setState(() => _selectedAmount = null),
                ),
                ...[501, 1116, 2116, 5016, 11000].map((amt) {
                  final isSelected = _selectedAmount == amt.toDouble();
                  return ActionChip(
                    label: Text('+₹$amt'),
                    backgroundColor: isSelected ? AppTheme.primarySaffron : Colors.white,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : AppTheme.textMain,
                      fontWeight: FontWeight.bold,
                    ),
                    onPressed: () => setState(() => _selectedAmount = amt.toDouble()),
                  );
                }),
              ],
            ),
            const SizedBox(height: 20),

            // Pay Directly Button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.devotionalEmerald,
                ),
                onPressed: () {
                  UpiService.launchUpiIntent(
                    upiId: upiId,
                    payeeName: payeeName,
                    amount: _selectedAmount,
                    note: '${widget.group.name} Chanda',
                  );
                },
                icon: const Icon(Icons.payment),
                label: const Text(
                  'Pay via UPI Apps (GPay / PhonePe)',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }
}

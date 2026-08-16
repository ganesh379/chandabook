import 'package:flutter/material.dart';
import 'package:confetti/confetti.dart';
import 'package:provider/provider.dart';
import '../providers/app_state_provider.dart';
import '../models/collection_model.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/app_constants.dart';
import '../widgets/quick_amount_chips.dart';
import '../widgets/confetti_overlay.dart';
import '../services/whatsapp_service.dart';
import 'receipt_modal_screen.dart';

class AddChandaDialog extends StatefulWidget {
  const AddChandaDialog({super.key});

  @override
  State<AddChandaDialog> createState() => _AddChandaDialogState();
}

class _AddChandaDialogState extends State<AddChandaDialog> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _donorNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _notesController = TextEditingController();

  String _paymentMode = 'Cash';
  late String _collectedBy;
  bool _openReceiptAfterSave = true;
  late ConfettiController _confettiController;

  @override
  void initState() {
    super.initState();
    _confettiController = ConfettiController(duration: const Duration(seconds: 2));
    final state = context.read<AppStateProvider>();
    _collectedBy = state.activeVolunteer;
  }

  @override
  void dispose() {
    _amountController.dispose();
    _donorNameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _notesController.dispose();
    _confettiController.dispose();
    super.dispose();
  }

  void _onAuspiciousAmountSelected(double amt) {
    setState(() {
      _amountController.text = amt.toInt().toString();
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final amount = double.tryParse(_amountController.text.trim()) ?? 0.0;
    if (amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid donation amount')),
      );
      return;
    }

    final state = context.read<AppStateProvider>();
    final group = state.activeGroup;
    if (group == null) return;

    final receiptNo = state.generateNextReceiptNo();
    final newCollection = CollectionModel(
      id: 'col-${DateTime.now().millisecondsSinceEpoch}',
      receiptNo: receiptNo,
      donorName: _donorNameController.text.trim(),
      phone: _phoneController.text.trim(),
      address: _addressController.text.trim(),
      amount: amount,
      paymentMode: _paymentMode,
      collectedBy: _collectedBy,
      date: DateTime.now().toIso8601String().split('T')[0],
      notes: _notesController.text.trim(),
    );

    // Blast celebratory confetti!
    _confettiController.play();
    await state.addCollection(newCollection);

    if (!mounted) return;

    // Small delay to appreciate confetti
    await Future.delayed(const Duration(milliseconds: 600));

    if (!mounted) return;
    Navigator.pop(context);

    if (_openReceiptAfterSave) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => ReceiptModalScreen(
            collection: newCollection,
            group: group,
          ),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Chanda of ₹$amount recorded for ${newCollection.donorName}!'),
          backgroundColor: AppTheme.devotionalEmerald,
          action: SnackBarAction(
            label: 'WhatsApp Receipt',
            textColor: Colors.white,
            onPressed: () {
              final msg = WhatsAppService.buildReceiptMessage(group, newCollection);
              WhatsAppService.launchWhatsApp(newCollection.phone, msg);
            },
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppStateProvider>();
    final group = state.activeGroup;
    final nextReceipt = state.generateNextReceiptNo();

    return ConfettiCelebrationOverlay(
      confettiController: _confettiController,
      child: Container(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom + 16,
          left: 20,
          right: 20,
          top: 12,
        ),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Handle Bar
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppTheme.borderSubtle,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.primarySaffron.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'Receipt No: $nextReceipt',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.primarySaffronDark,
                            ),
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Record Chanda Donation',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textMain,
                          ),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Auspicious Preset Chips
                QuickAmountChips(
                  selectedAmount: double.tryParse(_amountController.text),
                  onAmountSelected: _onAuspiciousAmountSelected,
                ),
                const SizedBox(height: 14),

                // Amount Field
                TextFormField(
                  controller: _amountController,
                  keyboardType: TextInputType.number,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primarySaffronDark,
                  ),
                  decoration: const InputDecoration(
                    labelText: 'Donation Amount (₹) *',
                    prefixText: '₹ ',
                    prefixStyle: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primarySaffronDark,
                    ),
                    hintText: 'e.g. 1116',
                  ),
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) return 'Enter donation amount';
                    if (double.tryParse(val) == null || double.parse(val) <= 0) return 'Invalid amount';
                    return null;
                  },
                ),
                const SizedBox(height: 12),

                // Donor Name
                TextFormField(
                  controller: _donorNameController,
                  textCapitalization: TextCapitalization.words,
                  decoration: const InputDecoration(
                    labelText: 'Donor Full Name *',
                    hintText: 'e.g. Suresh Patil & Family',
                    prefixIcon: Icon(Icons.person_outline, size: 20),
                  ),
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) return 'Please enter donor name';
                    return null;
                  },
                ),
                const SizedBox(height: 12),

                // Phone Number
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'WhatsApp Phone Number',
                    hintText: '10-digit mobile number',
                    prefixIcon: Icon(Icons.phone_outlined, size: 20),
                  ),
                ),
                const SizedBox(height: 12),

                // Address / Colony
                TextFormField(
                  controller: _addressController,
                  decoration: const InputDecoration(
                    labelText: 'Address / Flat / Colony',
                    hintText: 'e.g. Flat 302, Block A',
                    prefixIcon: Icon(Icons.location_on_outlined, size: 20),
                  ),
                ),
                const SizedBox(height: 12),

                // Payment Mode & Collector Row
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _paymentMode,
                        decoration: const InputDecoration(
                          labelText: 'Payment Mode',
                          prefixIcon: Icon(Icons.payment, size: 20),
                        ),
                        items: AppConstants.paymentModes.map((mode) {
                          return DropdownMenuItem(
                            value: mode,
                            child: Text(mode, style: const TextStyle(fontSize: 13)),
                          );
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) setState(() => _paymentMode = val);
                        },
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _collectedBy,
                        decoration: const InputDecoration(
                          labelText: 'Collected By',
                          prefixIcon: Icon(Icons.badge_outlined, size: 20),
                        ),
                        items: (group?.members ?? ['Treasurer']).map((m) {
                          return DropdownMenuItem(
                            value: m,
                            child: Text(m, style: const TextStyle(fontSize: 13), overflow: TextOverflow.ellipsis),
                          );
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) setState(() => _collectedBy = val);
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Notes
                TextFormField(
                  controller: _notesController,
                  decoration: const InputDecoration(
                    labelText: 'Special Pooja Sankalpam / Note',
                    hintText: 'e.g. Pooja in Gothram / Laddu Sponsor',
                    prefixIcon: Icon(Icons.note_alt_outlined, size: 20),
                  ),
                ),
                const SizedBox(height: 10),

                // Open Receipt Checkbox
                CheckboxListTile(
                  contentPadding: EdgeInsets.zero,
                  value: _openReceiptAfterSave,
                  activeColor: AppTheme.primarySaffron,
                  title: const Text(
                    'Open Digital Receipt after saving',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                  ),
                  onChanged: (val) {
                    setState(() {
                      _openReceiptAfterSave = val ?? true;
                    });
                  },
                ),
                const SizedBox(height: 12),

                // Save Button
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton.icon(
                    onPressed: _submit,
                    icon: const Icon(Icons.check_circle, color: Colors.white),
                    label: const Text(
                      'Save & Issue Receipt',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

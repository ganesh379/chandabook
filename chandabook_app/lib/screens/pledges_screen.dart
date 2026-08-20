import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state_provider.dart';
import '../models/pledge_model.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/app_constants.dart';
import '../core/utils/date_formatter.dart';
import '../widgets/festive_card.dart';
import '../services/whatsapp_service.dart';

class PledgesScreen extends StatefulWidget {
  const PledgesScreen({super.key});

  @override
  State<PledgesScreen> createState() => _PledgesScreenState();
}

class _PledgesScreenState extends State<PledgesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _openAddPledgeModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _AddPledgeDialog(),
    );
  }

  void _openPayPledgeDialog(BuildContext context, PledgeModel pledge) {
    showDialog(
      context: context,
      builder: (_) => _RecordPledgePaymentDialog(pledge: pledge),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppStateProvider>();
    final group = state.activeGroup;
    final financials = state.financials;
    final isAdmin = state.isCurrentUserAdmin;

    if (group == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final pending = group.pledges.where((p) => !p.isFulfilled).toList();
    final fulfilled = group.pledges.where((p) => p.isFulfilled).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Pledges & Promises'),
        actions: [
          if (isAdmin)
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            tooltip: 'Add Pledge',
            onPressed: () => _openAddPledgeModal(context),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.primarySaffron,
          labelColor: AppTheme.primarySaffronDark,
          unselectedLabelColor: AppTheme.textMuted,
          tabs: [
            Tab(text: 'Pending (${pending.length})'),
            Tab(text: 'Fulfilled (${fulfilled.length})'),
          ],
        ),
      ),
      body: Column(
        children: [
          // Pledges Summary Card
          Padding(
            padding: const EdgeInsets.all(16),
            child: FestiveCard(
              padding: const EdgeInsets.all(16),
              borderRadius: 16,
              color: AppTheme.bgSurface,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildSummaryCol('Total Pledged', DateFormatter.formatCurrency(financials.totalPledged), AppTheme.textMain),
                  Container(width: 1, height: 28, color: AppTheme.borderSubtle),
                  _buildSummaryCol('Collected', DateFormatter.formatCurrency(financials.totalPledgeCollected), AppTheme.devotionalEmerald),
                  Container(width: 1, height: 28, color: AppTheme.borderSubtle),
                  _buildSummaryCol('Outstanding', DateFormatter.formatCurrency(financials.pledgeOutstanding), AppTheme.primarySaffronDark),
                ],
              ),
            ),
          ),

          // Tab Views
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildPledgesList(context, pending, group, isPending: true, isAdmin: isAdmin),
                _buildPledgesList(context, fulfilled, group, isPending: false, isAdmin: isAdmin),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: isAdmin
          ? FloatingActionButton.extended(
              onPressed: () => _openAddPledgeModal(context),
              backgroundColor: AppTheme.primarySaffron,
              icon: const Icon(Icons.add, color: Colors.white),
              label: const Text('New Pledge', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            )
          : null,
    );
  }

  Widget _buildSummaryCol(String label, String value, Color color) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
        const SizedBox(height: 2),
        Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: color)),
      ],
    );
  }

  Widget _buildPledgesList(BuildContext context, List<PledgeModel> list, dynamic group, {required bool isPending, required bool isAdmin}) {
    if (list.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(isPending ? Icons.check_circle_outline : Icons.pending_actions, size: 48, color: AppTheme.textMuted),
            const SizedBox(height: 8),
            Text(
              isPending ? 'No pending pledges! All cleared 🎉' : 'No fulfilled pledges yet',
              style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textMuted),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      physics: const BouncingScrollPhysics(),
      itemCount: list.length,
      itemBuilder: (context, index) {
        final pledge = list[index];
        final percent = pledge.pledgeAmount > 0 ? (pledge.collectedAmount / pledge.pledgeAmount).clamp(0.0, 1.0) : 0.0;

        return Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: FestiveCard(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        pledge.donorName,
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: isPending ? const Color(0xFFFEF3C7) : const Color(0xFFECFDF5),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        isPending ? 'Pending: ${DateFormatter.formatCurrency(pledge.outstandingAmount)}' : 'Fulfilled ✅',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: isPending ? const Color(0xFFB45309) : const Color(0xFF047857),
                        ),
                      ),
                    ),
                  ],
                ),
                if (pledge.phone.isNotEmpty || pledge.address.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(
                    '${pledge.phone} • ${pledge.address}',
                    style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                  ),
                ],
                const SizedBox(height: 8),

                // Mini Progress Bar
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: percent,
                    minHeight: 6,
                    backgroundColor: AppTheme.borderSubtle,
                    valueColor: AlwaysStoppedAnimation(
                      isPending ? AppTheme.primarySaffron : AppTheme.devotionalEmerald,
                    ),
                  ),
                ),
                const SizedBox(height: 8),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Pledged: ${DateFormatter.formatCurrency(pledge.pledgeAmount)} (Paid: ${DateFormatter.formatCurrency(pledge.collectedAmount)})',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.textMuted),
                    ),
                    Row(
                      children: [
                        if (isPending) ...[
                          IconButton(
                            icon: const Icon(Icons.send, size: 18, color: Color(0xFF25D366)),
                            tooltip: 'Send WhatsApp Reminder',
                            onPressed: () {
                              final msg = WhatsAppService.buildPledgeReminderMessage(group, pledge);
                              WhatsAppService.launchWhatsApp(pledge.phone, msg);
                            },
                          ),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              textStyle: const TextStyle(fontSize: 12),
                            ),
                            onPressed: () => _openPayPledgeDialog(context, pledge),
                            child: const Text('Record Pay'),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _AddPledgeDialog extends StatefulWidget {
  const _AddPledgeDialog();

  @override
  State<_AddPledgeDialog> createState() => _AddPledgeDialogState();
}

class _AddPledgeDialogState extends State<_AddPledgeDialog> {
  final _formKey = GlobalKey<FormState>();
  final _donorNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _amountController = TextEditingController();
  final _notesController = TextEditingController();

  @override
  void dispose() {
    _donorNameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _amountController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final amount = double.tryParse(_amountController.text.trim()) ?? 0.0;
    if (amount <= 0) return;

    final state = context.read<AppStateProvider>();
    final newPledge = PledgeModel(
      id: 'plg-${DateTime.now().millisecondsSinceEpoch}',
      donorName: _donorNameController.text.trim(),
      phone: _phoneController.text.trim(),
      address: _addressController.text.trim(),
      pledgeAmount: amount,
      date: DateTime.now().toIso8601String().split('T')[0],
      notes: _notesController.text.trim(),
    );

    await state.addPledge(newPledge);
    if (!mounted) return;
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
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
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(color: AppTheme.borderSubtle, borderRadius: BorderRadius.circular(4)),
                ),
              ),
              const SizedBox(height: 12),
              const Text('Add Chanda Commitment / Pledge', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 14),

              TextFormField(
                controller: _donorNameController,
                textCapitalization: TextCapitalization.words,
                decoration: const InputDecoration(labelText: 'Donor Name *', hintText: 'e.g. Kishore Reddy'),
                validator: (v) => v == null || v.trim().isEmpty ? 'Enter donor name' : null,
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _amountController,
                keyboardType: TextInputType.number,
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.primarySaffronDark),
                decoration: const InputDecoration(labelText: 'Pledged Amount (₹) *', prefixText: '₹ '),
                validator: (v) => v == null || double.tryParse(v) == null || double.parse(v) <= 0 ? 'Enter valid amount' : null,
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'WhatsApp Phone', hintText: '10-digit number'),
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _addressController,
                decoration: const InputDecoration(labelText: 'Address / Colony', hintText: 'Villa 14, Royal Palm'),
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _notesController,
                decoration: const InputDecoration(labelText: 'Commitment Notes', hintText: 'Will pay during pooja'),
              ),
              const SizedBox(height: 16),

              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: _submit,
                  icon: const Icon(Icons.check),
                  label: const Text('Save Pledge Commitment', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RecordPledgePaymentDialog extends StatefulWidget {
  final PledgeModel pledge;

  const _RecordPledgePaymentDialog({required this.pledge});

  @override
  State<_RecordPledgePaymentDialog> createState() => _RecordPledgePaymentDialogState();
}

class _RecordPledgePaymentDialogState extends State<_RecordPledgePaymentDialog> {
  final _amountController = TextEditingController();
  String _paymentMode = 'Cash';
  late String _collectedBy;

  @override
  void initState() {
    super.initState();
    _amountController.text = widget.pledge.outstandingAmount.toInt().toString();
    final state = context.read<AppStateProvider>();
    _collectedBy = state.activeVolunteer;
  }

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppStateProvider>();
    final group = state.activeGroup;

    return AlertDialog(
      title: Text('Record Payment for ${widget.pledge.donorName}'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextFormField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Amount Received (₹)', prefixText: '₹ '),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _paymentMode,
              decoration: const InputDecoration(labelText: 'Payment Mode'),
              items: AppConstants.paymentModes.map((m) => DropdownMenuItem(value: m, child: Text(m, style: const TextStyle(fontSize: 13)))).toList(),
              onChanged: (v) => setState(() => _paymentMode = v ?? 'Cash'),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _collectedBy,
              decoration: const InputDecoration(labelText: 'Collected By'),
              items: (group?.members ?? ['Treasurer']).map((m) => DropdownMenuItem(value: m, child: Text(m, style: const TextStyle(fontSize: 13)))).toList(),
              onChanged: (v) => setState(() => _collectedBy = v ?? 'Treasurer'),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
        ElevatedButton(
          onPressed: () async {
            final amt = double.tryParse(_amountController.text.trim()) ?? 0.0;
            if (amt <= 0) return;

            await state.recordPledgePayment(
              pledge: widget.pledge,
              paymentAmount: amt,
              paymentMode: _paymentMode,
              collectedBy: _collectedBy,
            );

            if (!mounted) return;
            Navigator.pop(context);
          },
          child: const Text('Confirm Payment'),
        ),
      ],
    );
  }
}

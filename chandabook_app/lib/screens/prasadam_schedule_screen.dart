import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state_provider.dart';
import '../models/prasadam_model.dart';
import '../core/theme/app_theme.dart';
import '../core/utils/date_formatter.dart';
import '../widgets/festive_card.dart';
import '../services/whatsapp_service.dart';

class PrasadamScheduleScreen extends StatelessWidget {
  const PrasadamScheduleScreen({super.key});

  void _openAddPrasadamModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _AddPrasadamDialog(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppStateProvider>();
    final group = state.activeGroup;
    final isAdmin = state.isCurrentUserAdmin;

    if (group == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final schedule = group.prasadamSchedule;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Annadanam & Prasadam'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            tooltip: 'Share Schedule on WhatsApp',
            onPressed: () {
              final msg = WhatsAppService.buildPrasadamScheduleMessage(group, schedule);
              WhatsAppService.launchWhatsApp('', msg);
            },
          ),
          if (isAdmin)
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            tooltip: 'Add Sponsor',
            onPressed: () => _openAddPrasadamModal(context),
          ),
        ],
      ),
      body: schedule.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('🍲', style: TextStyle(fontSize: 48)),
                  const SizedBox(height: 8),
                  const Text(
                    'No Prasadam Sponsors booked yet',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Schedule daily Annadanam and Maha Prasadam sponsors.',
                    style: TextStyle(fontSize: 13, color: AppTheme.textMuted),
                  ),
                  const SizedBox(height: 16),
                  if (isAdmin)
                  ElevatedButton.icon(
                    onPressed: () => _openAddPrasadamModal(context),
                    icon: const Icon(Icons.add),
                    label: const Text('Book Sponsor Slot'),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              physics: const BouncingScrollPhysics(),
              itemCount: schedule.length,
              itemBuilder: (context, index) {
                final item = schedule[index];
                final isMorning = item.slot == 'morning';

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
                            Row(
                              children: [
                                Text(isMorning ? '🌅' : '🌙', style: const TextStyle(fontSize: 16)),
                                const SizedBox(width: 6),
                                Text(
                                  DateFormatter.formatDisplay(item.date),
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: isMorning ? AppTheme.marigold.withOpacity(0.2) : const Color(0xFFE0E7FF),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                isMorning ? 'Morning Pooja' : 'Evening Maha Prasadam',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: isMorning ? const Color(0xFFB45309) : const Color(0xFF3730A3),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Sponsor: ${item.sponsorName}',
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                        ),
                        if (item.sponsorPhone.isNotEmpty)
                          Text(
                            'Phone: ${item.sponsorPhone}',
                            style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                          ),
                        if (item.menuItems.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppTheme.bgSurface,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              children: [
                                const Text('🍛 ', style: TextStyle(fontSize: 12)),
                                Expanded(
                                  child: Text(
                                    item.menuItems,
                                    style: const TextStyle(fontSize: 12, fontStyle: FontStyle.italic),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Devotees: ~${item.estimatedCount} People',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppTheme.textMuted),
                            ),
                            if (isAdmin)
                            IconButton(
                              icon: const Icon(Icons.delete_outline, size: 16, color: Colors.redAccent),
                              onPressed: () => state.deletePrasadam(item.id),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
      floatingActionButton: isAdmin
          ? FloatingActionButton.extended(
              onPressed: () => _openAddPrasadamModal(context),
              backgroundColor: AppTheme.primarySaffron,
              icon: const Icon(Icons.add, color: Colors.white),
              label: const Text('Book Sponsor', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            )
          : null,
    );
  }
}

class _AddPrasadamDialog extends StatefulWidget {
  const _AddPrasadamDialog();

  @override
  State<_AddPrasadamDialog> createState() => _AddPrasadamDialogState();
}

class _AddPrasadamDialogState extends State<_AddPrasadamDialog> {
  final _formKey = GlobalKey<FormState>();
  final _sponsorNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _menuController = TextEditingController();
  final _countController = TextEditingController(text: '200');
  String _slot = 'morning';

  @override
  void dispose() {
    _sponsorNameController.dispose();
    _phoneController.dispose();
    _menuController.dispose();
    _countController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final state = context.read<AppStateProvider>();
    final newPrasadam = PrasadamModel(
      id: 'prs-${DateTime.now().millisecondsSinceEpoch}',
      date: DateTime.now().toIso8601String().split('T')[0],
      slot: _slot,
      sponsorName: _sponsorNameController.text.trim(),
      sponsorPhone: _phoneController.text.trim(),
      menuItems: _menuController.text.trim(),
      estimatedCount: int.tryParse(_countController.text.trim()) ?? 200,
    );

    await state.addPrasadam(newPrasadam);
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
                child: Container(width: 40, height: 4, decoration: BoxDecoration(color: AppTheme.borderSubtle, borderRadius: BorderRadius.circular(4))),
              ),
              const SizedBox(height: 12),
              const Text('Book Annadanam / Prasadam Seva', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 14),

              TextFormField(
                controller: _sponsorNameController,
                textCapitalization: TextCapitalization.words,
                decoration: const InputDecoration(labelText: 'Sponsor Family Name *', hintText: 'e.g. Deshmukh Family'),
                validator: (v) => v == null || v.trim().isEmpty ? 'Enter sponsor name' : null,
              ),
              const SizedBox(height: 12),

              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _slot,
                      decoration: const InputDecoration(labelText: 'Seva Timing Slot'),
                      items: const [
                        DropdownMenuItem(value: 'morning', child: Text('🌅 Morning Pooja')),
                        DropdownMenuItem(value: 'evening', child: Text('🌙 Evening Maha Prasadam')),
                      ],
                      onChanged: (v) => setState(() => _slot = v ?? 'morning'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextFormField(
                      controller: _countController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Devotees Count', hintText: '250'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _menuController,
                decoration: const InputDecoration(labelText: 'Prasadam Menu Items', hintText: 'e.g. Pulihora, Laddu, Payasam'),
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'Sponsor Contact Number', hintText: '10-digit number'),
              ),
              const SizedBox(height: 16),

              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: _submit,
                  icon: const Icon(Icons.check),
                  label: const Text('Confirm Prasadam Booking', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

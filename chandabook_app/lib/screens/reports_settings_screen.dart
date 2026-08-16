import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import '../providers/app_state_provider.dart';
import '../core/theme/app_theme.dart';
import '../core/utils/date_formatter.dart';
import '../widgets/festive_card.dart';
import '../services/pdf_service.dart';
import 'analytics_screen.dart';
import 'daily_ledger_screen.dart';
import 'pledges_screen.dart';
import 'prasadam_schedule_screen.dart';
import 'transparency_screen.dart';
import 'receipt_lookup_screen.dart';
import 'group_selector_screen.dart';

class ReportsSettingsScreen extends StatelessWidget {
  const ReportsSettingsScreen({super.key});

  void _openEditSettingsModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _EditGroupSettingsDialog(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppStateProvider>();
    final group = state.activeGroup;

    if (group == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return Scaffold(
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        physics: const BouncingScrollPhysics(),
        children: [
          // Group Summary Header Card
          FestiveCard(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: AppTheme.primarySaffron.withOpacity(0.12),
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Icon(Icons.festival, color: AppTheme.primarySaffron, size: 28),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        group.name,
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Join Code: ${group.code} • ${group.members.length} Volunteers',
                        style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.edit_outlined, color: AppTheme.primarySaffron),
                  tooltip: 'Edit Utsav Details',
                  onPressed: () => _openEditSettingsModal(context),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Reports & PDF Section
          const Text(
            'Export Statements & Analytics',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textMain),
          ),
          const SizedBox(height: 8),

          _buildActionItem(
            icon: Icons.picture_as_pdf,
            color: const Color(0xFFDC2626),
            title: 'Download Full PDF Statement',
            subtitle: 'Complete financial audit report with receipts & ledger',
            onTap: () => PdfService.printStatement(group),
          ),
          const SizedBox(height: 8),

          _buildActionItem(
            icon: Icons.insights,
            color: const Color(0xFF7C3AED),
            title: 'Analytics & Visual Charts',
            subtitle: 'Category pie chart & daily collections trend',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AnalyticsScreen())),
          ),
          const SizedBox(height: 8),

          _buildActionItem(
            icon: Icons.table_chart,
            color: const Color(0xFF059669),
            title: 'Export CSV / Text Summary',
            subtitle: 'Share formatted CSV summary to WhatsApp/Email',
            onTap: () {
              final buffer = StringBuffer();
              buffer.writeln('ReceiptNo,DonorName,Phone,Amount,Mode,Collector,Date');
              for (final c in group.collections) {
                buffer.writeln('${c.receiptNo},"${c.donorName}",${c.phone},${c.amount},${c.paymentMode},"${c.collectedBy}",${c.date}');
              }
              Share.share(buffer.toString(), subject: '${group.name} Collections CSV');
            },
          ),
          const SizedBox(height: 20),

          // Extended Features Section
          const Text(
            'Special Management Modules',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textMain),
          ),
          const SizedBox(height: 8),

          _buildActionItem(
            icon: Icons.auto_graph,
            color: const Color(0xFF2563EB),
            title: 'Daily Cash Flow Ledger',
            subtitle: 'Reconcile collections and expenses by day',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const DailyLedgerScreen())),
          ),
          const SizedBox(height: 8),

          _buildActionItem(
            icon: Icons.handshake_outlined,
            color: const Color(0xFFD97706),
            title: 'Pledges & Promises Tracker',
            subtitle: 'Follow up on committed donations with WhatsApp reminders',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PledgesScreen())),
          ),
          const SizedBox(height: 8),

          _buildActionItem(
            icon: Icons.restaurant,
            color: AppTheme.devotionalEmerald,
            title: 'Annadanam & Prasadam Schedule',
            subtitle: 'Manage daily morning & evening puja sponsor slots',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PrasadamScheduleScreen())),
          ),
          const SizedBox(height: 8),

          _buildActionItem(
            icon: Icons.search,
            color: const Color(0xFF0284C7),
            title: 'Donor Receipt Lookup',
            subtitle: 'Find and re-share receipts by receipt # or phone',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ReceiptLookupScreen())),
          ),
          const SizedBox(height: 8),

          _buildActionItem(
            icon: Icons.public,
            color: const Color(0xFFB45309),
            title: 'Public Devotee Transparency Page',
            subtitle: 'Open community view without login access',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TransparencyScreen())),
          ),
          const SizedBox(height: 20),

          // Cloud Sync & App Version
          FestiveCard(
            padding: const EdgeInsets.all(14),
            color: AppTheme.bgSurface,
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.cloud_done, color: AppTheme.devotionalEmerald, size: 20),
                        SizedBox(width: 8),
                        Text('Firestore Realtime Sync', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      ],
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        textStyle: const TextStyle(fontSize: 11),
                      ),
                      onPressed: () {
                        state.updateGroup(group);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Cloud synchronization triggered! ☁️')),
                        );
                      },
                      child: const Text('Sync Now'),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                  'Offline-first: All data is saved on your device and auto-synced across committee devices via Cloud Firestore.',
                  style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          const Center(
            child: Text(
              'ChandaBook v1.0.0 • Utsav Finance Platform',
              style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
            ),
          ),
          const SizedBox(height: 30),
        ],
      ),
    );
  }

  Widget _buildActionItem({
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return FestiveCard(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      onTap: onTap,
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                Text(subtitle, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: AppTheme.textMuted),
        ],
      ),
    );
  }
}

class _EditGroupSettingsDialog extends StatefulWidget {
  const _EditGroupSettingsDialog();

  @override
  State<_EditGroupSettingsDialog> createState() => _EditGroupSettingsDialogState();
}

class _EditGroupSettingsDialogState extends State<_EditGroupSettingsDialog> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _goalController;
  late TextEditingController _upiController;
  late TextEditingController _locationController;
  late TextEditingController _membersController;

  @override
  void initState() {
    super.initState();
    final group = context.read<AppStateProvider>().activeGroup;
    _nameController = TextEditingController(text: group?.name ?? '');
    _goalController = TextEditingController(text: group?.targetGoal.toInt().toString() ?? '75000');
    _upiController = TextEditingController(text: group?.upiId ?? '');
    _locationController = TextEditingController(text: group?.location ?? '');
    _membersController = TextEditingController(text: group?.members.join(', ') ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _goalController.dispose();
    _upiController.dispose();
    _locationController.dispose();
    _membersController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppStateProvider>();
    final group = state.activeGroup;

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
              const Text('Edit Utsav Group Settings', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 14),

              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: 'Festival / Pandal Name'),
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _goalController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Target Goal (₹)', prefixText: '₹ '),
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _upiController,
                decoration: const InputDecoration(labelText: 'Committee UPI ID', hintText: 'mandal@upi'),
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _locationController,
                decoration: const InputDecoration(labelText: 'Pandal Location'),
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _membersController,
                decoration: const InputDecoration(labelText: 'Volunteers (Comma separated)'),
              ),
              const SizedBox(height: 16),

              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: () {
                    if (group == null) return;
                    final goal = double.tryParse(_goalController.text.trim()) ?? group.targetGoal;
                    final members = _membersController.text
                        .split(',')
                        .map((m) => m.trim())
                        .where((m) => m.isNotEmpty)
                        .toList();

                    final updated = group.copyWith(
                      name: _nameController.text.trim(),
                      targetGoal: goal,
                      upiId: _upiController.text.trim(),
                      location: _locationController.text.trim(),
                      members: members.isNotEmpty ? members : group.members,
                    );

                    state.updateGroup(updated);
                    Navigator.pop(context);
                  },
                  icon: const Icon(Icons.save),
                  label: const Text('Save Settings', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

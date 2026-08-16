import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../providers/app_state_provider.dart';
import '../core/theme/app_theme.dart';
import '../core/utils/date_formatter.dart';
import '../models/collection_model.dart';
import '../widgets/festive_card.dart';
import '../widgets/target_progress_bar.dart';
import '../services/whatsapp_service.dart';
import '../services/pdf_service.dart';
import 'add_chanda_dialog.dart';
import 'receipt_modal_screen.dart';
import 'upi_qr_screen.dart';
import 'daily_ledger_screen.dart';
import 'pledges_screen.dart';
import 'prasadam_schedule_screen.dart';
import 'transparency_screen.dart';
import 'receipt_lookup_screen.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppStateProvider>();
    final group = state.activeGroup;
    final financials = state.financials;

    if (group == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return RefreshIndicator(
      onRefresh: () async {
        await state.initialize();
      },
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
        children: [
          // 1. Festive Hero Financial Card
          FestiveCard(
            gradient: AppTheme.festiveHeroGradient,
            padding: const EdgeInsets.all(20),
            borderRadius: 20,
            border: Border.all(color: Colors.white.withOpacity(0.2), width: 1.5),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.volunteer_activism, color: AppTheme.marigold, size: 16),
                        SizedBox(width: 6),
                        Text(
                          'TOTAL CHANDA COLLECTED',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.8,
                            color: Colors.white70,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.black26,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '${financials.donorCount} Donors',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  DateFormatter.formatCurrency(financials.totalCollected),
                  style: const TextStyle(
                    fontSize: 34,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 12),
                TargetProgressBar(
                  collected: financials.totalCollected,
                  target: group.targetGoal,
                  isDark: true,
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildMetric(
                        label: 'Total Expenses',
                        value: DateFormatter.formatCurrency(financials.totalExpenses),
                        color: const Color(0xFFFF8A80),
                        icon: Icons.trending_down,
                      ),
                      Container(width: 1, height: 28, color: Colors.white24),
                      _buildMetric(
                        label: 'In-Hand Balance',
                        value: DateFormatter.formatCurrency(financials.netBalance),
                        color: const Color(0xFFA7F3D0),
                        icon: Icons.account_balance_wallet,
                      ),
                      if (financials.pledgeOutstanding > 0) ...[
                        Container(width: 1, height: 28, color: Colors.white24),
                        _buildMetric(
                          label: 'Pending Pledges',
                          value: DateFormatter.formatCurrency(financials.pledgeOutstanding),
                          color: const Color(0xFFFFE082),
                          icon: Icons.timelapse,
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 2. 2x2 Quick Action Grid
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 2.2,
            children: [
              _buildQuickActionTile(
                title: 'Add Chanda',
                subtitle: 'Record Donation',
                icon: Icons.add_circle,
                color: AppTheme.primarySaffron,
                onTap: () {
                  showModalBottomSheet(
                    context: context,
                    isScrollControlled: true,
                    backgroundColor: Colors.transparent,
                    builder: (_) => const AddChandaDialog(),
                  );
                },
              ),
              _buildQuickActionTile(
                title: 'UPI QR Code',
                subtitle: 'Scan & Collect',
                icon: Icons.qr_code_scanner,
                color: AppTheme.devotionalEmerald,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => UpiQrScreen(group: group)),
                  );
                },
              ),
              _buildQuickActionTile(
                title: 'Daily Ledger',
                subtitle: 'Cash Flow Log',
                icon: Icons.auto_graph,
                color: const Color(0xFF2563EB),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const DailyLedgerScreen()),
                  );
                },
              ),
              _buildQuickActionTile(
                title: 'PDF Report',
                subtitle: 'Print Statement',
                icon: Icons.picture_as_pdf,
                color: const Color(0xFF7C3AED),
                onTap: () {
                  PdfService.printStatement(group);
                },
              ),
            ],
          ),
          const SizedBox(height: 16),

          // 3. Quick Feature Pills (Pledges, Annadanam, Transparency, Lookup)
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            child: Row(
              children: [
                _buildFeatureChip(
                  label: 'Pledges & Promises (${group.pledges.length})',
                  icon: Icons.handshake,
                  color: AppTheme.primarySaffronDark,
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PledgesScreen())),
                ),
                const SizedBox(width: 8),
                _buildFeatureChip(
                  label: 'Annadanam & Prasadam',
                  icon: Icons.restaurant,
                  color: AppTheme.devotionalEmerald,
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PrasadamScheduleScreen())),
                ),
                const SizedBox(width: 8),
                _buildFeatureChip(
                  label: 'Receipt Lookup',
                  icon: Icons.search,
                  color: const Color(0xFF2563EB),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ReceiptLookupScreen())),
                ),
                const SizedBox(width: 8),
                _buildFeatureChip(
                  label: 'Public Transparency',
                  icon: Icons.public,
                  color: const Color(0xFFB45309),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TransparencyScreen())),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // 4. Recent Collections Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Recent Chanda Donations',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textMain,
                ),
              ),
              if (group.collections.length > 3)
                Text(
                  '${group.collections.length} Total',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textMuted,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 10),

          // 5. Recent Collections List
          if (group.collections.isEmpty)
            FestiveCard(
              padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
              child: Column(
                children: [
                  const Text('🕉️', style: TextStyle(fontSize: 40)),
                  const SizedBox(height: 8),
                  const Text(
                    'No donations recorded yet',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Tap "+ Add Chanda" to record the first auspicious donation.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 13, color: AppTheme.textMuted),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () {
                      showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        backgroundColor: Colors.transparent,
                        builder: (_) => const AddChandaDialog(),
                      );
                    },
                    icon: const Icon(Icons.add, size: 18),
                    label: const Text('Record First Chanda'),
                  ),
                ],
              ),
            )
          else
            ...group.collections.take(5).map((col) => _buildDonationTile(context, group, col)),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildMetric({
    required String label,
    required String value,
    required Color color,
    required IconData icon,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 12, color: color),
            const SizedBox(width: 4),
            Text(
              label,
              style: const TextStyle(fontSize: 10, color: Colors.white70),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _buildQuickActionTile({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return FestiveCard(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      borderRadius: 14,
      onTap: onTap,
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  subtitle,
                  style: const TextStyle(fontSize: 10, color: AppTheme.textMuted),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureChip({
    required String label,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return ActionChip(
      onPressed: onTap,
      avatar: Icon(icon, size: 16, color: color),
      label: Text(
        label,
        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: color),
      ),
      backgroundColor: color.withOpacity(0.08),
      side: BorderSide(color: color.withOpacity(0.2)),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
    );
  }

  Widget _buildDonationTile(BuildContext context, dynamic group, CollectionModel col) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: FestiveCard(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => ReceiptModalScreen(collection: col, group: group),
            ),
          );
        },
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppTheme.primarySaffron.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Text('🧾', style: TextStyle(fontSize: 18)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          col.donorName,
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                        decoration: BoxDecoration(
                          color: AppTheme.borderSubtle,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          col.receiptNo,
                          style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppTheme.textMuted),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${col.paymentMode} • By ${col.collectedBy} • ${DateFormatter.formatDisplay(col.date)}',
                    style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  DateFormatter.formatCurrency(col.amount),
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.devotionalEmerald,
                  ),
                ),
                const SizedBox(height: 2),
                InkWell(
                  onTap: () {
                    final msg = WhatsAppService.buildReceiptMessage(group, col);
                    WhatsAppService.launchWhatsApp(col.phone, msg);
                  },
                  borderRadius: BorderRadius.circular(4),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF25D366).withOpacity(0.12),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.share, size: 10, color: Color(0xFF128C7E)),
                        SizedBox(width: 3),
                        Text(
                          'WhatsApp',
                          style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF128C7E)),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

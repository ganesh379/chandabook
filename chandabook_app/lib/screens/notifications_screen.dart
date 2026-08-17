import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import '../providers/app_state_provider.dart';
import '../models/activity_event_model.dart';
import '../core/theme/app_theme.dart';
import '../core/utils/date_formatter.dart';
import '../core/utils/financial_calculator.dart';
import '../widgets/festive_card.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  ActivityEventType? _filterType;

  List<ActivityEventModel> _generateEvents(AppStateProvider provider) {
    final group = provider.activeGroup;
    if (group == null) return [];

    final List<ActivityEventModel> events = [];

    // Collections
    for (final col in group.collections) {
      events.add(
        ActivityEventModel(
          id: 'col_${col.id}',
          type: ActivityEventType.collection,
          title: '💰 New Chanda: ${DateFormatter.formatCurrency(col.amount)}',
          description: '${col.donorName} donated ${col.paymentMode} (Receipt: ${col.receiptNo})',
          amount: col.amount,
          timestamp: col.date,
          actor: col.collectedBy,
        ),
      );
    }

    // Expenses
    for (final exp in group.expenses) {
      events.add(
        ActivityEventModel(
          id: 'exp_${exp.id}',
          type: ActivityEventType.expense,
          title: '🧾 Expense: ${exp.title}',
          description: 'Paid ${DateFormatter.formatCurrency(exp.amount)} for ${exp.category}',
          amount: exp.amount,
          timestamp: exp.date,
          actor: exp.paidBy,
        ),
      );
    }

    // Members
    for (final member in group.members) {
      events.add(
        ActivityEventModel(
          id: 'mem_$member',
          type: ActivityEventType.member,
          title: '🙌 Volunteer Joined Committee',
          description: '$member is active and recording festival collections',
          timestamp: group.createdAt != null && group.createdAt!.isNotEmpty ? group.createdAt! : '2026-08-16',
          actor: member,
        ),
      );
    }

    // Pledges
    for (final pledge in group.pledges) {
      events.add(
        ActivityEventModel(
          id: 'plg_${pledge.id}',
          type: ActivityEventType.pledge,
          title: '🙏 Pledge: ${DateFormatter.formatCurrency(pledge.pledgeAmount)}',
          description: '${pledge.donorName} committed (Paid: ${DateFormatter.formatCurrency(pledge.collectedAmount)})',
          amount: pledge.pledgeAmount,
          timestamp: pledge.date,
        ),
      );
    }

    // Sort newest first
    events.sort((a, b) => b.timestamp.compareTo(a.timestamp));
    return events;
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppStateProvider>();
    final group = provider.activeGroup;
    final allEvents = _generateEvents(provider);

    final filteredEvents = _filterType == null
        ? allEvents
        : allEvents.where((e) => e.type == _filterType).toList();

    final financials = FinancialCalculator.compute(group);
    final totalCol = financials.totalCollected;
    final totalExp = financials.totalExpenses;
    final inHand = financials.netBalance;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Live Activity & Alerts'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            tooltip: 'Broadcast Summary to WhatsApp',
            onPressed: () {
              if (group != null) {
                final summary = '📢 *${group.name} — Festival Committee Update*\n\n'
                    '💰 *Total Collected:* ${DateFormatter.formatCurrency(totalCol)}\n'
                    '🧾 *Total Expenses:* ${DateFormatter.formatCurrency(totalExp)}\n'
                    '💵 *In-Hand Balance:* ${DateFormatter.formatCurrency(inHand)}\n'
                    '👥 *Active Volunteers:* ${group.members.length}\n\n'
                    '✨ _Managed securely via ChandaBook_';
                Share.share(summary);
              }
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                FilterChip(
                  label: Text('All (${allEvents.length})'),
                  selected: _filterType == null,
                  onSelected: (_) => setState(() => _filterType = null),
                ),
                const SizedBox(width: 8),
                FilterChip(
                  avatar: const Icon(Icons.volunteer_activism, size: 16, color: AppTheme.devotionalEmerald),
                  label: const Text('Chanda'),
                  selected: _filterType == ActivityEventType.collection,
                  onSelected: (_) => setState(() => _filterType = ActivityEventType.collection),
                ),
                const SizedBox(width: 8),
                FilterChip(
                  avatar: const Icon(Icons.receipt_long, size: 16, color: AppTheme.festiveCrimson),
                  label: const Text('Expenses'),
                  selected: _filterType == ActivityEventType.expense,
                  onSelected: (_) => setState(() => _filterType = ActivityEventType.expense),
                ),
                const SizedBox(width: 8),
                FilterChip(
                  avatar: const Icon(Icons.person_add_alt_1, size: 16, color: AppTheme.primarySaffron),
                  label: const Text('Team'),
                  selected: _filterType == ActivityEventType.member,
                  onSelected: (_) => setState(() => _filterType = ActivityEventType.member),
                ),
                const SizedBox(width: 8),
                FilterChip(
                  avatar: const Icon(Icons.handshake, size: 16, color: Colors.indigo),
                  label: const Text('Pledges'),
                  selected: _filterType == ActivityEventType.pledge,
                  onSelected: (_) => setState(() => _filterType = ActivityEventType.pledge),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Events List
          Expanded(
            child: filteredEvents.isEmpty
                ? const Center(
                    child: Padding(
                      padding: EdgeInsets.all(32),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.notifications_none, size: 48, color: AppTheme.textMuted),
                          SizedBox(height: 12),
                          Text(
                            'No notifications recorded yet',
                            style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textMuted),
                          ),
                          SizedBox(height: 4),
                          Text(
                            'Every Chanda donation, expense, or team activity will appear here in real time.',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
                          ),
                        ],
                      ),
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    itemCount: filteredEvents.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final item = filteredEvents[index];
                      return FestiveCard(
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: item.color.withOpacity(0.12),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(item.icon, color: item.color, size: 20),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          item.title,
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      Text(
                                        DateFormatter.formatDisplay(item.timestamp),
                                        style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    item.description,
                                    style: const TextStyle(fontSize: 12, color: AppTheme.textMain),
                                  ),
                                  if (item.actor != null && item.actor!.isNotEmpty) ...[
                                    const SizedBox(height: 4),
                                    Text(
                                      'Recorded by: ${item.actor}',
                                      style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: AppTheme.textMuted),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

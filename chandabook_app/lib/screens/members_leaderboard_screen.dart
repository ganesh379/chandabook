import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import '../providers/app_state_provider.dart';
import '../core/theme/app_theme.dart';
import '../core/utils/date_formatter.dart';
import '../widgets/festive_card.dart';
import '../services/whatsapp_service.dart';

class MembersLeaderboardScreen extends StatelessWidget {
  const MembersLeaderboardScreen({super.key});

  static const List<Map<String, String>> designations = [
    {'id': 'Admin', 'label': '🛡️ Admin'},
    {'id': 'President', 'label': '👑 President'},
    {'id': 'Treasurer', 'label': '💼 Treasurer'},
    {'id': 'Secretary', 'label': '📜 General Secretary'},
    {'id': 'Vice President', 'label': '🌟 Vice President'},
    {'id': 'Youth Leader', 'label': '🚩 Youth Leader'},
    {'id': 'Pooja In-Charge', 'label': '🪔 Pooja In-Charge'},
    {'id': 'Pandal In-Charge', 'label': '🎪 Pandal & Decor In-Charge'},
    {'id': 'Prasadam In-Charge', 'label': '🍲 Prasadam In-Charge'},
    {'id': 'Volunteer', 'label': '📢 Volunteer'},
  ];

  void _openEditRoleModal(BuildContext context, String memberName, String currentDesignation, bool isCurrentAdmin) {
    String selectedDesignation = currentDesignation;
    bool makeAdmin = isCurrentAdmin || currentDesignation.toLowerCase() == 'admin';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (modalCtx, setModalState) {
          return Container(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(modalCtx).viewInsets.bottom + 20,
              left: 20,
              right: 20,
              top: 16,
            ),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
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
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      const Icon(Icons.badge_outlined, color: AppTheme.primarySaffron),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Assign Role: $memberName',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Select Official Committee Designation / Tag:',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textMuted),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: designations.map((d) {
                      final isSelected = selectedDesignation.toLowerCase() == d['id']!.toLowerCase();
                      return ChoiceChip(
                        label: Text(d['label']!),
                        selected: isSelected,
                        selectedColor: AppTheme.primarySaffron.withValues(alpha: 0.2),
                        labelStyle: TextStyle(
                          fontSize: 12,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          color: isSelected ? AppTheme.primarySaffronDark : AppTheme.textMain,
                        ),
                        side: BorderSide(
                          color: isSelected ? AppTheme.primarySaffron : AppTheme.borderSubtle,
                        ),
                        onSelected: (selected) {
                          if (selected) {
                            setModalState(() {
                              selectedDesignation = d['id']!;
                              if (d['id'] == 'Admin') {
                                makeAdmin = true;
                              }
                            });
                          }
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Grant Admin Privileges', style: TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: const Text(
                      'Allows editing group settings, deleting records, and managing roles',
                      style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                    ),
                    value: makeAdmin || selectedDesignation.toLowerCase() == 'admin',
                    onChanged: (val) {
                      setModalState(() {
                        makeAdmin = val;
                      });
                    },
                    activeColor: AppTheme.primarySaffron,
                  ),
                  const SizedBox(height: 18),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        context.read<AppStateProvider>().updateMemberRole(
                          memberName: memberName,
                          designation: selectedDesignation,
                          isAdmin: makeAdmin,
                        );
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Updated $memberName as $selectedDesignation${makeAdmin ? " (Admin)" : ""}'),
                            backgroundColor: AppTheme.devotionalEmerald,
                          ),
                        );
                      },
                      icon: const Icon(Icons.check),
                      label: const Text('Save Designation & Role', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
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

    final financials = state.financials;
    final stats = financials.memberStats;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Volunteers & Team'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add_alt_1_outlined),
            tooltip: 'Invite Volunteer on WhatsApp',
            onPressed: () {
              final msg = WhatsAppService.buildVolunteerInviteMessage(group);
              WhatsAppService.launchWhatsApp('', msg);
            },
          ),
          IconButton(
            icon: const Icon(Icons.share_outlined),
            tooltip: 'Share Leaderboard',
            onPressed: () {
              final buffer = StringBuffer();
              buffer.writeln('🏆 *${group.name.toUpperCase()}* 🏆');
              buffer.writeln('🚩 *VOLUNTEER COLLECTOR RANKINGS*');
              buffer.writeln('-----------------------------------');
              for (int i = 0; i < stats.length; i++) {
                final medal = i == 0 ? '🥇' : (i == 1 ? '🥈' : (i == 2 ? '🥉' : '#${i + 1}'));
                buffer.writeln('$medal *${stats[i].name}*: ${DateFormatter.formatCurrency(stats[i].total)} (${stats[i].count} donors)');
              }
              buffer.writeln('-----------------------------------');
              buffer.writeln('💰 *Total Collected:* ${DateFormatter.formatCurrency(financials.totalCollected)}');
              buffer.writeln('📲 *Managed via ChandaBook*');
              Share.share(buffer.toString());
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        physics: const BouncingScrollPhysics(),
        children: [
          // Header Podium / Top 3 Card
          if (stats.isNotEmpty && stats.first.total > 0) ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFEF3C7), Color(0xFFFDE68A)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppTheme.marigold.withValues(alpha: 0.5)),
              ),
              child: Column(
                children: [
                  const Text('🏆', style: TextStyle(fontSize: 32)),
                  const SizedBox(height: 4),
                  const Text(
                    'TOP COLLECTOR',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1,
                      color: Color(0xFF92400E),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    stats.first.name,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF78350F),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    DateFormatter.formatCurrency(stats.first.total),
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFB45309),
                    ),
                  ),
                  Text(
                    '${stats.first.count} Donors Registered',
                    style: const TextStyle(fontSize: 12, color: Color(0xFF92400E)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Rankings List Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Committee Volunteers & Roles',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textMain),
              ),
              Text(
                '${group.members.length} Members',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textMuted),
              ),
            ],
          ),
          const SizedBox(height: 8),

          ...group.members.map((memberName) {
            final stat = stats.where((s) => s.name.toLowerCase() == memberName.toLowerCase()).firstOrNull;
            final totalCollected = stat?.total ?? 0.0;
            final countLogged = stat?.count ?? 0;

            // Find member account info for designation and role
            final account = group.memberAccounts.where((m) => m.name.toLowerCase() == memberName.toLowerCase()).firstOrNull;
            final designation = account?.designation.isNotEmpty == true 
                ? account!.designation 
                : (memberName.toLowerCase().contains('president') ? 'President' : (memberName.toLowerCase().contains('treasurer') ? 'Treasurer' : 'Volunteer'));
            final isMemberAdmin = account?.role == 'admin' || designation.toLowerCase() == 'admin';

            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: FestiveCard(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: isMemberAdmin ? AppTheme.primarySaffron.withValues(alpha: 0.15) : AppTheme.bgSurface,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: isMemberAdmin ? AppTheme.primarySaffron : AppTheme.borderSubtle,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          isMemberAdmin ? '🛡️' : '📢',
                          style: const TextStyle(fontSize: 18),
                        ),
                      ),
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
                                  memberName,
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: isMemberAdmin 
                                      ? const Color(0xFFEEF2FF) 
                                      : AppTheme.primarySaffron.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(
                                    color: isMemberAdmin ? const Color(0xFFC7D2FE) : AppTheme.primarySaffron.withValues(alpha: 0.3),
                                  ),
                                ),
                                child: Text(
                                  designation,
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: isMemberAdmin ? const Color(0xFF4338CA) : AppTheme.primarySaffronDark,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            countLogged > 0
                                ? '$countLogged Donors • ${DateFormatter.formatCurrency(totalCollected)}'
                                : 'No donations logged yet',
                            style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                          ),
                        ],
                      ),
                    ),
                    if (isAdmin) ...[
                      IconButton(
                        icon: const Icon(Icons.edit_outlined, size: 18, color: AppTheme.primarySaffron),
                        tooltip: 'Assign Role / Designation',
                        onPressed: () => _openEditRoleModal(context, memberName, designation, isMemberAdmin),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete_outline, size: 18, color: Color(0xFFE57373)),
                        tooltip: 'Remove Volunteer',
                        onPressed: () async {
                          final confirm = await showDialog<bool>(
                            context: context,
                            builder: (ctx) => AlertDialog(
                              title: const Text('Remove Volunteer?'),
                              content: Text('Remove "$memberName" from the committee team?'),
                              actions: [
                                TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                                TextButton(
                                  onPressed: () => Navigator.pop(ctx, true),
                                  style: TextButton.styleFrom(foregroundColor: Colors.red),
                                  child: const Text('Remove'),
                                ),
                              ],
                            ),
                          );
                          if (confirm == true) {
                            state.removeMember(memberName);
                          }
                        },
                      ),
                    ],
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}

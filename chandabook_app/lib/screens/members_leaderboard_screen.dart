import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import '../providers/app_state_provider.dart';
import '../core/theme/app_theme.dart';
import '../core/utils/date_formatter.dart';
import '../widgets/festive_card.dart';

class MembersLeaderboardScreen extends StatelessWidget {
  const MembersLeaderboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppStateProvider>();
    final group = state.activeGroup;
    final financials = state.financials;
    final stats = financials.memberStats;

    if (group == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Volunteer Leaderboard'),
        actions: [
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
          if (stats.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFEF3C7), Color(0xFFFDE68A)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppTheme.marigold.withOpacity(0.5)),
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

          // Rankings List
          const Text(
            'All Committee Volunteers',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textMain),
          ),
          const SizedBox(height: 8),

          ...stats.asMap().entries.map((entry) {
            final idx = entry.key;
            final item = entry.value;
            final isTop3 = idx < 3;
            final medalEmoji = idx == 0 ? '🥇' : (idx == 1 ? '🥈' : (idx == 2 ? '🥉' : ''));

            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: FestiveCard(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                child: Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: isTop3 ? AppTheme.marigold.withOpacity(0.2) : AppTheme.bgSurface,
                        shape: BoxShape.circle,
                        border: Border.all(color: isTop3 ? AppTheme.marigold : AppTheme.borderSubtle),
                      ),
                      child: Center(
                        child: Text(
                          isTop3 ? medalEmoji : '#${idx + 1}',
                          style: TextStyle(
                            fontSize: isTop3 ? 16 : 12,
                            fontWeight: FontWeight.bold,
                            color: isTop3 ? AppTheme.primarySaffronDark : AppTheme.textMuted,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.name,
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                          Text(
                            '${item.count} Donors logged',
                            style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          DateFormatter.formatCurrency(item.total),
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.devotionalEmerald,
                          ),
                        ),
                        if (financials.totalCollected > 0)
                          Text(
                            '${((item.total / financials.totalCollected) * 100).round()}% of total',
                            style: const TextStyle(fontSize: 10, color: AppTheme.textMuted),
                          ),
                      ],
                    ),
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

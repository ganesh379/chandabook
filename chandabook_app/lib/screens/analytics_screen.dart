import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../providers/app_state_provider.dart';
import '../core/theme/app_theme.dart';
import '../core/utils/date_formatter.dart';
import '../widgets/festive_card.dart';

class AnalyticsScreen extends StatelessWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppStateProvider>();
    final group = state.activeGroup;
    final financials = state.financials;

    if (group == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final categories = financials.categoryBreakdowns;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Financial Analytics'),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        physics: const BouncingScrollPhysics(),
        children: [
          // Overview Numbers
          FestiveCard(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatColumn('Total Inflow', DateFormatter.formatCurrency(financials.totalCollected), AppTheme.devotionalEmerald),
                Container(width: 1, height: 32, color: AppTheme.borderSubtle),
                _buildStatColumn('Total Outflow', DateFormatter.formatCurrency(financials.totalExpenses), const Color(0xFFDC2626)),
                Container(width: 1, height: 32, color: AppTheme.borderSubtle),
                _buildStatColumn('Net Surplus', DateFormatter.formatCurrency(financials.netBalance), AppTheme.primarySaffronDark),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Expense Categories Donut Chart
          FestiveCard(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Expense Breakdown by Category',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                if (categories.isEmpty)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: Text('No expenses recorded to chart.', style: TextStyle(color: AppTheme.textMuted)),
                    ),
                  )
                else ...[
                  SizedBox(
                    height: 180,
                    child: PieChart(
                      PieChartData(
                        sectionsSpace: 2,
                        centerSpaceRadius: 40,
                        sections: categories.map((cat) {
                          return PieChartSectionData(
                            color: cat.color,
                            value: cat.amount,
                            title: '${cat.percent}%',
                            radius: 45,
                            titleStyle: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 12,
                    runSpacing: 8,
                    children: categories.map((cat) {
                      return Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(color: cat.color, shape: BoxShape.circle),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '${cat.label}: ${DateFormatter.formatCurrency(cat.amount)} (${cat.percent}%)',
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
                          ),
                        ],
                      );
                    }).toList(),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Leaderboard Share Distribution
          FestiveCard(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Volunteer Collection Contribution',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 14),
                ...financials.memberStats.map((stat) {
                  final percent = financials.totalCollected > 0
                      ? (stat.total / financials.totalCollected).clamp(0.0, 1.0)
                      : 0.0;

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(stat.name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                            Text(
                              '${DateFormatter.formatCurrency(stat.total)} (${(percent * 100).round()}%)',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.devotionalEmerald),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: percent,
                            minHeight: 8,
                            backgroundColor: AppTheme.borderSubtle,
                            valueColor: const AlwaysStoppedAnimation(AppTheme.primarySaffron),
                          ),
                        ),
                      ],
                    ),
                  );
                }),
              ],
            ),
          ),
          const SizedBox(height: 30),
        ],
      ),
    );
  }

  Widget _buildStatColumn(String label, String value, Color color) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
        const SizedBox(height: 2),
        Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: color)),
      ],
    );
  }
}

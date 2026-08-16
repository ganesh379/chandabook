import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state_provider.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/app_constants.dart';
import '../core/utils/date_formatter.dart';
import '../widgets/festive_card.dart';

class TransparencyScreen extends StatefulWidget {
  const TransparencyScreen({super.key});

  @override
  State<TransparencyScreen> createState() => _TransparencyScreenState();
}

class _TransparencyScreenState extends State<TransparencyScreen> {
  String _search = '';

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppStateProvider>();
    final group = state.activeGroup;
    final financials = state.financials;
    final activeFestival = AppConstants.getFestivalType(group?.festivalType);

    if (group == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final filteredCollections = group.collections.where((c) {
      if (_search.isEmpty) return true;
      return c.donorName.toLowerCase().contains(_search.toLowerCase()) ||
          c.receiptNo.toLowerCase().contains(_search.toLowerCase());
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Public Transparency Portal'),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        physics: const BouncingScrollPhysics(),
        children: [
          // Public Banner
          FestiveCard(
            gradient: AppTheme.festiveHeroGradient,
            padding: const EdgeInsets.all(20),
            borderRadius: 20,
            child: Column(
              children: [
                Text(activeFestival.icon, style: const TextStyle(fontSize: 36)),
                const SizedBox(height: 6),
                Text(
                  group.name.toUpperCase(),
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 2),
                const Text(
                  '100% Transparent Community Utsav Accounts',
                  style: TextStyle(fontSize: 11, color: Colors.white70),
                ),
                const SizedBox(height: 14),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.black26,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildPublicMetric('Collections', DateFormatter.formatCurrency(financials.totalCollected), const Color(0xFFA7F3D0)),
                      _buildPublicMetric('Expenses', DateFormatter.formatCurrency(financials.totalExpenses), const Color(0xFFFF8A80)),
                      _buildPublicMetric('Current Balance', DateFormatter.formatCurrency(financials.netBalance), Colors.white),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Search Box
          TextField(
            onChanged: (val) => setState(() => _search = val.trim()),
            decoration: const InputDecoration(
              hintText: 'Search donor name or receipt number...',
              prefixIcon: Icon(Icons.search),
              contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            ),
          ),
          const SizedBox(height: 14),

          // Verified Donors List
          Text(
            'Verified Devotee Contributions (${filteredCollections.length})',
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textMain),
          ),
          const SizedBox(height: 8),

          ...filteredCollections.map((col) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: FestiveCard(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
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
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const SizedBox(width: 6),
                              const Icon(Icons.verified, size: 14, color: AppTheme.devotionalEmerald),
                            ],
                          ),
                          Text(
                            'Receipt #${col.receiptNo} • ${col.paymentMode} • ${DateFormatter.formatDisplay(col.date)}',
                            style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      DateFormatter.formatCurrency(col.amount),
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.devotionalEmerald,
                      ),
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

  Widget _buildPublicMetric(String label, String value, Color color) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.white70)),
        const SizedBox(height: 2),
        Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: color)),
      ],
    );
  }
}

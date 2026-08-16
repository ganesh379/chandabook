import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state_provider.dart';
import '../models/collection_model.dart';
import '../core/theme/app_theme.dart';
import '../core/utils/date_formatter.dart';
import '../widgets/festive_card.dart';
import 'receipt_modal_screen.dart';

class ReceiptLookupScreen extends StatefulWidget {
  const ReceiptLookupScreen({super.key});

  @override
  State<ReceiptLookupScreen> createState() => _ReceiptLookupScreenState();
}

class _ReceiptLookupScreenState extends State<ReceiptLookupScreen> {
  final _queryController = TextEditingController();
  CollectionModel? _foundCollection;
  bool _searched = false;

  @override
  void dispose() {
    _queryController.dispose();
    super.dispose();
  }

  void _search() {
    final query = _queryController.text.trim().toLowerCase();
    if (query.isEmpty) return;

    final group = context.read<AppStateProvider>().activeGroup;
    if (group == null) return;

    final match = group.collections.cast<CollectionModel?>().firstWhere(
      (c) =>
          c!.receiptNo.toLowerCase() == query ||
          c.phone.replaceAll(' ', '').contains(query) ||
          c.donorName.toLowerCase().contains(query),
      orElse: () => null,
    );

    setState(() {
      _foundCollection = match;
      _searched = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    final group = context.watch<AppStateProvider>().activeGroup;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Verify / Lookup Receipt'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            FestiveCard(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Search Receipt by Receipt # or Phone',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _queryController,
                          decoration: const InputDecoration(
                            hintText: 'e.g. CB-101 or 9876543210',
                            prefixIcon: Icon(Icons.search),
                            contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          ),
                          onSubmitted: (_) => _search(),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: _search,
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        ),
                        child: const Text('Search'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            if (_searched && _foundCollection != null && group != null) ...[
              const Text(
                'Found Matching Official Receipt:',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.devotionalEmerald),
              ),
              const SizedBox(height: 8),
              FestiveCard(
                padding: const EdgeInsets.all(16),
                border: Border.all(color: AppTheme.devotionalEmerald.withOpacity(0.4)),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => ReceiptModalScreen(
                        collection: _foundCollection!,
                        group: group,
                      ),
                    ),
                  );
                },
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          _foundCollection!.donorName,
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppTheme.primarySaffron.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            _foundCollection!.receiptNo,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.primarySaffronDark,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Amount: ${DateFormatter.formatCurrency(_foundCollection!.amount)} • ${_foundCollection!.paymentMode}',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.devotionalEmerald,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Collected By: ${_foundCollection!.collectedBy} on ${DateFormatter.formatDisplay(_foundCollection!.date)}',
                      style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => ReceiptModalScreen(
                                collection: _foundCollection!,
                                group: group,
                              ),
                            ),
                          );
                        },
                        icon: const Icon(Icons.receipt),
                        label: const Text('View Full Verified Receipt'),
                      ),
                    ),
                  ],
                ),
              ),
            ] else if (_searched && _foundCollection == null) ...[
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(32),
                  child: Column(
                    children: [
                      Icon(Icons.search_off, size: 48, color: AppTheme.textMuted),
                      SizedBox(height: 8),
                      Text(
                        'No matching receipt found',
                        style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textMuted),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

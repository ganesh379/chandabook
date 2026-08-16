import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state_provider.dart';
import '../models/collection_model.dart';
import '../core/theme/app_theme.dart';
import '../core/utils/date_formatter.dart';
import '../widgets/festive_card.dart';
import '../services/whatsapp_service.dart';
import 'receipt_modal_screen.dart';
import 'add_chanda_dialog.dart';

class ChandaListScreen extends StatefulWidget {
  const ChandaListScreen({super.key});

  @override
  State<ChandaListScreen> createState() => _ChandaListScreenState();
}

class _ChandaListScreenState extends State<ChandaListScreen> {
  String _searchQuery = '';
  String _selectedPaymentMode = 'All';
  String _selectedCollector = 'All';

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppStateProvider>();
    final group = state.activeGroup;

    if (group == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final collections = group.collections.where((c) {
      final matchesSearch = _searchQuery.isEmpty ||
          c.donorName.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          c.phone.contains(_searchQuery) ||
          c.receiptNo.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          c.address.toLowerCase().contains(_searchQuery.toLowerCase());

      final matchesPayment = _selectedPaymentMode == 'All' || c.paymentMode.contains(_selectedPaymentMode);
      final matchesCollector = _selectedCollector == 'All' || c.collectedBy == _selectedCollector;

      return matchesSearch && matchesPayment && matchesCollector;
    }).toList();

    final totalFiltered = collections.fold<double>(0.0, (sum, c) => sum + c.amount);

    return Scaffold(
      body: Column(
        children: [
          // Search & Filter Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: Colors.white,
            child: Column(
              children: [
                // Search Input
                TextField(
                  onChanged: (val) => setState(() => _searchQuery = val.trim()),
                  decoration: InputDecoration(
                    hintText: 'Search by donor name, receipt #, phone...',
                    prefixIcon: const Icon(Icons.search, size: 20),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, size: 18),
                            onPressed: () => setState(() => _searchQuery = ''),
                          )
                        : null,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                ),
                const SizedBox(height: 8),

                // Filter Chips Row
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  child: Row(
                    children: [
                      _buildFilterChip('All Modes', 'All', _selectedPaymentMode, (v) => setState(() => _selectedPaymentMode = v)),
                      const SizedBox(width: 6),
                      _buildFilterChip('Cash', 'Cash', _selectedPaymentMode, (v) => setState(() => _selectedPaymentMode = v)),
                      const SizedBox(width: 6),
                      _buildFilterChip('UPI', 'UPI', _selectedPaymentMode, (v) => setState(() => _selectedPaymentMode = v)),
                      const SizedBox(width: 6),
                      _buildFilterChip('Online', 'Online', _selectedPaymentMode, (v) => setState(() => _selectedPaymentMode = v)),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Sub-header stats bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: const BoxDecoration(
              color: AppTheme.bgSurface,
              border: Border(bottom: BorderSide(color: AppTheme.borderSubtle)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${collections.length} Donations Found',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textMuted),
                ),
                Text(
                  'Total: ${DateFormatter.formatCurrency(totalFiltered)}',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.devotionalEmerald,
                  ),
                ),
              ],
            ),
          ),

          // Donations List
          Expanded(
            child: collections.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.receipt_long, size: 48, color: AppTheme.textMuted),
                        const SizedBox(height: 8),
                        const Text(
                          'No donations match your search/filter',
                          style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textMuted),
                        ),
                        const SizedBox(height: 12),
                        ElevatedButton.icon(
                          onPressed: () {
                            showModalBottomSheet(
                              context: context,
                              isScrollControlled: true,
                              backgroundColor: Colors.transparent,
                              builder: (_) => const AddChandaDialog(),
                            );
                          },
                          icon: const Icon(Icons.add, size: 16),
                          label: const Text('Add Chanda'),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    physics: const BouncingScrollPhysics(),
                    itemCount: collections.length,
                    itemBuilder: (context, index) {
                      final col = collections[index];
                      return _buildDonationItem(context, group, col, state);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value, String current, ValueChanged<String> onSelected) {
    final isSelected = current == value;
    return ChoiceChip(
      label: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          color: isSelected ? Colors.white : AppTheme.textMain,
        ),
      ),
      selected: isSelected,
      selectedColor: AppTheme.primarySaffron,
      backgroundColor: Colors.white,
      side: BorderSide(color: isSelected ? AppTheme.primarySaffron : AppTheme.borderSubtle),
      onSelected: (_) => onSelected(value),
    );
  }

  Widget _buildDonationItem(BuildContext context, dynamic group, CollectionModel col, AppStateProvider state) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: FestiveCard(
        padding: const EdgeInsets.all(12),
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
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppTheme.primarySaffron.withOpacity(0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Center(
                child: Text(
                  col.donorName.isNotEmpty ? col.donorName[0].toUpperCase() : '🕉️',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primarySaffronDark,
                  ),
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
                    '${col.paymentMode} • ${col.collectedBy}',
                    style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (col.address.isNotEmpty)
                    Text(
                      col.address,
                      style: const TextStyle(fontSize: 10, color: AppTheme.textMuted),
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
                const SizedBox(height: 4),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.share, size: 16, color: Color(0xFF25D366)),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      tooltip: 'WhatsApp Receipt',
                      onPressed: () {
                        final msg = WhatsAppService.buildReceiptMessage(group, col);
                        WhatsAppService.launchWhatsApp(col.phone, msg);
                      },
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      icon: const Icon(Icons.delete_outline, size: 16, color: Color(0xFFE57373)),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      tooltip: 'Delete',
                      onPressed: () async {
                        final confirm = await showDialog<bool>(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            title: const Text('Delete Donation?'),
                            content: Text('Remove receipt ${col.receiptNo} for ${col.donorName}?'),
                            actions: [
                              TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                              TextButton(
                                onPressed: () => Navigator.pop(ctx, true),
                                style: TextButton.styleFrom(foregroundColor: Colors.red),
                                child: const Text('Delete'),
                              ),
                            ],
                          ),
                        );
                        if (confirm == true) {
                          state.deleteCollection(col.id);
                        }
                      },
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state_provider.dart';
import '../models/expense_model.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/app_constants.dart';
import '../core/utils/date_formatter.dart';
import '../widgets/festive_card.dart';
import '../widgets/category_icon_badge.dart';

class ExpensesScreen extends StatefulWidget {
  const ExpensesScreen({super.key});

  @override
  State<ExpensesScreen> createState() => _ExpensesScreenState();
}

class _ExpensesScreenState extends State<ExpensesScreen> {
  String _selectedCategory = 'all';

  void _openAddExpenseModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _AddExpenseDialog(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppStateProvider>();
    final group = state.activeGroup;
    final financials = state.financials;

    if (group == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final expenses = group.expenses.where((e) {
      if (_selectedCategory == 'all') return true;
      return e.category == _selectedCategory;
    }).toList();

    final totalFiltered = expenses.fold<double>(0.0, (sum, e) => sum + e.amount);

    return Scaffold(
      body: Column(
        children: [
          // Expense Summary Header
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'TOTAL EXPENSES LOGGED',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMuted),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          DateFormatter.formatCurrency(financials.totalExpenses),
                          style: const TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFDC2626),
                          ),
                        ),
                      ],
                    ),
                    ElevatedButton.icon(
                      onPressed: () => _openAddExpenseModal(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFDC2626),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      ),
                      icon: const Icon(Icons.add, size: 16),
                      label: const Text('Add Expense', style: TextStyle(fontSize: 13)),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Category Filter Pills
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  child: Row(
                    children: [
                      ChoiceChip(
                        label: const Text('All Categories', style: TextStyle(fontSize: 11)),
                        selected: _selectedCategory == 'all',
                        selectedColor: const Color(0xFFDC2626),
                        backgroundColor: Colors.white,
                        labelStyle: TextStyle(
                          color: _selectedCategory == 'all' ? Colors.white : AppTheme.textMain,
                          fontWeight: _selectedCategory == 'all' ? FontWeight.bold : FontWeight.normal,
                        ),
                        onSelected: (_) => setState(() => _selectedCategory = 'all'),
                      ),
                      ...AppConstants.expenseCategories.map((cat) {
                        final isSelected = _selectedCategory == cat.id;
                        return Padding(
                          padding: const EdgeInsets.only(left: 6),
                          child: ChoiceChip(
                            avatar: Text(cat.icon, style: const TextStyle(fontSize: 12)),
                            label: Text(cat.label, style: const TextStyle(fontSize: 11)),
                            selected: isSelected,
                            selectedColor: cat.color,
                            backgroundColor: Colors.white,
                            labelStyle: TextStyle(
                              color: isSelected ? Colors.white : AppTheme.textMain,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            ),
                            onSelected: (_) => setState(() => _selectedCategory = cat.id),
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Sub-header
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
                  '${expenses.length} Expenses in view',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textMuted),
                ),
                Text(
                  'Filtered: ${DateFormatter.formatCurrency(totalFiltered)}',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFDC2626)),
                ),
              ],
            ),
          ),

          // Expenses List
          Expanded(
            child: expenses.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.receipt_outlined, size: 48, color: AppTheme.textMuted),
                        const SizedBox(height: 8),
                        const Text(
                          'No expenses logged in this category',
                          style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textMuted),
                        ),
                        const SizedBox(height: 12),
                        OutlinedButton.icon(
                          onPressed: () => _openAddExpenseModal(context),
                          icon: const Icon(Icons.add, size: 16),
                          label: const Text('Add First Expense'),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    physics: const BouncingScrollPhysics(),
                    itemCount: expenses.length,
                    itemBuilder: (context, index) {
                      final exp = expenses[index];
                      return _buildExpenseTile(context, exp, state);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildExpenseTile(BuildContext context, ExpenseModel exp, AppStateProvider state) {
    final cat = AppConstants.getExpenseCategory(exp.category);

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: FestiveCard(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            CategoryIconBadge(categoryId: exp.category, size: 42),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    exp.title,
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${cat.label} • Paid by ${exp.paidBy} • ${DateFormatter.formatDisplay(exp.date)}',
                    style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (exp.notes.isNotEmpty)
                    Text(
                      exp.notes,
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
                  DateFormatter.formatCurrency(exp.amount),
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFDC2626),
                  ),
                ),
                const SizedBox(height: 4),
                IconButton(
                  icon: const Icon(Icons.delete_outline, size: 16, color: Color(0xFFE57373)),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  onPressed: () async {
                    final confirm = await showDialog<bool>(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        title: const Text('Delete Expense?'),
                        content: Text('Remove "${exp.title}" (${DateFormatter.formatCurrency(exp.amount)})?'),
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
                      state.deleteExpense(exp.id);
                    }
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _AddExpenseDialog extends StatefulWidget {
  const _AddExpenseDialog();

  @override
  State<_AddExpenseDialog> createState() => _AddExpenseDialogState();
}

class _AddExpenseDialogState extends State<_AddExpenseDialog> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _amountController = TextEditingController();
  final _notesController = TextEditingController();

  String _category = 'idol';
  late String _paidBy;

  @override
  void initState() {
    super.initState();
    final state = context.read<AppStateProvider>();
    _paidBy = state.activeVolunteer;
  }

  @override
  void dispose() {
    _titleController.dispose();
    _amountController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final amount = double.tryParse(_amountController.text.trim()) ?? 0.0;
    if (amount <= 0) return;

    final state = context.read<AppStateProvider>();
    final newExpense = ExpenseModel(
      id: 'exp-${DateTime.now().millisecondsSinceEpoch}',
      title: _titleController.text.trim(),
      amount: amount,
      category: _category,
      paidBy: _paidBy,
      date: DateTime.now().toIso8601String().split('T')[0],
      notes: _notesController.text.trim(),
    );

    await state.addExpense(newExpense);

    if (!mounted) return;
    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Logged expense: ${newExpense.title} (${DateFormatter.formatCurrency(amount)})'),
        backgroundColor: const Color(0xFFDC2626),
      ),
    );
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
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppTheme.borderSubtle,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Record Festival Expense',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Title
              TextFormField(
                controller: _titleController,
                textCapitalization: TextCapitalization.sentences,
                decoration: const InputDecoration(
                  labelText: 'Expense Description *',
                  hintText: 'e.g. Tent & Lighting advance',
                  prefixIcon: Icon(Icons.receipt_outlined),
                ),
                validator: (v) => v == null || v.trim().isEmpty ? 'Enter expense description' : null,
              ),
              const SizedBox(height: 12),

              // Amount
              TextFormField(
                controller: _amountController,
                keyboardType: TextInputType.number,
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFFDC2626)),
                decoration: const InputDecoration(
                  labelText: 'Amount Spent (₹) *',
                  prefixText: '₹ ',
                  hintText: 'e.g. 5000',
                ),
                validator: (v) {
                  if (v == null || v.trim().isEmpty) return 'Enter amount';
                  if (double.tryParse(v) == null || double.parse(v) <= 0) return 'Invalid amount';
                  return null;
                },
              ),
              const SizedBox(height: 12),

              // Category Picker Dropdown
              DropdownButtonFormField<String>(
                value: _category,
                decoration: const InputDecoration(labelText: 'Expense Category'),
                items: AppConstants.expenseCategories.map((cat) {
                  return DropdownMenuItem(
                    value: cat.id,
                    child: Row(
                      children: [
                        Text(cat.icon, style: const TextStyle(fontSize: 16)),
                        const SizedBox(width: 8),
                        Text(cat.label, style: const TextStyle(fontSize: 13)),
                      ],
                    ),
                  );
                }).toList(),
                onChanged: (v) => setState(() => _category = v ?? 'idol'),
              ),
              const SizedBox(height: 12),

              // Paid By
              DropdownButtonFormField<String>(
                value: _paidBy,
                decoration: const InputDecoration(labelText: 'Paid By'),
                items: (group?.members ?? ['Treasurer']).map((m) {
                  return DropdownMenuItem(value: m, child: Text(m, style: const TextStyle(fontSize: 13)));
                }).toList(),
                onChanged: (v) => setState(() => _paidBy = v ?? 'Treasurer'),
              ),
              const SizedBox(height: 12),

              // Notes
              TextFormField(
                controller: _notesController,
                decoration: const InputDecoration(
                  labelText: 'Invoice / Vendor Details (Optional)',
                  hintText: 'e.g. Bill #102, Shanti Tent House',
                  prefixIcon: Icon(Icons.note_alt_outlined),
                ),
              ),
              const SizedBox(height: 16),

              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFDC2626)),
                  onPressed: _submit,
                  icon: const Icon(Icons.check),
                  label: const Text('Save Expense Record', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

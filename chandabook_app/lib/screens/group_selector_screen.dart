import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import '../providers/app_state_provider.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/app_constants.dart';
import '../core/utils/date_formatter.dart';
import '../widgets/festive_card.dart';
import '../services/whatsapp_service.dart';

class GroupSelectorScreen extends StatefulWidget {
  const GroupSelectorScreen({super.key});

  @override
  State<GroupSelectorScreen> createState() => _GroupSelectorScreenState();
}

class _GroupSelectorScreenState extends State<GroupSelectorScreen> {
  final _joinCodeController = TextEditingController();
  bool _isJoining = false;

  @override
  void dispose() {
    _joinCodeController.dispose();
    super.dispose();
  }

  Future<void> _handleJoinCode() async {
    final code = _joinCodeController.text.trim();
    if (code.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid 6-digit group code')),
      );
      return;
    }

    setState(() => _isJoining = true);
    final state = context.read<AppStateProvider>();
    final success = await state.joinGroupByCode(code);
    setState(() => _isJoining = false);

    if (!mounted) return;

    if (success) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Joined ${state.activeGroup?.name}! 🎉'),
          backgroundColor: AppTheme.devotionalEmerald,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Group not found. Please verify the 6-digit code.'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _openCreateGroupDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _CreateGroupDialog(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppStateProvider>();
    final allGroups = state.allGroups.values.toList();
    final activeId = state.activeGroupId;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Switch / Manage Utsav'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        physics: const BouncingScrollPhysics(),
        children: [
          // Join by 6-digit Code Box
          FestiveCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.vpn_key_outlined, size: 18, color: AppTheme.primarySaffron),
                    SizedBox(width: 8),
                    Text(
                      'Join Existing Utsav via 6-Digit Code',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _joinCodeController,
                        keyboardType: TextInputType.number,
                        maxLength: 6,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 4,
                        ),
                        decoration: const InputDecoration(
                          hintText: '847291',
                          counterText: '',
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    ElevatedButton(
                      onPressed: _isJoining ? null : _handleJoinCode,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                      ),
                      child: _isJoining
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Text('Join'),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Create New Group Button
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton.icon(
              onPressed: () => _openCreateGroupDialog(context),
              icon: const Icon(Icons.add_circle_outline),
              label: const Text('Create New Festival / Utsav Group', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
          const SizedBox(height: 20),

          // Existing Groups List
          const Text(
            'Your Festival Groups',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textMain),
          ),
          const SizedBox(height: 8),

          ...allGroups.map((group) {
            final isSelected = group.id == activeId;
            final festival = AppConstants.getFestivalType(group.festivalType);

            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: FestiveCard(
                padding: const EdgeInsets.all(14),
                border: isSelected ? Border.all(color: AppTheme.primarySaffron, width: 2) : null,
                onTap: () {
                  state.switchGroup(group.id);
                  Navigator.pop(context);
                },
                child: Row(
                  children: [
                    Text(festival.icon, style: const TextStyle(fontSize: 28)),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Flexible(
                                child: Text(
                                  group.name,
                                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              if (isSelected) ...[
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                  decoration: BoxDecoration(
                                    color: AppTheme.primarySaffron,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Text(
                                    'ACTIVE',
                                    style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white),
                                  ),
                                ),
                              ],
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Code: ${group.code} • Goal: ${DateFormatter.formatCurrency(group.targetGoal)}',
                            style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.share, size: 18, color: Color(0xFF25D366)),
                      tooltip: 'Invite Volunteer on WhatsApp',
                      onPressed: () {
                        final msg = WhatsAppService.buildVolunteerInviteMessage(group);
                        WhatsAppService.launchWhatsApp('', msg);
                      },
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

class _CreateGroupDialog extends StatefulWidget {
  const _CreateGroupDialog();

  @override
  State<_CreateGroupDialog> createState() => _CreateGroupDialogState();
}

class _CreateGroupDialogState extends State<_CreateGroupDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _goalController = TextEditingController(text: '75000');
  final _upiController = TextEditingController();
  final _locationController = TextEditingController();
  final _membersController = TextEditingController(text: 'Rahul (Treasurer), Vikram (President), Suresh');

  String _festivalType = 'vinayaka_chavithi';

  @override
  void dispose() {
    _nameController.dispose();
    _goalController.dispose();
    _upiController.dispose();
    _locationController.dispose();
    _membersController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final goal = double.tryParse(_goalController.text.trim()) ?? 75000.0;
    final members = _membersController.text
        .split(',')
        .map((m) => m.trim())
        .where((m) => m.isNotEmpty)
        .toList();

    final state = context.read<AppStateProvider>();
    await state.createGroup(
      name: _nameController.text.trim(),
      festivalType: _festivalType,
      targetGoal: goal,
      upiId: _upiController.text.trim(),
      upiPayeeName: _nameController.text.trim(),
      location: _locationController.text.trim(),
      members: members.isNotEmpty ? members : ['Treasurer', 'President'],
    );

    if (!mounted) return;
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
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
              const Text('Create New Festival Group', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 14),

              // Festival Type Dropdown
              DropdownButtonFormField<String>(
                value: _festivalType,
                decoration: const InputDecoration(labelText: 'Festival Celebration Type'),
                items: AppConstants.festivalTypes.map((f) {
                  return DropdownMenuItem(
                    value: f.id,
                    child: Row(
                      children: [
                        Text(f.icon, style: const TextStyle(fontSize: 18)),
                        const SizedBox(width: 8),
                        Text(f.name, style: const TextStyle(fontSize: 13)),
                      ],
                    ),
                  );
                }).toList(),
                onChanged: (v) {
                  if (v != null) {
                    setState(() {
                      _festivalType = v;
                      final fest = AppConstants.getFestivalType(v);
                      _goalController.text = fest.defaultGoal.toInt().toString();
                    });
                  }
                },
              ),
              const SizedBox(height: 12),

              // Group Name
              TextFormField(
                controller: _nameController,
                textCapitalization: TextCapitalization.words,
                decoration: const InputDecoration(labelText: 'Festival / Pandal Name *', hintText: 'e.g. Balaji Colony Ganesh Utsav 2026'),
                validator: (v) => v == null || v.trim().isEmpty ? 'Enter festival name' : null,
              ),
              const SizedBox(height: 12),

              // Target Goal
              TextFormField(
                controller: _goalController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Target Collection Goal (₹) *', prefixText: '₹ '),
                validator: (v) => v == null || double.tryParse(v) == null ? 'Enter valid goal' : null,
              ),
              const SizedBox(height: 12),

              // UPI ID
              TextFormField(
                controller: _upiController,
                decoration: const InputDecoration(labelText: 'Committee UPI ID (VPA)', hintText: 'e.g. balajimandal@upi'),
              ),
              const SizedBox(height: 12),

              // Location
              TextFormField(
                controller: _locationController,
                decoration: const InputDecoration(labelText: 'Pandal Location / Colony', hintText: 'e.g. Main Park Ground'),
              ),
              const SizedBox(height: 12),

              // Members
              TextFormField(
                controller: _membersController,
                decoration: const InputDecoration(
                  labelText: 'Committee Volunteer Names (Comma Separated)',
                  hintText: 'Rahul, Vikram, Suresh',
                ),
              ),
              const SizedBox(height: 16),

              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: _submit,
                  icon: const Icon(Icons.check),
                  label: const Text('Create & Launch Utsav', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

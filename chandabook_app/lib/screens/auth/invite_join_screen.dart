import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/constants/app_constants.dart';
import '../../core/utils/date_formatter.dart';
import '../../models/group_model.dart';
import '../../providers/app_state_provider.dart';
import '../../widgets/festive_card.dart';

class InviteJoinScreen extends StatefulWidget {
  final String inviteCode;

  const InviteJoinScreen({super.key, required this.inviteCode});

  @override
  State<InviteJoinScreen> createState() => _InviteJoinScreenState();
}

class _InviteJoinScreenState extends State<InviteJoinScreen> {
  bool _isLoading = true;
  bool _isJoining = false;
  GroupModel? _group;
  String? _error;

  @override
  void initState() {
    super.initState();
    _lookupGroup();
  }

  Future<void> _lookupGroup() async {
    final state = context.read<AppStateProvider>();
    final group = await state.previewGroupByCode(widget.inviteCode);
    if (!mounted) return;
    setState(() {
      _group = group;
      _isLoading = false;
      _error = group == null ? 'This invite link is invalid or has expired.' : null;
    });
  }

  Future<void> _join() async {
    final group = _group;
    if (group == null) return;
    setState(() => _isJoining = true);
    await context.read<AppStateProvider>().joinAsVolunteer(group);
    // joinAsVolunteer() clears the pending invite and notifies listeners,
    // so AuthGate rebuilds straight into MainNavigationScreen from here.
  }

  void _dismiss() {
    context.read<AppStateProvider>().clearPendingInvite();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Center(
            child: _isLoading
                ? const CircularProgressIndicator()
                : _error != null
                    ? _buildError()
                    : _buildInvite(context, _group!),
          ),
        ),
      ),
    );
  }

  Widget _buildError() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Icon(Icons.link_off, size: 48, color: AppTheme.textMuted),
        const SizedBox(height: 16),
        Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: AppTheme.textMuted)),
        const SizedBox(height: 20),
        OutlinedButton(onPressed: _dismiss, child: const Text('Continue to ChandaBook')),
      ],
    );
  }

  Widget _buildInvite(BuildContext context, GroupModel group) {
    final festival = AppConstants.getFestivalType(group.festivalType);

    return SingleChildScrollView(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text("You're Invited! 🎉", style: Theme.of(context).textTheme.headlineLarge),
          const SizedBox(height: 6),
          Text(
            'Join this Utsav committee as a volunteer',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          FestiveCard(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    gradient: AppTheme.saffronGradient,
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Center(child: Text(festival.icon, style: const TextStyle(fontSize: 30))),
                ),
                const SizedBox(height: 14),
                Text(
                  group.name,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                if (group.location.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(group.location, style: const TextStyle(color: AppTheme.textMuted, fontSize: 13)),
                ],
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _StatChip(icon: Icons.groups_outlined, label: '${group.members.length} Members'),
                    const SizedBox(width: 10),
                    _StatChip(icon: Icons.flag_outlined, label: DateFormatter.formatCurrency(group.targetGoal)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton.icon(
              onPressed: _isJoining ? null : _join,
              icon: _isJoining
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.check_circle_outline),
              label: Text(_isJoining ? 'Joining...' : 'Join as Volunteer'),
            ),
          ),
          const SizedBox(height: 10),
          TextButton(onPressed: _dismiss, child: const Text('Not now')),
        ],
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _StatChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppTheme.primarySaffron.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppTheme.primarySaffronDark),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.primarySaffronDark)),
        ],
      ),
    );
  }
}

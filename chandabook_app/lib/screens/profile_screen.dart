import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_theme.dart';
import '../models/user_profile_model.dart';
import '../providers/app_state_provider.dart';
import '../widgets/festive_card.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isEditing = false;
  bool _isSaving = false;
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController;
  late final TextEditingController _phoneController;
  late final TextEditingController _cityController;

  @override
  void initState() {
    super.initState();
    final profile = context.read<AppStateProvider>().userProfile;
    _nameController = TextEditingController(text: profile?.fullName ?? '');
    _phoneController = TextEditingController(text: profile?.phone ?? '');
    _cityController = TextEditingController(text: profile?.city ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _cityController.dispose();
    super.dispose();
  }

  void _startEditing() {
    final profile = context.read<AppStateProvider>().userProfile;
    _nameController.text = profile?.fullName ?? '';
    _phoneController.text = profile?.phone ?? '';
    _cityController.text = profile?.city ?? '';
    setState(() => _isEditing = true);
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    await context.read<AppStateProvider>().completeProfile(
          fullName: _nameController.text.trim(),
          phone: _phoneController.text.trim(),
          city: _cityController.text.trim(),
        );

    if (!mounted) return;
    setState(() {
      _isSaving = false;
      _isEditing = false;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Profile updated'), backgroundColor: AppTheme.devotionalEmerald),
    );
  }

  String _roleLabel(String role) {
    switch (role) {
      case 'admin':
        return 'Admin / Creator';
      case 'treasurer':
        return 'Treasurer';
      default:
        return 'Volunteer';
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppStateProvider>();
    final profile = state.userProfile;
    final group = state.activeGroup;
    final myUid = state.firebaseUser?.uid;
    String? myRole;
    if (group != null && myUid != null) {
      for (final m in group.memberAccounts) {
        if (m.uid == myUid) {
          myRole = m.role;
          break;
        }
      }
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
        actions: [
          if (!_isEditing)
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              tooltip: 'Edit Profile',
              onPressed: _startEditing,
            ),
        ],
      ),
      body: profile == null
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: CircleAvatar(
                      radius: 44,
                      backgroundColor: AppTheme.primarySaffron.withOpacity(0.15),
                      backgroundImage: profile.photoURL.isNotEmpty ? NetworkImage(profile.photoURL) : null,
                      child: profile.photoURL.isEmpty
                          ? const Icon(Icons.person, size: 40, color: AppTheme.primarySaffron)
                          : null,
                    ),
                  ),
                  const SizedBox(height: 20),
                  if (_isEditing) _buildEditForm() else _buildDetails(profile, myRole),
                ],
              ),
            ),
    );
  }

  Widget _buildDetails(UserProfileModel profile, String? role) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        FestiveCard(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _detailRow(Icons.badge_outlined, 'Full Name', profile.fullName),
              const Divider(height: 24),
              _detailRow(Icons.email_outlined, 'Email', profile.email.isNotEmpty ? profile.email : '—'),
              const Divider(height: 24),
              _detailRow(Icons.phone_outlined, 'Phone', profile.phone.isNotEmpty ? profile.phone : 'Not added'),
              const Divider(height: 24),
              _detailRow(Icons.location_city_outlined, 'City', profile.city.isNotEmpty ? profile.city : 'Not added'),
              if (role != null) ...[
                const Divider(height: 24),
                _detailRow(Icons.shield_outlined, 'Role in Current Group', _roleLabel(role)),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _detailRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: AppTheme.primarySaffron),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
              const SizedBox(height: 2),
              Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildEditForm() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextFormField(
            controller: _nameController,
            textCapitalization: TextCapitalization.words,
            decoration: const InputDecoration(labelText: 'Full Name *'),
            validator: (v) => v == null || v.trim().isEmpty ? 'Enter your name' : null,
          ),
          const SizedBox(height: 14),
          TextFormField(
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(labelText: 'Phone Number', hintText: '9876543210'),
          ),
          const SizedBox(height: 14),
          TextFormField(
            controller: _cityController,
            textCapitalization: TextCapitalization.words,
            decoration: const InputDecoration(labelText: 'City / Town', hintText: 'e.g. Hyderabad'),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _isSaving ? null : () => setState(() => _isEditing = false),
                  child: const Text('Cancel'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: _isSaving ? null : _save,
                  child: _isSaving
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Save'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

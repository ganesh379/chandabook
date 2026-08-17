import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/app_state_provider.dart';

class ProfileSetupScreen extends StatefulWidget {
  const ProfileSetupScreen({super.key});

  @override
  State<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends State<ProfileSetupScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController;
  final _phoneController = TextEditingController();
  final _cityController = TextEditingController();
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final profile = context.read<AppStateProvider>().userProfile;
    _nameController = TextEditingController(text: profile?.fullName ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _cityController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    await context.read<AppStateProvider>().completeProfile(
          fullName: _nameController.text.trim(),
          phone: _phoneController.text.trim(),
          city: _cityController.text.trim(),
        );

    if (mounted) setState(() => _isSaving = false);
  }

  @override
  Widget build(BuildContext context) {
    final profile = context.watch<AppStateProvider>().userProfile;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 12),
                Row(
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: AppTheme.primarySaffron.withOpacity(0.15),
                      backgroundImage: (profile?.photoURL.isNotEmpty ?? false)
                          ? NetworkImage(profile!.photoURL)
                          : null,
                      child: (profile?.photoURL.isEmpty ?? true)
                          ? const Icon(Icons.person, color: AppTheme.primarySaffron, size: 28)
                          : null,
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Almost there!', style: Theme.of(context).textTheme.headlineMedium),
                          if (profile?.email.isNotEmpty ?? false)
                            Text(profile!.email, style: Theme.of(context).textTheme.bodyMedium),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  'Tell us a bit about yourself so committee members can recognize you.',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 28),
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
                const SizedBox(height: 28),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _isSaving ? null : _submit,
                    child: _isSaving
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2.4, color: Colors.white),
                          )
                        : const Text('Continue'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

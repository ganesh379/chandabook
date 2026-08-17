import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/app_state_provider.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  bool _isSigningIn = false;
  String? _error;

  Future<void> _handleSignIn() async {
    setState(() {
      _isSigningIn = true;
      _error = null;
    });

    try {
      final success = await context.read<AppStateProvider>().signInWithGoogle();
      if (!mounted) return;
      if (!success) {
        setState(() => _error = null); // user cancelled the picker, no error needed
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = 'Sign-in failed. Please try again.');
    } finally {
      if (mounted) setState(() => _isSigningIn = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28),
          child: Column(
            children: [
              const Spacer(flex: 3),
              Container(
                width: 88,
                height: 88,
                decoration: BoxDecoration(
                  gradient: AppTheme.saffronGradient,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primarySaffron.withOpacity(0.35),
                      blurRadius: 24,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: const Center(
                  child: Text('🪔', style: TextStyle(fontSize: 40)),
                ),
              ),
              const SizedBox(height: 24),
              RichText(
                text: TextSpan(
                  style: Theme.of(context).textTheme.displayMedium,
                  children: [
                    const TextSpan(text: 'Chanda'),
                    TextSpan(text: 'Book', style: TextStyle(color: AppTheme.primarySaffron)),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Universal Festival Donation & Daily Expense\nLedger for your Utsav Committee',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const Spacer(flex: 2),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppTheme.primarySaffron.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.primarySaffron.withOpacity(0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.verified_user_outlined, size: 14, color: AppTheme.primarySaffronDark),
                    const SizedBox(width: 6),
                    Text(
                      'Verified Real-Time Committee Ledgers',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.primarySaffronDark),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),
              if (_error != null) ...[
                Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 13)),
                const SizedBox(height: 12),
              ],
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isSigningIn ? null : _handleSignIn,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: AppTheme.textMain,
                    elevation: 2,
                    side: const BorderSide(color: AppTheme.borderSubtle),
                  ),
                  child: _isSigningIn
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2.4),
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SvgPicture.asset('assets/google_logo.svg', width: 20, height: 20),
                            const SizedBox(width: 12),
                            const Text(
                              'Sign In with Google',
                              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                            ),
                          ],
                        ),
                ),
              ),
              const SizedBox(height: 14),
              Text(
                'Sign in with your Gmail account to create or join a\nfestival committee and sync across devices',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 12),
              ),
              const Spacer(flex: 2),
            ],
          ),
        ),
      ),
    );
  }
}

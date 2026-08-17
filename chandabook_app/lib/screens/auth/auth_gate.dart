import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/app_state_provider.dart';
import '../main_navigation_screen.dart';
import 'welcome_screen.dart';
import 'profile_setup_screen.dart';
import 'invite_join_screen.dart';

/// Routes to the right top-level screen based on auth + onboarding state:
/// loading -> splash, signed out -> WelcomeScreen, signed in but profile
/// incomplete -> ProfileSetupScreen, signed in + a pending invite link ->
/// InviteJoinScreen, otherwise -> the normal dashboard.
class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppStateProvider>();

    if (state.isLoading || !state.authResolved) {
      return const _SplashScreen();
    }

    if (!state.isAuthenticated) {
      return const WelcomeScreen();
    }

    final profile = state.userProfile;
    if (profile == null || !profile.isProfileComplete) {
      return const ProfileSetupScreen();
    }

    final inviteCode = state.pendingInviteCode;
    if (inviteCode != null) {
      return InviteJoinScreen(inviteCode: inviteCode);
    }

    return const MainNavigationScreen();
  }
}

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: CircularProgressIndicator(color: AppTheme.primarySaffron),
      ),
    );
  }
}

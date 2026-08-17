import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'firebase_options.dart';
import 'providers/app_state_provider.dart';
import 'core/theme/app_theme.dart';
import 'screens/auth/auth_gate.dart';
import 'widgets/connectivity_gate.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);

  // ChandaBook has no offline mode - disable Firestore's on-disk cache so a
  // stale local copy is never shown; every read/write always goes live.
  FirebaseFirestore.instance.settings = const Settings(persistenceEnabled: false);

  // Set Android system overlay navigation and status bar style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const ChandaBookApp());
}

class ChandaBookApp extends StatelessWidget {
  const ChandaBookApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AppStateProvider()..initialize(),
      child: MaterialApp(
        title: 'ChandaBook',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const ConnectivityGate(child: AuthGate()),
      ),
    );
  }
}

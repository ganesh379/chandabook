import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Utsav Core Festive Colors
  static const Color primarySaffron = Color(0xFFFF7A00);
  static const Color primarySaffronDark = Color(0xFF8F4E00);
  static const Color marigold = Color(0xFFFFB800);
  static const Color festiveCrimson = Color(0xFFC2185B);
  static const Color devotionalEmerald = Color(0xFF00897B);
  static const Color darkSlate = Color(0xFF1A1C1E);
  static const Color cardSurface = Color(0xFFFFFFFF);
  static const Color bgSurface = Color(0xFFFBF8F6);
  static const Color borderSubtle = Color(0xFFEFE6E0);
  static const Color textMain = Color(0xFF1E293B);
  static const Color textMuted = Color(0xFF64748B);

  // Gradients
  static const LinearGradient saffronGradient = LinearGradient(
    colors: [Color(0xFFFF7A00), Color(0xFFFF9933)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient festiveHeroGradient = LinearGradient(
    colors: [Color(0xFF8F4E00), Color(0xFFFF7A00), Color(0xFFC2185B)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient emeraldGradient = LinearGradient(
    colors: [Color(0xFF00897B), Color(0xFF26A69A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient darkCardGradient = LinearGradient(
    colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static ThemeData get lightTheme {
    final baseTextTheme = GoogleFonts.interTextTheme();

    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: bgSurface,
      colorScheme: const ColorScheme.light(
        primary: primarySaffron,
        primaryContainer: Color(0xFFFFDCC2),
        secondary: marigold,
        secondaryContainer: Color(0xFFFFDF9E),
        tertiary: festiveCrimson,
        surface: cardSurface,
        onPrimary: Colors.white,
        onSecondary: Colors.black87,
        onSurface: textMain,
        error: Color(0xFFBA1A1A),
      ),
      textTheme: baseTextTheme.copyWith(
        displayLarge: GoogleFonts.notoSerif(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: textMain,
        ),
        displayMedium: GoogleFonts.notoSerif(
          fontSize: 26,
          fontWeight: FontWeight.bold,
          color: textMain,
        ),
        headlineLarge: GoogleFonts.notoSerif(
          fontSize: 22,
          fontWeight: FontWeight.bold,
          color: textMain,
        ),
        headlineMedium: GoogleFonts.notoSerif(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: textMain,
        ),
        titleLarge: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: textMain,
        ),
        bodyLarge: GoogleFonts.inter(
          fontSize: 15,
          color: textMain,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 13,
          color: textMuted,
        ),
        labelLarge: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.2,
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        iconTheme: const IconThemeData(color: textMain),
        titleTextStyle: GoogleFonts.notoSerif(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: textMain,
        ),
      ),
      cardTheme: CardTheme(
        color: cardSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: borderSubtle, width: 1),
        ),
        margin: EdgeInsets.zero,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primarySaffron,
          foregroundColor: Colors.white,
          elevation: 2,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primarySaffron,
          side: const BorderSide(color: primarySaffron, width: 1.5),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: borderSubtle),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: borderSubtle),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primarySaffron, width: 2),
        ),
        labelStyle: GoogleFonts.inter(color: textMuted, fontSize: 14),
        hintStyle: GoogleFonts.inter(color: Color(0xFF94A3B8), fontSize: 14),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: primarySaffron,
        unselectedItemColor: textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
        selectedLabelStyle: TextStyle(fontWeight: FontWeight.w600, fontSize: 11),
        unselectedLabelStyle: TextStyle(fontWeight: FontWeight.w500, fontSize: 11),
      ),
    );
  }
}

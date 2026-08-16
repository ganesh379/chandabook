import 'package:intl/intl.dart';

class DateFormatter {
  static final DateFormat _isoFormat = DateFormat('yyyy-MM-dd');
  static final DateFormat _displayFormat = DateFormat('dd MMM yyyy');
  static final DateFormat _dateTimeFormat = DateFormat('dd MMM yyyy, hh:mm a');
  static final DateFormat _shortDateFormat = DateFormat('dd/MM');

  static String todayIso() {
    return _isoFormat.format(DateTime.now());
  }

  static String formatDisplay(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return 'Today';
    try {
      final parsed = DateTime.parse(dateStr);
      return _displayFormat.format(parsed);
    } catch (e) {
      return dateStr;
    }
  }

  static String formatDateTime(DateTime? dateTime) {
    if (dateTime == null) return _dateTimeFormat.format(DateTime.now());
    return _dateTimeFormat.format(dateTime);
  }

  static String formatShort(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return '';
    try {
      final parsed = DateTime.parse(dateStr);
      return _shortDateFormat.format(parsed);
    } catch (e) {
      return dateStr;
    }
  }

  static String formatCurrency(num amount) {
    final formatter = NumberFormat.currency(
      locale: 'en_IN',
      symbol: '₹',
      decimalDigits: 0,
    );
    return formatter.format(amount);
  }
}

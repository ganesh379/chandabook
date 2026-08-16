class NumberToWords {
  static const List<String> _units = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  static const List<String> _tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  static String convert(num amount) {
    int n = amount.toInt();
    if (n == 0) return 'Zero Rupees Only';
    if (n < 0) return 'Minus ${_convertPositive(-n)} Rupees Only';
    return '${_convertPositive(n)} Rupees Only';
  }

  static String _convertPositive(int n) {
    if (n < 20) {
      return _units[n];
    }
    if (n < 100) {
      return _tens[n ~/ 10] + (n % 10 != 0 ? ' ${_units[n % 10]}' : '');
    }
    if (n < 1000) {
      return '${_units[n ~/ 100]} Hundred${n % 100 != 0 ? ' ${_convertPositive(n % 100)}' : ''}';
    }
    if (n < 100000) {
      return '${_convertPositive(n ~/ 1000)} Thousand${n % 1000 != 0 ? ' ${_convertPositive(n % 1000)}' : ''}';
    }
    if (n < 10000000) {
      return '${_convertPositive(n ~/ 100000)} Lakh${n % 100000 != 0 ? ' ${_convertPositive(n % 100000)}' : ''}';
    }
    return '${_convertPositive(n ~/ 10000000)} Crore${n % 10000000 != 0 ? ' ${_convertPositive(n % 10000000)}' : ''}';
  }
}

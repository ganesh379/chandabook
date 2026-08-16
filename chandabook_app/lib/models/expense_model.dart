class ExpenseModel {
  final String id;
  final String title;
  final double amount;
  final String category;
  final String paidBy;
  final String? billImageBase64;
  final String date;
  final String notes;
  final String? timestamp;

  ExpenseModel({
    required this.id,
    required this.title,
    required this.amount,
    required this.category,
    required this.paidBy,
    this.billImageBase64,
    required this.date,
    this.notes = '',
    this.timestamp,
  });

  factory ExpenseModel.fromJson(Map<String, dynamic> json) {
    return ExpenseModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      amount: (json['amount'] is num) ? (json['amount'] as num).toDouble() : (double.tryParse(json['amount']?.toString() ?? '0') ?? 0.0),
      category: json['category']?.toString() ?? 'misc',
      paidBy: json['paidBy']?.toString() ?? 'Treasurer',
      billImageBase64: json['billImageBase64']?.toString(),
      date: json['date']?.toString() ?? DateTime.now().toIso8601String().split('T')[0],
      notes: json['notes']?.toString() ?? '',
      timestamp: json['timestamp']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'amount': amount,
      'category': category,
      'paidBy': paidBy,
      'billImageBase64': billImageBase64,
      'date': date,
      'notes': notes,
      'timestamp': timestamp ?? DateTime.now().toIso8601String(),
    };
  }

  ExpenseModel copyWith({
    String? id,
    String? title,
    double? amount,
    String? category,
    String? paidBy,
    String? billImageBase64,
    String? date,
    String? notes,
    String? timestamp,
  }) {
    return ExpenseModel(
      id: id ?? this.id,
      title: title ?? this.title,
      amount: amount ?? this.amount,
      category: category ?? this.category,
      paidBy: paidBy ?? this.paidBy,
      billImageBase64: billImageBase64 ?? this.billImageBase64,
      date: date ?? this.date,
      notes: notes ?? this.notes,
      timestamp: timestamp ?? this.timestamp,
    );
  }
}

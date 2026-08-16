class CollectionModel {
  final String id;
  final String receiptNo;
  final String donorName;
  final String phone;
  final String address;
  final double amount;
  final String paymentMode;
  final String collectedBy;
  final String date;
  final String notes;
  final String? timestamp;

  CollectionModel({
    required this.id,
    required this.receiptNo,
    required this.donorName,
    this.phone = '',
    this.address = '',
    required this.amount,
    this.paymentMode = 'Cash',
    required this.collectedBy,
    required this.date,
    this.notes = '',
    this.timestamp,
  });

  factory CollectionModel.fromJson(Map<String, dynamic> json) {
    return CollectionModel(
      id: json['id']?.toString() ?? '',
      receiptNo: json['receiptNo']?.toString() ?? '',
      donorName: json['donorName']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      address: json['address']?.toString() ?? '',
      amount: (json['amount'] is num) ? (json['amount'] as num).toDouble() : (double.tryParse(json['amount']?.toString() ?? '0') ?? 0.0),
      paymentMode: json['paymentMode']?.toString() ?? 'Cash',
      collectedBy: json['collectedBy']?.toString() ?? 'Volunteer',
      date: json['date']?.toString() ?? DateTime.now().toIso8601String().split('T')[0],
      notes: json['notes']?.toString() ?? '',
      timestamp: json['timestamp']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'receiptNo': receiptNo,
      'donorName': donorName,
      'phone': phone,
      'address': address,
      'amount': amount,
      'paymentMode': paymentMode,
      'collectedBy': collectedBy,
      'date': date,
      'notes': notes,
      'timestamp': timestamp ?? DateTime.now().toIso8601String(),
    };
  }

  CollectionModel copyWith({
    String? id,
    String? receiptNo,
    String? donorName,
    String? phone,
    String? address,
    double? amount,
    String? paymentMode,
    String? collectedBy,
    String? date,
    String? notes,
    String? timestamp,
  }) {
    return CollectionModel(
      id: id ?? this.id,
      receiptNo: receiptNo ?? this.receiptNo,
      donorName: donorName ?? this.donorName,
      phone: phone ?? this.phone,
      address: address ?? this.address,
      amount: amount ?? this.amount,
      paymentMode: paymentMode ?? this.paymentMode,
      collectedBy: collectedBy ?? this.collectedBy,
      date: date ?? this.date,
      notes: notes ?? this.notes,
      timestamp: timestamp ?? this.timestamp,
    );
  }
}

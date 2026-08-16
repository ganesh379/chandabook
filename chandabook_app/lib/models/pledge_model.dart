class PledgeModel {
  final String id;
  final String donorName;
  final String phone;
  final String address;
  final double pledgeAmount;
  final double collectedAmount;
  final String status; // 'pending', 'partial', 'fulfilled'
  final String date;
  final String notes;
  final List<String> linkedCollectionIds;
  final String? lastReminderSentAt;

  PledgeModel({
    required this.id,
    required this.donorName,
    this.phone = '',
    this.address = '',
    required this.pledgeAmount,
    this.collectedAmount = 0.0,
    this.status = 'pending',
    required this.date,
    this.notes = '',
    this.linkedCollectionIds = const [],
    this.lastReminderSentAt,
  });

  double get outstandingAmount => (pledgeAmount - collectedAmount) > 0 ? (pledgeAmount - collectedAmount) : 0.0;
  bool get isFulfilled => status == 'fulfilled' || collectedAmount >= pledgeAmount;

  factory PledgeModel.fromJson(Map<String, dynamic> json) {
    final pledgeAmt = (json['pledgeAmount'] is num) ? (json['pledgeAmount'] as num).toDouble() : (double.tryParse(json['pledgeAmount']?.toString() ?? '0') ?? 0.0);
    final collectedAmt = (json['collectedAmount'] is num) ? (json['collectedAmount'] as num).toDouble() : (double.tryParse(json['collectedAmount']?.toString() ?? '0') ?? 0.0);
    
    String stat = json['status']?.toString() ?? 'pending';
    if (collectedAmt >= pledgeAmt && pledgeAmt > 0) {
      stat = 'fulfilled';
    } else if (collectedAmt > 0) {
      stat = 'partial';
    }

    return PledgeModel(
      id: json['id']?.toString() ?? '',
      donorName: json['donorName']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      address: json['address']?.toString() ?? '',
      pledgeAmount: pledgeAmt,
      collectedAmount: collectedAmt,
      status: stat,
      date: json['date']?.toString() ?? DateTime.now().toIso8601String().split('T')[0],
      notes: json['notes']?.toString() ?? '',
      linkedCollectionIds: (json['linkedCollectionIds'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      lastReminderSentAt: json['lastReminderSentAt']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'donorName': donorName,
      'phone': phone,
      'address': address,
      'pledgeAmount': pledgeAmount,
      'collectedAmount': collectedAmount,
      'status': status,
      'date': date,
      'notes': notes,
      'linkedCollectionIds': linkedCollectionIds,
      'lastReminderSentAt': lastReminderSentAt,
    };
  }

  PledgeModel copyWith({
    String? id,
    String? donorName,
    String? phone,
    String? address,
    double? pledgeAmount,
    double? collectedAmount,
    String? status,
    String? date,
    String? notes,
    List<String>? linkedCollectionIds,
    String? lastReminderSentAt,
  }) {
    return PledgeModel(
      id: id ?? this.id,
      donorName: donorName ?? this.donorName,
      phone: phone ?? this.phone,
      address: address ?? this.address,
      pledgeAmount: pledgeAmount ?? this.pledgeAmount,
      collectedAmount: collectedAmount ?? this.collectedAmount,
      status: status ?? this.status,
      date: date ?? this.date,
      notes: notes ?? this.notes,
      linkedCollectionIds: linkedCollectionIds ?? this.linkedCollectionIds,
      lastReminderSentAt: lastReminderSentAt ?? this.lastReminderSentAt,
    );
  }
}

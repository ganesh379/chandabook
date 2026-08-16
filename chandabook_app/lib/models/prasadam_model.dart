class PrasadamModel {
  final String id;
  final String date;
  final String slot; // 'morning', 'evening', 'all_day'
  final String sponsorName;
  final String sponsorPhone;
  final String menuItems;
  final int estimatedCount;
  final String status; // 'confirmed', 'pending', 'completed'
  final double costEstimate;
  final String notes;

  PrasadamModel({
    required this.id,
    required this.date,
    this.slot = 'morning',
    required this.sponsorName,
    this.sponsorPhone = '',
    this.menuItems = '',
    this.estimatedCount = 100,
    this.status = 'confirmed',
    this.costEstimate = 0.0,
    this.notes = '',
  });

  factory PrasadamModel.fromJson(Map<String, dynamic> json) {
    return PrasadamModel(
      id: json['id']?.toString() ?? '',
      date: json['date']?.toString() ?? DateTime.now().toIso8601String().split('T')[0],
      slot: json['slot']?.toString() ?? 'morning',
      sponsorName: json['sponsorName']?.toString() ?? '',
      sponsorPhone: json['sponsorPhone']?.toString() ?? '',
      menuItems: json['menuItems']?.toString() ?? '',
      estimatedCount: int.tryParse(json['estimatedCount']?.toString() ?? '100') ?? 100,
      status: json['status']?.toString() ?? 'confirmed',
      costEstimate: (json['costEstimate'] is num) ? (json['costEstimate'] as num).toDouble() : (double.tryParse(json['costEstimate']?.toString() ?? '0') ?? 0.0),
      notes: json['notes']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'date': date,
      'slot': slot,
      'sponsorName': sponsorName,
      'sponsorPhone': sponsorPhone,
      'menuItems': menuItems,
      'estimatedCount': estimatedCount,
      'status': status,
      'costEstimate': costEstimate,
      'notes': notes,
    };
  }

  PrasadamModel copyWith({
    String? id,
    String? date,
    String? slot,
    String? sponsorName,
    String? sponsorPhone,
    String? menuItems,
    int? estimatedCount,
    String? status,
    double? costEstimate,
    String? notes,
  }) {
    return PrasadamModel(
      id: id ?? this.id,
      date: date ?? this.date,
      slot: slot ?? this.slot,
      sponsorName: sponsorName ?? this.sponsorName,
      sponsorPhone: sponsorPhone ?? this.sponsorPhone,
      menuItems: menuItems ?? this.menuItems,
      estimatedCount: estimatedCount ?? this.estimatedCount,
      status: status ?? this.status,
      costEstimate: costEstimate ?? this.costEstimate,
      notes: notes ?? this.notes,
    );
  }
}

import 'collection_model.dart';
import 'expense_model.dart';
import 'pledge_model.dart';
import 'prasadam_model.dart';
import 'group_member_model.dart';

class GroupModel {
  final String id;
  final String name;
  final String code; // 6-digit join code
  final String festivalType;
  final double targetGoal;
  final String upiId;
  final String upiPayeeName;
  final String location;
  final String year;
  final String? bannerUrl;
  final List<String> members;
  final List<GroupMemberModel> memberAccounts;
  final List<CollectionModel> collections;
  final List<ExpenseModel> expenses;
  final List<PledgeModel> pledges;
  final List<PrasadamModel> prasadamSchedule;
  final String? createdAt;
  final String? updatedAt;
  final String? createdBy;

  GroupModel({
    required this.id,
    required this.name,
    required this.code,
    this.festivalType = 'vinayaka_chavithi',
    this.targetGoal = 75000,
    this.upiId = '',
    this.upiPayeeName = '',
    this.location = '',
    this.year = '2026',
    this.bannerUrl,
    this.members = const ['Rahul (Treasurer)', 'Vikram', 'Suresh'],
    this.memberAccounts = const [],
    this.collections = const [],
    this.expenses = const [],
    this.pledges = const [],
    this.prasadamSchedule = const [],
    this.createdAt,
    this.updatedAt,
    this.createdBy,
  });

  factory GroupModel.fromJson(Map<String, dynamic> json) {
    return GroupModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Utsav Chanda',
      code: json['code']?.toString() ?? '',
      festivalType: json['festivalType']?.toString() ?? 'vinayaka_chavithi',
      targetGoal: (json['targetGoal'] is num)
          ? (json['targetGoal'] as num).toDouble()
          : (double.tryParse(json['targetGoal']?.toString() ?? '75000') ?? 75000.0),
      upiId: json['upiId']?.toString() ?? '',
      upiPayeeName: json['upiPayeeName']?.toString() ?? '',
      location: json['location']?.toString() ?? '',
      year: json['year']?.toString() ?? '2026',
      bannerUrl: json['bannerUrl']?.toString(),
      members: (json['members'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .where((m) => m.isNotEmpty)
              .toList() ??
          ['Treasurer', 'President'],
      memberAccounts: (json['memberAccounts'] as List<dynamic>?)
              ?.map((e) => GroupMemberModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      collections: (json['collections'] as List<dynamic>?)
              ?.map((e) => CollectionModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      expenses: (json['expenses'] as List<dynamic>?)
              ?.map((e) => ExpenseModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      pledges: (json['pledges'] as List<dynamic>?)
              ?.map((e) => PledgeModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      prasadamSchedule: (json['prasadamSchedule'] as List<dynamic>?)
              ?.map((e) => PrasadamModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      createdAt: json['createdAt']?.toString(),
      updatedAt: json['updatedAt']?.toString(),
      createdBy: json['createdBy']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'code': code,
      'festivalType': festivalType,
      'targetGoal': targetGoal,
      'upiId': upiId,
      'upiPayeeName': upiPayeeName,
      'location': location,
      'year': year,
      'bannerUrl': bannerUrl,
      'members': members,
      'memberAccounts': memberAccounts.map((m) => m.toJson()).toList(),
      'collections': collections.map((c) => c.toJson()).toList(),
      'expenses': expenses.map((e) => e.toJson()).toList(),
      'pledges': pledges.map((p) => p.toJson()).toList(),
      'prasadamSchedule': prasadamSchedule.map((pr) => pr.toJson()).toList(),
      'createdAt': createdAt ?? DateTime.now().toIso8601String(),
      'updatedAt': updatedAt ?? DateTime.now().toIso8601String(),
      'createdBy': createdBy,
    };
  }

  GroupModel copyWith({
    String? id,
    String? name,
    String? code,
    String? festivalType,
    double? targetGoal,
    String? upiId,
    String? upiPayeeName,
    String? location,
    String? year,
    String? bannerUrl,
    List<String>? members,
    List<GroupMemberModel>? memberAccounts,
    List<CollectionModel>? collections,
    List<ExpenseModel>? expenses,
    List<PledgeModel>? pledges,
    List<PrasadamModel>? prasadamSchedule,
    String? createdAt,
    String? updatedAt,
    String? createdBy,
  }) {
    return GroupModel(
      id: id ?? this.id,
      name: name ?? this.name,
      code: code ?? this.code,
      festivalType: festivalType ?? this.festivalType,
      targetGoal: targetGoal ?? this.targetGoal,
      upiId: upiId ?? this.upiId,
      upiPayeeName: upiPayeeName ?? this.upiPayeeName,
      location: location ?? this.location,
      year: year ?? this.year,
      bannerUrl: bannerUrl ?? this.bannerUrl,
      members: members ?? this.members,
      memberAccounts: memberAccounts ?? this.memberAccounts,
      collections: collections ?? this.collections,
      expenses: expenses ?? this.expenses,
      pledges: pledges ?? this.pledges,
      prasadamSchedule: prasadamSchedule ?? this.prasadamSchedule,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      createdBy: createdBy ?? this.createdBy,
    );
  }
}

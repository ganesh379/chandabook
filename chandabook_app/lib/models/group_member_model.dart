class GroupMemberModel {
  final String uid;
  final String name;
  final String email;
  final String photoURL;
  final String role;
  final String? joinedAt;

  GroupMemberModel({
    required this.uid,
    required this.name,
    this.email = '',
    this.photoURL = '',
    this.role = 'volunteer',
    this.joinedAt,
  });

  factory GroupMemberModel.fromJson(Map<String, dynamic> json) {
    return GroupMemberModel(
      uid: json['uid']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Volunteer',
      email: json['email']?.toString() ?? '',
      photoURL: json['photoURL']?.toString() ?? '',
      role: json['role']?.toString() ?? 'volunteer',
      joinedAt: json['joinedAt']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'uid': uid,
      'name': name,
      'email': email,
      'photoURL': photoURL,
      'role': role,
      'joinedAt': joinedAt ?? DateTime.now().toIso8601String(),
    };
  }
}

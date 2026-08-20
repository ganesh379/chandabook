class GroupMemberModel {
  final String uid;
  final String name;
  final String email;
  final String photoURL;
  final String role;
  final String designation;
  final String? joinedAt;

  GroupMemberModel({
    required this.uid,
    required this.name,
    this.email = '',
    this.photoURL = '',
    this.role = 'volunteer',
    this.designation = 'Volunteer',
    this.joinedAt,
  });

  factory GroupMemberModel.fromJson(Map<String, dynamic> json) {
    final r = json['role']?.toString() ?? 'volunteer';
    final des = json['designation']?.toString() ?? (r == 'admin' ? 'Admin' : 'Volunteer');
    return GroupMemberModel(
      uid: json['uid']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Volunteer',
      email: json['email']?.toString() ?? '',
      photoURL: json['photoURL']?.toString() ?? '',
      role: r,
      designation: des,
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
      'designation': designation,
      'joinedAt': joinedAt ?? DateTime.now().toIso8601String(),
    };
  }

  GroupMemberModel copyWith({
    String? uid,
    String? name,
    String? email,
    String? photoURL,
    String? role,
    String? designation,
    String? joinedAt,
  }) {
    return GroupMemberModel(
      uid: uid ?? this.uid,
      name: name ?? this.name,
      email: email ?? this.email,
      photoURL: photoURL ?? this.photoURL,
      role: role ?? this.role,
      designation: designation ?? this.designation,
      joinedAt: joinedAt ?? this.joinedAt,
    );
  }
}

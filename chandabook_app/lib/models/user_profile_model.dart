class UserProfileModel {
  final String uid;
  final String fullName;
  final String email;
  final String phone;
  final String city;
  final String photoURL;
  final List<String> groupIds;
  final bool isProfileComplete;

  UserProfileModel({
    required this.uid,
    required this.fullName,
    this.email = '',
    this.phone = '',
    this.city = '',
    this.photoURL = '',
    this.groupIds = const [],
    this.isProfileComplete = false,
  });

  factory UserProfileModel.fromJson(Map<String, dynamic> json) {
    return UserProfileModel(
      uid: json['uid']?.toString() ?? '',
      fullName: json['fullName']?.toString() ?? 'Committee Volunteer',
      email: json['email']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      city: json['city']?.toString() ?? '',
      photoURL: json['photoURL']?.toString() ?? '',
      groupIds: (json['groupIds'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      isProfileComplete: json['isProfileComplete'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'uid': uid,
      'fullName': fullName,
      'email': email,
      'phone': phone,
      'city': city,
      'photoURL': photoURL,
      'groupIds': groupIds,
      'isProfileComplete': isProfileComplete,
    };
  }

  UserProfileModel copyWith({
    String? uid,
    String? fullName,
    String? email,
    String? phone,
    String? city,
    String? photoURL,
    List<String>? groupIds,
    bool? isProfileComplete,
  }) {
    return UserProfileModel(
      uid: uid ?? this.uid,
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      city: city ?? this.city,
      photoURL: photoURL ?? this.photoURL,
      groupIds: groupIds ?? this.groupIds,
      isProfileComplete: isProfileComplete ?? this.isProfileComplete,
    );
  }
}

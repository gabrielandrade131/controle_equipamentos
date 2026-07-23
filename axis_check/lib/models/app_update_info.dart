class AppUpdateInfo {
  final String version;
  final int buildNumber;
  final String downloadUrl;
  final bool forceUpdate;
  final String? notes;
  final String? publishedAt;

  const AppUpdateInfo({
    required this.version,
    required this.buildNumber,
    required this.downloadUrl,
    required this.forceUpdate,
    this.notes,
    this.publishedAt,
  });

  factory AppUpdateInfo.fromJson(Map<String, dynamic> json) {
    return AppUpdateInfo(
      version: json['version']?.toString() ?? '',
      buildNumber: int.tryParse(json['buildNumber']?.toString() ?? '') ?? 0,
      downloadUrl: json['downloadUrl']?.toString() ?? '',
      forceUpdate: json['forceUpdate'] == true,
      notes: json['notes']?.toString(),
      publishedAt: json['publishedAt']?.toString(),
    );
  }
}

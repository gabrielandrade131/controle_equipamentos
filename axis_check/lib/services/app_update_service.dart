import 'package:dio/dio.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../core/config/app_config.dart';
import '../models/app_update_info.dart';

class AppUpdateService {
  final Dio _dio;

  AppUpdateService()
    : _dio = Dio(
        BaseOptions(
          baseUrl: AppConfig.axisBaseUrl,
          connectTimeout: const Duration(seconds: 15),
          receiveTimeout: const Duration(seconds: 20),
          headers: const {'Content-Type': 'application/json'},
        ),
      );

  Future<AppUpdateInfo?> buscarAtualizacaoDisponivel() async {
    final packageInfo = await PackageInfo.fromPlatform();
    final response = await _dio.get('/mobile-app/axis-check/version');
    final updateInfo = AppUpdateInfo.fromJson(
      Map<String, dynamic>.from(response.data as Map),
    );

    if (updateInfo.downloadUrl.isEmpty) {
      return null;
    }

    final currentBuildNumber =
        int.tryParse(packageInfo.buildNumber.trim()) ?? 0;

    if (updateInfo.buildNumber > currentBuildNumber) {
      return updateInfo;
    }

    return null;
  }

  Future<bool> abrirDownload(String downloadUrl) async {
    final uri = Uri.tryParse(downloadUrl);

    if (uri == null) {
      return false;
    }

    return launchUrl(uri, mode: LaunchMode.externalApplication);
  }
}

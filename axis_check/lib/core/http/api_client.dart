import 'package:dio/dio.dart';

import '../config/app_config.dart';
import '../storage/token_storage.dart';

class ApiClient {
  final TokenStorage tokenStorage;

  ApiClient({required this.tokenStorage});

  Dio axisDio() {
    final dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.axisBaseUrl,
        connectTimeout: const Duration(seconds: 20),
        receiveTimeout: const Duration(seconds: 30),
        headers: {'Content-Type': 'application/json'},
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await tokenStorage.buscarToken();

          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }

          return handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            await tokenStorage.removerToken();
          }

          return handler.next(error);
        },
      ),
    );

    return dio;
  }

  Dio synchroDio() {
    final dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.synchroBaseUrl,
        connectTimeout: const Duration(seconds: 20),
        receiveTimeout: const Duration(seconds: 30),
        headers: {'Content-Type': 'application/json'},
      ),
    );

    return dio;
  }
}
